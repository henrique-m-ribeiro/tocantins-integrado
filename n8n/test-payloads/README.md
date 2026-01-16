# 🧪 Payloads de Teste - Sistema de Coleta

> Payloads prontos para testar workflows no n8n

**Sessão**: #19
**Data**: 2026-01-16

---

## 📋 Como Usar

### No n8n:

1. Abrir workflow desejado
2. Clicar em **Execute Workflow**
3. No nó de **Webhook Trigger**, aba **Test**
4. Colar o payload JSON correspondente
5. **Execute Workflow**

---

## 🎯 Payloads para Workflow IBGE

### Teste 1: Indicador Único (População)

**Objetivo**: Testar coleta mais simples possível

**Tempo Estimado**: 5-10 minutos

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-populacao",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "code": "SOCIAL_POPULACAO",
      "name": "População Total",
      "dimension": "SOCIAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last",
      "collection_status": "overdue"
    }
  ],
  "total_indicators": 1,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Validação**:
```sql
SELECT COUNT(*) FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code = 'SOCIAL_POPULACAO'
  AND iv.created_at > NOW() - INTERVAL '1 hour';
-- Esperado: ~139 registros
```

---

### Teste 2: Três Indicadores IBGE

**Objetivo**: Testar múltiplos indicadores em uma única execução

**Tempo Estimado**: 15-20 minutos

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-multiplos",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "code": "SOCIAL_POPULACAO",
      "name": "População Total",
      "dimension": "SOCIAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last",
      "collection_status": "overdue"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "code": "ECON_PIB_TOTAL",
      "name": "PIB Municipal Total",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last/d/v37%202",
      "collection_status": "overdue"
    },
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "code": "ECON_PIB_PER_CAPITA",
      "name": "PIB per Capita",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/37/p/last",
      "collection_status": "overdue"
    }
  ],
  "total_indicators": 3,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Validação**:
```sql
SELECT
  id.code,
  id.name,
  COUNT(DISTINCT m.id) as municipios_coletados,
  COUNT(*) as total_registros
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('SOCIAL_POPULACAO', 'ECON_PIB_TOTAL', 'ECON_PIB_PER_CAPITA')
  AND iv.created_at > NOW() - INTERVAL '1 hour'
GROUP BY id.code, id.name;
-- Esperado: ~139 municípios por indicador, total ~417 registros
```

---

### Teste 3: Indicadores de Valor Adicionado (VA)

**Objetivo**: Testar coleta de indicadores de setores econômicos

**Tempo Estimado**: 20-30 minutos

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-va-setores",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000004",
      "code": "ECON_VA_AGRO",
      "name": "Valor Adicionado - Agropecuária",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/513/p/last",
      "collection_status": "never_collected"
    },
    {
      "id": "00000000-0000-0000-0000-000000000005",
      "code": "ECON_VA_INDUSTRIA",
      "name": "Valor Adicionado - Indústria",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/514/p/last",
      "collection_status": "never_collected"
    },
    {
      "id": "00000000-0000-0000-0000-000000000006",
      "code": "ECON_VA_SERVICOS",
      "name": "Valor Adicionado - Serviços",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/515/p/last",
      "collection_status": "never_collected"
    },
    {
      "id": "00000000-0000-0000-0000-000000000007",
      "code": "ECON_VA_ADM_PUB",
      "name": "Valor Adicionado - Administração Pública",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/516/p/last",
      "collection_status": "never_collected"
    }
  ],
  "total_indicators": 4,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Validação**:
```sql
-- Verificar dados coletados
SELECT
  id.code,
  m.name as municipio,
  iv.year,
  iv.value,
  iv.data_quality
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('ECON_VA_AGRO', 'ECON_VA_INDUSTRIA', 'ECON_VA_SERVICOS', 'ECON_VA_ADM_PUB')
  AND iv.created_at > NOW() - INTERVAL '2 hours'
ORDER BY id.code, m.name
LIMIT 50;
```

---

### Teste 4: Teste de Stress (10 Indicadores)

**Objetivo**: Testar performance com carga alta

**Tempo Estimado**: 30-45 minutos

