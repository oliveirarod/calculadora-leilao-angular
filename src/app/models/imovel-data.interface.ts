export interface ImovelData {
  // Dados básicos
  objetivo: 'vender' | 'alugar' | 'uso proprio';
  valorAvaliacao: number;
  valorArrematacao: number;
  
  // Financiamento
  seraFinanciado: boolean;
  taxaJurosAnual?: number;
  valorEntrada?: number;
  prazoFinanciamentoAnos?: number;
  
  // Advogado
  usaraAdvogado: boolean;
  honorariosAdvogado?: number;
  
  // Taxas e custos
  percentualITBI: number;
  valorDesocupacao: number;
  valorReforma: number;
  
  // Valores condicionais baseados no objetivo
  valorEstimadoVenda?: number;
  valorAluguelMensal?: number;
  
  // Gastos mensais
  valorCondominio: number;
  valorIPTUMensal: number; // Agora pode ser sobrescrito
  outrosGastosMensais: number;
  periodoAnalise: number; // em meses
}

