# 🔄 Análise de Impacto e Plano de Ação

> Impacto da Migration 009 nos workflows de coleta e queries do sistema

**Sessão**: #19
**Data**: 2026-01-16
**Relacionado**: ADR-005, Migration 009

---

## 📋 Sumário Executivo

A **Migration 009** introduz mudanças significativas no schema de dados, substituindo um modelo município-cêntrico por um modelo genérico e extensível de territórios. Este documento analisa:

1. **Impactos nos workflows de coleta n8n**
2. **Ajustes necessários no código**
3. **Queries de exemplo** para análises temporais e regionais
4. **Plano de ação detalhado** para implementação
5. **Estratégias de agregação de dados**

---

## 🎯 Mudanças Principais

### Antes (Schema Atual)

```sql
-- Modelo município-cêntrico rígido
municipalities (139)
microregions (8)
mesoregions (2)

indicator_values (
    municipality_id UUID  -- Apenas municípios
)
```

**Limitações**:
- ❌ Apenas municípios
- ❌ Apenas divisão antiga
- ❌ Sem indicadores estaduais

### Depois (Migration 009)

```sql
-- Modelo genérico extensível
territories (164+)
  ├── estado, municípios
  ├── antiga: mesorregiões, microrregiões
  └── nova: regiões intermediárias, imediatas

indicator_values (
    territory_id UUID  -- Qualquer território
)
```

**Benefícios**:
- ✅ Multi-escala (estado, região, município)
- ✅ Divisões antiga E nova
- ✅ Extensível (bacias, saúde, etc.)

---

## 📊 Análise de Impacto nos Workflows

### 1. Workflow IBGE Sidra (Principal)

**Arquivo**: `n8n/workflows/data-collection-ibge.json`

#### Impacto: 🟡 MODERADO

**Nós Afetados**:
1. ✅ `Get Municipalities` - **SEM MUDANÇA** (usa view de compatibilidade)
2. ⚠️ `Upsert Indicator Value` - **AJUSTE NECESSÁRIO** (territory_id)

#### Análise Detalhada

**Nó: Get Municipalities**

```sql
-- Query ATUAL (funciona com view de compatibilidade)
SELECT id, ibge_code, name
FROM municipalities
WHERE state_id = 'TO';

-- Após Migration 009, esta query continua funcionando via view:
-- CREATE VIEW municipalities AS SELECT ... FROM territories ...
```

**Status**: ✅ **SEM MUDANÇA NECESSÁRIA** (view de compatibilidade)

---

**Nó: Upsert Indicator Value**

```sql
-- Query ATUAL
INSERT INTO indicator_values (
  indicator_id,
  municipality_id,  -- ← Coluna antiga (deprecated)
  year,
  value,
  data_quality,
  notes
)
SELECT id.id, $2::uuid, $3::integer, $4::decimal, $5::varchar, $6::text
FROM indicator_definitions id
WHERE id.code = $1
ON CONFLICT (indicator_id, municipality_id, year, month)
DO UPDATE SET value = EXCLUDED.value;
```

**Problema**: Coluna `municipality_id` será deprecated (mantida temporariamente).

**Solução 1: Usar territory_id (Recomendado)**

```sql
-- Query NOVA (Migration 009)
INSERT INTO indicator_values (
  indicator_id,
  territory_id,     -- ← Coluna nova (genérica)
  year,
  value,
  data_quality,
  notes,
  aggregation_method
)
SELECT id.id, $2::uuid, $3::integer, $4::decimal, $5::varchar, $6::text, 'raw'
FROM indicator_definitions id
WHERE id.code = $1
ON CONFLICT (indicator_id, territory_id, year, month)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
```

**Mudanças**:
- ✅ `municipality_id` → `territory_id`
- ✅ Adicionar `aggregation_method = 'raw'` (indica dado bruto municipal)
- ✅ Constraint de unicidade atualizada

**Impacto no Workflow n8n**: 🟢 **MÍNIMO**

O workflow continua coletando municípios da mesma forma. Apenas o INSERT muda:

```javascript
// Nó: Prepare Upsert Data (JavaScript)
// ANTES
const data = {
  indicator_code: $json.indicator_code,
  municipality_id: $json.municipality_id,
  year: $json.year,
  value: $json.value,
  data_quality: 'official',
  notes: `Coletado via API IBGE Sidra`
};

// DEPOIS (adicionar aggregation_method)
const data = {
  indicator_code: $json.indicator_code,
  territory_id: $json.municipality_id,  // Apenas renomear variável
  year: $json.year,
  value: $json.value,
  data_quality: 'official',
  notes: `Coletado via API IBGE Sidra`,
  aggregation_method: 'raw'  // ← Adicionar
};
```

**Solução 2: Manter municipality_id Temporariamente (Compatibilidade)**

```sql
-- Migration 009 mantém municipality_id temporariamente
-- Workflow não precisa mudar NADA inicialmente
-- Migração gradual possível
```

