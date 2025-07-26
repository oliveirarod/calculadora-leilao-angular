export interface CalculatedResults {
  // Custos básicos
  taxaLeiloeiro: number;
  itbi: number;
  custosCartorarios: number;
  custosCartorariosDescricao: string; // Nova propriedade para explicar o que está incluído
  honorariosAdvogado: number;
  valorDesocupacao: number;
  valorReforma: number;
  
  // Custos de financiamento
  valorFinanciado?: number;
  valorEntradaFinal?: number; // Novo campo
  valorArrematacaoParaCustos: number; // Novo campo para distinguir o valor na tabela de custos
  jurosAnuaisEstimados?: number;
  jurosTotaisEstimados?: number;
  segurosObrigatorios?: number;
  parcelaMensalEstimada?: number;
  segurosObrigatoriosMensal?: number;
  
  // Totais
  custoTotalAquisicao: number;
  totalFinanciamento?: number; // Total dos custos de financiamento
  
  // Análise de rentabilidade (venda)
  ganhoBruto?: number;
  impostoRenda?: number;
  ganhoLiquido?: number;
  
  // Análise de rentabilidade (aluguel)
  retornoAnualAluguel?: number;
  rendaLiquidaMensal?: number; // Novo campo para renda líquida (descontando condomínio e IPTU)
  
  // Gastos mensais
  custoMensalTotal: number;
  custoTotalPeriodo: number;
  custoMensalComFinanciamento?: number; // Novo campo
  
  // Comparações
  economiaEmRelacaoAvaliacao: number;
  percentualEconomia: number;
  
  // IPTU calculado automaticamente
  iptuMensalCalculado: number;
  
  // Alertas
  alertas: Alerta[];
}

export interface Alerta {
  tipo: 'warning' | 'info' | 'success';
  titulo: string;
  descricao: string;
}