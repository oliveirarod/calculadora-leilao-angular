# 📊 Calculadora de Leilão de Imóveis - Angular 17 (Versão 2.0)

## 🚀 Guia de Instalação e Execução - Versão Atualizada

### ✨ Novidades da Versão 2.0

- ✅ **Nova opção "Uso Próprio"** como objetivo da compra
- ✅ **Entrada padrão de 5%** para financiamentos de leilão
- ✅ **Prazo padrão de 30 anos** para financiamento
- ✅ **Cálculo automático do IPTU** baseado no valor de avaliação
- ✅ **Correção do bug dos inputs** (não iniciam mais com "0")
- ✅ **Custos cartorários explicitados** (registro vs escritura+registro)
- ✅ **Totais em todas as tabelas** de custos
- ✅ **Financiamento calculado sobre valor de arrematação** (correção importante)
- ✅ **Gastos mensais detalhados** e clarificados

### 📋 Pré-requisitos

Antes de executar a aplicação, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verifique a instalação: `node --version`

2. **npm** (geralmente vem com o Node.js)
   - Verifique a instalação: `npm --version`

3. **Angular CLI** (versão 17)
   ```bash
   npm install -g @angular/cli@17
   ```

### 📦 Instalação

1. **Extrair o projeto**
   - Extraia o arquivo `calculadora-leilao-angular-v2.zip` em uma pasta de sua escolha

2. **Navegar para o diretório do projeto**
   ```bash
   cd calculadora-leilao-angular
   ```

3. **Instalar as dependências**
   ```bash
   npm install
   ```

### ▶️ Execução

1. **Iniciar o servidor de desenvolvimento**
   ```bash
   ng serve
   ```
   
   Ou, se preferir especificar a porta:
   ```bash
   ng serve --port 4200
   ```

2. **Acessar a aplicação**
   - Abra seu navegador e acesse: `http://localhost:4200`
   - A aplicação será recarregada automaticamente quando você fizer alterações no código

### 🎯 Como Usar a Calculadora

#### 1. **Dados Básicos**
- **Objetivo da Compra**: Escolha entre Aluguel, Revenda ou **Uso Próprio** (novo!)
- **Valor de Avaliação**: Informe o valor de avaliação do imóvel (usado para calcular IPTU automaticamente)
- **Valor de Arrematação**: Valor que você pretende arrematar o imóvel

#### 2. **Financiamento**
- Marque se será financiado
- **Taxa de Juros**: Informe a taxa anual do financiamento
- **Entrada**: Deixe vazio para usar 5% automático (padrão para leilões)
- **Prazo**: Deixe vazio para usar 30 anos automático

#### 3. **Custos Adicionais**
- **ITBI**: Percentual padrão de 2% (ajustável)
- **Desocupação**: Custo estimado se o imóvel estiver ocupado
- **Reforma**: Valor estimado para reformas necessárias

#### 4. **Gastos Mensais**
- **Condomínio**: Valor mensal do condomínio
- **IPTU**: Calculado automaticamente (0,7% do valor de avaliação/ano ÷ 12)
- **Outros Gastos**: Outros custos mensais estimados

### 🔧 Comandos Úteis

- **Compilar para produção:**
  ```bash
  ng build --prod
  ```

- **Executar testes:**
  ```bash
  ng test
  ```

- **Gerar novos componentes:**
  ```bash
  ng generate component nome-do-componente
  ```

- **Gerar novos serviços:**
  ```bash
  ng generate service nome-do-servico
  ```