**Recomendação**: 🎯 **Usar Solução 1** (territory_id) para aproveitar novo modelo desde o início.

---

#### Checklist de Ajustes - Workflow IBGE

- [ ] **Nó**: `Upsert Indicator Value`
  - [ ] Alterar query SQL: `municipality_id` → `territory_id`
  - [ ] Adicionar campo `aggregation_method = 'raw'`
  - [ ] Testar com 1 município (Palmas)
  - [ ] Validar constraint de unicidade

- [ ] **Nó**: `Update Dictionary`
  - [ ] Sem mudanças necessárias

- [ ] **Teste End-to-End**
  - [ ] Executar coleta de 1 indicador
  - [ ] Verificar dados em `indicator_values`
  - [ ] Verificar `territory_id` populado corretamente

**Tempo Estimado**: 30 minutos

---

### 2. Workflow Orquestrador

**Arquivo**: `n8n/workflows/data-collection-orchestrator.json`

#### Impacto: 🟢 ZERO

**Análise**: O orquestrador opera em nível de `indicator_dictionary`, que não mudou. Apenas dispara workflows especialistas.

**Status**: ✅ **SEM MUDANÇA NECESSÁRIA**

---

### 3. Workflows Placeholder (INEP, MapBiomas)

**Arquivos**: `data-collection-inep.json`, `data-collection-mapbiomas.json`

#### Impacto: 🟢 ZERO (Atualmente)

**Quando implementados**: Devem usar `territory_id` desde o início.

---

### 4. Novo Workflow: Coleta Estadual (SICONFI)

#### Impacto: ✅ HABILITADO pela Migration 009

**Antes**: Impossível coletar indicadores estaduais (ex: receita do governo estadual).

**Depois**: Possível via `territory_id` apontando para estado.

#### Exemplo: Workflow SICONFI

**Objetivo**: Coletar receitas e despesas do governo estadual do Tocantins.

**Fluxo**:

```
1. Get State Territory
   └─> SELECT id FROM territories WHERE type = 'estado' AND name = 'Tocantins'

2. Call SICONFI API
   └─> https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra
       ?ano=2023&uf=TO&tipo=receita

3. Parse Response
   └─> Extrair receita_total, receita_propria, transferencias

4. Upsert Indicator Values
   └─> INSERT INTO indicator_values (
           indicator_id,
           territory_id,  -- ID do estado
           year,
           value,
           aggregation_method
       ) VALUES (..., estado_id, 2023, 5000000000, 'raw')
```

**Benefício**: Indicadores estaduais agora são **cidadãos de primeira classe** no sistema.

---

## 📈 Estratégias de Agregação

### Abordagem 1: Agregação On-the-Fly (Recomendado Inicialmente)

**Descrição**: Calcular agregações regionais em tempo de consulta via SQL.

**Exemplo**: PIB total de uma microrregião

```sql
-- Agregação on-the-fly (SUM de municípios)
WITH municipios_microrregiao AS (
    SELECT child_territory_id
    FROM territory_relationships tr
    JOIN territories t ON tr.parent_territory_id = t.id
    WHERE t.name = 'Araguaína'
      AND t.type = 'microrregiao'
      AND tr.division_scheme = 'antiga'
)
SELECT
    iv.year,
    SUM(iv.value) as pib_total_regional,
    AVG(iv.value) as pib_medio_municipal,
    COUNT(DISTINCT iv.territory_id) as total_municipios
FROM indicator_values iv
WHERE iv.territory_id IN (SELECT child_territory_id FROM municipios_microrregiao)
  AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year >= 2015
GROUP BY iv.year
ORDER BY iv.year;
```

**Vantagens**:
- ✅ Simples de implementar
- ✅ Sempre atualizado (dados municipais mudam → agregação muda)
- ✅ Sem dados duplicados

**Desvantagens**:
- ❌ Performance pode ser lenta para dashboards (múltiplos JOINs)
- ❌ Recalcula a cada consulta

**Quando Usar**: MVP, queries ad-hoc, análises exploratórias.

---

### Abordagem 2: Agregação Pré-Calculada (Recomendado para Produção)

**Descrição**: Calcular e armazenar agregações regionais em `indicator_values` com `is_aggregated = true`.

**Exemplo**: Script de pré-cálculo (executado periodicamente)

