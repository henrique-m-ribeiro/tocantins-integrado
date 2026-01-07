# Dimensão AMBIENT - Documento de Referência

## Visão Geral

A dimensão AMBIENT (Ambiental) abrange indicadores relacionados à conservação da biodiversidade, recursos hídricos, qualidade ambiental, mudanças climáticas e gestão ambiental. O Tocantins, localizado no ecótono Amazônia-Cerrado, possui importância estratégica para a conservação de dois biomas brasileiros.

---

## 1. COBERTURA VEGETAL E DESMATAMENTO

### 1.1 Vegetação Nativa

#### MapBiomas - Vegetação por Bioma
- **Fonte**: Projeto MapBiomas
- **Periodicidade**: Anual
- **Disponibilidade**: 1985-2023
- **Biomas no TO**: Cerrado (91%), Amazônia (9%)

**API/Coleta**:
```
URL: https://brasil.mapbiomas.org/estatisticas/
Downloads: https://storage.googleapis.com/mapbiomas-public/

Classes de Vegetação Nativa:
  1.1 - Floresta (Amazônia, Cerrado)
  1.2 - Savana (Cerrado stricto sensu)
  2.1 - Campo Alagado
  2.2 - Formação Campestre
  2.3 - Apicum
  2.4 - Afloramento Rochoso
  2.5 - Restinga

Filtro Tocantins:
  - Por bioma: Cerrado, Amazônia
  - Por município (código IBGE)
```

**Cálculo de Remanescentes**:
```python
# Área de vegetação nativa / Área total do município × 100
remanescente_pct = (area_vegetacao_nativa / area_total) * 100
```

#### PRODES - Monitoramento da Amazônia
- **Fonte**: INPE
- **Periodicidade**: Anual (agosto-julho)
- **Cobertura**: Bioma Amazônia (9 municípios TO na Amazônia Legal)

**API TerraBrasilis**:
```
URL: http://terrabrasilis.dpi.inpe.br/
API: http://terrabrasilis.dpi.inpe.br/geoserver/
WMS: http://terrabrasilis.dpi.inpe.br/geoserver/prodes-cerrado/wms

Downloads:
  - Desmatamento anual (shapefile)
  - Incrementos por município
  - Série histórica 2000-2023

Endpoint REST:
  http://terrabrasilis.dpi.inpe.br/dashboard/api/
```

#### PRODES Cerrado
- **Fonte**: INPE
- **Periodicidade**: Anual
- **Cobertura**: Bioma Cerrado

**Coleta**:
```
URL: http://terrabrasilis.dpi.inpe.br/downloads/
Produto: prodes-cerrado
Formato: Shapefile, GeoTIFF
```

### 1.2 Desmatamento

#### Taxa de Desmatamento Anual
- **Fontes**: PRODES (Amazônia), PRODES Cerrado, MapBiomas
- **Indicador**: km²/ano ou ha/ano

**Dados TerraBrasilis**:
```
Amazônia:
  URL: http://terrabrasilis.dpi.inpe.br/app/dashboard/deforestation/biomes/legal_amazon/increments

Cerrado:
  URL: http://terrabrasilis.dpi.inpe.br/app/dashboard/deforestation/biomes/cerrado/increments

API Dashboard:
  http://terrabrasilis.dpi.inpe.br/dashboard/api/v1/redis-cli/
  Endpoints: /deforestation, /biome, /state, /municipality
```

#### DETER - Alertas em Tempo Real
- **Fonte**: INPE
- **Periodicidade**: Diário
- **Descrição**: Sistema de alertas de desmatamento

**API**:
```
URL: http://terrabrasilis.dpi.inpe.br/app/dashboard/alerts/legal/amazon/
Dados: Alertas por município e data
```

### 1.3 Degradação Florestal

#### Degradação por Fogo
- **Fonte**: MapBiomas Fogo
- **Indicadores**:
  - Área queimada (ha/ano)
  - Frequência de fogo
  - Cicatrizes recentes

**Coleta**:
```
URL: https://mapbiomas.org/colecoes-mapbiomas-fogo
Downloads: https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_fire/
```

