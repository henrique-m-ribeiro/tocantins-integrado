# Dimensão TERRA - Documento de Referência

## Visão Geral

A dimensão TERRA abrange indicadores relacionados a uso e ocupação do solo, infraestrutura territorial, logística, urbanização e ordenamento territorial. Esta dimensão é fundamental para compreender a dinâmica espacial e o potencial de desenvolvimento físico dos municípios tocantinenses.

---

## 1. USO E COBERTURA DO SOLO

### 1.1 Mapeamento de Uso do Solo

#### MapBiomas - Coleção Anual
- **Fonte**: Projeto MapBiomas
- **Periodicidade**: Anual
- **Disponibilidade**: 1985-2023
- **Resolução**: 30 metros
- **Descrição**: Mapeamento anual da cobertura e uso do solo do Brasil

**API/Coleta**:
```
URL Base: https://brasil.mapbiomas.org/
API: https://plataforma.brasil.mapbiomas.org/
Downloads: https://brasil.mapbiomas.org/estatisticas/

Toolkit QGIS: https://github.com/mapbiomas-brazil/user-toolkit

Google Earth Engine:
var collection = ee.Image('projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1');
```

**Classes de Uso (Nível 1)**:
- 1 - Floresta
- 2 - Formação Natural não Florestal
- 3 - Agropecuária
- 4 - Área não Vegetada
- 5 - Corpo d'Água
- 6 - Não Observado

**Estatísticas Disponíveis por Município**:
- Área por classe de uso (ha)
- Transições de uso entre anos
- Séries históricas

**Download Direto**:
```
Estatísticas: https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_8/downloads/statistics/
Formato: CSV por UF/Município
Arquivo TO: MAPBIOMAS_COL8_TOCANTINS_MUNICIPIO.csv
```

### 1.2 Áreas Agrícolas

#### Área Plantada por Cultura
- **Fonte**: IBGE - PAM (Produção Agrícola Municipal)
- **Periodicidade**: Anual
- **Culturas principais TO**: Soja, milho, arroz, cana-de-açúcar, mandioca

**API SIDRA**:
```
Tabela 5457 - Área plantada (ha)
https://apisidra.ibge.gov.br/values/t/5457/n6/in%20n3%2017/v/216/p/last%205/c782/allxt

Tabela 1612 - Área colhida, produção e valor
https://apisidra.ibge.gov.br/values/t/1612/n6/in%20n3%2017/v/216,214,215/p/last%205/c81/allxt

Variáveis:
  216 - Área plantada (ha)
  214 - Área colhida (ha)
  215 - Quantidade produzida
  112 - Rendimento médio (kg/ha)
```

#### Área de Pastagem
- **Fonte**: MapBiomas / IBGE PPM
- **Indicadores**:
  - Área total de pastagem
  - Pastagem degradada vs bem manejada

**API SIDRA (PPM)**:
```
Tabela 3939 - Efetivo de rebanhos
https://apisidra.ibge.gov.br/values/t/3939/n6/in%20n3%2017/v/105/p/last%205/c79/allxt
```

### 1.3 Áreas Especiais

#### Terras Indígenas
- **Fonte**: FUNAI
- **Indicadores**:
  - Número de TIs
  - Área total (ha)
  - % do território municipal
  - Situação fundiária (regularizada, homologada, etc.)

**Coleta**:
```
URL: https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas
Shapefile: Download via portal de dados abertos
API: https://dados.gov.br/dados/conjuntos-dados/terras-indigenas
```

#### Unidades de Conservação
- **Fonte**: MMA / ICMBio
- **Categorias**:
  - Proteção Integral (Parques, Reservas, Estações Ecológicas)
  - Uso Sustentável (APAs, RESEX, FLONA)

**Coleta**:
```
URL: https://www.gov.br/icmbio/pt-br
Dados: https://dados.gov.br/dados/conjuntos-dados/unidadesdeconservacao
Formato: Shapefile, GeoJSON
```

