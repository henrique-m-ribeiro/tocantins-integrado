# ✅ Checklist de Setup - n8n Cloud

> Guia passo a passo para importar e configurar os workflows de coleta no n8n Cloud

**Sessão**: #19
**Data**: 2026-01-16
**Tempo Estimado**: 45-60 minutos

---

## 📋 Pré-requisitos

Antes de começar, tenha em mãos:

- [ ] **URL do n8n Cloud**: `https://SEU_WORKSPACE.app.n8n.cloud`
- [ ] **Credenciais Supabase**:
  - Host: `xxxxx.pooler.supabase.com`
  - Database: `postgres`
  - User: `postgres.xxxxx`
  - Password: `***`
  - Port: `6543`
- [ ] **Arquivos dos Workflows**:
  - `n8n/workflows/data-collection-orchestrator.json`
  - `n8n/workflows/data-collection-ibge.json`
  - `n8n/workflows/data-collection-inep.json` (opcional)
  - `n8n/workflows/data-collection-mapbiomas.json` (opcional)

---

## 🚀 Fase 1: Acesso e Preparação (5 min)

### 1.1 Login no n8n Cloud

- [ ] Acessar: https://app.n8n.cloud/
- [ ] Fazer login com suas credenciais
- [ ] Verificar que está no workspace correto (canto superior esquerdo)

### 1.2 Verificar Versão do n8n

- [ ] Menu ☰ (canto superior esquerdo) > **About**
- [ ] Verificar versão: `n8n v1.x.x` (deve ser >= 1.0)
- [ ] Fechar modal

### 1.3 Limpar Workflows Antigos (Se Necessário)

- [ ] Menu **Workflows**
- [ ] Se existirem workflows com nomes duplicados, arquivar:
  - `Data Collection Orchestrator` (antigo)
  - `Data Collection - IBGE Sidra` (antigo)
- [ ] **Actions** (...) > **Archive**

---

## 📥 Fase 2: Importação dos Workflows (10 min)

### 2.1 Importar Orquestrador

- [ ] Menu ☰ > **Import from File**
- [ ] **Choose File** > Selecionar `data-collection-orchestrator.json`
- [ ] **Import**
- [ ] Aguardar carregamento do workflow (13 nós)
- [ ] **Save** (ícone de disquete no canto superior direito)
- [ ] Verificar mensagem: "Workflow saved"

**✅ Checkpoint**: Workflow aparece na lista de workflows como "Data Collection Orchestrator"

### 2.2 Importar Workflow IBGE

- [ ] Menu ☰ > **Import from File**
- [ ] **Choose File** > Selecionar `data-collection-ibge.json`
- [ ] **Import**
- [ ] Aguardar carregamento (14 nós)
- [ ] **Save**
- [ ] Verificar mensagem: "Workflow saved"

**✅ Checkpoint**: Workflow aparece como "Data Collection - IBGE Sidra"

### 2.3 Importar Placeholders (Opcional)

#### INEP
- [ ] Menu ☰ > **Import from File**
- [ ] Selecionar `data-collection-inep.json`
- [ ] **Import** > **Save**

#### MapBiomas
- [ ] Menu ☰ > **Import from File**
- [ ] Selecionar `data-collection-mapbiomas.json`
- [ ] **Import** > **Save**

**✅ Checkpoint**: Total de 4 workflows importados

---

## 🔐 Fase 3: Configuração de Credenciais (15 min)

### 3.1 Criar Credencial Supabase PostgreSQL

- [ ] Menu lateral esquerdo > **Credentials**
- [ ] **Add Credential**
- [ ] Buscar: "Postgres"
- [ ] Selecionar: **Postgres**
- [ ] Preencher formulário:

| Campo | Valor |
|-------|-------|
| **Name** | `Supabase PostgreSQL` |
| **Host** | `<SEU_HOST>.pooler.supabase.com` |
| **Database** | `postgres` |
| **User** | `postgres.<SEU_PROJETO>` |
| **Password** | `<SUA_SENHA>` |
| **Port** | `6543` |
| **SSL** | `require` (ou `allow`) |

