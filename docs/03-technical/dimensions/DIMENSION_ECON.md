# Dimensão ECONÔMICA (ECON)

## Visão Geral

A dimensão econômica analisa a capacidade de geração de riqueza, emprego e renda nos municípios do Tocantins, considerando a estrutura produtiva, finanças públicas e dinâmica empresarial.

---

## Indicadores Disponíveis

### 1. Produto Interno Bruto

#### PIB Total
- **Código**: `PIB_TOTAL`
- **Descrição**: Soma de todos os bens e serviços finais produzidos no município
- **Unidade**: R$ (reais)
- **Fonte**: IBGE - Contas Regionais
- **Periodicidade**: Anual (defasagem de 3 anos)
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/37/p/all`
- **Anos disponíveis**: 2002-2021

#### PIB per Capita
- **Código**: `PIB_PER_CAPITA`
- **Descrição**: PIB dividido pela população estimada
- **Unidade**: R$/habitante
- **Fonte**: IBGE - Contas Regionais
- **Periodicidade**: Anual
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/513/p/all`
- **Referências**:
  - Brasil 2021: R$ 46.154
  - Norte 2021: R$ 28.529
  - Tocantins 2021: R$ 32.775

### 2. Valor Adicionado Bruto (VAB) por Setor

#### VAB Agropecuária
- **Código**: `VAB_AGROPECUARIA`
- **Descrição**: Valor adicionado pelo setor agropecuário
- **Unidade**: R$ (milhares)
- **Fonte**: IBGE - Contas Regionais
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/517/p/all`
- **Tooltip**: Inclui agricultura, pecuária, silvicultura, exploração florestal e pesca

#### VAB Indústria
- **Código**: `VAB_INDUSTRIA`
- **Descrição**: Valor adicionado pelo setor industrial
- **Unidade**: R$ (milhares)
- **Fonte**: IBGE - Contas Regionais
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/518/p/all`
- **Tooltip**: Inclui indústria extrativa, transformação, construção e utilidades

#### VAB Serviços
- **Código**: `VAB_SERVICOS`
- **Descrição**: Valor adicionado pelo setor de serviços
- **Unidade**: R$ (milhares)
- **Fonte**: IBGE - Contas Regionais
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/519/p/all`
- **Tooltip**: Inclui comércio, transporte, alojamento, informação, finanças, etc.

#### VAB Administração Pública
- **Código**: `VAB_ADM_PUBLICA`
- **Descrição**: Valor adicionado pela administração pública
- **Unidade**: R$ (milhares)
- **Fonte**: IBGE - Contas Regionais
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/6575/p/all`
- **Tooltip**: Administração pública, defesa, seguridade social, educação e saúde públicas

### 3. Mercado de Trabalho

#### Empregos Formais (Estoque)
- **Código**: `EMPREGOS_FORMAIS`
- **Descrição**: Total de vínculos empregatícios formais ativos em 31/dezembro
- **Unidade**: vínculos
- **Fonte**: Ministério do Trabalho - CAGED/RAIS
- **API**: Base dos Dados (tratada)
- **URL**: https://basedosdados.org/dataset/br-me-rais
- **Query BigQuery**:
```sql
SELECT
  id_municipio,
  ano,
  COUNT(*) as total_empregos,
  AVG(valor_remuneracao_media) as salario_medio
FROM `basedosdados.br_me_rais.microdados_vinculos`
WHERE sigla_uf = 'TO' AND ano = 2022
GROUP BY id_municipio, ano
```

#### Salário Médio
- **Código**: `SALARIO_MEDIO`
- **Descrição**: Remuneração média dos empregos formais
- **Unidade**: R$/mês
- **Fonte**: RAIS/CAGED
- **Tooltip**: Média aritmética das remunerações em dezembro

#### Taxa de Formalização
- **Código**: `TAXA_FORMALIZACAO`
- **Descrição**: Proporção de ocupados com carteira assinada
- **Unidade**: %
- **Fonte**: IBGE - PNAD Contínua
- **Limitação**: Disponível apenas para grandes municípios

#### Saldo de Empregos (CAGED)
- **Código**: `SALDO_EMPREGOS`
- **Descrição**: Admissões menos desligamentos no período
- **Unidade**: vínculos
- **Fonte**: CAGED
- **Periodicidade**: Mensal
- **API**: Portal Brasileiro de Dados Abertos
- **Endpoint**: `https://dados.gov.br/dados/conjuntos-dados/caged`

### 4. Estrutura Empresarial