#### Assentamentos Rurais
- **Fonte**: INCRA
- **Indicadores**:
  - Número de assentamentos
  - Área total
  - Famílias assentadas
  - Capacidade de famílias

**Coleta**:
```
URL: https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/assentamentos
Shapefile: SIPRA
API: https://dados.gov.br/dados/conjuntos-dados/sistema-de-informacoes-de-projetos-de-reforma-agraria
```

#### Quilombos
- **Fonte**: INCRA / Fundação Palmares
- **Indicadores**:
  - Comunidades certificadas
  - Territórios titulados
  - Área

**Coleta**:
```
URL: https://www.gov.br/palmares/pt-br
Certificações: Portal da Fundação Palmares
```

---

## 2. INFRAESTRUTURA DE TRANSPORTES

### 2.1 Malha Rodoviária

#### Rodovias Federais
- **Fonte**: DNIT / PNLT
- **Indicadores**:
  - Extensão por tipo de pavimento
  - Condição do pavimento (bom/regular/ruim)
  - Rodovias duplicadas

**Coleta**:
```
URL: https://www.gov.br/dnit/pt-br/assuntos/planejamento-e-pesquisa/snv
Shapefile: SNV - Sistema Nacional de Viação
Downloads: https://www.gov.br/dnit/pt-br/assuntos/atlas-e-mapas
```

#### Rodovias Estaduais
- **Fonte**: AGETO (Tocantins)
- **Indicadores**:
  - Extensão pavimentada vs não pavimentada
  - Densidade rodoviária (km/km²)

#### Rodovias Municipais
- **Fonte**: Prefeituras / IBGE Cidades
- **Indicadores**:
  - Extensão de vias
  - % pavimentado

### 2.2 Ferrovias

#### Ferrovia Norte-Sul (FNS)
- **Fonte**: VALEC / ANTT
- **Indicadores**:
  - Extensão no município
  - Presença de pátio de cargas
  - Volume transportado

**Coleta**:
```
URL: https://www.gov.br/antt/pt-br
Dados: http://www.transportes.gov.br/ferrovias
```

### 2.3 Hidrovias

#### Hidrovia Tocantins-Araguaia
- **Fonte**: ANTAQ / DNIT
- **Indicadores**:
  - Municípios com acesso hidroviário
  - Portos e terminais
  - Calado disponível

**Coleta**:
```
URL: https://www.gov.br/antaq/pt-br
Anuário: https://www.gov.br/antaq/pt-br/assuntos/instalacoes-portuarias/
```

### 2.4 Aeroportos

#### Infraestrutura Aeroportuária
- **Fonte**: ANAC
- **Indicadores**:
  - Aeroportos por categoria
  - Extensão de pista
  - Operações comerciais

**Coleta**:
```
URL: https://www.gov.br/anac/pt-br
Dados: https://www.gov.br/anac/pt-br/assuntos/dados-e-estatisticas
```

### 2.5 Índices de Acessibilidade

#### Distância a Centros
- **Indicadores calculados**:
  - Distância à capital estadual (Palmas)
  - Distância ao centro regional mais próximo
  - Tempo de viagem ao hospital de referência

**Fonte para cálculo**: OpenStreetMap / Google Directions API

---

## 3. INFRAESTRUTURA URBANA

### 3.1 Cadastro e Gestão Territorial

#### CNEFE - Cadastro de Endereços
- **Fonte**: IBGE
- **Indicadores**:
  - Endereços urbanos vs rurais
  - Domicílios por setor censitário

**Coleta**:
```
URL: https://www.ibge.gov.br/estatisticas/downloads-estatisticas.html
Arquivo: CNEFE por município
```

#### Regularização Fundiária
- **Fonte**: Prefeituras / Cartórios
- **Indicadores**:
  - % imóveis regularizados
  - Existência de cadastro técnico multifinalitário

### 3.2 Ordenamento Urbano