```sql
-- Inserir PIB agregado para microrregião de Araguaína (divisão antiga)
WITH municipios AS (
    SELECT child_territory_id
    FROM territory_relationships tr
    JOIN territories t ON tr.parent_territory_id = t.id
    WHERE t.name = 'Araguaína'
      AND t.type = 'microrregiao'
      AND tr.division_scheme = 'antiga'
),
agregacao AS (
    SELECT
        iv.indicator_id,
        iv.year,
        SUM(iv.value) as valor_agregado,
        'sum' as metodo,
        COUNT(DISTINCT iv.territory_id) as num_municipios
    FROM indicator_values iv
    WHERE iv.territory_id IN (SELECT child_territory_id FROM municipios)
      AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
      AND iv.is_aggregated = false
    GROUP BY iv.indicator_id, iv.year
)
INSERT INTO indicator_values (
    indicator_id,
    territory_id,
    year,
    value,
    aggregation_method,
    is_aggregated,
    notes
)
SELECT
    a.indicator_id,
    (SELECT id FROM territories WHERE name = 'Araguaína' AND type = 'microrregiao'),
    a.year,
    a.valor_agregado,
    a.metodo,
    true,
    format('Agregado de %s municípios', a.num_municipios)
FROM agregacao a
ON CONFLICT (indicator_id, territory_id, year, month)
DO UPDATE SET
    value = EXCLUDED.value,
    aggregation_method = EXCLUDED.aggregation_method,
    notes = EXCLUDED.notes,
    updated_at = NOW();
```

**Vantagens**:
- ✅ Performance de queries ~100x mais rápida
- ✅ Dashboards responsivos
- ✅ Possibilita alertas e triggers em agregações

**Desvantagens**:
- ❌ Dados duplicados (municipais + regionais)
- ❌ Requer job periódico para atualizar
- ❌ Pode ficar desatualizado se municipais mudarem

**Quando Usar**: Produção, dashboards, relatórios automatizados.

---

### Abordagem 3: Materialização de Views (Híbrido)

**Descrição**: Usar Materialized Views do PostgreSQL.

```sql
-- Criar materialized view para PIB por microrregião
CREATE MATERIALIZED VIEW mv_pib_microregioes AS
WITH microregioes AS (
    SELECT DISTINCT
        t.id as microrregiao_id,
        t.name as microrregiao_nome,
        tr.child_territory_id as municipio_id
    FROM territories t
    JOIN territory_relationships tr ON tr.parent_territory_id = t.id
        AND tr.relationship_type = 'pertence_a'
        AND tr.division_scheme = 'antiga'
    WHERE t.type = 'microrregiao'
)
SELECT
    m.microrregiao_id,
    m.microrregiao_nome,
    iv.year,
    SUM(iv.value) as pib_total,
    AVG(iv.value) as pib_medio,
    COUNT(DISTINCT m.municipio_id) as num_municipios
FROM microregioes m
JOIN indicator_values iv ON iv.territory_id = m.municipio_id
WHERE iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.is_aggregated = false
GROUP BY m.microrregiao_id, m.microrregiao_nome, iv.year;

-- Criar índices
CREATE INDEX ON mv_pib_microregioes (microrregiao_id, year);

-- Refresh periódico (via cron ou trigger)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pib_microregioes;
```

**Vantagens**:
- ✅ Performance excelente
- ✅ Refresh controlado (não precisa estar sempre atualizado)
- ✅ Não duplica dados em `indicator_values`

**Desvantagens**:
- ❌ Mais complexo de gerenciar
- ❌ Requer PostgreSQL 9.3+

**Quando Usar**: Produção com análises regionais frequentes.

---

### Recomendação

| Fase | Abordagem | Motivo |
|------|-----------|--------|
| **MVP (Semana 1-2)** | On-the-Fly | Simples, validar queries |
| **Produção Inicial (Mês 1)** | Pré-Calculada | Performance dashboards |
| **Produção Madura (Mês 2+)** | Materialized Views | Otimização máxima |

---

## 🔍 Queries de Exemplo

### 1. Séries Temporais (Últimos 10 Anos)

**Caso de Uso**: Exibir evolução do PIB de Palmas nos últimos 10 anos.

```sql
-- Query para séries temporais (otimizada com índices da Migration 009)
SELECT
    t.name as municipio,
    iv.year,
    iv.value,
    iv.data_quality
FROM indicator_values iv
JOIN territories t ON iv.territory_id = t.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE t.type = 'municipio'
  AND t.name = 'Palmas'
  AND id.code = 'ECON_PIB_TOTAL'
  AND iv.year >= EXTRACT(YEAR FROM CURRENT_DATE) - 10
ORDER BY iv.year DESC;
```

**Performance Esperada**: <10ms (com índice `idx_indicator_values_recent`)

---

### 2. Últimos 3 Pontos Disponíveis (Dados Esparsos)

**Caso de Uso**: Exibir últimos 3 valores do IDHM (dados do Censo - esparsos).

```sql
-- Query para dados esparsos (census, etc.)
SELECT
    t.name as municipio,
    iv.year,
    iv.value
FROM indicator_values iv
JOIN territories t ON iv.territory_id = t.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE t.type = 'municipio'
  AND t.name = 'Palmas'
  AND id.code = 'SOCIAL_IDHM'
ORDER BY iv.year DESC
LIMIT 3;
```

**Resultado Esperado**:
```
| municipio | year | value  |
|-----------|------|--------|
| Palmas    | 2010 | 0.788  |
| Palmas    | 2000 | 0.710  |
| Palmas    | 1991 | 0.632  |
```

---

### 3. Comparação Município vs Microrregião vs Estado