#### Empresas Ativas
- **Código**: `EMPRESAS_ATIVAS`
- **Descrição**: Total de empresas com CNPJ ativo no município
- **Unidade**: unidades
- **Fonte**: IBGE - CEMPRE (Cadastro Central de Empresas)
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/6450/n6/in n3 17/v/707/p/all`

#### MEI (Microempreendedores Individuais)
- **Código**: `MEI_ATIVOS`
- **Descrição**: Total de MEIs ativos
- **Unidade**: unidades
- **Fonte**: Portal do Empreendedor / DataSebrae
- **URL**: https://datasebrae.com.br/totaldeempresas/
- **Tooltip**: Indica nível de empreendedorismo informal formalizado

#### Densidade Empresarial
- **Código**: `DENSIDADE_EMPRESARIAL`
- **Descrição**: Empresas por 1.000 habitantes
- **Unidade**: empresas/1.000 hab
- **Fórmula**: (Empresas ativas / População) × 1.000

### 5. Finanças Públicas Municipais

#### Receita Corrente Líquida (RCL)
- **Código**: `RECEITA_CORRENTE_LIQUIDA`
- **Descrição**: Soma das receitas correntes menos transferências constitucionais
- **Unidade**: R$
- **Fonte**: Tesouro Nacional - SICONFI
- **API REST**: https://apidatalake.tesouro.gov.br/
- **Endpoint**: `/ords/siconfi/tt/rgf`
- **Parâmetros**: `an_exercicio=2023&id_ente=17XXXXX&co_tipo_demonstrativo=RGF`

#### Receita Tributária Própria
- **Código**: `RECEITA_TRIBUTARIA`
- **Descrição**: Receitas de IPTU, ISS, ITBI e taxas
- **Unidade**: R$
- **Fonte**: SICONFI / FINBRA
- **Tooltip**: Indica capacidade de arrecadação própria

#### FPM (Fundo de Participação dos Municípios)
- **Código**: `RECEITA_FPM`
- **Descrição**: Transferências constitucionais do FPM
- **Unidade**: R$
- **Fonte**: Tesouro Nacional
- **URL**: https://sisweb.tesouro.gov.br/apex/f?p=2501:9::::9:P9_ID_UG:

#### Dependência de Transferências
- **Código**: `DEPENDENCIA_TRANSFERENCIAS`
- **Descrição**: Proporção das receitas que vêm de transferências
- **Unidade**: %
- **Fórmula**: (Receitas de transferências / Receita total) × 100
- **Referência**: Acima de 80% indica alta dependência

#### Despesa com Pessoal
- **Código**: `DESPESA_PESSOAL_RCL`
- **Descrição**: Gasto com pessoal como proporção da RCL
- **Unidade**: %
- **Fonte**: RGF - SICONFI
- **Limite legal**: 54% (Executivo municipal, LRF)

#### Investimentos Públicos
- **Código**: `INVESTIMENTOS_PUBLICOS`
- **Descrição**: Despesas de capital em investimentos
- **Unidade**: R$
- **Fonte**: SICONFI
- **Tooltip**: Capacidade de investimento do município

### 6. Agropecuária

#### Valor da Produção Agrícola
- **Código**: `VALOR_PRODUCAO_AGRICOLA`
- **Descrição**: Valor total da produção agrícola municipal
- **Unidade**: R$ (mil)
- **Fonte**: IBGE - PAM (Produção Agrícola Municipal)
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5457/n6/in n3 17/v/215/p/all`

#### Área Plantada
- **Código**: `AREA_PLANTADA`
- **Descrição**: Área total destinada à agricultura
- **Unidade**: hectares
- **Fonte**: IBGE - PAM
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/5457/n6/in n3 17/v/109/p/all`

#### Rebanho Bovino
- **Código**: `REBANHO_BOVINO`
- **Descrição**: Efetivo do rebanho bovino
- **Unidade**: cabeças
- **Fonte**: IBGE - PPM (Pesquisa Pecuária Municipal)
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/3939/n6/in n3 17/v/105/p/all/c79/2670`

#### Valor da Produção Pecuária
- **Código**: `VALOR_PRODUCAO_PECUARIA`
- **Descrição**: Valor da produção de origem animal
- **Unidade**: R$ (mil)
- **Fonte**: IBGE - PPM
- **API**: SIDRA
- **Endpoint**: `https://apisidra.ibge.gov.br/values/t/74/n6/in n3 17/v/all/p/all`

### 7. Comércio Exterior

#### Exportações
- **Código**: `EXPORTACOES`
- **Descrição**: Valor FOB das exportações do município
- **Unidade**: US$
- **Fonte**: Comex Stat - MDIC
- **API**: https://api.comexstat.mdic.gov.br/
- **Endpoint**: `/general?filter=city&value=1721000`

#### Importações
- **Código**: `IMPORTACOES`
- **Descrição**: Valor CIF das importações do município
- **Unidade**: US$
- **Fonte**: Comex Stat - MDIC

#### Saldo Comercial
- **Código**: `SALDO_COMERCIAL`
- **Descrição**: Exportações menos importações
- **Unidade**: US$
- **Fórmula**: Exportações - Importações