#### Extração Seletiva de Madeira
- **Fonte**: SIMEX (Imazon) / MapBiomas
- **Indicador**: Área com exploração madeireira

---

## 2. RECURSOS HÍDRICOS

### 2.1 Bacias Hidrográficas

#### Bacias do Tocantins
- **Fonte**: ANA
- **Principais bacias**:
  - Rio Tocantins
  - Rio Araguaia
  - Rio Manuel Alves
  - Rio Sono
  - Rio Palma

**Coleta**:
```
URL: https://metadados.snirh.gov.br/geonetwork/
Base: Bacias Hidrográficas Otto-codificadas
Níveis: Otto 1 a Otto 6
Formato: Shapefile
```

#### Área de Drenagem Municipal
- **Indicador**: Área por bacia no município (km²)

### 2.2 Disponibilidade Hídrica

#### Vazão dos Rios
- **Fonte**: ANA - Hidroweb
- **Indicadores**:
  - Vazão média (m³/s)
  - Vazão mínima (Q95)
  - Vazão de referência

**API Hidroweb**:
```
URL: https://www.snirh.gov.br/hidroweb/
API: https://www.snirh.gov.br/hidroweb/rest/api/
Endpoints:
  /estacoes - Lista estações
  /series - Séries históricas
  /documentos - Arquivos

Formato: JSON, CSV
```

#### Águas Subterrâneas
- **Fonte**: CPRM / SIAGAS
- **Indicadores**:
  - Poços cadastrados
  - Vazão média dos poços
  - Aquíferos presentes

**Coleta**:
```
URL: http://siagasweb.cprm.gov.br/layout/
Filtros: UF, Município
Dados: Poços, vazão, nível estático
```

### 2.3 Qualidade da Água

#### Índice de Qualidade da Água (IQA)
- **Fonte**: ANA / Órgãos estaduais (NATURATINS)
- **Parâmetros**: OD, pH, DBO, coliformes, turbidez, etc.

**Coleta**:
```
URL: https://www.snirh.gov.br/portal/snirh/snirh-1/acesso-tematico/qualidade-das-aguas
Portal: SNIRH
```

#### Balneabilidade
- **Fonte**: Órgãos estaduais
- **Indicador**: Classificação das praias fluviais

### 2.4 Uso da Água

#### Outorgas de Direito de Uso
- **Fonte**: ANA / NATURATINS
- **Indicadores**:
  - Volume outorgado (m³/ano)
  - Finalidade (irrigação, abastecimento, indústria)
  - Tipo de captação (superficial, subterrânea)

**API CNARH**:
```
URL: https://www.snirh.gov.br/cnarh/
Cadastro Nacional de Usuários de Recursos Hídricos
```

---

## 3. BIODIVERSIDADE

### 3.1 Áreas Protegidas

#### Unidades de Conservação
- **Fonte**: MMA / ICMBio / NATURATINS
- **Categorias no TO**:
  - Proteção Integral: Parque Estadual Jalapão, Estação Ecológica Serra Geral
  - Uso Sustentável: APA Jalapão, APA Lago de Palmas

**Coleta**:
```
URL: https://www.gov.br/icmbio/pt-br
CNUC: https://www.gov.br/mma/pt-br/assuntos/areasprotegidas/unidades-de-conservacao/cadastro-nacional-de-ucs
Dados: https://dados.gov.br/dados/conjuntos-dados/unidadesdeconservacao
```

**Indicadores**:
- % território em UCs
- Área de cada categoria
- UCs federais vs estaduais vs municipais

#### Terras Indígenas
- **Fonte**: FUNAI
- **TIs no Tocantins**: Xerente, Apinayé, Krahô, etc.

**Indicadores**:
- Área protegida por TIs
- % vegetação nativa em TIs

### 3.2 Espécies

#### Espécies Ameaçadas
- **Fonte**: ICMBio / Lista Vermelha IUCN
- **Indicadores**:
  - Número de espécies ameaçadas por município
  - Espécies endêmicas

**Coleta**:
```
URL: https://www.icmbio.gov.br/portal/faunabrasileira/lista-de-especies
Dados: Livro Vermelho da Fauna Brasileira
```

