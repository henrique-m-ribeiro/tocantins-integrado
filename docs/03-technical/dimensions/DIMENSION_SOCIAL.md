# Dimensão SOCIAL - Documento de Referência

## Visão Geral

A dimensão SOCIAL abrange indicadores relacionados a educação, saúde, desenvolvimento social, habitação, segurança pública e assistência social. Esta dimensão é fundamental para avaliar a qualidade de vida e o desenvolvimento humano dos municípios tocantinenses.

---

## 1. EDUCAÇÃO

### 1.1 Qualidade do Ensino

#### IDEB - Índice de Desenvolvimento da Educação Básica
- **Fonte**: INEP/MEC
- **Periodicidade**: Bienal (anos ímpares)
- **Disponibilidade**: 2005-2023
- **Desagregação**: Município, escola, rede (pública/privada)
- **Descrição**: Combina desempenho em provas (Saeb) com taxas de aprovação

**API/Coleta**:
```
URL Base: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/ideb
Formato: CSV/Excel para download
Alternativa: Microdados INEP
```

**Dados disponíveis**:
- IDEB Anos Iniciais (1º ao 5º ano)
- IDEB Anos Finais (6º ao 9º ano)
- IDEB Ensino Médio
- Metas projetadas

#### Taxa de Distorção Idade-Série
- **Fonte**: INEP - Censo Escolar
- **Periodicidade**: Anual
- **Descrição**: Percentual de alunos com idade acima da recomendada para a série

**API/Coleta**:
```
URL: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxa-de-distorcao-idade-serie
Formato: CSV
Filtros: UF=17, Município
```

#### Taxa de Rendimento Escolar
- **Fonte**: INEP - Censo Escolar
- **Periodicidade**: Anual
- **Indicadores**:
  - Taxa de Aprovação
  - Taxa de Reprovação
  - Taxa de Abandono

**API/Coleta**:
```
URL: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxas-de-rendimento-escolar
```

### 1.2 Acesso à Educação

#### Matrículas por Etapa
- **Fonte**: INEP - Censo Escolar
- **Periodicidade**: Anual
- **Níveis**: Creche, Pré-escola, Fundamental, Médio, EJA, Educação Especial

**API/Coleta - INEP Sinopses**:
```
URL: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas/educacao-basica
Formato: Excel
```

**API Alternativa - IBGE SIDRA (Tabela 7129)**:
```
Endpoint: https://apisidra.ibge.gov.br/values/t/7129/n6/in%20n3%2017/v/allxp/p/last%205
Variáveis: Matrículas por nível de ensino
```

#### Taxa de Escolarização
- **Fonte**: IBGE - PNAD Contínua (estadual) / Censo (municipal)
- **Indicadores**:
  - Taxa de escolarização 0-3 anos (creche)
  - Taxa de escolarização 4-5 anos (pré-escola)
  - Taxa de escolarização 6-14 anos (fundamental)
  - Taxa de escolarização 15-17 anos (médio)

#### Taxa de Analfabetismo
- **Fonte**: IBGE - Censo/PNAD
- **Desagregação**: Faixa etária, sexo, cor/raça
- **Indicadores relacionados**: Analfabetismo funcional

**API SIDRA (Tabela 3540)**:
```
https://apisidra.ibge.gov.br/values/t/3540/n6/in%20n3%2017/v/1641/p/last%201
```

### 1.3 Infraestrutura Educacional

#### Escolas por Infraestrutura
- **Fonte**: INEP - Censo Escolar
- **Indicadores**:
  - Escolas com laboratório de informática
  - Escolas com biblioteca
  - Escolas com quadra de esportes
  - Escolas com internet banda larga
  - Escolas com acessibilidade
  - Escolas com esgoto sanitário adequado

**Coleta**: Microdados do Censo Escolar
```
URL: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar
```

#### Docentes
- **Indicadores**:
  - Número de docentes por etapa
  - Docentes com formação superior adequada
  - Proporção alunos/docente

### 1.4 Ensino Superior

#### Matrículas no Ensino Superior
- **Fonte**: INEP - Censo da Educação Superior
- **Indicadores**:
  - Matrículas em IES públicas
  - Matrículas em IES privadas
  - Concluintes por área