- [ ] **Test Connection**
- [ ] Verificar: ✅ "Connection successful"
- [ ] **Save**

**✅ Checkpoint**: Credencial aparece na lista como "Supabase PostgreSQL"

### 3.2 Aplicar Credencial ao Orquestrador

- [ ] **Workflows** > Abrir `Data Collection Orchestrator`
- [ ] Clicar no nó: **Query Pending Indicators**
- [ ] Seção **Parameters**:
  - **Credential for PostgreSQL**: Selecionar `Supabase PostgreSQL`
- [ ] **Save** (disquete)

**✅ Checkpoint**: Nó não mostra mais ícone de erro de credencial

### 3.3 Aplicar Credencial ao Workflow IBGE (3 nós)

- [ ] **Workflows** > Abrir `Data Collection - IBGE Sidra`

#### Nó 1: Get Municipalities
- [ ] Clicar no nó **Get Municipalities**
- [ ] **Credential for PostgreSQL**: Selecionar `Supabase PostgreSQL`

#### Nó 2: Upsert Indicator Value
- [ ] Clicar no nó **Upsert Indicator Value**
- [ ] **Credential for PostgreSQL**: Selecionar `Supabase PostgreSQL`

#### Nó 3: Update Dictionary
- [ ] Clicar no nó **Update Dictionary**
- [ ] **Credential for PostgreSQL**: Selecionar `Supabase PostgreSQL`

- [ ] **Save** (disquete)

**✅ Checkpoint**: Todos os nós PostgreSQL sem ícone de erro

---

## 🔧 Fase 4: Configuração de Webhooks (10 min)

### 4.1 Obter URL Base do n8n Cloud

- [ ] Copiar URL do seu workspace: `https://SEU_WORKSPACE.app.n8n.cloud`
- [ ] Salvar em um bloco de notas temporário

### 4.2 Configurar URL de Webhook no Orquestrador

- [ ] **Workflows** > Abrir `Data Collection Orchestrator`
- [ ] Clicar no nó: **Call Specialist Workflow**
- [ ] Seção **Parameters**:
  - Encontrar campo **URL**
  - Valor atual: `={{ $env.N8N_WEBHOOK_BASE_URL }}/webhook/{{ $json.workflow_name }}`

#### Opção A: Usar Environment Variable (Recomendado)

- [ ] Menu ☰ > **Settings** > **Environment Variables**
- [ ] **Add Variable**:
  - **Name**: `N8N_WEBHOOK_BASE_URL`
  - **Value**: `https://SEU_WORKSPACE.app.n8n.cloud`
- [ ] **Save**
- [ ] Manter URL do nó como está

#### Opção B: Hardcode (Mais Simples)

- [ ] No campo **URL**, substituir por:
  ```
  https://SEU_WORKSPACE.app.n8n.cloud/webhook/{{ $json.workflow_name }}
  ```
  (Substitua `SEU_WORKSPACE` pelo seu workspace real)

- [ ] **Save** (disquete)

**✅ Checkpoint**: URL configurada (com env var ou hardcoded)

### 4.3 Obter URLs dos Webhooks Especialistas

#### IBGE Webhook
- [ ] **Workflows** > Abrir `Data Collection - IBGE Sidra`
- [ ] Clicar no nó **Webhook Trigger**
- [ ] Copiar **Production URL**: `https://SEU_WORKSPACE.app.n8n.cloud/webhook/data-collection-ibge`
- [ ] Salvar em bloco de notas

#### INEP Webhook (Se importado)
- [ ] Workflow `Data Collection - INEP`
- [ ] Copiar Production URL: `.../webhook/data-collection-inep`

#### MapBiomas Webhook (Se importado)
- [ ] Workflow `Data Collection - MapBiomas`
- [ ] Copiar Production URL: `.../webhook/data-collection-mapbiomas`

**✅ Checkpoint**: URLs dos webhooks copiadas e salvas

---

## 🧪 Fase 5: Testes Básicos (15 min)

### 5.1 Teste do Workflow IBGE (Isolado)