**⚠️ ATENÇÃO**: Este teste coletará ~1.390 registros (10 × 139 municípios)

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-stress-10-indicadores",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "code": "SOCIAL_POPULACAO",
      "name": "População Total",
      "dimension": "SOCIAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "code": "ECON_PIB_TOTAL",
      "name": "PIB Municipal Total",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last/d/v37%202"
    },
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "code": "ECON_PIB_PER_CAPITA",
      "name": "PIB per Capita",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/37/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000004",
      "code": "ECON_VA_AGRO",
      "name": "Valor Adicionado - Agropecuária",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/513/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000005",
      "code": "ECON_VA_INDUSTRIA",
      "name": "Valor Adicionado - Indústria",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/514/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000006",
      "code": "ECON_VA_SERVICOS",
      "name": "Valor Adicionado - Serviços",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/515/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000007",
      "code": "ECON_VA_ADM_PUB",
      "name": "Valor Adicionado - Administração Pública",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/516/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000008",
      "code": "TERRA_COLETA_LIXO",
      "name": "Coleta de Lixo",
      "dimension": "TERRA",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/3175/n6/{ibge_code}/v/allxp/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000009",
      "code": "TERRA_PAVIMENTACAO",
      "name": "Vias Pavimentadas",
      "dimension": "TERRA",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/3175/n6/{ibge_code}/v/1000092/p/last"
    },
    {
      "id": "00000000-0000-0000-0000-000000000010",
      "code": "TERRA_ILUMINACAO",
      "name": "Iluminação Pública",
      "dimension": "TERRA",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/3175/n6/{ibge_code}/v/1000093/p/last"
    }
  ],
  "total_indicators": 10,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Métricas de Performance**:
```sql
-- Total de registros coletados
SELECT COUNT(*) as total_registros
FROM indicator_values
WHERE created_at > NOW() - INTERVAL '2 hours';
-- Esperado: ~1.390

-- Por dimensão
SELECT
  SUBSTRING(id.code FROM 1 FOR POSITION('_' IN id.code) - 1) as dimension,
  COUNT(*) as total_registros
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE iv.created_at > NOW() - INTERVAL '2 hours'
GROUP BY dimension;
```

---

## 🎯 Payloads para Workflow INEP (Placeholder)

### Teste: Placeholder INEP

**Objetivo**: Validar que placeholder retorna status correto

```json
{
  "source_name": "INEP",
  "orchestrator_run_id": "test-placeholder-inep",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000020",
      "code": "SOCIAL_IDEB_AI",
      "name": "IDEB Anos Iniciais",
      "dimension": "SOCIAL",
      "api_endpoint": "https://inep.gov.br/ideb/api"
    },
    {
      "id": "00000000-0000-0000-0000-000000000021",
      "code": "SOCIAL_IDEB_AF",
      "name": "IDEB Anos Finais",
      "dimension": "SOCIAL",
      "api_endpoint": "https://inep.gov.br/ideb/api"
    }
  ],
  "total_indicators": 2,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Resposta Esperada**:
```json
{
  "source": "INEP",
  "status": "not_implemented",
  "message": "INEP collection requires manual data import or scraping implementation",
  "indicators_received": 2,
  "next_steps": [
    "Download microdados INEP",
    "Process CSV files",
    "Import to database"
  ]
}
```

---

## 🎯 Payloads para Workflow MapBiomas (Placeholder)

### Teste: Placeholder MapBiomas

**Objetivo**: Validar que placeholder retorna status correto

```json
{
  "source_name": "MapBiomas",
  "orchestrator_run_id": "test-placeholder-mapbiomas",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000030",
      "code": "AMBIENT_COBERTURA_NATIVA",
      "name": "Cobertura de Vegetação Nativa",
      "dimension": "AMBIENT",
      "api_endpoint": "https://api.mapbiomas.org/coverage"
    },
    {
      "id": "00000000-0000-0000-0000-000000000031",
      "code": "AMBIENT_TX_DESMATAMENTO",
      "name": "Taxa de Desmatamento",
      "dimension": "AMBIENT",
      "api_endpoint": "https://api.mapbiomas.org/deforestation"
    }
  ],
  "total_indicators": 2,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Resposta Esperada**:
```json
{
  "source": "MapBiomas",
  "status": "not_implemented",
  "message": "MapBiomas API requires authentication token",
  "indicators_received": 2,
  "next_steps": [
    "Register at MapBiomas platform",
    "Obtain API token",
    "Implement authenticated API calls",
    "Process coverage data"
  ]
}
```

---

## 🎯 Payloads para Orquestrador (Não Usar Diretamente)

> **NOTA**: O orquestrador não aceita payload manual. Ele consulta o database automaticamente.

### Como Testar o Orquestrador:

1. **Preparar Database**:
   ```sql
   -- Forçar indicadores como pendentes
   UPDATE indicator_dictionary
   SET next_collection_date = CURRENT_DATE - 1
   WHERE code IN ('SOCIAL_POPULACAO', 'ECON_PIB_TOTAL', 'ECON_VA_AGRO');
   ```

2. **Executar Orquestrador**:
   - n8n > Workflow `Data Collection Orchestrator`
   - **Execute Workflow** (manual)

3. **Verificar Logs**:
   ```
   [ORCHESTRATOR] Iniciando coleta de dados...
   [ORCHESTRATOR] Indicadores agrupados por fonte:
     • IBGE Sidra: 3 indicadores
   ```