**Coleta**:
```
URL: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas/educacao-superior
```

---

## 2. SAÚDE

### 2.1 Mortalidade

#### Taxa de Mortalidade Infantil
- **Fonte**: DataSUS - SIM/SINASC
- **Periodicidade**: Anual
- **Descrição**: Óbitos de menores de 1 ano por 1.000 nascidos vivos

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10to.def
Parâmetros:
- Linha: Município
- Coluna: Ano
- Medidas: Óbitos, Nascidos vivos, Taxa
- Período: últimos 5 anos
- UF: Tocantins
```

**Componentes**:
- Mortalidade neonatal precoce (0-6 dias)
- Mortalidade neonatal tardia (7-27 dias)
- Mortalidade pós-neonatal (28 dias - 1 ano)

#### Taxa de Mortalidade Materna
- **Fonte**: DataSUS - SIM
- **Descrição**: Óbitos maternos por 100.000 nascidos vivos

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10to.def
```

#### Mortalidade por Causas
- **Fonte**: DataSUS - SIM
- **Grupos CID-10**:
  - Doenças do aparelho circulatório
  - Neoplasias
  - Causas externas (violência, acidentes)
  - Doenças respiratórias
  - Doenças infecciosas

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10to.def
Filtros: Categoria CID-10, Município, Ano
```

### 2.2 Cobertura e Acesso

#### Cobertura da Estratégia Saúde da Família (ESF)
- **Fonte**: e-Gestor AB / SISAB
- **Periodicidade**: Mensal
- **Descrição**: % população coberta por equipes de saúde da família

**API**:
```
URL: https://egestorab.saude.gov.br/paginas/acessoPublico/relatorios/relHistoricoCoberturaAB.xhtml
Alternativa: https://sisab.saude.gov.br/
Formato: CSV/Excel
```

#### Cobertura Vacinal
- **Fonte**: DataSUS - SI-PNI
- **Indicadores por vacina**:
  - BCG
  - Hepatite B
  - Pentavalente
  - Poliomielite
  - Tríplice viral
  - Febre amarela

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/dhdat.exe?bd_pni/cpnibr.def
```

#### Leitos Hospitalares
- **Fonte**: CNES - DataSUS
- **Indicadores**:
  - Leitos SUS por 1.000 habitantes
  - Leitos UTI por 10.000 habitantes
  - Leitos por especialidade

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?cnes/cnv/leiintto.def
```

### 2.3 Produção de Serviços

#### Procedimentos Ambulatoriais
- **Fonte**: DataSUS - SIA
- **Indicadores**:
  - Consultas médicas per capita
  - Procedimentos por grupo

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sia/cnv/qato.def
```

#### Internações Hospitalares
- **Fonte**: DataSUS - SIH
- **Indicadores**:
  - Taxa de internação
  - Tempo médio de permanência
  - Internações por causa (ICSAP)

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sih/cnv/nito.def
```

### 2.4 Saúde Materno-Infantil

#### Pré-natal
- **Fonte**: SINASC
- **Indicadores**:
  - % gestantes com 7+ consultas pré-natal
  - Pré-natal iniciado no 1º trimestre

#### Nascidos Vivos
- **Fonte**: SINASC
- **Indicadores**:
  - Nascidos vivos por município de residência
  - % baixo peso ao nascer (<2.500g)
  - % prematuros (<37 semanas)
  - % cesáreas

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvto.def
```

### 2.5 Profissionais e Estabelecimentos

#### Profissionais de Saúde
- **Fonte**: CNES
- **Indicadores**:
  - Médicos por 1.000 habitantes
  - Enfermeiros por 1.000 habitantes
  - Dentistas por 1.000 habitantes
  - Agentes Comunitários de Saúde