#### Plano Diretor
- **Fonte**: IBGE MUNIC
- **Indicadores**:
  - Existência de Plano Diretor
  - Ano de aprovação/atualização
  - Instrumentos urbanísticos previstos

**API SIDRA (MUNIC)**:
```
Tabela 6521 - Plano Diretor
https://apisidra.ibge.gov.br/values/t/6521/n6/in%20n3%2017/v/allxp/p/last%201
```

#### Zoneamento
- **Indicadores**:
  - Existência de lei de zoneamento
  - Zonas definidas (residencial, comercial, industrial)

### 3.3 Iluminação e Pavimentação

#### Iluminação Pública
- **Fonte**: IBGE Cidades / Distribuidoras
- **Indicadores**:
  - % vias com iluminação
  - Tipo de iluminação (LED, vapor de sódio)

#### Pavimentação Urbana
- **Fonte**: IBGE MUNIC / Prefeituras
- **Indicadores**:
  - % vias pavimentadas
  - Tipo de pavimento

---

## 4. INFRAESTRUTURA PRODUTIVA

### 4.1 Energia Elétrica

#### Rede de Distribuição
- **Fonte**: ANEEL / Distribuidoras (Energisa TO)
- **Indicadores**:
  - Consumidores por classe
  - Consumo médio
  - Perdas na distribuição

**Coleta**:
```
URL: https://dadosabertos.aneel.gov.br/
Datasets: Consumo, Distribuidoras
```

#### Geração de Energia
- **Fonte**: ANEEL
- **Indicadores**:
  - Usinas no município (UHE, PCH, solar, eólica)
  - Potência instalada (MW)

**API ANEEL**:
```
URL: https://dadosabertos.aneel.gov.br/dataset/siga-sistema-de-informacoes-de-geracao-da-aneel
Filtros: UF=TO, Município
```

### 4.2 Telecomunicações

#### Conectividade
- **Fonte**: ANATEL
- **Indicadores**:
  - Acessos banda larga fixa por 100 hab
  - Cobertura 4G/5G
  - Acessos móveis

**Coleta**:
```
URL: https://informacoes.anatel.gov.br/paineis/acessos
Dados: https://www.anatel.gov.br/dados/
```

### 4.3 Armazenagem

#### Capacidade de Armazenagem
- **Fonte**: CONAB
- **Indicadores**:
  - Armazéns cadastrados
  - Capacidade estática (toneladas)
  - Tipo (granéis, convencional)

**Coleta**:
```
URL: https://www.conab.gov.br/armazenagem
Dados: Sistema de Cadastro de Unidades Armazenadoras
```

### 4.4 Irrigação

#### Projetos de Irrigação
- **Fonte**: ANA / CODEVASF
- **Indicadores**:
  - Área irrigável (ha)
  - Área irrigada efetiva
  - Método de irrigação

**Coleta**:
```
URL: https://www.gov.br/ana/pt-br
Dados: Atlas Irrigação (ANA)
```

---

## 5. DINÂMICA TERRITORIAL

### 5.1 Urbanização

#### Taxa de Urbanização
- **Fonte**: IBGE Censo
- **Indicador**: % população em área urbana

**API SIDRA**:
```
Tabela 6579 - População por situação do domicílio
https://apisidra.ibge.gov.br/values/t/6579/n6/in%20n3%2017/v/93/p/last%201/c1/allxt
```

#### Crescimento Urbano
- **Fonte**: MapBiomas / IBGE
- **Indicadores**:
  - Área urbana (km²)
  - Expansão urbana (% a.a.)

### 5.2 Densidade

#### Densidade Demográfica
- **Fonte**: IBGE
- **Indicador**: hab/km²

**Cálculo**:
```
Tabela 6579 (população) / Tabela 1301 (área territorial)
```

### 5.3 Centralidade

#### Hierarquia Urbana
- **Fonte**: IBGE - REGIC (Regiões de Influência das Cidades)
- **Classificação**:
  - Metrópole
  - Capital Regional
  - Centro Sub-regional
  - Centro de Zona
  - Centro Local

