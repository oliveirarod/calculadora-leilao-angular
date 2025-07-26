import { Injectable } from '@angular/core';
import { ImovelData } from '../models/imovel-data.interface';
import { CalculatedResults, Alerta } from '../models/calculated-results.interface';
import { CALCULATION_CONSTANTS } from '../constants/calculation-constants';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  calcularResultados(data: ImovelData): CalculatedResults {
    // Cálculos básicos
    const taxaLeiloeiro = data.valorArrematacao * CALCULATION_CONSTANTS.TAXA_LEILOEIRO;
    const itbi = data.valorArrematacao * (data.percentualITBI / 100);
    
    // Custos cartorários baseados no financiamento
    const custosCartorarios = data.seraFinanciado 
      ? data.valorArrematacao * CALCULATION_CONSTANTS.CUSTOS_CARTORARIOS_COM_FINANCIAMENTO
      : data.valorArrematacao * CALCULATION_CONSTANTS.CUSTOS_CARTORARIOS_SEM_FINANCIAMENTO;
    
    // Descrição dos custos cartorários
    const custosCartorariosDescricao = data.seraFinanciado 
      ? 'Apenas registro (escritura incluída no financiamento)'
      : 'Escritura e registro';
    
    const honorariosAdvogado = data.usaraAdvogado ? (data.honorariosAdvogado || 0) : 0;
    
    // Cálculo do IPTU usando a nova tabela de faixas
    const iptuMensalCalculado = this.calcularIPTUPorFaixa(data.valorAvaliacao);
    
    // Usar o IPTU informado pelo usuário ou o calculado automaticamente
    const iptuMensalFinal = data.valorIPTUMensal > 0 ? data.valorIPTUMensal : iptuMensalCalculado;
    
    // Cálculos de financiamento (baseado apenas no valor de arrematação)
    let valorFinanciado: number | undefined;
    let jurosAnuaisEstimados: number | undefined;
    let jurosTotaisEstimados: number | undefined;
    let segurosObrigatorios: number | undefined;
    let parcelaMensalEstimada: number | undefined;
    let segurosObrigatoriosMensal: number | undefined;
    let totalFinanciamento: number | undefined;
    let valorEntradaFinal: number | undefined;
    let valorArrematacaoParaCustos: number; // Novo campo para distinguir o valor na tabela de custos
    
    if (data.seraFinanciado && data.taxaJurosAnual) {
      const entrada = data.valorEntrada || (data.valorArrematacao * CALCULATION_CONSTANTS.ENTRADA_PADRAO);
      valorEntradaFinal = entrada;
      valorFinanciado = data.valorArrematacao - entrada;
      
      // Para financiamento, o valor de arrematação na tabela de custos deve ser apenas a entrada
      valorArrematacaoParaCustos = entrada;
      
      jurosAnuaisEstimados = valorFinanciado * (data.taxaJurosAnual / 100);
      
      const prazoAnos = data.prazoFinanciamentoAnos || CALCULATION_CONSTANTS.PRAZO_FINANCIAMENTO_PADRAO;
      jurosTotaisEstimados = jurosAnuaisEstimados * prazoAnos;
      
      segurosObrigatoriosMensal = valorFinanciado * CALCULATION_CONSTANTS.SEGUROS_OBRIGATORIOS_MENSAL;
      segurosObrigatorios = segurosObrigatoriosMensal * 12; // anual
      
      // Cálculo mais preciso da parcela mensal usando a fórmula de Price
      const prazoMeses = prazoAnos * 12;
      const taxaMensal = (data.taxaJurosAnual / 100) / 12;
      
      if (taxaMensal > 0) {
        const fatorPrice = Math.pow(1 + taxaMensal, prazoMeses);
        parcelaMensalEstimada = valorFinanciado * (taxaMensal * fatorPrice) / (fatorPrice - 1);
      } else {
        parcelaMensalEstimada = valorFinanciado / prazoMeses;
      }
      
      // Total dos custos de financiamento
      totalFinanciamento = jurosTotaisEstimados + (segurosObrigatorios * prazoAnos);
    } else {
      // Sem financiamento, o valor de arrematação permanece o total
      valorArrematacaoParaCustos = data.valorArrematacao;
    }
    
    // Custo total de aquisição (usando o valor correto baseado no financiamento)
    const custoTotalAquisicao = valorArrematacaoParaCustos + taxaLeiloeiro + itbi + 
                               custosCartorarios + honorariosAdvogado + 
                               data.valorDesocupacao + data.valorReforma;
    
    // Análise de rentabilidade para venda (apenas se objetivo for vender)
    let ganhoBruto: number | undefined;
    let impostoRenda: number | undefined;
    let ganhoLiquido: number | undefined;
    
    if (data.objetivo === 'vender' && data.valorEstimadoVenda) {
      ganhoBruto = data.valorEstimadoVenda - data.valorArrematacao;
      const ganhoCapital = data.valorEstimadoVenda - custoTotalAquisicao;
      
      if (ganhoCapital > 0) {
        impostoRenda = ganhoCapital * CALCULATION_CONSTANTS.ALIQUOTA_IR_GANHO_CAPITAL;
      } else {
        impostoRenda = 0;
      }
      
      ganhoLiquido = ganhoBruto - (taxaLeiloeiro + itbi + custosCartorarios + 
                                  honorariosAdvogado + data.valorDesocupacao + 
                                  data.valorReforma + impostoRenda);
    }
    
    // Análise de rentabilidade para aluguel (apenas se objetivo for alugar)
    let retornoAnualAluguel: number | undefined;
    let rendaLiquidaMensal: number | undefined;
    
    if (data.objetivo === 'alugar' && data.valorAluguelMensal) {
      // Descontar condomínio e IPTU da renda mensal
      rendaLiquidaMensal = data.valorAluguelMensal - data.valorCondominio - iptuMensalFinal;
      const rendaAnual = rendaLiquidaMensal * 12;
      retornoAnualAluguel = (rendaAnual / custoTotalAquisicao) * 100;
    }
    
    // Gastos mensais
    const custoMensalTotal = data.valorCondominio + iptuMensalFinal + data.outrosGastosMensais;
    const custoTotalPeriodo = custoMensalTotal * data.periodoAnalise;
    
    // Custo mensal com financiamento
    let custoMensalComFinanciamento: number | undefined;
    if (data.seraFinanciado && parcelaMensalEstimada && segurosObrigatoriosMensal) {
      custoMensalComFinanciamento = custoMensalTotal + parcelaMensalEstimada + segurosObrigatoriosMensal;
    }
    
    // Comparações
    const economiaEmRelacaoAvaliacao = data.valorAvaliacao - data.valorArrematacao;
    const percentualEconomia = data.valorAvaliacao > 0 
      ? ((economiaEmRelacaoAvaliacao / data.valorAvaliacao) * 100) 
      : 0;
    
    // Gerar alertas
    const alertas = this.gerarAlertas(data, {
      custoTotalAquisicao,
      percentualEconomia,
      retornoAnualAluguel,
      valorFinanciado,
      rendaLiquidaMensal
    });
    
    return {
      taxaLeiloeiro,
      itbi,
      custosCartorarios,
      custosCartorariosDescricao,
      honorariosAdvogado,
      valorDesocupacao: data.valorDesocupacao,
      valorReforma: data.valorReforma,
      valorFinanciado,
      valorEntradaFinal,
      valorArrematacaoParaCustos, // Novo campo
      jurosAnuaisEstimados,
      jurosTotaisEstimados,
      segurosObrigatorios,
      parcelaMensalEstimada,
      segurosObrigatoriosMensal,
      custoTotalAquisicao,
      totalFinanciamento,
      ganhoBruto,
      impostoRenda,
      ganhoLiquido,
      retornoAnualAluguel,
      rendaLiquidaMensal, // Novo campo
      custoMensalTotal,
      custoTotalPeriodo,
      custoMensalComFinanciamento,
      economiaEmRelacaoAvaliacao,
      percentualEconomia,
      iptuMensalCalculado,
      alertas
    };
  }
  
  private calcularIPTUPorFaixa(valorVenal: number): number {
    if (!valorVenal || valorVenal <= 0) {
      return 0;
    }
    
    const faixa = CALCULATION_CONSTANTS.IPTU_FAIXAS.find(f => 
      valorVenal >= f.valorMinimo && valorVenal <= f.valorMaximo
    );
    
    if (!faixa) {
      // Fallback para o cálculo padrão
      return (valorVenal * CALCULATION_CONSTANTS.IPTU_ANUAL_PADRAO) / 12;
    }
    
    const iptuAnual = (valorVenal * faixa.multiplicador) - faixa.subtrair;
    return Math.max(0, iptuAnual / 12);
  }
  
  private gerarAlertas(data: ImovelData, calculos: any): Alerta[] {
    const alertas: Alerta[] = [];
    
    // Alerta para imóvel ocupado
    if (data.valorDesocupacao > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Imóvel Ocupado',
        descricao: 'Considere os custos e tempo necessário para desocupação do imóvel.'
      });
    }
    
    // Alerta para alto custo de reforma
    if (data.valorReforma > data.valorArrematacao * CALCULATION_CONSTANTS.LIMITE_REFORMA_ALERTA) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Alto Custo de Reforma',
        descricao: `O custo de reforma representa mais de ${CALCULATION_CONSTANTS.LIMITE_REFORMA_ALERTA * 100}% do valor de arrematação. Avalie se vale a pena.`
      });
    }
    
    // Alerta para baixa economia
    if (calculos.percentualEconomia < CALCULATION_CONSTANTS.LIMITE_ECONOMIA_BAIXA * 100 && data.valorAvaliacao > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Baixa Economia',
        descricao: `A economia em relação ao valor de avaliação é menor que ${CALCULATION_CONSTANTS.LIMITE_ECONOMIA_BAIXA * 100}%. Considere se o negócio é vantajoso.`
      });
    }
    
    // Alerta para baixo retorno no aluguel (considerando renda líquida)
    if (data.objetivo === 'alugar' && calculos.retornoAnualAluguel && 
        calculos.retornoAnualAluguel < CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Baixo Retorno no Aluguel',
        descricao: `O retorno anual líquido está abaixo de ${CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100}%. Considere outras opções de investimento.`
      });
    }
    
    // Alerta para renda líquida negativa no aluguel
    if (data.objetivo === 'alugar' && calculos.rendaLiquidaMensal && calculos.rendaLiquidaMensal <= 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Renda Líquida Negativa',
        descricao: 'O valor do aluguel não cobre os gastos mensais (condomínio + IPTU). Você terá prejuízo mensal.'
      });
    }
    
    // Alerta para financiamento com juros altos
    if (data.seraFinanciado && data.taxaJurosAnual && data.taxaJurosAnual > 12) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Taxa de Juros Elevada',
        descricao: 'A taxa de juros do financiamento está acima de 12% ao ano. Considere negociar melhores condições.'
      });
    }
    
    // Alerta para boa oportunidade
    if (calculos.percentualEconomia > 20) {
      alertas.push({
        tipo: 'success',
        titulo: 'Boa Oportunidade',
        descricao: `Excelente economia de ${calculos.percentualEconomia.toFixed(1)}% em relação ao valor de avaliação!`
      });
    }
    
    // Alerta específico para uso próprio
    if (data.objetivo === 'uso proprio') {
      alertas.push({
        tipo: 'info',
        titulo: 'Uso Próprio',
        descricao: 'Como o objetivo é uso próprio, os cálculos de rentabilidade não se aplicam. Foque nos custos totais de aquisição.'
      });
    }
    
    return alertas;
  }
}