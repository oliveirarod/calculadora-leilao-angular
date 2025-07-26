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
    
    // Custo total de aquisição
    const custoTotalAquisicao = data.valorArrematacao + taxaLeiloeiro + itbi + 
                               custosCartorarios + honorariosAdvogado + 
                               data.valorDesocupacao + data.valorReforma;
    
    // Cálculo automático do IPTU mensal
    const iptuMensalCalculado = data.valorAvaliacao > 0 
      ? (data.valorAvaliacao * CALCULATION_CONSTANTS.IPTU_ANUAL_PADRAO) / 12
      : 0;
    
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
    
    if (data.seraFinanciado && data.taxaJurosAnual) {
      const entrada = data.valorEntrada || (data.valorArrematacao * CALCULATION_CONSTANTS.ENTRADA_PADRAO);
      valorFinanciado = data.valorArrematacao - entrada;
      jurosAnuaisEstimados = valorFinanciado * (data.taxaJurosAnual / 100);
      
      const prazoAnos = data.prazoFinanciamentoAnos || CALCULATION_CONSTANTS.PRAZO_FINANCIAMENTO_PADRAO;
      jurosTotaisEstimados = jurosAnuaisEstimados * prazoAnos;
      
      segurosObrigatoriosMensal = valorFinanciado * CALCULATION_CONSTANTS.SEGUROS_OBRIGATORIOS_MENSAL;
      segurosObrigatorios = segurosObrigatoriosMensal * 12; // anual
      
      // Estimativa simplificada da parcela mensal
      const prazoMeses = prazoAnos * 12;
      const jurosMensal = jurosAnuaisEstimados / 12;
      parcelaMensalEstimada = (valorFinanciado / prazoMeses) + jurosMensal;
      
      // Total dos custos de financiamento
      totalFinanciamento = jurosTotaisEstimados + (segurosObrigatorios * prazoAnos);
    }
    
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
    
    if (data.objetivo === 'alugar' && data.valorAluguelMensal) {
      const rendaAnual = data.valorAluguelMensal * 12;
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
      valorFinanciado
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
      custoMensalTotal,
      custoTotalPeriodo,
      custoMensalComFinanciamento,
      economiaEmRelacaoAvaliacao,
      percentualEconomia,
      iptuMensalCalculado,
      alertas
    };
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
    
    // Alerta para baixo retorno no aluguel
    if (data.objetivo === 'alugar' && calculos.retornoAnualAluguel && 
        calculos.retornoAnualAluguel < CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Baixo Retorno no Aluguel',
        descricao: `O retorno anual está abaixo de ${CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100}%. Considere outras opções de investimento.`
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