#### Ocorrências de Fauna/Flora
- **Fonte**: GBIF / speciesLink / SiBBr
- **Dados**: Registros georreferenciados de espécies

**API GBIF**:
```
URL: https://api.gbif.org/v1/
Endpoints:
  /occurrence/search?stateProvince=Tocantins
  /species/search?q=nome_especie
Formato: JSON
```

### 3.3 Serviços Ecossistêmicos

#### Carbono Estocado
- **Fonte**: MapBiomas / Pesquisas acadêmicas
- **Indicador**: Toneladas de carbono por hectare

**Coleta MapBiomas Biomassa**:
```
URL: https://mapbiomas.org/
Produto: Biomassa e Carbono (em desenvolvimento)
```

#### Polinização/Provisão de Água
- **Fonte**: Pesquisas acadêmicas
- **Métrica**: Valor econômico dos serviços

---

## 4. QUALIDADE AMBIENTAL

### 4.1 Queimadas e Incêndios

#### Focos de Calor
- **Fonte**: INPE - BDQueimadas
- **Periodicidade**: Diário
- **Satélites**: AQUA, TERRA, VIIRS, GOES

**API BDQueimadas**:
```
URL: https://queimadas.dgi.inpe.br/queimadas/bdqueimadas/
API: https://queimadas.dgi.inpe.br/queimadas/bdqueimadas/export

Parâmetros:
  - pais=33 (Brasil)
  - estado=17 (Tocantins)
  - data_inicio, data_fim
  - satelite

Formato: CSV, Shapefile, KML

Exemplo:
https://queimadas.dgi.inpe.br/queimadas/bdqueimadas/export?formato=csv&pais=33&estado=17
```

#### Área Queimada
- **Fonte**: MapBiomas Fogo / INPE
- **Indicador**: ha/ano por município

### 4.2 Poluição

#### Qualidade do Ar
- **Fonte**: Estações de monitoramento (limitado no TO)
- **Parâmetros**: PM2.5, PM10, O3, NO2, SO2

**Nota**: Tocantins tem poucas estações de monitoramento da qualidade do ar

#### Resíduos e Passivos Ambientais
- **Fonte**: IBAMA / Órgãos estaduais
- **Indicadores**:
  - Áreas contaminadas
  - Passivos minerários

### 4.3 Licenciamento Ambiental

#### Licenças Emitidas
- **Fonte**: NATURATINS / IBAMA
- **Tipos**: LP, LI, LO
- **Indicador**: Número e tipo de licenças por município

---

## 5. MUDANÇAS CLIMÁTICAS

### 5.1 Emissões de GEE

#### Emissões por Setor
- **Fonte**: SEEG (Sistema de Estimativas de Emissões de Gases de Efeito Estufa)
- **Periodicidade**: Anual
- **Setores**:
  - Mudança de uso da terra
  - Agropecuária
  - Energia
  - Processos industriais
  - Resíduos

**API/Coleta SEEG**:
```
URL: https://seeg.eco.br/
Downloads: https://seeg.eco.br/download
Dados por UF e município: Disponíveis

Indicadores:
  - Emissões brutas (tCO2eq)
  - Remoções (tCO2eq)
  - Emissões líquidas
```

#### Emissões per Capita
- **Cálculo**: Emissões totais / População

### 5.2 Vulnerabilidade Climática

#### Projeções Climáticas
- **Fonte**: INPE / IPCC / PBMC
- **Indicadores**:
  - Aumento de temperatura projetado
  - Mudança na precipitação
  - Eventos extremos

**Coleta**:
```
URL: https://projeta.cptec.inpe.br/
Plataforma PROJETA
Cenários: RCP 4.5, RCP 8.5
```

#### Índice de Vulnerabilidade
- **Fonte**: Estudos acadêmicos / IPCC
- **Componentes**:
  - Exposição
  - Sensibilidade
  - Capacidade adaptativa

### 5.3 Eventos Extremos

#### Secas
- **Fonte**: ANA / Monitor de Secas
- **Indicadores**:
  - Índice de seca
  - Duração
  - Intensidade