**API TabNet**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?cnes/cnv/prid02to.def
```

#### Estabelecimentos de Saúde
- **Fonte**: CNES
- **Tipos**:
  - UBS, UPA, Hospitais, Clínicas
  - Públicos vs Privados

---

## 3. DESENVOLVIMENTO SOCIAL E HUMANO

### 3.1 Índice de Desenvolvimento Humano

#### IDH Municipal (IDHM)
- **Fonte**: Atlas Brasil (PNUD/IPEA/FJP)
- **Periodicidade**: Decenal (Censos)
- **Componentes**:
  - IDHM Longevidade
  - IDHM Educação
  - IDHM Renda
- **Disponibilidade**: 1991, 2000, 2010 (2020 em elaboração)

**API/Coleta**:
```
URL: http://www.atlasbrasil.org.br/ranking
Download: http://www.atlasbrasil.org.br/acervo/biblioteca
API: http://www.integracao.atlasbrasil.org.br/api/
Endpoints:
  - /v1/localidades/municipios?uf=17
  - /v1/indicadores?localidade=<codigo>
```

### 3.2 Pobreza e Desigualdade

#### Índice de Gini
- **Fonte**: Atlas Brasil / IBGE
- **Descrição**: Mede concentração de renda (0=igualdade, 1=desigualdade total)

#### Taxa de Pobreza
- **Fonte**: Atlas Brasil / CadÚnico
- **Indicadores**:
  - % população em extrema pobreza (< R$ 105/mês)
  - % população em pobreza (< R$ 210/mês)
  - % vulneráveis à pobreza

#### Renda per Capita
- **Fonte**: Atlas Brasil / IBGE
- **Indicadores**:
  - Renda per capita média
  - Renda dos 20% mais pobres
  - Renda dos 20% mais ricos
  - Razão 10+ / 40-

### 3.3 Cadastro Único e Programas Sociais

#### Famílias no Cadastro Único
- **Fonte**: CECAD / MDS
- **Periodicidade**: Mensal
- **Indicadores**:
  - Total de famílias cadastradas
  - Famílias em extrema pobreza
  - Famílias em pobreza
  - Famílias baixa renda

**API/Coleta**:
```
URL: https://cecad.cidadania.gov.br/painel03.php
Dados: https://aplicacoes.mds.gov.br/sagi/vis/data3/
```

#### Bolsa Família / Auxílio Brasil
- **Fonte**: MDS / Portal da Transparência
- **Periodicidade**: Mensal
- **Indicadores**:
  - Famílias beneficiárias
  - Valor total transferido
  - Valor médio por família
  - Cobertura (% famílias elegíveis)

**API Portal da Transparência**:
```
URL: https://api.portaldatransparencia.gov.br/api-de-dados/
Endpoint: /bolsa-familia-por-municipio
Parâmetros: mesAno, codigoIbge, pagina
Autenticação: API Key (cadastro necessário)
```

#### BPC - Benefício de Prestação Continuada
- **Fonte**: MDS
- **Indicadores**:
  - BPC Idoso (beneficiários)
  - BPC PcD (beneficiários)
  - Valor total

### 3.4 Trabalho e Emprego

#### Taxa de Desocupação
- **Fonte**: IBGE - PNAD Contínua (estadual)
- **Nota**: Dados municipais disponíveis apenas no Censo

#### Trabalho Infantil
- **Fonte**: IBGE - Censo/PNAD
- **Indicador**: % crianças 10-17 anos ocupadas

#### Trabalho Informal
- **Fonte**: IBGE - PNAD
- **Indicador**: % ocupados sem carteira assinada

---

## 4. SANEAMENTO E HABITAÇÃO

### 4.1 Abastecimento de Água

#### Cobertura de Água Tratada
- **Fonte**: SNIS (Ministério das Cidades)
- **Periodicidade**: Anual
- **Indicador**: IN055 - % população com água tratada

**API SNIS**:
```
URL: http://app4.mdr.gov.br/serieHistorica/
Dados: http://www.snis.gov.br/downloads/diagnosticos/
Indicadores água:
  - IN055: Índice de atendimento total de água
  - IN023: Índice de atendimento urbano de água
  - IN022: Consumo médio per capita de água
