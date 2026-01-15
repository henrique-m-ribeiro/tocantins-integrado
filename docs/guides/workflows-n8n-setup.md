# 🔄 Guia de Configuração dos Workflows n8n

> Instruções detalhadas para importar e configurar os workflows de coleta

---

## 📦 Workflows Disponíveis

### 1. **Orquestrador** - `data-collection-orchestrator.json`
**Função**: Ponto central da coleta. Executa diariamente, identifica indicadores pendentes e dispara workflows especialistas.

**Status**: ✅ Completo e funcional

### 2. **IBGE Sidra** - `data-collection-ibge.json`
**Função**: Coleta indicadores econômicos e demográficos via API pública do IBGE.

**Status**: ✅ Completo e funcional

**Indicadores**: PIB, VA setoriais, População

### 3. **INEP** - `data-collection-inep.json`
**Função**: Placeholder para indicadores educacionais (IDEB, Censo Escolar).

**Status**: ⏳ Placeholder (requer implementação de coleta manual/dados abertos)

### 4. **MapBiomas** - `data-collection-mapbiomas.json`
**Função**: Placeholder para indicadores ambientais (cobertura vegetal, desmatamento).

**Status**: ⏳ Placeholder (requer token de API)

---

## 🚀 Importação dos Workflows

### Passo 1: Acessar n8n

1. Abra seu n8n (Cloud ou Self-hosted)
2. Faça login

### Passo 2: Importar Orquestrador

1. **Menu** (☰) > **Import from File**
2. Selecione: `n8n/workflows/data-collection-orchestrator.json`
3. Clique em **Import**
4. **Save** (disquete no canto superior direito)

### Passo 3: Importar Workflow IBGE

1. **Menu** > **Import from File**
2. Selecione: `n8n/workflows/data-collection-ibge.json`
3. **Import** > **Save**

### Passo 4: Importar Placeholders (Opcional)

Se quiser ter os placeholders já importados:
1. Importe `data-collection-inep.json`
2. Importe `data-collection-mapbiomas.json`

**Nota**: Estes workflows retornam "not_implemented" mas não causam erros.

---

## ⚙️ Configuração das Credenciais

### Credencial 1: Supabase PostgreSQL

Usada por: **Orquestrador** e **IBGE**

#### Criar Credencial

1. No workflow (qualquer nó PostgreSQL), clique no dropdown **Credential for PostgreSQL**
2. **Create New** > **Postgres**
3. Preencha:

| Campo | Valor |
|-------|-------|
| **Name** | Supabase PostgreSQL |
| **Host** | Seu host Supabase (ex: `aws-0-sa-east-1.pooler.supabase.com`) |
| **Database** | `postgres` |
| **User** | `postgres.seu-projeto-id` |
| **Password** | Sua senha do Supabase |
| **Port** | `6543` (Connection Pooling) |
| **SSL** | `Allow` ou `Require` |

4. **Test Connection** (deve retornar ✅)
5. **Save**

#### Aplicar a Todos os Nós

Depois de criar a credencial, você precisa aplicá-la em TODOS os nós PostgreSQL de cada workflow:

**Orquestrador**:
- `Query Pending Indicators`

**IBGE**:
- `Get Municipalities`
- `Upsert Indicator Value`
- `Update Dictionary`

**Como aplicar**:
1. Clique no nó
2. Dropdown **Credential for PostgreSQL**
3. Selecione **Supabase PostgreSQL**
4. Repita para todos os nós PostgreSQL
5. **Save** o workflow

---

### Credencial 2: n8n Webhook Auth (Opcional)

Usada pelo **Orquestrador** para chamar workflows especialistas.

#### Opção A: Sem Autenticação (Desenvolvimento)

1. No nó `Call Specialist Workflow` do Orquestrador
2. Remova o campo `authentication` ou deixe como `None`

#### Opção B: Com Autenticação (Produção Recomendada)

1. **Credentials** (menu lateral) > **Add Credential**
2. Tipo: **Header Auth**
3. Nome: `n8n Webhook Auth`
4. Header Name: `X-Webhook-Token`
5. Header Value: `seu-token-secreto-aqui` (gere um aleatório)
6. **Save**

