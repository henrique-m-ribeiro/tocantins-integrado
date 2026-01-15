# 🚀 Guia de Implementação - Sistema de Coleta de Dados

> Sistema de coleta orientado a metadados para o Tocantins Integrado

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Pré-requisitos](#-pré-requisitos)
4. [Setup do Banco de Dados](#-setup-do-banco-de-dados)
5. [Configuração dos Workflows](#-configuração-dos-workflows)
6. [Execução e Monitoramento](#-execução-e-monitoramento)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

### O Problema Anterior

O sistema de coleta inicial tinha limitações:
- Workflows hardcoded para cada indicador
- Difícil manutenção e escalabilidade
- Sem centralização de metadados
- Coleta manual propensa a erros

### A Solução: Coleta Orientada a Metadados

**Novo paradigma**:
```
┌──────────────────────────────────────────────────┐
│         INDICATOR_DICTIONARY (Metadados)         │
│  • Código, Nome, Dimensão                        │
│  • Fonte, API Endpoint, Parâmetros               │
│  • Periodicidade, Próxima coleta                 │
└─────────────────┬────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ ORQUESTRADOR│────────▶│  WORKFLOWS  │
│             │         │ ESPECIALISTAS│
│ • Diário    │         │             │
│ • Identifica│         │ • IBGE      │
│   pendentes │         │ • INEP      │
│ • Dispara   │         │ • MapBiomas │
│   workflows │         │ • Etc.      │
└─────────────┘         └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐      ┌────────────────┐
            │ INDICATOR    │      │ INDICATOR      │
            │ DEFINITIONS  │      │ VALUES         │
            └──────────────┘      └────────────────┘
```

**Benefícios**:
- ✅ **Escalável**: Adicionar indicador = inserir no dictionary
- ✅ **Manutenível**: Metadados centralizados
- ✅ **Automatizado**: Orquestrador identifica o que coletar
- ✅ **Auditável**: Histórico de coletas
- ✅ **Flexível**: Múltiplas fontes e métodos

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

#### 1. Indicator Dictionary (Banco de Dados)

**Tabela**: `indicator_dictionary`

Armazena metadados de **55 indicadores**:
- 15 indicadores ECON
- 17 indicadores SOCIAL
- 13 indicadores TERRA
- 11 indicadores AMBIENT

**Campos-chave**:
- `code`: Identificador único (ex: `ECON_PIB_TOTAL`)
- `source_name`: Fonte de dados (ex: `IBGE Sidra`)
- `api_endpoint`: URL da API (template)
- `api_params`: Parâmetros JSON da API
- `periodicity`: Frequência (`annual`, `monthly`, etc.)
- `next_collection_date`: Quando coletar próximo
- `is_active`: Se está ativo para coleta

#### 2. Workflow Orquestrador

**Arquivo**: `data-collection-orchestrator.json`

**Responsabilidades**:
1. Executa **diariamente** (agendado)
2. Consulta `indicator_dictionary`
3. Identifica indicadores vencidos ou nunca coletados
4. Agrupa por `source_name`
5. Dispara workflows especialistas correspondentes

**Lógica de Priorização**:
```sql
SELECT * FROM indicator_dictionary
WHERE is_active = true
  AND collection_method IN ('api', 'scraping')
  AND (
    next_collection_date IS NULL          -- Nunca coletado
    OR next_collection_date <= CURRENT_DATE  -- Vencido
  )
ORDER BY
  CASE
    WHEN next_collection_date IS NULL THEN 1
    WHEN next_collection_date < CURRENT_DATE THEN 2
    ELSE 3
  END;
```

#### 3. Workflows Especialistas

**Por Fonte de Dados**:
- `data-collection-ibge.json` → IBGE Sidra
- `data-collection-inep.json` → INEP (educação)
- `data-collection-mapbiomas.json` → MapBiomas (ambiental)
- `data-collection-siconfi.json` → SICONFI (finanças)

**Input**: Lista de indicadores a coletar (JSON)

**Output**:
- Dados inseridos em `indicator_values`
- Atualização de `last_ref_date` e `next_collection_date` no dictionary

### Fluxo de Execução

```
1. ORQUESTRADOR (3:00 AM, diário)
   ↓
2. Query: Quais indicadores precisam ser coletados?
   ↓
3. Resultado: {
     "IBGE Sidra": ["ECON_PIB_TOTAL", "SOCIAL_POPULACAO"],
     "MapBiomas": ["AMBIENT_COBERTURA_NATIVA"]
   }
   ↓
4. Dispara workflows:
   - data-collection-ibge (2 indicadores)
   - data-collection-mapbiomas (1 indicador)
   ↓
5. Cada workflow:
   a. Busca metadados do dictionary (api_endpoint, api_params)
   b. Para cada município:
      - Constrói URL da API
      - Faz requisição HTTP
      - Parseia resposta
      - Insere/atualiza indicator_values
   c. Atualiza dictionary (last_ref_date, next_collection_date)
   ↓
6. Log de execução e notificações (sucesso/erro)
```

---

## 🔧 Pré-requisitos

### Software

- ✅ **Supabase** configurado (projeto criado)
- ✅ **n8n** (Cloud ou Self-hosted)
- ✅ **PostgreSQL Client** (para executar migrations)

### Acesso

- ✅ Credenciais do Supabase (host, porta, senha)
- ✅ Acesso ao n8n com permissões de criação de workflows

### Dados Mínimos

- ✅ Tabela `municipalities` populada (139 municípios do TO)
- ✅ Tabela `indicator_definitions` com indicadores básicos

---

## 📦 Setup do Banco de Dados

### Passo 1: Executar Migration 008

1. Acesse o **Supabase Dashboard**
2. SQL Editor > New Query
3. Cole o conteúdo de: `supabase/migrations/008_create_indicator_dictionary.sql`
4. Execute (Run)

**Resultado esperado**:
```
✅ Migration 008 concluída com sucesso!

📊 Dicionário de Indicadores criado:
   Total de indicadores: 55
   • ECON (Econômico): 15
   • SOCIAL (Social): 17
   • TERRA (Territorial): 13
   • AMBIENT (Ambiental): 11

🔌 Métodos de coleta:
   • API automática: 21
   • Manual: 34
```

### Passo 2: Verificar Tabelas Criadas

```sql
-- Listar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'indicator%'
ORDER BY table_name;

-- Resultado esperado:
-- indicator_categories
-- indicator_definitions
-- indicator_dictionary  ← NOVA!
-- indicator_values
```

### Passo 3: Explorar o Dictionary

```sql
-- Ver resumo por dimensão
SELECT * FROM v_indicators_by_dimension;

-- Ver indicadores por fonte
SELECT * FROM v_indicators_by_source;

-- Ver indicadores pendentes de coleta
SELECT * FROM v_indicators_pending_collection LIMIT 10;
```

### Passo 4: Sincronizar indicator_definitions

O dictionary referencia códigos de indicadores. Certifique-se de que esses indicadores existem em `indicator_definitions`:

```sql
-- Verificar se há indicadores no dictionary sem definição
SELECT dict.code
FROM indicator_dictionary dict
LEFT JOIN indicator_definitions def ON dict.code = def.code
WHERE def.id IS NULL;
```

Se houver, execute o script: `n8n/workflows/setup-ibge-indicators.sql` (criado na sessão anterior)

---

## ⚙️ Configuração dos Workflows

### Workflow 1: Orquestrador

**Arquivo**: `n8n/workflows/data-collection-orchestrator.json`

#### Importação

1. n8n > Menu > Import from File
2. Selecione: `data-collection-orchestrator.json`
3. Save

#### Configuração

**Nó: Schedule Trigger**
- Frequência: Diário às 3:00 AM
- Timezone: America/Sao_Paulo

**Nó: Query Indicators**
- Credencial: Supabase PostgreSQL
- Query automática (já configurada)

**Nó: Group by Source**
- Agrupa indicadores por `source_name`

**Nó: Trigger Workflows**
- Dispara workflows especialistas via HTTP Webhook
- Mapeamento de fontes → workflows:
  ```json
  {
    "IBGE Sidra": "data-collection-ibge",
    "MapBiomas": "data-collection-mapbiomas",
    "INEP": "data-collection-inep"
  }
  ```

**Ativar**: Toggle ON

---

### Workflow 2: IBGE Sidra (Refatorado)

**Arquivo**: `n8n/workflows/data-collection-ibge-refactored.json`

#### Mudanças vs Versão Anterior

| Aspecto | Anterior | Refatorado |
|---------|----------|------------|
| Indicadores | Hardcoded (2) | Dinâmico (consulta dictionary) |
| API URLs | Hardcoded | Construído via template |
| Municípios | Busca todos | Recebe lista ou busca todos |
| Periodicidade | Mensal fixo | Baseada no dictionary |
| Atualização | Manual | Automática (next_collection_date) |

#### Configuração

**Nó: Webhook/Trigger**
- Recebe payload: `{"indicators": ["ECON_PIB_TOTAL", ...]}`
- Se vazio, busca todos ativos do IBGE Sidra

**Nó: Get Indicators Metadata**
```sql
SELECT id, code, name, api_endpoint, api_params
FROM indicator_dictionary
WHERE code = ANY($1::text[])
  AND is_active = true;
```

**Nó: Get Municipalities**
```sql
SELECT id, ibge_code, name FROM municipalities
WHERE state_id = 'TO'
ORDER BY name;
```

**Nó: Process in Batches**
- Batch size: 10 municípios

**Nó: Build API URLs (Code)**
```javascript
const indicator = $input.first().json;
const municipality = $('Get Municipalities').first().json;

// Substituir placeholders no endpoint
let url = indicator.api_endpoint;
url = url.replace('{ibge_code}', municipality.ibge_code);

// Adicionar parâmetros adicionais se necessário
const params = indicator.api_params;

return [{ url, indicator, municipality }];
```

**Nó: Call IBGE API**
- HTTP Request
- URL dinâmica
- Timeout: 30s

**Nó: Parse and Insert**
```javascript
// Parse resposta IBGE (formato Sidra)
const response = $('Call IBGE API').first().json;
const indicator = $input.first().json.indicator;
const municipality = $input.first().json.municipality;

// Extrair valor e ano
let value, year;
if (Array.isArray(response) && response.length > 1) {
  const data = response[1]; // Primeiro é header
  value = parseFloat(data.V.replace(',', '.'));
  year = parseInt(data.D3N);
}

// Retornar para inserção
return [{
  indicator_code: indicator.code,
  municipality_id: municipality.id,
  year: year,
  value: value
}];
```

**Nó: Upsert Indicator Values**
```sql
INSERT INTO indicator_values (
  indicator_id,
  municipality_id,
  year,
  value,
  data_quality,
  notes
)
SELECT
  id.id,
  $2::uuid,
  $3::integer,
  $4::decimal,
  'official',
  'Coletado automaticamente via API IBGE Sidra'
FROM indicator_definitions id
WHERE id.code = $1
ON CONFLICT (indicator_id, municipality_id, year, month)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
```

**Nó: Update Dictionary**
```sql
UPDATE indicator_dictionary
SET
  last_ref_date = $2::date,
  last_update_date = NOW()
WHERE code = $1;
```

**Ativar**: Toggle ON

---

## ▶️ Execução e Monitoramento

### Teste Manual

#### 1. Testar Workflow IBGE Isoladamente

1. Desative o orquestrador temporariamente
2. Abra `data-collection-ibge-refactored`
3. Clique em "Execute Workflow"
4. Payload de teste (opcional):
```json
{
  "indicators": ["ECON_PIB_TOTAL", "SOCIAL_POPULACAO"]
}
```
5. Aguarde execução (~5-10 min para 139 municípios)

#### 2. Verificar Resultados

```sql
-- Ver últimos dados coletados
SELECT
  id.code,
  id.name,
  m.name AS municipio,
  iv.year,
  iv.value,
  iv.created_at
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO')
ORDER BY iv.created_at DESC
LIMIT 20;
```

#### 3. Verificar Atualização do Dictionary

```sql
SELECT
  code,
  name,
  last_ref_date,
  last_update_date,
  next_collection_date
FROM indicator_dictionary
WHERE code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO');
```

### Teste do Orquestrador

1. Ative o orquestrador
2. Force execução manual (Execute Workflow)
3. Observe logs:
   - Indicadores identificados
   - Workflows disparados
   - Resultados de cada workflow

### Monitoramento em Produção

#### Queries Úteis

**Dashboard de Coleta**:
```sql
SELECT
  dimension,
  COUNT(*) as total_indicators,
  COUNT(*) FILTER (WHERE last_ref_date IS NOT NULL) as collected,
  COUNT(*) FILTER (WHERE next_collection_date < CURRENT_DATE) as overdue
FROM indicator_dictionary
WHERE is_active = true
  AND collection_method IN ('api', 'scraping')
GROUP BY dimension;
```

**Últimas Coletas**:
```sql
SELECT
  source_name,
  MAX(last_update_date) as last_collection,
  COUNT(*) as indicators_count
FROM indicator_dictionary
WHERE last_update_date IS NOT NULL
GROUP BY source_name
ORDER BY last_collection DESC;
```

**Cobertura por Município**:
```sql
SELECT
  m.name AS municipio,
  COUNT(DISTINCT iv.indicator_id) as indicators_collected,
  (SELECT COUNT(*) FROM indicator_dictionary WHERE is_active = true AND collection_method = 'api') as total_api_indicators
FROM municipalities m
LEFT JOIN indicator_values iv ON m.id = iv.municipality_id
GROUP BY m.id, m.name
ORDER BY indicators_collected DESC;
```

---

## 🐛 Troubleshooting

### Problema: Indicador não está sendo coletado

**Diagnóstico**:
```sql
SELECT
  code,
  is_active,
  collection_method,
  next_collection_date,
  last_update_date
FROM indicator_dictionary
WHERE code = 'ECON_PIB_TOTAL';
```

**Causas Possíveis**:
1. `is_active = false` → Ativar: `UPDATE indicator_dictionary SET is_active = true WHERE code = '...'`
2. `collection_method = 'manual'` → Orquestrador ignora, coleta deve ser manual
3. `next_collection_date` no futuro → Aguardar data ou ajustar manualmente

---

### Problema: API retorna erro 404

**Causa**: Endpoint no dictionary está incorreto ou município não tem dados

**Solução**:
1. Teste a API manualmente:
```bash
curl "https://apisidra.ibge.gov.br/values/t/5938/n6/1721000/v/allxp/p/last"
```

2. Se funcionar, verifique template no dictionary:
```sql
SELECT api_endpoint, api_params
FROM indicator_dictionary
WHERE code = 'ECON_PIB_TOTAL';
```

3. Corrija se necessário:
```sql
UPDATE indicator_dictionary
SET api_endpoint = 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last'
WHERE code = 'ECON_PIB_TOTAL';
```

---

### Problema: Orquestrador não dispara workflows

**Diagnóstico**: Ver logs de execução no n8n

**Causas Possíveis**:
1. **Nenhum indicador pendente**:
```sql
SELECT * FROM v_indicators_pending_collection;
```
Se vazio, forçar:
```sql
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code = 'ECON_PIB_TOTAL';
```

2. **Workflows especialistas não existem**: Importar arquivos JSON

3. **Webhooks desativados**: Verificar que workflows têm Webhook Trigger ativo

---

### Problema: Dados duplicados em indicator_values

**Causa**: Constraint UNIQUE não está funcionando

**Verificar**:
```sql
SELECT
  indicator_id,
  municipality_id,
  year,
  month,
  COUNT(*)
FROM indicator_values
GROUP BY indicator_id, municipality_id, year, month
HAVING COUNT(*) > 1;
```

**Solução**: Limpar duplicatas e recriar constraint
```sql
-- Deletar duplicatas (manter mais recente)
DELETE FROM indicator_values a
USING indicator_values b
WHERE a.id < b.id
  AND a.indicator_id = b.indicator_id
  AND a.municipality_id = b.municipality_id
  AND a.year = b.year
  AND COALESCE(a.month, 0) = COALESCE(b.month, 0);

-- Recriar constraint
ALTER TABLE indicator_values
ADD CONSTRAINT indicator_values_unique
UNIQUE (indicator_id, municipality_id, year, month);
```

---

## 📚 Próximos Passos

### Curto Prazo (1-2 semanas)

1. ✅ **Testar coleta IBGE** com ~5 indicadores
2. ✅ **Validar dados** coletados vs fonte original
3. ✅ **Criar workflow INEP** para indicadores educacionais
4. ✅ **Criar workflow MapBiomas** para indicadores ambientais

### Médio Prazo (1-2 meses)

1. **Adicionar mais indicadores** ao dictionary (expandir de 55 para 100+)
2. **Implementar coleta SICONFI** (finanças públicas)
3. **Criar scripts de importação manual** para dados sem API
4. **Dashboard de monitoramento** (Grafana ou Metabase)

### Longo Prazo (3-6 meses)

1. **Data quality checks** (validação automática de valores)
2. **Alertas** (email/Slack quando coleta falha)
3. **Histórico de coletas** (tabela `collection_history`)
4. **API própria** para consulta de indicadores

---

## 📖 Referências

### Documentação Técnica

- [indicator_dictionary Schema](../../supabase/migrations/008_create_indicator_dictionary.sql)
- [ADR 004 - Sistema Orientado a Metadados](../adr/004-sistema-coleta-orientado-metadados.md)

### Documentos de Referência por Dimensão

- [ECON - Dimensão Econômica](../references/ECON_reference.md)
- [SOCIAL - Dimensão Social](../references/SOCIAL_reference.md)
- [TERRA - Dimensão Territorial](../references/TERRA_reference.md)
- [AMBIENT - Dimensão Ambiental](../references/AMBIENT_reference.md)

### APIs Externas

- [IBGE Sidra API](https://apisidra.ibge.gov.br/)
- [SICONFI API](https://apidatalake.tesouro.gov.br/docs/siconfi)
- [MapBiomas API](https://mapbiomas.org/api)
- [INPE Queimadas API](https://queimadas.dgi.inpe.br/queimadas/sisam-api/)

---

**Última atualização**: Janeiro 2026
**Versão**: 2.0 (Sistema Orientado a Metadados)
**Autor**: CTO (Claude) + CEO (Henrique)