```

#### Perdas na Distribuição
- **Indicador**: IN049 - Índice de perdas na distribuição

### 4.2 Esgotamento Sanitário

#### Cobertura de Esgoto
- **Fonte**: SNIS
- **Indicadores**:
  - IN056: % população com coleta de esgoto
  - IN024: Índice de atendimento urbano de esgoto
  - IN046: Índice de esgoto tratado referido à água consumida

**API SNIS**:
```
URL: http://app4.mdr.gov.br/serieHistorica/
Download diagnósticos: http://www.snis.gov.br/diagnostico-anual-agua-e-esgotos
```

### 4.3 Resíduos Sólidos

#### Cobertura de Coleta
- **Fonte**: SNIS Resíduos Sólidos
- **Indicadores**:
  - IN015: Taxa de cobertura do serviço de coleta
  - IN016: Taxa de recuperação de recicláveis
  - IN031: Taxa de material recolhido pela coleta seletiva

**Coleta**:
```
URL: http://www.snis.gov.br/diagnostico-anual-residuos-solidos
```

#### Destinação Final
- **Indicadores**:
  - % para aterro sanitário
  - % para lixão
  - Presença de coleta seletiva

### 4.4 Habitação

#### Déficit Habitacional
- **Fonte**: FJP - Fundação João Pinheiro
- **Componentes**:
  - Habitação precária
  - Coabitação familiar
  - Ônus excessivo com aluguel
  - Adensamento excessivo

**Coleta**:
```
URL: https://fjp.mg.gov.br/deficit-habitacional-no-brasil/
Formato: Excel/PDF
```

#### Inadequação Habitacional
- **Indicadores**:
  - Domicílios sem banheiro
  - Domicílios em aglomerados subnormais
  - Domicílios com adensamento excessivo

#### Energia Elétrica
- **Fonte**: IBGE / ANEEL
- **Indicador**: % domicílios com energia elétrica

---

## 5. SEGURANÇA PÚBLICA

### 5.1 Violência

#### Taxa de Homicídios
- **Fonte**: DataSUS SIM / FBSP
- **Periodicidade**: Anual
- **Indicador**: Homicídios por 100.000 habitantes

**API TabNet (Causas Externas)**:
```
URL: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/ext10to.def
Filtros:
  - Categoria CID-10: X85-Y09 (Agressões)
  - Município residência