**Coleta**:
```
URL: https://www.ibge.gov.br/geociencias/organizacao-do-territorio/analises-do-territorio/
Publicação: REGIC 2018
```

#### Arranjos Populacionais
- **Fonte**: IBGE
- **Indicadores**:
  - Municípios em arranjos populacionais
  - Fluxos pendulares

---

## 6. APTIDÃO E VULNERABILIDADE

### 6.1 Aptidão Agrícola

#### Classe de Aptidão
- **Fonte**: EMBRAPA / IBGE
- **Classificação**:
  - Boa, Regular, Restrita, Inapta
  - Por nível de manejo (A, B, C)

**Coleta**:
```
URL: https://www.embrapa.br/solos
Dados: Sistema Brasileiro de Classificação de Solos
Shapefile: IBGE Pedologia
```

### 6.2 Solos

#### Tipos de Solo
- **Fonte**: IBGE / EMBRAPA
- **Classes principais TO**:
  - Latossolos
  - Neossolos
  - Plintossolos
  - Argissolos

**Coleta**:
```
URL: https://www.ibge.gov.br/geociencias/informacoes-ambientais/pedologia.html
Escala: 1:250.000
```

### 6.3 Relevo

#### Declividade
- **Fonte**: IBGE / SRTM
- **Classes**:
  - Plano (0-3%)
  - Suave ondulado (3-8%)
  - Ondulado (8-20%)
  - Forte ondulado (20-45%)
  - Montanhoso (>45%)

**Fonte de dados**:
```
SRTM: https://earthexplorer.usgs.gov/
TOPODATA: http://www.dsr.inpe.br/topodata/
```

### 6.4 Vulnerabilidade Ambiental

#### Áreas de Risco
- **Fonte**: CPRM / Defesa Civil
- **Tipos**:
  - Risco de inundação
  - Risco de erosão
  - Risco de deslizamento

**Coleta**:
```
URL: https://www.cprm.gov.br/publique/
Dados: Cartas de suscetibilidade
```

---

## 7. ANÁLISES SUGERIDAS

### 7.1 Análise de Uso e Mudança do Solo
**Objetivo**: Avaliar dinâmica de transformação territorial

**Indicadores combinados**:
- Série MapBiomas (5 anos)
- Área plantada PAM
- Efetivo pecuário
- Área desmatada PRODES

**Metodologia**:
1. Calcular matriz de transição de uso
2. Identificar principais conversões (cerrado → soja/pasto)
3. Quantificar perda de vegetação nativa
4. Correlacionar com produção agrícola

### 7.2 Análise de Acessibilidade e Logística
**Objetivo**: Identificar gargalos logísticos

**Indicadores combinados**:
- Distância a rodovias principais
- Distância a ferrovias
- Distância a armazéns
- Produção agrícola

**Metodologia**:
1. Calcular custos de transporte por município
2. Identificar zonas de influência de modais
3. Mapear "vazios logísticos"
4. Simular cenários com novos investimentos

### 7.3 Análise de Infraestrutura Urbana
**Objetivo**: Avaliar qualidade da infraestrutura urbana

**Indicadores combinados**:
- Pavimentação
- Iluminação
- Saneamento
- Existência de Plano Diretor

**Metodologia**:
1. Construir índice de infraestrutura urbana
2. Comparar com população e arrecadação
3. Identificar déficits prioritários
4. Ranquear municípios por necessidade

### 7.4 Análise de Aptidão Territorial
**Objetivo**: Identificar vocações territoriais

**Indicadores combinados**:
- Aptidão agrícola
- Tipo de solo
- Declividade
- Disponibilidade hídrica
- Uso atual

**Metodologia**:
1. Cruzar aptidão com uso atual
2. Identificar subutilização/sobreutilização
3. Mapear potencial de expansão agrícola
4. Considerar restrições ambientais

### 7.5 Análise de Polarização Regional
**Objetivo**: Entender centralidades e fluxos