**Caso de Uso**: Comparar PIB de Palmas com sua microrregião e o estado.

```sql
WITH palmas AS (
    SELECT id FROM territories WHERE name = 'Palmas' AND type = 'municipio'
),
micro_porto_nacional AS (
    SELECT t.id
    FROM territories t
    JOIN territory_relationships tr ON tr.child_territory_id = (SELECT id FROM palmas)
        AND tr.relationship_type = 'pertence_a'
        AND tr.division_scheme = 'antiga'
    JOIN territories t ON tr.parent_territory_id = t.id
    WHERE t.type = 'microrregiao'
),
estado AS (
    SELECT id FROM territories WHERE name = 'Tocantins' AND type = 'estado'
)
SELECT
    'Palmas' as territorio,
    iv.year,
    iv.value
FROM indicator_values iv
WHERE iv.territory_id = (SELECT id FROM palmas)
  AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year = 2022

UNION ALL

SELECT
    'Microrregião Porto Nacional' as territorio,
    iv.year,
    SUM(iv.value) as value
FROM indicator_values iv
JOIN territory_relationships tr ON iv.territory_id = tr.child_territory_id
        AND tr.parent_territory_id = (SELECT id FROM micro_porto_nacional)
        AND tr.division_scheme = 'antiga'
WHERE iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year = 2022
GROUP BY iv.year

UNION ALL

SELECT
    'Estado Tocantins' as territorio,
    iv.year,
    iv.value
FROM indicator_values iv
WHERE iv.territory_id = (SELECT id FROM estado)
  AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year = 2022
ORDER BY value DESC;
```

**Resultado Esperado**:
```
| territorio                   | year | value         |
|------------------------------|------|---------------|
| Estado Tocantins             | 2022 | 50000000000   |
| Microrregião Porto Nacional  | 2022 | 15000000000   |
| Palmas                       | 2022 | 10000000000   |
```

---

### 4. Agregação por Microrregião (Divisão Antiga)

**Caso de Uso**: Ranking de microrregiões por PIB em 2022.

```sql
SELECT
    t_micro.name as microrregiao,
    SUM(iv.value) as pib_total,
    AVG(iv.value) as pib_medio_municipal,
    COUNT(DISTINCT iv.territory_id) as num_municipios
FROM territories t_micro
JOIN territory_relationships tr ON tr.parent_territory_id = t_micro.id
    AND tr.relationship_type = 'pertence_a'
    AND tr.division_scheme = 'antiga'
JOIN indicator_values iv ON iv.territory_id = tr.child_territory_id
WHERE t_micro.type = 'microrregiao'
  AND t_micro.division_scheme = 'antiga'
  AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year = 2022
  AND iv.is_aggregated = false  -- Apenas dados municipais brutos
GROUP BY t_micro.id, t_micro.name
ORDER BY pib_total DESC;
```

**Resultado Esperado**:
```
| microrregiao        | pib_total    | pib_medio_municipal | num_municipios |
|---------------------|--------------|---------------------|----------------|
| Araguaína           | 12000000000  | 800000000           | 15             |
| Porto Nacional      | 15000000000  | 1000000000          | 15             |
| Gurupi              | 8000000000   | 500000000           | 16             |
| ...                 | ...          | ...                 | ...            |
```

---

### 5. Agregação por Região Imediata (Divisão Nova)

**Caso de Uso**: Ranking de regiões imediatas por PIB em 2022.

```sql
SELECT
    t_imediata.name as regiao_imediata,
    SUM(iv.value) as pib_total,
    AVG(iv.value) as pib_medio_municipal,
    COUNT(DISTINCT iv.territory_id) as num_municipios
FROM territories t_imediata
JOIN territory_relationships tr ON tr.parent_territory_id = t_imediata.id
    AND tr.relationship_type = 'pertence_a'
    AND tr.division_scheme = 'nova'
JOIN indicator_values iv ON iv.territory_id = tr.child_territory_id
WHERE t_imediata.type = 'regiao_imediata'
  AND t_imediata.division_scheme = 'nova'
  AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year = 2022
  AND iv.is_aggregated = false
GROUP BY t_imediata.id, t_imediata.name
ORDER BY pib_total DESC;
```

---

### 6. Comparação Divisão Antiga vs Nova

**Caso de Uso**: Comparar evolução do PIB agregado usando ambas as divisões.