7. No Orquestrador, nó `Call Specialist Workflow`:
   - **Authentication**: Generic Credential Type
   - **Generic Auth Type**: HTTP Header Auth
   - **Credential**: Selecione `n8n Webhook Auth`

8. Nos workflows especialistas (IBGE, etc.), nó `Webhook Trigger`:
   - **Authentication**: Header Auth
   - **Credential**: Selecione `n8n Webhook Auth`

---

## 🔧 Configuração Específica por Workflow

### Orquestrador

#### 1. Ajustar Schedule

Nó: **Schedule Trigger - Daily 3AM**

- **Hora**: 3 (3:00 AM)
- **Timezone**: Verifique timezone do servidor
- Se quiser testar: Mude para próxima hora

#### 2. Ajustar Webhook Base URL

Nó: **Call Specialist Workflow**

Se não estiver usando `$env.N8N_WEBHOOK_BASE_URL`:

1. Descubra sua URL base:
   - n8n Cloud: `https://seu-nome.app.n8n.cloud`
   - Self-hosted: `https://seu-dominio.com`

2. Substitua na URL:
   ```
   {{ $env.N8N_WEBHOOK_BASE_URL }}/webhook/{{ $json.workflow_name }}

   POR:

   https://seu-nome.app.n8n.cloud/webhook/{{ $json.workflow_name }}
   ```

#### 3. Ativar Workflow

- Toggle **Active** no canto superior direito (deve ficar verde)

---

### Workflow IBGE

#### 1. Testar Webhook

1. Abra o workflow IBGE
2. Nó `Webhook Trigger` > **Copy** URL do webhook
3. Deve ser algo como: `https://seu-nome.app.n8n.cloud/webhook/data-collection-ibge`

#### 2. Testar Manualmente

Use o **Execute Workflow** com payload de teste:

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-123",
  "indicators": [
    {
      "id": "uuid-do-indicador",
      "code": "ECON_PIB_TOTAL",
      "name": "PIB Municipal Total",
      "dimension": "ECON",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last/d/v37%202"
    },
    {
      "id": "uuid-do-indicador-2",
      "code": "SOCIAL_POPULACAO",
      "name": "População Total",
      "dimension": "SOCIAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last"
    }
  ],
  "total_indicators": 2,
  "timestamp": "2026-01-15T10:00:00Z"
}
```

**Como testar**:
1. Workflow IBGE > **Execute Workflow**
2. Cole o JSON acima no nó `Webhook Trigger` (aba **Test**)
3. Execute
4. Aguarde ~5-10 min (coleta de 139 municípios × 2 indicadores = 278 registros)

#### 3. Verificar Resultados

```sql
-- Ver dados coletados
SELECT
  id.code,
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

#### 4. Ativar Webhook

- Toggle **Active** (deve ficar verde)
- Agora o webhook está escutando chamadas do Orquestrador

---

## 🧪 Testando o Sistema Completo

### Teste 1: Forçar Indicador como Pendente

```sql
-- Forçar PIB e População como vencidos
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO');

-- Verificar
SELECT code, name, next_collection_date
FROM indicator_dictionary
WHERE code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO');
```

### Teste 2: Executar Orquestrador Manualmente

1. Abra workflow **Data Collection Orchestrator**
2. Clique em **Execute Workflow**
3. Observe logs no console:
   ```
   [ORCHESTRATOR] Iniciando coleta de dados: ...
   [ORCHESTRATOR] Indicadores agrupados por fonte:
     • IBGE Sidra: 2 indicadores
   [ORCHESTRATOR] 📋 Preparando chamada: data-collection-ibge (2 indicadores)
   [ORCHESTRATOR] 🚀 Disparando: data-collection-ibge
   ```

4. Aguarde conclusão (~10 min)
5. Verifique logs finais:
   ```
   [ORCHESTRATOR] ✅ data-collection-ibge completado com sucesso
   [ORCHESTRATOR] 📊 Resumo da Execução:
     Workflows chamados: 1
     Sucessos: 1
     Falhas: 0
   ```