---

## 📊 Queries de Validação SQL

### Verificar Dados Coletados (Últimas 24h)

```sql
SELECT
  dimension,
  COUNT(DISTINCT indicator_id) as indicadores,
  COUNT(*) as total_registros,
  MIN(created_at) as primeira_coleta,
  MAX(created_at) as ultima_coleta
FROM (
  SELECT
    SUBSTRING(id.code FROM 1 FOR POSITION('_' IN id.code) - 1) as dimension,
    iv.indicator_id,
    iv.created_at
  FROM indicator_values iv
  JOIN indicator_definitions id ON iv.indicator_id = id.id
  WHERE iv.created_at > NOW() - INTERVAL '24 hours'
) sub
GROUP BY dimension
ORDER BY dimension;
```

### Verificar Dictionary Atualizado

```sql
SELECT
  code,
  name,
  dimension,
  source_name,
  last_ref_date,
  last_update_date,
  next_collection_date,
  CASE
    WHEN next_collection_date IS NULL THEN 'never_collected'
    WHEN next_collection_date < CURRENT_DATE THEN 'overdue'
    WHEN next_collection_date = CURRENT_DATE THEN 'due_today'
    ELSE 'future'
  END as status
FROM indicator_dictionary
WHERE code IN (
  'SOCIAL_POPULACAO',
  'ECON_PIB_TOTAL',
  'ECON_PIB_PER_CAPITA',
  'ECON_VA_AGRO',
  'ECON_VA_INDUSTRIA',
  'ECON_VA_SERVICOS',
  'ECON_VA_ADM_PUB'
)
ORDER BY code;
```

### Listar Indicadores Pendentes

```sql
SELECT * FROM v_indicators_pending_collection
WHERE source_name IN ('IBGE Sidra', 'IBGE')
LIMIT 20;
```

### Verificar Taxa de Sucesso de Coleta

```sql
-- Total de indicadores ativos com API
WITH active_indicators AS (
  SELECT COUNT(*) as total
  FROM indicator_dictionary
  WHERE is_active = true
    AND collection_method = 'api'
    AND source_name IN ('IBGE Sidra', 'IBGE')
),
-- Indicadores coletados nas últimas 24h
collected_indicators AS (
  SELECT COUNT(DISTINCT indicator_id) as collected
  FROM indicator_values
  WHERE created_at > NOW() - INTERVAL '24 hours'
)
SELECT
  a.total as total_indicadores_ativos,
  c.collected as indicadores_coletados,
  ROUND((c.collected::numeric / a.total * 100), 2) as taxa_sucesso_pct
FROM active_indicators a, collected_indicators c;
```

---

## 🐛 Payloads de Teste para Debugging

### Teste de Erro: Endpoint Inválido

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-error-invalid-endpoint",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000099",
      "code": "TEST_INVALID",
      "name": "Teste Endpoint Inválido",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/INVALIDO/n6/{ibge_code}"
    }
  ],
  "total_indicators": 1,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Comportamento Esperado**:
- API retorna erro 404 ou JSON vazio
- Workflow não quebra (neverError: true)
- Nenhum registro inserido em `indicator_values`

---

### Teste de Timeout

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-timeout",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000098",
      "code": "SOCIAL_POPULACAO",
      "name": "População Total",
      "dimension": "SOCIAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last"
    }
  ],
  "total_indicators": 1,
  "timestamp": "2026-01-16T10:00:00Z"
}
```

**Modificação no Workflow**:
- Temporariamente reduzir timeout de `Call IBGE API` para 1000ms (1s)
- Deve resultar em timeouts para a maioria das requisições

**Comportamento Esperado**:
- Alguns municípios falham com timeout
- Workflow continua (neverError: true)
- Registros parciais inseridos

---

## 📝 Notas Importantes

### UUIDs dos Indicadores

- Os UUIDs nos payloads acima são **placeholders**
- No sistema real, UUIDs virão do database (`indicator_dictionary.id`)
- Para testes manuais, qualquer UUID válido funciona

### API Endpoints

- Todos os endpoints são **reais** da API IBGE Sidra
- Testados e funcionando em Janeiro 2026
- Se algum endpoint falhar, consultar [documentação IBGE Sidra](https://apisidra.ibge.gov.br/)

### Códigos de Município (IBGE Code)

- Placeholder `{ibge_code}` é substituído pelo workflow
- Exemplos: `1721000` (Palmas), `1702109` (Araguaína)
- Total: 139 municípios do Tocantins

---

**Última Atualização**: 2026-01-16
**Autor**: Claude Code (Sonnet 4.5)
**Sessão**: #19