#### Preparar Database
```sql
-- Executar no Supabase SQL Editor
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code = 'SOCIAL_POPULACAO'
  AND source_name = 'IBGE Sidra';
```

#### Executar Teste Manual

- [ ] n8n > Workflow `Data Collection - IBGE Sidra`
- [ ] **Execute Workflow** (botão no canto superior direito)
- [ ] Aba **Test** do nó `Webhook Trigger`
- [ ] Colar payload:

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-001",
  "indicators": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
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

- [ ] **Execute Workflow**
- [ ] Aguardar ~5-10 minutos (coleta de 139 municípios)
- [ ] Verificar execução completa: ✅ Success

#### Validar Dados Coletados

```sql
-- Executar no Supabase SQL Editor
SELECT COUNT(*) as total_registros
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code = 'SOCIAL_POPULACAO'
  AND iv.created_at > NOW() - INTERVAL '1 hour';
-- Esperado: ~139
```

- [ ] Query retorna ~139 registros
- [ ] Valores fazem sentido (população > 1000)

**✅ Checkpoint**: Workflow IBGE funciona corretamente em modo manual

### 5.2 Teste do Orquestrador (Sem Schedule)

#### Preparar Database
```sql
-- Forçar 1 indicador como pendente
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code = 'SOCIAL_POPULACAO';
```

#### Ativar Workflow IBGE

- [ ] Workflow `Data Collection - IBGE Sidra`
- [ ] Toggle **Active** no canto superior direito (deve ficar verde)
- [ ] Verificar mensagem: "Workflow activated"

#### Executar Orquestrador Manualmente

- [ ] Workflow `Data Collection Orchestrator`
- [ ] **NÃO ATIVAR** ainda (manter inactive)
- [ ] **Execute Workflow** (manual)
- [ ] Aguardar ~5-10 minutos
- [ ] Verificar execução completa: ✅ Success

#### Verificar Logs

- [ ] Abrir execução (clique na linha da execução)
- [ ] Verificar nó `Log Start`: timestamp correto
- [ ] Verificar nó `Query Pending Indicators`: 1 indicador retornado
- [ ] Verificar nó `Call Specialist Workflow`: Status 200
- [ ] Verificar nó `Consolidate Results`:
  ```json
  {
    "total_workflows_called": 1,
    "successful_workflows": 1,
    "failed_workflows": 0
  }
  ```

**✅ Checkpoint**: Orquestrador chama IBGE com sucesso via webhook

---

## ⚙️ Fase 6: Configuração de Produção (5 min)

### 6.1 Ajustar Schedule do Orquestrador

- [ ] Workflow `Data Collection Orchestrator`
- [ ] Clicar no nó **Schedule Trigger - Daily 3AM**
- [ ] Verificar configuração:
  - **Trigger Interval**: Daily
  - **Trigger at Hour**: 3 (3:00 AM)
  - **Timezone**: Verificar timezone do servidor
- [ ] Se necessário, ajustar horário para sua preferência

### 6.2 Ativar Workflows para Produção

#### IBGE (Se ainda não ativado)
- [ ] Workflow `Data Collection - IBGE Sidra`
- [ ] Toggle **Active** (verde)

#### Placeholders (Opcional)
- [ ] Workflow `Data Collection - INEP`
- [ ] Toggle **Active** (verde)

- [ ] Workflow `Data Collection - MapBiomas`
- [ ] Toggle **Active** (verde)

#### Orquestrador (ÚLTIMO!)
- [ ] Workflow `Data Collection Orchestrator`
- [ ] ⚠️ **IMPORTANTE**: Só ativar após validar testes
- [ ] Toggle **Active** (verde)
- [ ] Verificar mensagem: "Workflow activated"

**✅ Checkpoint**: Todos os workflows ativos (verde)

### 6.3 Resetar Indicadores para Coleta Inicial

```sql
-- Forçar alguns indicadores IBGE como vencidos para primeira execução automática
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE source_name = 'IBGE Sidra'
  AND collection_method = 'api'
  AND is_active = true
  AND code IN (
    'SOCIAL_POPULACAO',
    'ECON_PIB_TOTAL',
    'ECON_PIB_PER_CAPITA',
    'ECON_VA_AGRO',
    'ECON_VA_INDUSTRIA'
  );

-- Verificar
SELECT code, name, next_collection_date
FROM indicator_dictionary
WHERE next_collection_date < CURRENT_DATE
ORDER BY code;
```

