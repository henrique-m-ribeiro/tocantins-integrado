# 🧪 Plano de Testes - Sistema de Coleta Multiagentes

> Guia completo para testar e validar os workflows de coleta de dados no n8n Cloud

**Sessão**: #19
**Data**: 2026-01-16
**Status**: Em Execução
**Objetivo**: Validar sistema metadata-driven implementado na Sessão #18

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Pré-requisitos](#pré-requisitos)
3. [Fase 1: Análise dos Workflows](#fase-1-análise-dos-workflows)
4. [Fase 2: Preparação do Ambiente](#fase-2-preparação-do-ambiente)
5. [Fase 3: Testes Unitários](#fase-3-testes-unitários)
6. [Fase 4: Testes de Integração](#fase-4-testes-de-integração)
7. [Fase 5: Validação End-to-End](#fase-5-validação-end-to-end)
8. [Critérios de Sucesso](#critérios-de-sucesso)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral do Sistema

### Arquitetura Multiagentes

```
┌─────────────────────────────────────────────────────────────┐
│                   ORQUESTRADOR DE COLETA                     │
│  • Executa diariamente às 3h AM                              │
│  • Consulta indicator_dictionary                             │
│  • Identifica indicadores pendentes                          │
│  • Agrupa por fonte de dados                                 │
│  • Dispara workflows especialistas via webhook               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────┬───────────────────┬──────────────────┐
    │             │                   │                  │
    ▼             ▼                   ▼                  ▼
┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌──────────────┐
│  IBGE   │  │  INEP   │  │  MapBiomas   │  │  SICONFI     │
│Specialist│  │Specialist│  │  Specialist  │  │  Specialist  │
│         │  │         │  │              │  │              │
│ ✅ OK   │  │⏳Placeholder│ │⏳Placeholder │  │ ⏳ Futuro   │
└─────────┘  └─────────┘  └──────────────┘  └──────────────┘
    │             │                   │                  │
    └─────────────┴───────────────────┴──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │    SUPABASE      │
                    │  • indicator_    │
                    │    dictionary    │
                    │  • indicator_    │
                    │    values        │
                    └──────────────────┘
```

### Workflows Implementados

| Workflow | Arquivo | Nós | Status | Função |
|----------|---------|-----|--------|--------|
| **Orquestrador** | `data-collection-orchestrator.json` | 13 | ✅ Completo | Coordena coleta, dispara especialistas |
| **IBGE Sidra** | `data-collection-ibge.json` | 14 | ✅ Completo | Coleta PIB, VA, População via API IBGE |
| **INEP** | `data-collection-inep.json` | 3 | ⏳ Placeholder | Retorna "not_implemented" |
| **MapBiomas** | `data-collection-mapbiomas.json` | 3 | ⏳ Placeholder | Retorna "not_implemented" |

---

## ✅ Pré-requisitos

### Infraestrutura

- [ ] **n8n Cloud** - Conta ativa e acessível
- [ ] **Supabase** - Database com Migration 008 executada
- [ ] **Indicadores Populados** - 55 indicadores no `indicator_dictionary`
- [ ] **Municípios** - 139 municípios do Tocantins em `municipalities`

### Credenciais Necessárias

- [ ] **Supabase PostgreSQL**
  - Host, Database, User, Password, Port (6543)
  - Permissões: SELECT, INSERT, UPDATE em `indicator_dictionary`, `indicator_values`, `municipalities`

- [ ] **n8n Webhook Auth** (Opcional - Produção)
  - Token para autenticação entre workflows

### Conhecimento Técnico

- [ ] Familiaridade com n8n (importar workflows, executar manualmente)
- [ ] SQL básico (queries de validação)
- [ ] JSON (interpretar payloads e respostas)

---

## 🔍 Fase 1: Análise dos Workflows

### Objetivo
Revisar estrutura dos workflows e identificar possíveis problemas antes da importação.

### 1.1 Análise do Orquestrador

**Arquivo**: `n8n/workflows/data-collection-orchestrator.json`

#### Nós Críticos

1. **Schedule Trigger - Daily 3AM**
   - ⚠️ **Validar**: Timezone do servidor n8n
   - 🔧 **Ajuste**: Pode ser alterado para testes

2. **Query Pending Indicators**
   - ✅ **Query SQL**: Valida (usa view `v_indicators_pending_collection`)
   - 🔧 **Credencial**: Requer `Supabase PostgreSQL`

3. **Map Source to Workflow**
   - ✅ **Mapeamento**:
     ```javascript
     'IBGE Sidra': 'data-collection-ibge',
     'IBGE': 'data-collection-ibge',
     'INEP': 'data-collection-inep',
     'MapBiomas': 'data-collection-mapbiomas',
     'SICONFI': 'data-collection-siconfi',
     ...
     ```
   - ⚠️ **Atenção**: SICONFI não tem workflow ainda (retornará erro ou skip)

4. **Call Specialist Workflow**
   - ⚠️ **URL Base**: Usa `$env.N8N_WEBHOOK_BASE_URL`
   - 🔧 **Ajuste**: Pode precisar hardcode da URL no n8n Cloud
   - ⚠️ **Timeout**: 300s (5 minutos) - adequado para IBGE

#### Problemas Identificados

| # | Problema | Severidade | Solução |
|---|----------|------------|---------|
| 1 | `N8N_WEBHOOK_BASE_URL` pode não estar definido no n8n Cloud | 🔴 Alta | Hardcode URL base ou configurar env var |
| 2 | SICONFI mapeado mas workflow não existe | 🟡 Média | Remover do mapeamento ou criar placeholder |
| 3 | JavaScript tem espaços extras em linha 85 (`groupedBySo urce`) | 🟢 Baixa | Corrigir typo |

### 1.2 Análise do Workflow IBGE

**Arquivo**: `n8n/workflows/data-collection-ibge.json`

#### Nós Críticos

1. **Webhook Trigger**
   - ✅ **Path**: `/webhook/data-collection-ibge`
   - ⚠️ **Autenticação**: Nenhuma (development mode)

2. **Get Municipalities**
   - ✅ **Query**: `SELECT id, ibge_code, name FROM municipalities WHERE state_id = 'TO'`
   - 🔧 **Credencial**: Requer `Supabase PostgreSQL`

3. **Build API URLs**
   - ✅ **Lógica**: Substitui `{ibge_code}` com código do município
   - ✅ **Exemplo**: `https://apisidra.ibge.gov.br/values/t/6579/n6/1721000/v/allxp/p/last`

4. **Parse Response**
   - ⚠️ **Parsing**: Depende de estrutura específica da API IBGE
   - 🧪 **Testar**: Com múltiplos indicadores (PIB, População, VA)

5. **Upsert Indicator Value**
   - ✅ **Query**: Usa `ON CONFLICT` para evitar duplicatas
   - ⚠️ **Parâmetros**: Usa `$1, $2, $3...` (necessário mapear corretamente)

#### Problemas Potenciais

| # | Problema | Severidade | Solução |
|---|----------|------------|---------|
| 1 | Parsing JSON da API IBGE pode falhar com formatos variados | 🟡 Média | Testar com múltiplos endpoints |
| 2 | Timeout de 30s pode ser insuficiente para municípios específicos | 🟢 Baixa | Aumentar para 60s se necessário |
| 3 | Batch de 10 municípios pode sobrecarregar API IBGE | 🟡 Média | Ajustar para 5 ou adicionar delay |

### 1.3 Análise dos Placeholders

**Arquivos**: `data-collection-inep.json`, `data-collection-mapbiomas.json`

#### Estrutura

✅ **Correto**: Retornam `status: "not_implemented"` sem causar erro
✅ **Correto**: Respondem ao webhook com JSON válido
✅ **Correto**: Logam indicadores recebidos

Não há problemas identificados nos placeholders.

---

## 🛠️ Fase 2: Preparação do Ambiente

### 2.1 Importação dos Workflows

#### Passo a Passo

1. **Acessar n8n Cloud**
   ```
   https://app.n8n.cloud/
   ```

2. **Importar Orquestrador**
   - Menu ☰ > **Import from File**
   - Selecionar: `n8n/workflows/data-collection-orchestrator.json`
   - **Import** > **Save**

3. **Importar IBGE Specialist**
   - Menu ☰ > **Import from File**
   - Selecionar: `n8n/workflows/data-collection-ibge.json`
   - **Import** > **Save**

4. **Importar Placeholders** (Opcional)
   - `data-collection-inep.json`
   - `data-collection-mapbiomas.json`

#### Checklist de Importação

- [ ] Orquestrador importado e salvo
- [ ] IBGE importado e salvo
- [ ] INEP importado (opcional)
- [ ] MapBiomas importado (opcional)
- [ ] Sem erros de validação JSON

### 2.2 Configuração de Credenciais

#### Credencial: Supabase PostgreSQL

1. **Criar Credencial**
   - n8n > **Credentials** (menu lateral)
   - **Add Credential** > **Postgres**
   - Nome: `Supabase PostgreSQL`

2. **Preencher Dados**
   ```
   Host:     <SEU_HOST>.pooler.supabase.com
   Database: postgres
   User:     postgres.<SEU_PROJETO>
   Password: <SUA_SENHA>
   Port:     6543
   SSL:      Require
   ```

3. **Testar Conexão**
   - **Test Connection**
   - ✅ Deve retornar sucesso

4. **Salvar**
   - **Save**

#### Aplicar Credencial aos Workflows

**Orquestrador** (1 nó):
- [ ] `Query Pending Indicators` → `Supabase PostgreSQL`

**IBGE** (3 nós):
- [ ] `Get Municipalities` → `Supabase PostgreSQL`
- [ ] `Upsert Indicator Value` → `Supabase PostgreSQL`
- [ ] `Update Dictionary` → `Supabase PostgreSQL`

#### Configuração de Webhook Base URL

**Problema**: `$env.N8N_WEBHOOK_BASE_URL` pode não estar definido.

**Solução 1 - Hardcode (Recomendado para testes)**:

No Orquestrador, nó `Call Specialist Workflow`:
```
URL antiga:
{{ $env.N8N_WEBHOOK_BASE_URL }}/webhook/{{ $json.workflow_name }}

URL nova:
https://SEU_WORKSPACE.app.n8n.cloud/webhook/{{ $json.workflow_name }}
```

**Solução 2 - Verificar Environment Variable**:
- n8n Cloud > Settings > Environment Variables
- Adicionar: `N8N_WEBHOOK_BASE_URL=https://SEU_WORKSPACE.app.n8n.cloud`

### 2.3 Preparação do Database

#### Verificar Indicadores Ativos com API

```sql
SELECT
  code,
  name,
  dimension,
  source_name,
  api_endpoint,
  periodicity,
  collection_method,
  is_active
FROM indicator_dictionary
WHERE collection_method = 'api'
  AND is_active = true
  AND api_endpoint IS NOT NULL
ORDER BY dimension, code;
```

**Resultado Esperado**: ~15-20 indicadores com API configurada

#### Verificar Municípios

```sql
SELECT COUNT(*) as total_municipios
FROM municipalities
WHERE state_id = 'TO';
```

**Resultado Esperado**: 139 municípios

#### Forçar Indicadores como Pendentes (Para Testes)

```sql
-- Forçar 3 indicadores IBGE como vencidos para teste
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code IN (
  'SOCIAL_POPULACAO',
  'ECON_PIB_TOTAL',
  'ECON_VA_AGRO'
)
  AND source_name = 'IBGE Sidra';

-- Verificar
SELECT code, name, source_name, next_collection_date
FROM indicator_dictionary
WHERE code IN ('SOCIAL_POPULACAO', 'ECON_PIB_TOTAL', 'ECON_VA_AGRO');
```

**Resultado Esperado**: `next_collection_date` = ontem (CURRENT_DATE - 1)

---

## 🧪 Fase 3: Testes Unitários

### 3.1 Teste do Workflow IBGE (Isolado)

#### Objetivo
Validar que o workflow IBGE consegue:
1. Receber payload via webhook
2. Buscar municípios do Tocantins
3. Construir URLs da API IBGE
4. Coletar dados da API
5. Fazer upsert em `indicator_values`
6. Atualizar `indicator_dictionary`

#### Payload de Teste

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-001",
  "indicators": [
    {
      "id": "uuid-placeholder",
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

#### Execução

1. Abrir workflow `Data Collection - IBGE Sidra`
2. Clicar em **Execute Workflow**
3. No nó `Webhook Trigger`, aba **Test**
4. Colar payload JSON
5. **Execute Workflow**
6. Aguardar conclusão (~5-10 min para 139 municípios)

#### Validação

**Durante a Execução**:
- [ ] Nó `Get Municipalities` retorna 139 itens
- [ ] Nó `Build API URLs` cria 139 URLs (1 por município)
- [ ] Nó `Call IBGE API` retorna dados (verificar alguns)
- [ ] Nó `Parse Response` extrai `value` e `year`
- [ ] Nó `Upsert Indicator Value` insere ~139 registros

**Após a Execução**:

```sql
-- Verificar dados coletados
SELECT
  m.name AS municipio,
  iv.year,
  iv.value,
  iv.created_at
FROM indicator_values iv
JOIN municipalities m ON iv.municipality_id = m.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code = 'SOCIAL_POPULACAO'
ORDER BY iv.created_at DESC
LIMIT 20;
```

**Resultado Esperado**:
- ~139 registros novos
- `year` = 2023 ou 2024 (último disponível)
- `value` > 0 (população)
- `created_at` = agora

**Verificar Dictionary Atualizado**:

```sql
SELECT
  code,
  last_ref_date,
  last_update_date,
  next_collection_date
FROM indicator_dictionary
WHERE code = 'SOCIAL_POPULACAO';
```

**Resultado Esperado**:
- `last_ref_date` = 2023-12-31 ou 2024-12-31
- `last_update_date` = agora
- `next_collection_date` = ~1 ano no futuro

#### Critérios de Sucesso

- [ ] Execução completa sem erros
- [ ] 139 registros inseridos em `indicator_values`
- [ ] `indicator_dictionary` atualizado com datas corretas
- [ ] Valores coletados fazem sentido (população > 1000)
- [ ] Tempo de execução < 15 minutos

### 3.2 Teste do Orquestrador (Sem Execução de Especialistas)

#### Objetivo
Validar que o orquestrador consegue:
1. Consultar `indicator_dictionary`
2. Identificar indicadores pendentes
3. Agrupar por fonte
4. Mapear fonte → workflow

#### Execução Manual (Sem Chamar Especialistas)

1. Abrir workflow `Data Collection Orchestrator`
2. **NÃO ATIVAR** (para evitar chamada real aos especialistas)
3. Executar manualmente via **Execute Workflow**
4. Observar até nó `Map Source to Workflow`

#### Validação

**Nó `Query Pending Indicators`**:
- [ ] Retorna 3 indicadores (SOCIAL_POPULACAO, ECON_PIB_TOTAL, ECON_VA_AGRO)
- [ ] Campo `collection_status` = 'overdue'

**Nó `Group by Source`**:
- [ ] Agrupa em 1 grupo: `IBGE Sidra`
- [ ] `count` = 3

**Nó `Map Source to Workflow`**:
- [ ] `workflow_name` = 'data-collection-ibge'
- [ ] `should_skip` = false

#### Critérios de Sucesso

- [ ] Indicadores pendentes identificados corretamente
- [ ] Agrupamento por fonte correto
- [ ] Mapeamento para workflow IBGE correto

---

## 🔗 Fase 4: Testes de Integração

### 4.1 Teste Orquestrador → IBGE (End-to-End Parcial)

#### Objetivo
Validar fluxo completo: Orquestrador chama IBGE via webhook e recebe resposta.

#### Preparação

1. **Ativar Workflow IBGE**
   - Workflow `Data Collection - IBGE Sidra`
   - Toggle **Active** (verde)
   - Copiar URL do webhook: `https://SEU_WORKSPACE.app.n8n.cloud/webhook/data-collection-ibge`

2. **Configurar Orquestrador**
   - Verificar nó `Call Specialist Workflow`
   - URL deve formar: `https://SEU_WORKSPACE.app.n8n.cloud/webhook/data-collection-ibge`

3. **Preparar Database**
   ```sql
   -- Forçar apenas 1 indicador como pendente (teste rápido)
   UPDATE indicator_dictionary
   SET next_collection_date = CURRENT_DATE - 1
   WHERE code = 'SOCIAL_POPULACAO';

   -- Resetar outros
   UPDATE indicator_dictionary
   SET next_collection_date = CURRENT_DATE + 30
   WHERE code IN ('ECON_PIB_TOTAL', 'ECON_VA_AGRO');
   ```

#### Execução

1. Workflow `Data Collection Orchestrator`
2. **Execute Workflow** (manual)
3. Observar logs:
   ```
   [ORCHESTRATOR] Iniciando coleta de dados...
   [ORCHESTRATOR] Indicadores agrupados por fonte:
     • IBGE Sidra: 1 indicadores
   [ORCHESTRATOR] 📋 Preparando chamada: data-collection-ibge
   [ORCHESTRATOR] 🚀 Disparando: data-collection-ibge
   ```
4. Aguardar ~5-10 min
5. Verificar logs finais:
   ```
   [ORCHESTRATOR] ✅ data-collection-ibge completado com sucesso
   [ORCHESTRATOR] 📊 Resumo da Execução:
     Workflows chamados: 1
     Sucessos: 1
     Falhas: 0
   ```

#### Validação

**No Orquestrador**:
- [ ] Nó `Call Specialist Workflow` retorna status 200
- [ ] Response body contém `status: "completed"`
- [ ] `records_inserted` = 139

**No Workflow IBGE**:
- [ ] Execution aparece em **Executions** do workflow IBGE
- [ ] Status = Success
- [ ] Logs mostram coleta de 139 municípios

**No Database**:

```sql
-- Verificar dados coletados
SELECT COUNT(*) as total_registros
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code = 'SOCIAL_POPULACAO'
  AND iv.created_at > NOW() - INTERVAL '1 hour';
```

**Resultado Esperado**: 139 registros

#### Critérios de Sucesso

- [ ] Orquestrador chama IBGE via webhook com sucesso
- [ ] IBGE executa e retorna resumo ao orquestrador
- [ ] 139 registros inseridos em `indicator_values`
- [ ] `indicator_dictionary` atualizado
- [ ] Tempo total < 20 minutos

### 4.2 Teste com Múltiplos Indicadores

#### Objetivo
Validar coleta de 3 indicadores diferentes em uma única execução.

#### Preparação

```sql
-- Forçar 3 indicadores IBGE como pendentes
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code IN (
  'SOCIAL_POPULACAO',
  'ECON_PIB_TOTAL',
  'ECON_VA_AGRO'
)
  AND source_name = 'IBGE Sidra';
```

#### Execução

Mesmo procedimento do teste 4.1, mas com 3 indicadores.

#### Validação

```sql
-- Verificar dados dos 3 indicadores
SELECT
  id.code,
  id.name,
  COUNT(DISTINCT m.id) as total_municipios_coletados,
  MIN(iv.value) as min_value,
  MAX(iv.value) as max_value,
  AVG(iv.value) as avg_value
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('SOCIAL_POPULACAO', 'ECON_PIB_TOTAL', 'ECON_VA_AGRO')
  AND iv.created_at > NOW() - INTERVAL '1 hour'
GROUP BY id.code, id.name;
```

**Resultado Esperado**:
- Cada indicador: ~139 municípios coletados
- Total: ~417 registros (3 × 139)

#### Critérios de Sucesso

- [ ] 3 indicadores coletados com sucesso
- [ ] ~417 registros inseridos (3 × 139)
- [ ] Valores fazem sentido (PIB > 0, População > 0, VA > 0)
- [ ] Tempo de execução < 30 minutos

---

## ✅ Fase 5: Validação End-to-End

### 5.1 Ativação do Schedule (Produção)

#### Objetivo
Ativar coleta automática diária e validar primeira execução.

#### Preparação

1. **Revisar Schedule**
   - Orquestrador > Nó `Schedule Trigger - Daily 3AM`
   - Verificar horário (3h AM - timezone do servidor)
   - Ajustar se necessário

2. **Preparar Indicadores**
   ```sql
   -- Forçar alguns indicadores como vencidos para primeira execução
   UPDATE indicator_dictionary
   SET next_collection_date = CURRENT_DATE - 1
   WHERE source_name = 'IBGE Sidra'
     AND collection_method = 'api'
     AND is_active = true
   LIMIT 5;
   ```

#### Ativação

1. Workflow `Data Collection Orchestrator`
2. Toggle **Active** (verde)
3. Aguardar próxima execução (3h AM ou horário configurado)

#### Monitoramento

**No dia seguinte** (após execução):

1. **n8n Executions**
   - Menu **Executions**
   - Filtrar: `Data Collection Orchestrator`
   - Verificar execução mais recente
   - Status: ✅ Success

2. **Logs do Orquestrador**
   - Abrir execução
   - Verificar logs de cada nó
   - Confirmar chamada aos especialistas

3. **Database**
   ```sql
   -- Verificar coletas das últimas 24h
   SELECT
     dimension,
     COUNT(DISTINCT indicator_id) as indicadores_coletados,
     COUNT(*) as total_registros
   FROM indicator_values
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY dimension;
   ```

#### Critérios de Sucesso

- [ ] Schedule disparou na hora correta
- [ ] Orquestrador executou com sucesso
- [ ] Workflows especialistas foram chamados
- [ ] Dados foram coletados e armazenados
- [ ] `indicator_dictionary` atualizado com próximas datas

### 5.2 Teste com Placeholders (INEP e MapBiomas)

#### Objetivo
Validar que placeholders não quebram o fluxo.

#### Preparação

```sql
-- Forçar 1 indicador INEP como pendente
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code = 'SOCIAL_IDEB_AI'
  AND source_name = 'INEP';
```

#### Execução

1. Executar Orquestrador manualmente
2. Observar logs

#### Validação Esperada

```
[ORCHESTRATOR] Indicadores agrupados por fonte:
  • INEP: 1 indicadores
[ORCHESTRATOR] 📋 Preparando chamada: data-collection-inep
[ORCHESTRATOR] 🚀 Disparando: data-collection-inep
[INEP] ⚠️  Coleta INEP requer implementação de scraping ou dados abertos
[ORCHESTRATOR] ✅ data-collection-inep completado com sucesso
[ORCHESTRATOR] 📊 Resumo da Execução:
  Workflows chamados: 1
  Sucessos: 1
  Falhas: 0
```

#### Critérios de Sucesso

- [ ] Placeholder retorna `status: "not_implemented"`
- [ ] Orquestrador não falha
- [ ] Fluxo continua normalmente

---

## 🎯 Critérios de Sucesso Geral

### Sistema Funcionando 100%

- [ ] **Orquestrador** executa diariamente sem erros
- [ ] **IBGE Specialist** coleta todos os indicadores IBGE configurados
- [ ] **Placeholders** respondem corretamente sem quebrar fluxo
- [ ] **Database** é atualizado com dados e metadados corretos
- [ ] **Performance** aceitável (< 30 min para ~10 indicadores IBGE)

### Métricas de Validação

| Métrica | Esperado | Como Validar |
|---------|----------|--------------|
| **Taxa de Sucesso** | > 95% | Executions do orquestrador |
| **Tempo de Coleta** | < 30 min | Duration das execuções |
| **Registros por Execução** | ~1.390 (10 indicadores × 139 municípios) | `SELECT COUNT(*) FROM indicator_values WHERE created_at > ...` |
| **Indicadores Atualizados** | Todos com `next_collection_date` futuro | `SELECT * FROM v_indicators_pending_collection` |
| **Erros de API** | < 5% | Logs do workflow IBGE |

---

## 🐛 Troubleshooting

### Problema 1: "Credential not found"

**Sintoma**: Workflow falha com erro de credencial PostgreSQL.

**Causa**: Credencial não aplicada em todos os nós.

**Solução**:
1. Abrir workflow
2. Clicar em CADA nó PostgreSQL
3. Dropdown **Credential for PostgreSQL**
4. Selecionar `Supabase PostgreSQL`
5. **Save** workflow

---

### Problema 2: "Workflow not found" no Orquestrador

**Sintoma**: Orquestrador falha ao chamar especialista.

**Causa**: Workflow especialista não existe ou não está ativo.

**Solução**:
1. Verificar que workflow IBGE está importado
2. Verificar que está **Active** (toggle verde)
3. Copiar URL do webhook e confirmar que está acessível

---

### Problema 3: Timeout na API IBGE

**Sintoma**: Nó `Call IBGE API` falha com timeout.

**Solução**:
1. Aumentar timeout:
   - Nó `Call IBGE API`
   - Options > **Timeout**: 60000 (60s)
2. Reduzir batch size:
   - Nó `Batch Municipalities`
   - **Batch Size**: 5 (ao invés de 10)

---

### Problema 4: Parsing JSON da API IBGE Falha

**Sintoma**: Nó `Parse Response` retorna array vazio.

**Causa**: Estrutura JSON diferente do esperado.

**Solução**:
1. Inspecionar resposta real da API:
   - Nó `Call IBGE API` > Output > Ver JSON
2. Ajustar lógica de parsing no nó `Parse Response`
3. Testar com endpoint específico

---

### Problema 5: Dictionary Não Atualiza

**Sintoma**: `last_ref_date` e `next_collection_date` não mudam.

**Causa**: Nó `Update Dictionary` não recebe dados ou query falha.

**Diagnóstico**:
1. Verificar output de `Prepare Dictionary Update`
2. Se vazio, problema está em `Upsert Indicator Value`
3. Se preenchido, verificar query SQL em `Update Dictionary`

**Solução**:
- Verificar parâmetros da query (devem estar mapeados corretamente)
- Testar query manualmente no Supabase

---

### Problema 6: `N8N_WEBHOOK_BASE_URL` Não Definido

**Sintoma**: Orquestrador falha ao construir URL de webhook.

**Solução 1 - Hardcode**:
```javascript
// Nó: Call Specialist Workflow
// URL antiga:
{{ $env.N8N_WEBHOOK_BASE_URL }}/webhook/{{ $json.workflow_name }}

// URL nova:
https://SEU_WORKSPACE.app.n8n.cloud/webhook/{{ $json.workflow_name }}
```

**Solução 2 - Environment Variable** (n8n Cloud):
- Settings > Environment Variables
- Add: `N8N_WEBHOOK_BASE_URL=https://SEU_WORKSPACE.app.n8n.cloud`

---

## 📝 Checklist Final de Validação

### Pré-Produção

- [ ] Todos os workflows importados
- [ ] Credenciais configuradas e testadas
- [ ] Teste unitário IBGE passou
- [ ] Teste de integração Orquestrador → IBGE passou
- [ ] Teste com múltiplos indicadores passou
- [ ] Placeholders testados e funcionando
- [ ] Database validado (registros corretos)

### Produção

- [ ] Schedule ativado
- [ ] Primeira execução automática bem-sucedida
- [ ] Monitoramento configurado
- [ ] Alertas configurados (se aplicável)
- [ ] Documentação atualizada

---

## 🚀 Próximos Passos

Após validação bem-sucedida:

1. **Expandir Indicadores IBGE**
   - Adicionar VA setoriais
   - Adicionar mais indicadores econômicos

2. **Implementar INEP**
   - Download de microdados
   - Script de processamento
   - Importação para database

3. **Implementar MapBiomas**
   - Registrar e obter API token
   - Implementar workflow com autenticação

4. **Monitoramento Avançado**
   - Dashboard Grafana
   - Alertas via email/Slack
   - Métricas de performance

5. **Data Quality**
   - Validação automática de valores
   - Detecção de anomalias
   - Histórico de mudanças

---

**Última Atualização**: 2026-01-16
**Autor**: Claude Code (Sonnet 4.5)
**Sessão**: #19
