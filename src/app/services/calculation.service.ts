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
    
    // Cálculos de financiamento usando SAC (Sistema de Amortização Constante)
    let valorFinanciado: number | undefined;
    let jurosTotaisEstimados: number | undefined;
    let segurosObrigatorios: number | undefined;
    let parcelaMensalEstimada: number | undefined;
    let segurosObrigatoriosMensal: number | undefined;
    let totalFinanciamento: number | undefined;
    let valorEntradaFinal: number | undefined;
    let valorArrematacaoParaCustos: number; 
    
    if (data.seraFinanciado && data.taxaJurosAnual) {
      const entrada = data.valorEntrada || (data.valorArrematacao * CALCULATION_CONSTANTS.ENTRADA_PADRAO);
      valorEntradaFinal = entrada;
      valorFinanciado = data.valorArrematacao - entrada;
      
      valorArrematacaoParaCustos = entrada;
      
      const prazoAnos = data.prazoFinanciamentoAnos || CALCULATION_CONSTANTS.PRAZO_FINANCIAMENTO_PADRAO;
      const prazoMeses = prazoAnos * 12;
      const taxaMensal = (data.taxaJurosAnual / 100) / 12;
      
      segurosObrigatoriosMensal = valorFinanciado * CALCULATION_CONSTANTS.SEGUROS_OBRIGATORIOS_MENSAL;
      segurosObrigatorios = segurosObrigatoriosMensal * 12; // anual
      
      // Cálculo SAC (Sistema de Amortização Constante)
      const amortizacaoMensal = valorFinanciado / prazoMeses;
      
      // Primeira parcela (maior parcela no SAC) - Esta é a estimativa que vamos mostrar
      const jurosPrimeiraParcela = valorFinanciado * taxaMensal;
      parcelaMensalEstimada = amortizacaoMensal + jurosPrimeiraParcela;
      
      // Cálculo dos juros totais no SAC
      // Fórmula: Juros Totais = (Valor Financiado × Taxa Mensal × (Prazo + 1)) / 2
      jurosTotaisEstimados = (valorFinanciado * taxaMensal * (prazoMeses + 1)) / 2;
      
      // Cálculo do valor total do financiamento
      const taxaAdministracaoMensal = 25; // Valor fixo baseado na simulação da Caixa
      const segurosTotal = segurosObrigatoriosMensal * prazoMeses;
      const taxaAdministracaoTotal = taxaAdministracaoMensal * prazoMeses;
      
      totalFinanciamento = valorFinanciado + jurosTotaisEstimados + segurosTotal + taxaAdministracaoTotal;
    } else {
      valorArrematacaoParaCustos = data.valorArrematacao;
    }
    
    // Custo total de aquisição
    const custoTotalAquisicao = valorArrematacaoParaCustos + taxaLeiloeiro + itbi + 
                               custosCartorarios + honorariosAdvogado + 
                               data.valorDesocupacao + data.valorReforma;
    
    // Análise de rentabilidade para venda
    let ganhoBruto: number | undefined;
    let impostoRenda: number | undefined;
    let ganhoLiquido: number | undefined;
    let custoTotalVenda: number | undefined;
    let margemLucro: number | undefined;
    
    if (data.objetivo === 'vender' && data.valorEstimadoVenda) {
      custoTotalVenda = data.valorArrematacao + taxaLeiloeiro + itbi + custosCartorarios + 
                       honorariosAdvogado + data.valorDesocupacao + data.valorReforma;
      
      ganhoBruto = data.valorEstimadoVenda - custoTotalVenda;
      
      if (ganhoBruto > 0) {
        impostoRenda = ganhoBruto * CALCULATION_CONSTANTS.ALIQUOTA_IR_GANHO_CAPITAL;
        ganhoLiquido = ganhoBruto - impostoRenda;
      } else {
        impostoRenda = 0;
        ganhoLiquido = ganhoBruto;
      }
      
      margemLucro = custoTotalVenda > 0 ? (ganhoLiquido / custoTotalVenda) * 100 : 0;
    }
    
    // Análise de rentabilidade para aluguel
    let retornoAnualAluguel: number | undefined;
    let rendaLiquidaMensal: number | undefined;
    let retornoAnualComFinanciamento: number | undefined;
    let fluxoCaixaMensal: number | undefined;
    
    if (data.objetivo === 'alugar' && data.valorAluguelMensal) {
      rendaLiquidaMensal = data.valorAluguelMensal - data.valorCondominio - iptuMensalFinal;
      
      if (data.seraFinanciado && parcelaMensalEstimada && segurosObrigatoriosMensal) {
        const investimentoInicial = custoTotalAquisicao;
        fluxoCaixaMensal = rendaLiquidaMensal - parcelaMensalEstimada - segurosObrigatoriosMensal - data.outrosGastosMensais - 25; // Inclui taxa de administração
        
        const rendaAnualLiquida = rendaLiquidaMensal * 12;
        retornoAnualAluguel = (rendaAnualLiquida / investimentoInicial) * 100;
        
        const fluxoCaixaAnual = fluxoCaixaMensal * 12;
        retornoAnualComFinanciamento = fluxoCaixaAnual > 0 ? (fluxoCaixaAnual / investimentoInicial) * 100 : 0;
      } else {
        const rendaAnualLiquida = rendaLiquidaMensal * 12;
        retornoAnualAluguel = (rendaAnualLiquida / custoTotalAquisicao) * 100;
      }
    }
    
    // Gastos mensais
    const custoMensalTotal = data.valorCondominio + iptuMensalFinal + data.outrosGastosMensais;
    const custoTotalPeriodo = custoMensalTotal * data.periodoAnalise;
    
    // Custo mensal com financiamento
    let custoMensalComFinanciamento: number | undefined;
    if (data.seraFinanciado && parcelaMensalEstimada && segurosObrigatoriosMensal) {
      custoMensalComFinanciamento = custoMensalTotal + parcelaMensalEstimada + segurosObrigatoriosMensal + 25; // Inclui taxa de administração
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
      retornoAnualComFinanciamento,
      valorFinanciado,
      rendaLiquidaMensal,
      fluxoCaixaMensal
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
      valorArrematacaoParaCustos,
      jurosTotaisEstimados,
      segurosObrigatorios,
      parcelaMensalEstimada,
      segurosObrigatoriosMensal,
      custoTotalAquisicao,
      totalFinanciamento,
      ganhoBruto,
      impostoRenda,
      ganhoLiquido,
      custoTotalVenda,
      margemLucro,
      retornoAnualAluguel,
      retornoAnualComFinanciamento,
      rendaLiquidaMensal,
      fluxoCaixaMensal,
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
      return (valorVenal * CALCULATION_CONSTANTS.IPTU_ANUAL_PADRAO) / 12;
    }
    
    const iptuAnual = (valorVenal * faixa.multiplicador) - faixa.subtrair;
    return Math.max(0, iptuAnual / 12);
  }
  
  private gerarAlertas(data: ImovelData, calculos: any): Alerta[] {
    const alertas: Alerta[] = [];
    
    if (data.valorDesocupacao > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Imóvel Ocupado',
        descricao: 'Considere os custos e tempo necessário para desocupação do imóvel.'
      });
    }
    
    if (data.valorReforma > data.valorArrematacao * CALCULATION_CONSTANTS.LIMITE_REFORMA_ALERTA) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Alto Custo de Reforma',
        descricao: `O custo de reforma representa mais de ${CALCULATION_CONSTANTS.LIMITE_REFORMA_ALERTA * 100}% do valor de arrematação. Avalie se vale a pena.`
      });
    }
    
    if (calculos.percentualEconomia < CALCULATION_CONSTANTS.LIMITE_ECONOMIA_BAIXA * 100 && data.valorAvaliacao > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Baixa Economia',
        descricao: `A economia em relação ao valor de avaliação é menor que ${CALCULATION_CONSTANTS.LIMITE_ECONOMIA_BAIXA * 100}%. Considere se o negócio é vantajoso.`
      });
    }
    
    const retornoParaAnalise = data.seraFinanciado ? calculos.retornoAnualComFinanciamento : calculos.retornoAnualAluguel;
    if (data.objetivo === 'alugar' && retornoParaAnalise !== undefined && 
        retornoParaAnalise < CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Baixo Retorno no Aluguel',
        descricao: `O retorno anual está abaixo de ${CALCULATION_CONSTANTS.LIMITE_RETORNO_BAIXO * 100}%. Considere outras opções de investimento.`
      });
    }
    
    if (data.objetivo === 'alugar' && calculos.rendaLiquidaMensal && calculos.rendaLiquidaMensal <= 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Renda Líquida Negativa',
        descricao: 'O valor do aluguel não cobre os gastos mensais (condomínio + IPTU). Você terá prejuízo mensal.'
      });
    }
    
    if (data.objetivo === 'alugar' && data.seraFinanciado && calculos.fluxoCaixaMensal && calculos.fluxoCaixaMensal <= 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Fluxo de Caixa Negativo',
        descricao: 'Após pagar o financiamento e gastos mensais, você terá fluxo de caixa negativo. Considere aumentar a entrada ou renegociar condições.'
      });
    }
    
    if (data.seraFinanciado && data.taxaJurosAnual && data.taxaJurosAnual > 12) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Taxa de Juros Elevada',
        descricao: 'A taxa de juros do financiamento está acima de 12% ao ano. Considere negociar melhores condições.'
      });
    }
    
    if (calculos.percentualEconomia > 20) {
      alertas.push({
        tipo: 'success',
        titulo: 'Boa Oportunidade',
        descricao: `Excelente economia de ${calculos.percentualEconomia.toFixed(1)}% em relação ao valor de avaliação!`
      });
    }
    
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