**Indicadores combinados**:
- Hierarquia urbana (REGIC)
- Fluxos pendulares
- Oferta de serviços
- Distâncias entre centros

**Metodologia**:
1. Mapear áreas de influência
2. Identificar dependências funcionais
3. Avaliar equilíbrio da rede urbana
4. Propor estratégias de desconcentração

### 7.6 Análise de Expansão Urbana
**Objetivo**: Projetar crescimento urbano

**Indicadores combinados**:
- Área urbana histórica (MapBiomas)
- Crescimento populacional
- Vetores de expansão
- Restrições ambientais

**Metodologia**:
1. Calcular taxa de expansão histórica
2. Identificar direções predominantes
3. Avaliar conflitos com áreas protegidas
4. Projetar cenários futuros

---

## 8. FONTES DE DADOS GEOESPACIAIS

### Bases Vetoriais

| Base | Fonte | Formato | Escala |
|------|-------|---------|--------|
| Limites municipais | IBGE | Shapefile | 1:250.000 |
| Malha rodoviária | DNIT/SNV | Shapefile | 1:250.000 |
| Ferrovias | ANTT | Shapefile | - |
| Hidrografia | ANA | Shapefile | 1:250.000 |
| Terras indígenas | FUNAI | Shapefile | - |
| Unidades conservação | ICMBio | Shapefile | - |
| Assentamentos | INCRA | Shapefile | - |

### Bases Raster

| Base | Fonte | Resolução | Período |
|------|-------|-----------|---------|
| Uso do solo | MapBiomas | 30m | 1985-2023 |
| Elevação | SRTM/TOPODATA | 30m | - |
| Declividade | Derivado SRTM | 30m | - |
| Solos | IBGE | 1:250.000 | - |

### Portais de Download

| Portal | URL | Dados |
|--------|-----|-------|
| IBGE Geociências | ibge.gov.br/geociencias | Limites, solos, relevo |
| MapBiomas | mapbiomas.org | Uso do solo |
| INPE/TerraBrasilis | terrabrasilis.dpi.inpe.br | Desmatamento |
| ANA GeoNetwork | metadados.snirh.gov.br | Hidrografia |
| ICMBio | icmbio.gov.br | UCs |
| FUNAI | funai.gov.br | TIs |

---

## 9. FERRAMENTAS DE ANÁLISE

### Processamento Geoespacial

```python
# Exemplo: Calcular área por uso do solo
import geopandas as gpd
import rasterio
from rasterstats import zonal_stats

# Carregar município
municipio = gpd.read_file('municipio.shp')

# Estatísticas zonais do MapBiomas
stats = zonal_stats(
    municipio,
    'mapbiomas_2023.tif',
    categorical=True
)
```

### Google Earth Engine

```javascript
// Exemplo: Área de desmatamento por município
var municipios = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/municipios-2016');
var tocantins = municipios.filter(ee.Filter.eq('UF', 'TO'));

var mapbiomas = ee.Image('projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1');

var desmatamento = mapbiomas.select('classification_2023')
  .eq(3) // Agropecuária
  .multiply(ee.Image.pixelArea())
  .divide(10000); // hectares

var areaDesmatada = desmatamento.reduceRegions({
  collection: tocantins,
  reducer: ee.Reducer.sum(),
  scale: 30
});
```

---

## 10. LIMITAÇÕES E CONSIDERAÇÕES

### Dados Espaciais
- Resolução espacial limita análises em pequena escala
- Atualizações de bases vetoriais são esporádicas
- Compatibilização de projeções cartográficas necessária

### Dados Censitários
- Defasagem entre censos (2010-2022)
- Mudanças metodológicas entre edições
- Setores censitários mudam entre censos

### Recomendações
1. Sempre verificar datum e projeção dos dados
2. Documentar fontes e datas de referência
3. Validar dados espaciais com imagens de satélite
4. Considerar margens de erro em classificações automáticas
5. Usar séries históricas para identificar tendências