### Teste 3: Verificar Dados no Supabase

```sql
-- Total de registros coletados
SELECT
  id.code,
  id.name,
  COUNT(*) as total_municipios_coletados
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO')
GROUP BY id.code, id.name;
```

**Resultado esperado**: ~139 registros por indicador (um por município)

### Teste 4: Verificar Atualização do Dictionary

```sql
-- Ver última coleta
SELECT
  code,
  name,
  last_ref_date,
  last_update_date,
  next_collection_date
FROM indicator_dictionary
WHERE code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO');
```

**Resultado esperado**:
- `last_update_date`: Data/hora de agora
- `next_collection_date`: ~1 ano no futuro (periodicidade anual)

---

## 📊 Monitoramento

### Ver Execuções do Orquestrador

1. n8n > **Executions** (menu lateral)
2. Filtrar por workflow: **Data Collection Orchestrator**
3. Ver status: ✅ Success / ❌ Error

### Ver Execuções do IBGE

1. **Executions** > Filtrar: **Data Collection - IBGE Sidra**
2. Clicar em execução específica
3. Ver fluxo de nós executados
4. Ver dados em cada nó

### Logs do Console

Workflows logam extensivamente no console:
- `[ORCHESTRATOR]` - Logs do orquestrador
- `[IBGE]` - Logs do workflow IBGE
- `[INEP]` - Logs do INEP
- `[MapBiomas]` - Logs do MapBiomas

Para ver logs:
1. Execution > Nó específico
2. Aba **Output**
3. Console logs aparecem como mensagens

---

## 🐛 Troubleshooting Comum

### Erro: "Credential not found"

**Causa**: Credencial PostgreSQL não configurada em um nó.

**Solução**:
1. Abra o workflow
2. Clique em CADA nó PostgreSQL
3. Selecione credencial **Supabase PostgreSQL**
4. **Save** workflow

---

### Erro: "Workflow not found" no Orquestrador

**Causa**: Workflow especialista não existe ou não está ativo.

**Solução**:
1. Verifique que workflow IBGE está importado
2. Verifique que está **Active** (toggle verde)
3. Verifique que webhook está configurado

---

### Erro: Timeout na API IBGE

**Causa**: API IBGE demorou mais de 30s para responder.

**Solução**:
1. Workflow IBGE > Nó `Call IBGE API`
2. Aumentar timeout: 60000 (60s)

---

### Workflow IBGE não retorna dados

**Diagnóstico**:
1. Teste API manualmente:
```bash
curl "https://apisidra.ibge.gov.br/values/t/5938/n6/1721000/v/allxp/p/last"
```

2. Se retornar dados, problema está no parsing
3. Nó `Parse Response` > Ajustar lógica de extração

---

### Dictionary não atualiza

**Causa**: Nó `Update Dictionary` não está recebendo dados.

**Diagnóstico**:
1. Execution > Nó `Prepare Dictionary Update`
2. Ver output - deve ter array de indicadores
3. Se vazio, problema está no nó anterior

---

## 🎯 Próximos Passos

### Curto Prazo

1. ✅ **Testar coleta IBGE** com 2-3 indicadores
2. ✅ **Validar dados** coletados vs fonte original
3. ⏳ **Expandir** para mais indicadores IBGE (VA setoriais)
4. ⏳ **Documentar** qualquer ajuste necessário

### Médio Prazo

1. **Implementar INEP**:
   - Download microdados Censo Escolar
   - Script Python para processar CSVs
   - Importação via workflow

2. **Implementar MapBiomas**:
   - Registrar na plataforma MapBiomas
   - Obter token de API
   - Adaptar workflow com autenticação

3. **Adicionar SICONFI**:
   - Criar workflow para finanças públicas
   - API pública do Tesouro

### Longo Prazo

1. **Alertas**: Notificação quando coleta falha
2. **Dashboard**: Grafana para monitorar coletas
3. **Data Quality**: Validação automática de valores
4. **Histórico**: Tabela `collection_history` para auditoria

---

## 📚 Referências

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [IBGE Sidra API](https://apisidra.ibge.gov.br/)

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0 (Workflows Implementados)