```sql
-- Agregação por MICRORREGIÃO (divisão antiga)
WITH pib_antiga AS (
    SELECT
        t_micro.name as nome_regiao,
        'microrregiao' as tipo,
        'antiga' as divisao,
        SUM(iv.value) as pib_total
    FROM territories t_micro
    JOIN territory_relationships tr ON tr.parent_territory_id = t_micro.id
        AND tr.relationship_type = 'pertence_a'
        AND tr.division_scheme = 'antiga'
    JOIN indicator_values iv ON iv.territory_id = tr.child_territory_id
    WHERE t_micro.type = 'microrregiao'
      AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
      AND iv.year = 2022
      AND iv.is_aggregated = false
    GROUP BY t_micro.id, t_micro.name
),
-- Agregação por REGIÃO IMEDIATA (divisão nova)
pib_nova AS (
    SELECT
        t_imediata.name as nome_regiao,
        'regiao_imediata' as tipo,
        'nova' as divisao,
        SUM(iv.value) as pib_total
    FROM territories t_imediata
    JOIN territory_relationships tr ON tr.parent_territory_id = t_imediata.id
        AND tr.relationship_type = 'pertence_a'
        AND tr.division_scheme = 'nova'
    JOIN indicator_values iv ON iv.territory_id = tr.child_territory_id
    WHERE t_imediata.type = 'regiao_imediata'
      AND iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
      AND iv.year = 2022
      AND iv.is_aggregated = false
    GROUP BY t_imediata.id, t_imediata.name
)
SELECT * FROM pib_antiga
UNION ALL
SELECT * FROM pib_nova
ORDER BY divisao, pib_total DESC;
```

**Resultado Esperado**:
```
| nome_regiao                      | tipo             | divisao | pib_total    |
|----------------------------------|------------------|---------|--------------|
| Porto Nacional                   | microrregiao     | antiga  | 15000000000  |
| Araguaína                        | microrregiao     | antiga  | 12000000000  |
| Palmas                           | regiao_imediata  | nova    | 10500000000  |
| Araguaína                        | regiao_imediata  | nova    | 9000000000   |
| ...                              | ...              | ...     | ...          |
```

---

### 7. Análise Temporal Multi-Escala

**Caso de Uso**: Evolução do PIB nos últimos 5 anos em múltiplas escalas.

```sql
SELECT
    iv.year,
    t.type as escala,
    t.name as territorio,
    CASE
        WHEN t.type = 'municipio' THEN iv.value
        ELSE (
            SELECT SUM(iv2.value)
            FROM territory_relationships tr
            JOIN indicator_values iv2 ON iv2.territory_id = tr.child_territory_id
            WHERE tr.parent_territory_id = t.id
              AND tr.division_scheme = COALESCE(t.division_scheme, 'antiga')
              AND iv2.indicator_id = iv.indicator_id
              AND iv2.year = iv.year
              AND iv2.is_aggregated = false
        )
    END as pib_total
FROM indicator_values iv
JOIN territories t ON iv.territory_id = t.id
WHERE iv.indicator_id = (SELECT id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL')
  AND iv.year >= 2018
  AND (
      (t.type = 'municipio' AND t.name = 'Palmas')
      OR (t.type = 'microrregiao' AND t.name = 'Porto Nacional')
      OR (t.type = 'estado' AND t.name = 'Tocantins')
  )
ORDER BY t.type, iv.year DESC;
```

---

## 📋 Plano de Ação Detalhado

### Fase 1: Execução da Migration (Semana 1)

**Responsável**: DBA / Dev Backend

**Atividades**:

1. **Backup do Database** (30 min)
   ```bash
   # Supabase Dashboard > Database > Backups
   # Criar backup manual antes da migration
   ```

2. **Executar Migration 009** (5-10 min)
   ```sql
   -- Supabase SQL Editor
   -- Copiar e executar: supabase/migrations/009_territories_schema.sql
   ```

3. **Validar Execução** (15 min)
   ```sql
   -- Verificar totais
   SELECT type, COUNT(*) FROM territories GROUP BY type;
   -- Esperado:
   --   estado: 1
   --   mesorregiao: 2
   --   microrregiao: 8
   --   regiao_intermediaria: 3
   --   regiao_imediata: 11
   --   municipio: 139

   -- Verificar relationships
   SELECT division_scheme, COUNT(*) FROM territory_relationships GROUP BY division_scheme;
   -- Esperado:
   --   antiga: 149 (139 municípios + 8 micros + 2 mesos)
   --   nova: ~150 (139 municípios + 11 imediatas)
   ```

4. **Verificar Views de Compatibilidade** (10 min)
   ```sql
   -- Testar views antigas
   SELECT COUNT(*) FROM municipalities;  -- Esperado: 139
   SELECT COUNT(*) FROM microregions;    -- Esperado: 8
   SELECT COUNT(*) FROM mesoregions;     -- Esperado: 2
   ```

**Critérios de Sucesso**:
- [ ] Migration executada sem erros
- [ ] 164 territórios criados (1+2+8+3+11+139)
- [ ] ~300 relationships criados
- [ ] Views de compatibilidade funcionando
- [ ] Validação SQL passou (script integrado na migration)

**Rollback**: Se houver problemas, restaurar backup.

---

### Fase 2: Atualização do Workflow IBGE (Semana 1)

**Responsável**: Dev n8n

**Atividades**:

1. **Backup do Workflow** (5 min)
   - n8n > Workflows > `Data Collection - IBGE Sidra`
   - Menu > **Duplicate** > Renomear: `Data Collection - IBGE Sidra (Backup)`