---

## Novos Indicadores Sugeridos

### Crédito e Sistema Financeiro

#### Operações de Crédito
- **Código**: `OPERACOES_CREDITO`
- **Descrição**: Volume de operações de crédito no município
- **Fonte**: Banco Central - ESTBAN
- **URL**: https://www.bcb.gov.br/estatisticas/estatisticabancariamunicipios
- **Query**:
```sql
-- Dados disponíveis em CSV mensal
SELECT municipio, data, credito_total, depositos_vista, depositos_prazo
FROM estban WHERE uf = 'TO'
```

#### Agências Bancárias
- **Código**: `AGENCIAS_BANCARIAS`
- **Descrição**: Número de agências bancárias
- **Fonte**: Banco Central - ESTBAN
- **Tooltip**: Indicador de inclusão financeira

### Infraestrutura Produtiva

#### Consumo de Energia Elétrica
- **Código**: `CONSUMO_ENERGIA_INDUSTRIAL`
- **Descrição**: Consumo de energia pela classe industrial
- **Unidade**: MWh
- **Fonte**: EPE - Anuário Estatístico de Energia Elétrica
- **URL**: https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica

#### Consumo de Energia Comercial
- **Código**: `CONSUMO_ENERGIA_COMERCIAL`
- **Descrição**: Consumo de energia pela classe comercial
- **Unidade**: MWh
- **Fonte**: EPE

### Turismo

#### ISSQN Turismo
- **Código**: `ISSQN_TURISMO`
- **Descrição**: Arrecadação de ISS de serviços turísticos
- **Unidade**: R$
- **Fonte**: Secretarias Municipais de Fazenda

#### Leitos Hoteleiros
- **Código**: `LEITOS_HOTELEIROS`
- **Descrição**: Capacidade de hospedagem
- **Unidade**: leitos
- **Fonte**: Cadastur - MTur
- **URL**: https://dados.turismo.gov.br/

---

## Análises Sugeridas

### 1. Perfil Produtivo Municipal
**Objetivo**: Identificar a vocação econômica de cada município
**Indicadores**: VAB por setor, Área plantada, Rebanho, Empresas por setor
**Método**: Análise de composição setorial + Quociente Locacional

### 2. Dependência Fiscal
**Objetivo**: Avaliar a sustentabilidade fiscal municipal
**Indicadores**: Receita tributária, FPM, Dependência de transferências
**Método**: Comparação com benchmark estadual + tendência temporal

### 3. Dinâmica do Emprego
**Objetivo**: Monitorar geração/destruição de postos de trabalho
**Indicadores**: Saldo CAGED, Empregos formais, Salário médio
**Método**: Série temporal + sazonalidade

### 4. Potencial Exportador
**Objetivo**: Identificar municípios com vocação exportadora
**Indicadores**: Exportações, Saldo comercial, VAB Agropecuária
**Método**: Correlação produção x exportação

### 5. Concentração Econômica
**Objetivo**: Medir desigualdade econômica intermunicipal
**Indicadores**: PIB, PIB per capita por município
**Método**: Índice de Gini, Curva de Lorenz

### 6. Análise de Cluster Econômico
**Objetivo**: Agrupar municípios por perfil econômico similar
**Indicadores**: Todos os indicadores ECON
**Método**: K-means clustering

---

## APIs e Endpoints Consolidados

| Indicador | API | Endpoint Base |
|-----------|-----|---------------|
| PIB/VAB | SIDRA | `https://apisidra.ibge.gov.br/values/t/5938` |
| PAM | SIDRA | `https://apisidra.ibge.gov.br/values/t/5457` |
| PPM | SIDRA | `https://apisidra.ibge.gov.br/values/t/3939` |
| CEMPRE | SIDRA | `https://apisidra.ibge.gov.br/values/t/6450` |
| Finanças | SICONFI | `https://apidatalake.tesouro.gov.br/ords/siconfi/` |
| Comex | MDIC | `https://api.comexstat.mdic.gov.br/` |
| Crédito | BCB | `https://www.bcb.gov.br/estatisticas/estatisticabancariamunicipios` |

---

## Exemplo de Coleta - SIDRA

```typescript
// Coletar PIB per capita de todos os municípios do Tocantins
const url = 'https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/513/p/2021/f/n';

const response = await fetch(url);
const data = await response.json();

// Resultado: Array de objetos com D1C (código município), D2C (ano), V (valor)
```

## Referências

1. IBGE - Contas Regionais: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9054-contas-regionais-do-brasil.html
2. RAIS/CAGED: https://portalfat.mte.gov.br/
3. SICONFI: https://siconfi.tesouro.gov.br/
4. Comex Stat: https://comexstat.mdic.gov.br/
5. Base dos Dados: https://basedosdados.org/
