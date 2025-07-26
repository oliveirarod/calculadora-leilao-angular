export const CALCULATION_CONSTANTS = {
  // Percentuais padrão
  TAXA_LEILOEIRO: 0.05, // 5%
  ITBI_PADRAO: 0.02, // 2%
  ITBI_MAXIMO: 0.03, // 3%
  
  // Custos cartorários (percentual do valor de arrematação)
  CUSTOS_CARTORARIOS_COM_FINANCIAMENTO: 0.004, // 0.4% (apenas registro)
  CUSTOS_CARTORARIOS_SEM_FINANCIAMENTO: 0.01, // 1% (escritura + registro)
  
  // Imposto de Renda sobre ganho de capital
  ALIQUOTA_IR_GANHO_CAPITAL: 0.15, // 15%
  
  // Seguros obrigatórios (percentual mensal do valor financiado)
  SEGUROS_OBRIGATORIOS_MENSAL: 0.0008, // 0.08% ao mês
  
  // Limites para alertas
  LIMITE_REFORMA_ALERTA: 0.3, // 30% do valor de arrematação
  LIMITE_DIVIDAS_ALERTA: 0.1, // 10% do valor de arrematação
  LIMITE_ECONOMIA_BAIXA: 0.1, // 10% de economia mínima
  LIMITE_RETORNO_BAIXO: 0.06, // 6% de retorno anual mínimo
  
  // Valores padrão
  ENTRADA_PADRAO: 0.05, // 5% de entrada (padrão para leilões)
  PRAZO_FINANCIAMENTO_PADRAO: 30, // 30 anos
  
  // IPTU - estimativa baseada no valor de avaliação
  IPTU_ANUAL_MIN: 0.005, // 0.5% do valor de avaliação
  IPTU_ANUAL_MAX: 0.01, // 1% do valor de avaliação
  IPTU_ANUAL_PADRAO: 0.007, // 0.7% do valor de avaliação (média)
  
  // Nova tabela de IPTU baseada no valor venal
  IPTU_FAIXAS: [
    {
      valorMinimo: 0,
      valorMaximo: 150000,
      multiplicador: 0.007,
      subtrair: 0
    },
    {
      valorMinimo: 150001,
      valorMaximo: 300000,
      multiplicador: 0.009,
      subtrair: 300
    },
    {
      valorMinimo: 300001,
      valorMaximo: 600000,
      multiplicador: 0.011,
      subtrair: 900
    },
    {
      valorMinimo: 600001,
      valorMaximo: 1200000,
      multiplicador: 0.013,
      subtrair: 2100
    },
    {
      valorMinimo: 1200001,
      valorMaximo: Infinity,
      multiplicador: 0.015,
      subtrair: 4500
    }
  ]
};