**Coleta**:
```
URL: https://monitordesecas.ana.gov.br/
API: Mapas mensais de seca
```

#### Inundações
- **Fonte**: Defesa Civil / CEMADEN
- **Indicadores**:
  - Ocorrências registradas
  - Municípios afetados

---

## 6. GESTÃO AMBIENTAL

### 6.1 Estrutura Municipal

#### Órgão Ambiental Municipal
- **Fonte**: IBGE MUNIC
- **Indicadores**:
  - Existência de secretaria/departamento de meio ambiente
  - Existência de Conselho Municipal de Meio Ambiente
  - Fundo Municipal de Meio Ambiente

**API SIDRA (MUNIC)**:
```
Tabela 6031 - Estrutura ambiental
https://apisidra.ibge.gov.br/values/t/6031/n6/in%20n3%2017/v/allxp/p/last%201
```

### 6.2 CAR - Cadastro Ambiental Rural

#### Situação do CAR
- **Fonte**: SICAR / SFB
- **Indicadores**:
  - Imóveis cadastrados
  - Área cadastrada (ha)
  - % área cadastrada vs área agropecuária
  - Situação (ativo, pendente, cancelado)

**Coleta**:
```
URL: https://www.car.gov.br/publico/imoveis/index
API: https://www.car.gov.br/#/consultar
Boletim: https://www.car.gov.br/publico/municipios/downloads
```

#### Análise do CAR
- **Indicadores derivados**:
  - APP declarada vs APP devida
  - Reserva Legal declarada
  - Passivos ambientais

### 6.3 Fiscalização

#### Autos de Infração
- **Fonte**: IBAMA
- **Indicadores**:
  - Número de autos
  - Valor das multas
  - Tipo de infração

**API IBAMA**:
```
URL: https://servicos.ibama.gov.br/ctf/publico/areasembargadas/
Dados abertos: https://dadosabertos.ibama.gov.br/
```

#### Embargos
- **Fonte**: IBAMA
- **Indicador**: Áreas embargadas por município

---

## 7. ANÁLISES SUGERIDAS

### 7.1 Análise de Dinâmica de Desmatamento
**Objetivo**: Avaliar padrões e tendências de desmatamento

**Indicadores combinados**:
- Taxa de desmatamento PRODES/MapBiomas (5 anos)
- Alertas DETER
- Focos de calor
- Embargos IBAMA

**Metodologia**:
1. Calcular taxa média anual de desmatamento
2. Identificar hotspots (municípios críticos)
3. Correlacionar com expansão agropecuária
4. Avaliar efetividade de áreas protegidas
5. Projetar cenários futuros

### 7.2 Análise de Conservação de Vegetação Nativa
**Objetivo**: Avaliar estado de conservação

**Indicadores combinados**:
- % vegetação nativa remanescente
- Tendência de perda (5 anos)
- Cobertura em APPs e RLs (CAR)
- Fragmentação da paisagem

**Metodologia**:
1. Calcular índice de conservação por município
2. Identificar corredores ecológicos potenciais
3. Mapear áreas prioritárias para restauração
4. Avaliar conectividade da paisagem

### 7.3 Análise de Segurança Hídrica
**Objetivo**: Avaliar disponibilidade e sustentabilidade hídrica

**Indicadores combinados**:
- Vazão dos principais rios
- Demanda hídrica (outorgas)
- Cobertura vegetal em APPs
- Qualidade da água

**Metodologia**:
1. Calcular balanço hídrico por bacia
2. Identificar conflitos pelo uso da água
3. Avaliar impacto do desmatamento na disponibilidade
4. Mapear áreas de recarga de aquíferos

### 7.4 Análise de Risco de Incêndios
**Objetivo**: Identificar áreas vulneráveis a incêndios

**Indicadores combinados**:
- Histórico de focos de calor
- Área queimada (MapBiomas Fogo)
- Tipo de vegetação
- Proximidade de áreas agrícolas
- Dados climáticos (precipitação, temperatura)