```

**Fonte Alternativa - FBSP**:
```
URL: https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/
Formato: Excel
```

#### Violência contra a Mulher
- **Fonte**: FBSP / Secretarias de Segurança
- **Indicadores**:
  - Feminicídios
  - Estupros
  - Lesão corporal dolosa (Lei Maria da Penha)

#### Mortes no Trânsito
- **Fonte**: DataSUS SIM
- **CID-10**: V01-V89

### 5.2 Criminalidade

#### Crimes contra o Patrimônio
- **Fonte**: Secretaria de Segurança Pública do TO
- **Indicadores**:
  - Furtos
  - Roubos
  - Roubo de veículos

**Nota**: Dados estaduais geralmente não disponíveis em API aberta

### 5.3 Sistema de Justiça

#### População Carcerária
- **Fonte**: DEPEN/SISDEPEN
- **Indicadores**:
  - Presos por 100.000 habitantes
  - Déficit de vagas
  - % presos provisórios

**Coleta**:
```
URL: https://www.gov.br/depen/pt-br/servicos/sisdepen
```

---

## 6. ANÁLISES SUGERIDAS

### 6.1 Análise de Qualidade Educacional
**Objetivo**: Identificar municípios com déficits educacionais

**Indicadores combinados**:
- IDEB (anos iniciais e finais)
- Taxa de distorção idade-série
- Taxa de abandono escolar
- Infraestrutura escolar (% com biblioteca, internet)

**Metodologia**:
1. Comparar IDEB municipal vs meta projetada
2. Identificar municípios abaixo da média estadual
3. Correlacionar com infraestrutura e formação docente
4. Mapear desigualdades urbano-rural

### 6.2 Análise de Vulnerabilidade em Saúde
**Objetivo**: Mapear fragilidades do sistema de saúde

**Indicadores combinados**:
- Mortalidade infantil
- Cobertura ESF
- Leitos por habitante
- Médicos por habitante
- Internações por condições sensíveis à atenção primária

**Metodologia**:
1. Calcular índice composto de vulnerabilidade
2. Identificar "desertos" de serviços de saúde
3. Correlacionar mortalidade com cobertura de atenção básica
4. Mapear fluxos de pacientes entre municípios

### 6.3 Análise de Pobreza Multidimensional
**Objetivo**: Caracterizar pobreza além da renda

**Dimensões**:
- Renda (extrema pobreza, Gini)
- Educação (analfabetismo, anos de estudo)
- Saúde (mortalidade, acesso)
- Habitação (saneamento, energia)
- Trabalho (informalidade, desemprego)

**Metodologia**:
1. Aplicar metodologia Alkire-Foster
2. Calcular índice de privações por município
3. Identificar privações predominantes por região
4. Comparar com cobertura de programas sociais

### 6.4 Análise de Saneamento Básico
**Objetivo**: Diagnosticar universalização do saneamento

**Indicadores**:
- Cobertura água tratada
- Cobertura esgoto
- Perdas na distribuição
- Coleta de resíduos sólidos
- Destinação final adequada

**Metodologia**:
1. Calcular gap para universalização (meta 2033)
2. Estimar investimentos necessários
3. Identificar municípios críticos
4. Comparar prestadores (público/privado)

### 6.5 Análise de Segurança Pública
**Objetivo**: Mapear violência e criminalidade

**Indicadores**:
- Taxa de homicídios
- Mortes no trânsito
- Crimes violentos letais intencionais
- Violência contra mulher

**Metodologia**:
1. Calcular taxa por 100.000 habitantes
2. Identificar tendências (aumento/redução)
3. Mapear clusters de violência
4. Correlacionar com indicadores socioeconômicos

### 6.6 Análise de Primeira Infância
**Objetivo**: Avaliar atenção à primeira infância (0-6 anos)

**Indicadores**:
- Matrículas em creche e pré-escola
- Taxa de mortalidade infantil
- Cobertura vacinal
- % baixo peso ao nascer
- Pré-natal adequado

**Metodologia**:
1. Construir índice de desenvolvimento da primeira infância
2. Identificar municípios com atenção inadequada
3. Correlacionar com disponibilidade de equipamentos
4. Avaliar integração de políticas (saúde-educação-assistência)

---

## 7. FONTES COMPLEMENTARES

### Portais de Dados

| Portal | URL | Dados |
|--------|-----|-------|
| DataSUS | datasus.saude.gov.br | Saúde |
| INEP | gov.br/inep | Educação |
| IBGE | ibge.gov.br | Diversos |
| Atlas Brasil | atlasbrasil.org.br | IDH, pobreza |
| SNIS | snis.gov.br | Saneamento |
| CECAD | cecad.cidadania.gov.br | Cadastro Único |
| DEPEN | gov.br/depen | Prisional |
| FBSP | forumseguranca.org.br | Segurança |

### Periodicidade de Atualização

| Indicador | Frequência | Defasagem típica |
|-----------|------------|------------------|
| IDEB | Bienal (ímpares) | 6-8 meses |
| Mortalidade | Anual | 18-24 meses |
| Cobertura ESF | Mensal | 1-2 meses |
| IDH | Decenal | 2-3 anos |
| Bolsa Família | Mensal | 1 mês |
| SNIS | Anual | 12-18 meses |
| Homicídios | Anual | 6-12 meses |

---

## 8. LIMITAÇÕES E CONSIDERAÇÕES

### Dados Municipais
- Muitos indicadores (desemprego, informalidade) só existem em nível estadual via PNAD
- Dados censitários municipais ficam desatualizados entre censos
- Pequenos municípios podem ter flutuações estatísticas significativas

### Qualidade dos Dados
- Subnotificação em sistemas de saúde (especialmente óbitos)
- Cobertura irregular do Cadastro Único
- Dados de segurança pública dependem de registros policiais

### Recomendações
1. Sempre verificar data de referência dos dados
2. Usar séries históricas para identificar tendências
3. Considerar população para calcular taxas
4. Triangular informações de diferentes fontes
5. Documentar limitações nas análises