### 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes da aplicação
│   │   ├── input-form/      # Formulário de entrada (ATUALIZADO)
│   │   ├── results-display/ # Exibição dos resultados (ATUALIZADO)
│   │   └── alerts/          # Componente de alertas
│   ├── models/              # Interfaces e tipos (ATUALIZADOS)
│   │   ├── imovel-data.interface.ts      # Interface com "uso próprio"
│   │   └── calculated-results.interface.ts # Interface com novos campos
│   ├── services/            # Serviços (ATUALIZADOS)
│   │   └── calculation.service.ts        # Lógica com melhorias
│   ├── constants/           # Constantes (ATUALIZADAS)
│   │   └── calculation-constants.ts      # Novos valores padrão
│   ├── app.component.*      # Componente principal
│   └── app.config.ts        # Configuração da aplicação
├── assets/                  # Arquivos estáticos
├── styles.scss             # Estilos globais (ATUALIZADOS)
└── index.html              # Página principal
```

### 🆕 Principais Melhorias Implementadas

#### **1. Correção do Bug dos Inputs**
- Os campos não iniciam mais com "0"
- Quando você clica em um campo vazio, ele não mostra "0"
- Experiência muito mais fluida

#### **2. Cálculo Automático do IPTU**
- Baseado em 0,7% do valor de avaliação anual
- Dividido por 12 para obter o valor mensal
- Indicador visual quando calculado automaticamente
- Você pode sobrescrever o valor se necessário

#### **3. Valores Padrão Realistas**
- **Entrada**: 5% (padrão para leilões da Caixa)
- **Prazo**: 30 anos (padrão do mercado)
- Placeholders informativos nos campos

#### **4. Financiamento Corrigido**
- Agora é calculado **apenas sobre o valor de arrematação**
- Anteriormente estava incorreto (sobre o custo total)
- Cálculos muito mais precisos

#### **5. Resultados Mais Claros**
- **Custos cartorários explicitados**: mostra se é só registro ou escritura+registro
- **Totais em todas as tabelas**: cada seção tem seu total
- **Gastos mensais detalhados**: separação clara entre custos básicos e financiamento

### 🎨 Interface Aprimorada

- **Design responsivo** para desktop e mobile
- **Seções bem organizadas** com títulos claros
- **Indicadores visuais** para valores calculados automaticamente
- **Cores diferenciadas** para diferentes tipos de informação
- **Totais destacados** visualmente

### ⚠️ Solução de Problemas

**Erro: "ng: command not found"**
- Instale o Angular CLI globalmente: `npm install -g @angular/cli@17`

**Erro: "Cannot find module"**
- Execute: `npm install` no diretório do projeto

**Porta já em uso**
- Use uma porta diferente: `ng serve --port 4201`

**Problemas de permissão (Linux/Mac)**
- Use `sudo` se necessário: `sudo npm install -g @angular/cli@17`

**Campos não funcionam corretamente**
- Certifique-se de que está usando a versão 2.0 atualizada
- Limpe o cache do navegador (Ctrl+F5)

### 🔍 Testando as Melhorias

Para verificar se as melhorias estão funcionando:

1. **Teste o bug dos inputs**: Clique em qualquer campo - não deve aparecer "0"
2. **Teste o IPTU automático**: Preencha o valor de avaliação e veja o IPTU ser calculado
3. **Teste "Uso Próprio"**: Selecione esta opção e veja que campos de rentabilidade desaparecem
4. **Teste os totais**: Faça um cálculo e veja os totais em cada seção
5. **Teste o financiamento**: Veja que é calculado sobre o valor de arrematação, não o total

### 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todos os pré-requisitos estão instalados
2. Certifique-se de estar no diretório correto do projeto
3. Execute `npm install` para garantir que todas as dependências estão instaladas
4. Verifique se não há conflitos de porta
5. Consulte o changelog para entender as melhorias implementadas

### 🎉 Aproveite a Nova Versão!

A versão 2.0 da calculadora está muito mais precisa, intuitiva e completa. Todas as melhorias solicitadas foram implementadas com foco na experiência do usuário e precisão dos cálculos.

---

**Versão:** 2.0  
**Data:** Janeiro 2025  
**Desenvolvido com:** Angular 17 + TypeScript + SCSS  
**Compatibilidade:** Navegadores modernos (Chrome, Firefox, Safari, Edge)