2. **Ajustar Nó: Upsert Indicator Value** (15 min)
   - Abrir nó `Upsert Indicator Value`
   - Alterar query SQL:

   ```sql
   -- Query NOVA
   INSERT INTO indicator_values (
     indicator_id,
     territory_id,      -- ← Mudança 1
     year,
     value,
     data_quality,
     notes,
     aggregation_method  -- ← Mudança 2
   )
   SELECT id.id, $2::uuid, $3::integer, $4::decimal, $5::varchar, $6::text, 'raw'
   FROM indicator_definitions id
   WHERE id.code = $1
   ON CONFLICT (indicator_id, territory_id, year, month)  -- ← Mudança 3
   DO UPDATE SET
     value = EXCLUDED.value,
     updated_at = NOW();
   ```

   - Ajustar mapeamento de parâmetros:
     - `$1`: `{{ $json.indicator_code }}`
     - `$2`: `{{ $json.territory_id }}` (era `municipality_id`)
     - `$3`: `{{ $json.year }}`
     - `$4`: `{{ $json.value }}`
     - `$5`: `{{ $json.data_quality }}`
     - `$6`: `{{ $json.notes }}`

3. **Ajustar Nó: Prepare Upsert Data** (10 min - se existir)
   - Se houver nó preparando dados, renomear:
   ```javascript
   // ANTES
   municipality_id: $json.municipality_id

   // DEPOIS
   territory_id: $json.municipality_id  // Valor continua o mesmo, apenas nome muda
   ```

4. **Testar Workflow** (30 min)
   - Executar manualmente com 1 indicador (População)
   - Payload de teste:
   ```json
   {
     "source_name": "IBGE Sidra",
     "indicators": [{
       "code": "SOCIAL_POPULACAO",
       "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last"
     }]
   }
   ```
   - Verificar:
     - [ ] Workflow executa sem erros
     - [ ] 139 registros inseridos em `indicator_values`
     - [ ] `territory_id` populado corretamente
     - [ ] `aggregation_method` = 'raw'

**Critérios de Sucesso**:
- [ ] Workflow ajustado e salvo
- [ ] Teste manual passou
- [ ] Dados validados no Supabase
- [ ] Backup disponível para rollback

---

### Fase 3: Completar Mapeamento Municípios → Regiões Imediatas (Semana 2)

**Responsável**: Data Analyst / Dev Backend

**Atividades**:

1. **Obter Lista Completa IBGE** (1h)
   - Acessar: https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional/23701-divisao-geografica-imediata-e-intermediaria.html
   - Download: Planilha com municípios por região imediata
   - Formatar para SQL

2. **Criar Script de População** (2h)
   ```sql
   -- Exemplo para Região Imediata de Colinas do Tocantins (170003)
   INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
   SELECT
       (SELECT id FROM territories WHERE type = 'regiao_imediata' AND ibge_code = '170003'),
       t_muni.id,
       'pertence_a',
       'nova'
   FROM territories t_muni
   WHERE t_muni.type = 'municipio'
     AND t_muni.name IN (
         'Colinas do Tocantins',
         'Brasilândia do Tocantins',
         'Bernardo Sayão',
         'Couto Magalhães',
         'Juarina',
         'Nova Olinda',
         'Pequizeiro',
         'Presidente Kennedy',
         'Tupiratins'
     )
   ON CONFLICT DO NOTHING;

   -- Repetir para as outras 10 regiões imediatas
   ```

3. **Executar Script** (10 min)
   - Supabase SQL Editor
   - Executar script completo

4. **Validar** (10 min)
   ```sql
   -- Verificar que todos os 139 municípios têm região imediata
   SELECT COUNT(*)
   FROM territories t
   WHERE t.type = 'municipio'
     AND NOT EXISTS (
         SELECT 1 FROM territory_relationships tr
         WHERE tr.child_territory_id = t.id
           AND tr.division_scheme = 'nova'
     );
   -- Esperado: 0
   ```

**Critérios de Sucesso**:
- [ ] 139 municípios mapeados para regiões imediatas
- [ ] Validação SQL retorna 0 municípios sem mapeamento
- [ ] Queries de agregação por região imediata funcionando

---

### Fase 4: Implementar Agregações Pré-Calculadas (Semana 3-4)

**Responsável**: Dev Backend

**Atividades**:

1. **Criar Função de Agregação** (3h)
   ```sql
   -- Função: Agregar indicadores para regiões
   CREATE OR REPLACE FUNCTION aggregate_indicators_for_regions()
   RETURNS void AS $$
   DECLARE
       v_indicator RECORD;
       v_region RECORD;
   BEGIN
       -- Loop por indicadores agregáveis (soma ou média)
       FOR v_indicator IN
           SELECT id, code FROM indicator_definitions
           WHERE code LIKE 'ECON_PIB%' OR code LIKE 'ECON_VA%'
       LOOP
           -- Loop por microrregiões (divisão antiga)
           FOR v_region IN
               SELECT id FROM territories WHERE type = 'microrregiao' AND division_scheme = 'antiga'
           LOOP
               -- Inserir agregação
               INSERT INTO indicator_values (
                   indicator_id,
                   territory_id,
                   year,
                   value,
                   aggregation_method,
                   is_aggregated
               )
               SELECT
                   v_indicator.id,
                   v_region.id,
                   iv.year,
                   SUM(iv.value),
                   'sum',
                   true
               FROM indicator_values iv
               JOIN territory_relationships tr ON iv.territory_id = tr.child_territory_id
                   AND tr.parent_territory_id = v_region.id
                   AND tr.division_scheme = 'antiga'
               WHERE iv.indicator_id = v_indicator.id
                 AND iv.is_aggregated = false
               GROUP BY iv.year
               ON CONFLICT (indicator_id, territory_id, year, month)
               DO UPDATE SET
                   value = EXCLUDED.value,
                   updated_at = NOW();
           END LOOP;
       END LOOP;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Criar Job Periódico** (1h)
   - Opção A: Supabase Edge Function (cron)
   - Opção B: n8n Workflow (schedule)
   - Opção C: PostgreSQL pg_cron extension

   **Exemplo n8n**:
   ```
   Schedule: Daily 4:00 AM (após coleta municipal)
   └─> Execute SQL
       └─> SELECT aggregate_indicators_for_regions();
   ```

3. **Testar Função** (1h)
   ```sql
   -- Executar manualmente
   SELECT aggregate_indicators_for_regions();

   -- Verificar agregações criadas
   SELECT
       t.name,
       COUNT(*) as total_agregacoes
   FROM indicator_values iv
   JOIN territories t ON iv.territory_id = t.id
   WHERE iv.is_aggregated = true
     AND t.type IN ('microrregiao', 'regiao_imediata')
   GROUP BY t.name;
   ```

**Critérios de Sucesso**:
- [ ] Função de agregação criada e testada
- [ ] Job periódico configurado
- [ ] Agregações regionais visíveis em `indicator_values`
- [ ] Performance de dashboards melhorou (queries <100ms)

---

### Fase 5: Implementar Workflow SICONFI (Semana 4-5)

**Responsável**: Dev n8n

**Objetivo**: Coletar indicadores estaduais (receitas e despesas do governo estadual).

**Atividades**:

1. **Criar Workflow** (4h)
   - n8n > New Workflow
   - Nome: `Data Collection - SICONFI`
   - Estrutura:

   ```
   1. Webhook Trigger
      ├─> Path: /webhook/data-collection-siconfi

   2. Get State Territory
      ├─> Query: SELECT id FROM territories WHERE type = 'estado' AND name = 'Tocantins'

   3. Loop Indicators
      ├─> Input: indicators array from webhook

   4. Call SICONFI API
      ├─> URL: https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra
      ├─> Params: ?ano={{ $json.year }}&uf=TO&tipo={{ $json.tipo }}

   5. Parse Response
      ├─> Extract: receita_total, despesa_total, etc.

   6. Upsert Indicator Value
      ├─> territory_id: estado_id (from step 2)
      ├─> aggregation_method: 'raw'

   7. Return Summary
   ```

2. **Registrar Indicadores Estaduais** (1h)
   ```sql
   INSERT INTO indicator_dictionary (code, name, description, dimension, category, source_name, api_endpoint, periodicity, collection_method, is_active)
   VALUES
   ('ECON_RECEITA_ESTADUAL', 'Receita Total do Estado', 'Receita orçamentária total do governo estadual', 'ECON', 'Finanças Públicas', 'SICONFI', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra', 'annual', 'api', true),
   ('ECON_DESPESA_ESTADUAL', 'Despesa Total do Estado', 'Despesa orçamentária total do governo estadual', 'ECON', 'Finanças Públicas', 'SICONFI', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra', 'annual', 'api', true);
   ```

3. **Atualizar Orquestrador** (30 min)
   - Adicionar mapeamento SICONFI no orquestrador:
   ```javascript
   const sourceToWorkflow = {
     'IBGE Sidra': 'data-collection-ibge',
     'SICONFI': 'data-collection-siconfi',  // ← Novo
     ...
   };
   ```

4. **Testar End-to-End** (1h)
   - Forçar indicador estadual como pendente:
   ```sql
   UPDATE indicator_dictionary
   SET next_collection_date = CURRENT_DATE - 1
   WHERE code = 'ECON_RECEITA_ESTADUAL';
   ```
   - Executar orquestrador
   - Verificar:
     - [ ] SICONFI workflow chamado
     - [ ] Dados estaduais coletados
     - [ ] `territory_id` aponta para estado
     - [ ] Query de comparação município/estado funciona

**Critérios de Sucesso**:
- [ ] Workflow SICONFI funcional
- [ ] ≥2 indicadores estaduais coletados
- [ ] Orquestrador chama SICONFI corretamente
- [ ] Comparações multi-escala funcionando

---

### Fase 6: Atualizar Dashboards e Frontend (Semana 5-6)

**Responsável**: Dev Frontend

**Atividades**:

1. **Adicionar Seletor de Escala** (3h)
   - Dropdown: Estado / Região Intermediária / Região Imediata / Microrregião / Município
   - Quando usuário seleciona região, carregar dados agregados

2. **Adicionar Seletor de Divisão** (2h)
   - Toggle: Divisão Antiga / Divisão Nova
   - Mostrar regiões conforme divisão selecionada

3. **Gráficos de Séries Temporais** (4h)
   - Linha do tempo (últimos 10 anos)
   - Suporte a dados esparsos (census)
   - Indicador de qualidade de dados

4. **Comparações Multi-Escala** (4h)
   - Gráfico comparativo: Município vs Região vs Estado
   - Percentual em relação ao total estadual

**Critérios de Sucesso**:
- [ ] Usuário pode visualizar dados em múltiplas escalas
- [ ] Gráficos de séries temporais funcionando
- [ ] Comparações multi-escala intuitivas

---

## 🎯 Cronograma Consolidado

| Semana | Fase | Atividades Principais | Responsável |
|--------|------|----------------------|-------------|
| **1** | Migration + Workflow IBGE | Executar Migration 009, Ajustar workflow IBGE | DBA + Dev n8n |
| **2** | Mapeamento Completo | Completar municípios → regiões imediatas | Data Analyst |
| **3-4** | Agregações | Implementar pré-cálculo, Job periódico | Dev Backend |
| **4-5** | SICONFI | Workflow estadual, Indicadores estaduais | Dev n8n |
| **5-6** | Frontend | Dashboards multi-escala, Séries temporais | Dev Frontend |

**Duração Total**: 6 semanas

---

## ✅ Checklist de Validação Final

### Funcional

- [ ] Migration 009 executada com sucesso
- [ ] 164 territórios criados (1+2+8+3+11+139)
- [ ] ~300 relationships criados
- [ ] 139 municípios mapeados em ambas as divisões (antiga E nova)
- [ ] Workflow IBGE ajustado e testado
- [ ] Workflow SICONFI implementado e testado
- [ ] Agregações pré-calculadas funcionando
- [ ] Views de compatibilidade operacionais

### Performance

- [ ] Queries de séries temporais <10ms
- [ ] Queries de agregação regional <100ms (pré-calculada) ou <500ms (on-the-fly)
- [ ] Dashboards responsivos (<2s de carregamento)

### Dados

- [ ] Indicadores municipais coletados corretamente
- [ ] Indicadores estaduais coletados corretamente
- [ ] Agregações regionais corretas (validar soma de municípios)
- [ ] Sem dados duplicados incorretos

### Documentação

- [ ] ADR-005 revisado e aprovado
- [ ] Migration 009 documentada
- [ ] Queries de exemplo testadas e documentadas
- [ ] Guias atualizados (data-collection-setup.md, etc.)

---

## 🚨 Riscos e Mitigações

### Risco 1: Performance de Agregações On-the-Fly

**Probabilidade**: 🟡 Média
**Impacto**: 🟡 Médio (dashboards lentos)

**Mitigação**:
- Implementar pré-cálculo (Fase 4) assim que possível
- Usar materialized views como plano B
- Cache de resultados frequentes no frontend

---

### Risco 2: Mapeamento Incompleto Municípios → Regiões Imediatas

**Probabilidade**: 🟢 Baixa
**Impacto**: 🔴 Alto (agregações incorretas)

**Mitigação**:
- Validação SQL automática (incluída na Migration 009)
- Script de verificação pós-mapeamento
- Testar agregações em ambiente de dev primeiro

---

### Risco 3: Complexidade Aumentada para Desenvolvedores

**Probabilidade**: 🟡 Média
**Impacto**: 🟡 Médio (curva de aprendizado)

**Mitigação**:
- Documentação extensa (este documento + ADR-005)
- Views de compatibilidade (código antigo continua funcionando)
- Exemplos de queries (seção acima)
- Treinamento da equipe

---

### Risco 4: Quebra de Código Existente

**Probabilidade**: 🟢 Baixa
**Impacto**: 🔴 Alto (sistema parado)

**Mitigação**:
- Views de compatibilidade (`v_municipalities_compat`, etc.)
- Testes extensivos antes de deploy
- Backup completo antes da migration
- Rollback plan documentado

---

## 📚 Referências

- [ADR-005: Granularidade Territorial e Temporal](../adr/005-granularidade-territorial-temporal.md)
- [Migration 009: Territories Schema](../../supabase/migrations/009_territories_schema.sql)
- [Divisões Regionais IBGE](../references/tocantins_divisoes_regionais_ibge.md)
- [IBGE - Divisão Regional do Brasil](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional/23701-divisao-geografica-imediata-e-intermediaria.html)

---

**Última Atualização**: 2026-01-16
**Autor**: Claude Code (Sonnet 4.5)
**Sessão**: #19