- [ ] Query executada
- [ ] ~5 indicadores marcados como vencidos

**✅ Checkpoint**: Database preparado para primeira coleta automática

---

## 📊 Fase 7: Monitoramento (Contínuo)

### 7.1 Verificar Execuções

- [ ] Menu **Executions** (relógio no menu lateral)
- [ ] Filtrar por workflow: `Data Collection Orchestrator`
- [ ] Verificar última execução:
  - Status: ✅ Success
  - Duration: < 30 min
  - Finished at: horário esperado

### 7.2 Verificar Dados no Supabase

```sql
-- Total de registros coletados hoje
SELECT COUNT(*) as total_hoje
FROM indicator_values
WHERE created_at::date = CURRENT_DATE;

-- Por dimensão
SELECT
  SUBSTRING(id.code FROM 1 FOR POSITION('_' IN id.code) - 1) as dimension,
  COUNT(*) as total_registros
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE iv.created_at::date = CURRENT_DATE
GROUP BY dimension;

-- Indicadores atualizados hoje
SELECT
  code,
  name,
  last_ref_date,
  last_update_date,
  next_collection_date
FROM indicator_dictionary
WHERE last_update_date::date = CURRENT_DATE
ORDER BY dimension, code;
```

- [ ] Queries executadas
- [ ] Dados coletados estão corretos
- [ ] `indicator_dictionary` atualizado com próximas datas

**✅ Checkpoint**: Sistema funcionando em produção

---

## 🎯 Checklist Final de Validação

### Infraestrutura
- [ ] 4 workflows importados no n8n Cloud
- [ ] Credencial Supabase PostgreSQL criada e testada
- [ ] URLs de webhook configuradas
- [ ] Workflows ativados (toggles verdes)

### Funcionalidade
- [ ] Workflow IBGE coleta dados corretamente (testado manual)
- [ ] Orquestrador chama IBGE via webhook (testado manual)
- [ ] Schedule configurado (3:00 AM ou conforme preferência)
- [ ] Placeholders retornam "not_implemented" sem erro

### Database
- [ ] Migration 008 executada (55 indicadores populados)
- [ ] 139 municípios do Tocantins em `municipalities`
- [ ] Dados coletados em `indicator_values`
- [ ] `indicator_dictionary` atualizado após coleta

### Monitoramento
- [ ] Executions visíveis no n8n
- [ ] Logs acessíveis em cada execução
- [ ] Queries SQL de validação funcionando

---

## 🐛 Troubleshooting Rápido

### ❌ "Credential not found"
**Solução**: Aplicar credencial `Supabase PostgreSQL` em TODOS os nós PostgreSQL

### ❌ "Workflow not found" (Orquestrador)
**Solução**: Verificar que workflow IBGE está **Active** (toggle verde)

### ❌ Timeout na API IBGE
**Solução**: Aumentar timeout em `Call IBGE API` para 60000ms (60s)

### ❌ "Connection refused" (Supabase)
**Solução**: Verificar Port (deve ser 6543 para Connection Pooling, não 5432)

### ❌ Schedule não dispara
**Solução**: Verificar timezone e que workflow está **Active**

---

## 📞 Próximos Passos

Após setup completo:

1. **Aguardar Primeira Execução Automática** (próximo 3:00 AM)
2. **Validar Dados Coletados** (queries SQL)
3. **Expandir Indicadores** (adicionar mais indicadores IBGE)
4. **Implementar INEP** (substituir placeholder)
5. **Implementar MapBiomas** (obter token de API)

---

**✅ SETUP COMPLETO!**

Seu sistema de coleta multiagentes está pronto para operar em produção.

---

**Última Atualização**: 2026-01-16
**Autor**: Claude Code (Sonnet 4.5)
**Sessão**: #19
**Tempo Total**: ~60 minutos