**Metodologia**:
1. Construir modelo de risco de incêndio
2. Identificar período crítico por região
3. Mapear áreas prioritárias para prevenção
4. Correlacionar com práticas agrícolas

### 7.5 Análise de Passivos Ambientais
**Objetivo**: Quantificar déficit de APP e RL

**Indicadores combinados**:
- Dados do CAR (APP e RL declaradas)
- Mapeamento de vegetação atual
- Hidrografia (APPs hídricas)
- Declividade (APPs de topo de morro)

**Metodologia**:
1. Calcular APP e RL devidas por lei
2. Comparar com vegetação existente
3. Quantificar área a ser restaurada
4. Estimar custos de restauração

### 7.6 Análise de Emissões e Carbono
**Objetivo**: Avaliar contribuição para mudanças climáticas

**Indicadores combinados**:
- Emissões SEEG por setor
- Desmatamento (principal fonte)
- Estoque de carbono na vegetação
- Remoções por regeneração

**Metodologia**:
1. Calcular balanço de carbono por município
2. Identificar principais fontes de emissão
3. Mapear potencial de sequestro
4. Projetar metas de redução

---

## 8. FONTES DE DADOS

### Plataformas Principais

| Plataforma | URL | Dados |
|------------|-----|-------|
| MapBiomas | mapbiomas.org | Uso do solo, fogo, água |
| TerraBrasilis | terrabrasilis.dpi.inpe.br | Desmatamento, alertas |
| BDQueimadas | queimadas.dgi.inpe.br | Focos de calor |
| SNIRH | snirh.gov.br | Recursos hídricos |
| SEEG | seeg.eco.br | Emissões GEE |
| SICAR | car.gov.br | Cadastro Ambiental Rural |
| ICMBio | icmbio.gov.br | Unidades de Conservação |

### APIs Disponíveis

| API | Endpoint | Formato |
|-----|----------|---------|
| MapBiomas | Toolkit/GEE | GeoTIFF, CSV |
| TerraBrasilis | REST/WMS | JSON, Shapefile |
| Hidroweb | REST | JSON, CSV |
| GBIF | REST | JSON |
| BDQueimadas | Export | CSV, Shapefile |

### Periodicidade de Atualização

| Dado | Frequência | Defasagem |
|------|------------|-----------|
| Focos de calor | Diário | Tempo real |
| DETER (alertas) | Semanal | 1-2 semanas |
| PRODES | Anual | 6-8 meses |
| MapBiomas | Anual | 6-12 meses |
| SEEG | Anual | 18-24 meses |
| Hidroweb | Variável | Depende da estação |

---

## 9. PARTICULARIDADES DO TOCANTINS

### Ecótono Amazônia-Cerrado
- 9 municípios na Amazônia Legal
- 91% no bioma Cerrado
- Alta biodiversidade de transição
- Pressão de fronteira agrícola

### Regiões de Destaque

#### Jalapão
- Área de Proteção Ambiental
- Biodiversidade única (veredas, campos)
- Potencial turístico
- Vulnerabilidade ao fogo

#### MATOPIBA
- Tocantins é parte da região MATOPIBA
- Expansão intensa da soja
- Conflitos ambientais
- Pressão sobre vegetação nativa

### Grandes Empreendimentos
- UHEs no rio Tocantins (Serra da Mesa, Cana Brava, São Salvador, Peixe, Lajeado)
- Impactos em áreas de várzea
- Deslocamento de comunidades

---

## 10. LIMITAÇÕES E CONSIDERAÇÕES

### Dados Ambientais
- Defasagem temporal nos mapeamentos oficiais
- Resolução espacial limita análises locais
- Dados de qualidade da água escassos
- Monitoramento de biodiversidade limitado

### Metodológicas
- Diferentes classificações entre MapBiomas e PRODES
- Dados de emissões são estimativas
- Projeções climáticas têm incertezas

### Recomendações
1. Usar múltiplas fontes para validação cruzada
2. Priorizar dados oficiais (PRODES) para Amazônia
3. Considerar sazonalidade (fogo concentrado no período seco)
4. Documentar versões de coleções (MapBiomas 8, etc.)
5. Atualizar análises quando novas versões forem lançadas
