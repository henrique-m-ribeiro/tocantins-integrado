# 🔧 Guia de Troubleshooting - Sistema de Coleta Multiagentes

> Diagnóstico e resolução de problemas comuns no sistema de coleta de dados

**Sessão**: #19
**Data**: 2026-01-16
**Última Atualização**: 2026-01-16

---

## 📋 Índice

1. [Como Usar Este Guia](#como-usar-este-guia)
2. [Problemas de Configuração](#problemas-de-configuração)
3. [Problemas de Execução](#problemas-de-execução)
4. [Problemas de Dados](#problemas-de-dados)
5. [Problemas de Performance](#problemas-de-performance)
6. [Diagnóstico Avançado](#diagnóstico-avançado)

---

## 🎯 Como Usar Este Guia

### Estrutura de Cada Problema

Cada seção segue o formato:

```
❌ SINTOMA
   Descrição do que o usuário observa

🔍 DIAGNÓSTICO
   Como confirmar que é este problema específico

🔧 SOLUÇÃO
   Passo a passo para resolver

✅ VALIDAÇÃO
   Como verificar que o problema foi resolvido
```

### Níveis de Severidade

| Ícone | Severidade | Impacto |
|-------|------------|---------|
| 🔴 | Crítico | Sistema não funciona |
| 🟡 | Moderado | Funcionalidade parcial |
| 🟢 | Baixo | Inconveniência menor |

---

## 🛠️ Problemas de Configuração

### 🔴 Problema 1: "Credential not found" no PostgreSQL

#### ❌ SINTOMA
Workflow falha imediatamente com erro:
```
Error: "Credential for PostgreSQL" is not set
```

Ou no log:
```
ERROR: Credential "supabase-postgres" could not be found
```

#### 🔍 DIAGNÓSTICO

1. **Verificar Credencial Existe**:
   - n8n > Menu lateral > **Credentials**
   - Buscar: "Supabase PostgreSQL"
   - ❌ Se não aparece: Credencial não foi criada
   - ✅ Se aparece: Credencial existe mas não está aplicada

2. **Verificar Nós do Workflow**:
   - Abrir workflow com problema
   - Procurar nós PostgreSQL (ícone de elefante)
   - Nós com problema mostram ⚠️ vermelho

#### 🔧 SOLUÇÃO

**Caso 1: Credencial Não Existe**

1. **Criar Credencial**:
   - n8n > **Credentials** > **Add Credential**
   - Tipo: **Postgres**
   - Nome: `Supabase PostgreSQL`
   - Preencher:
     ```
     Host:     xxxxx.pooler.supabase.com
     Database: postgres
     User:     postgres.xxxxx
     Password: ***
     Port:     6543
     SSL:      require
     ```
   - **Test Connection** (deve retornar ✅)
   - **Save**

**Caso 2: Credencial Existe Mas Não Aplicada**

1. **Identificar Todos os Nós PostgreSQL**:

   **Orquestrador**:
   - `Query Pending Indicators`

   **Workflow IBGE**:
   - `Get Municipalities`
   - `Upsert Indicator Value`
   - `Update Dictionary`

2. **Aplicar Credencial**:
   - Para CADA nó acima:
     - Clicar no nó
     - Dropdown **Credential for PostgreSQL**
     - Selecionar `Supabase PostgreSQL`
   - **Save** o workflow

#### ✅ VALIDAÇÃO

- [ ] Nó PostgreSQL não mostra ⚠️ vermelho
- [ ] Executar workflow manualmente → não falha com erro de credencial
- [ ] Query retorna dados (verificar output do nó)

---

### 🔴 Problema 2: "Connection refused" ou "Connection timeout" (Supabase)

#### ❌ SINTOMA

```
ERROR: connect ECONNREFUSED xxx.xxx.xxx.xxx:6543
```

Ou:

```
ERROR: Connection timeout
```

#### 🔍 DIAGNÓSTICO

1. **Verificar Configuração de Porta**:
   - n8n > **Credentials** > `Supabase PostgreSQL`
   - Campo **Port**: ❌ Se `5432` → ERRADO
   - Campo **Port**: ✅ Se `6543` → CORRETO (Connection Pooling)

2. **Verificar Host**:
   - Host deve terminar com `.pooler.supabase.com`
   - ❌ ERRADO: `xxx.supabase.co` (falta pooler)
   - ✅ CORRETO: `xxx.pooler.supabase.com`

3. **Teste Manual de Conexão**:
   ```bash
   # No seu terminal local (não no n8n)
   psql "postgresql://postgres.xxxxx:PASSWORD@xxx.pooler.supabase.com:6543/postgres"
   ```

#### 🔧 SOLUÇÃO

1. **Obter Credenciais Corretas do Supabase**:
   - Supabase Dashboard > **Settings** > **Database**
   - Seção **Connection Pooling** (não "Direct Connection")
   - Copiar:
     - **Host**: `xxx.pooler.supabase.com`
     - **Port**: `6543`
     - **Database**: `postgres`
     - **User**: `postgres.xxxxx`
     - **Password**: (sua senha)

2. **Atualizar Credencial no n8n**:
   - n8n > **Credentials** > `Supabase PostgreSQL` > **Edit**
   - Colar valores corretos
   - **Test Connection**
   - Se ✅: **Save**
   - Se ❌: Verificar firewall/VPN

#### ✅ VALIDAÇÃO

- [ ] **Test Connection** retorna sucesso
- [ ] Query de teste retorna dados:
  ```sql
  SELECT COUNT(*) FROM municipalities WHERE state_id = 'TO';
  -- Esperado: 139
  ```

---

### 🟡 Problema 3: "Workflow not found" ao chamar especialista

#### ❌ SINTOMA

Orquestrador falha no nó `Call Specialist Workflow`:

```
ERROR: HTTP 404 - Not Found
URL: https://xxx.app.n8n.cloud/webhook/data-collection-ibge
```

#### 🔍 DIAGNÓSTICO

1. **Verificar Workflow Especialista Importado**:
   - n8n > **Workflows**
   - Buscar: `Data Collection - IBGE Sidra`
   - ❌ Não aparece: Workflow não importado
   - ✅ Aparece: Continuar diagnóstico

2. **Verificar Workflow Ativo**:
   - Abrir `Data Collection - IBGE Sidra`
   - Toggle **Active** no canto superior direito
   - ❌ Cinza (inactive): Não está escutando webhooks
   - ✅ Verde (active): Está ativo

3. **Verificar URL do Webhook**:
   - Nó `Webhook Trigger` do IBGE
   - Copiar **Production URL**
   - Deve ser: `https://xxx.app.n8n.cloud/webhook/data-collection-ibge`

4. **Comparar com URL do Orquestrador**:
   - Orquestrador > Nó `Call Specialist Workflow`
   - Campo **URL**: Verificar se base URL está correta

#### 🔧 SOLUÇÃO

**Caso 1: Workflow Não Importado**

1. Importar workflow:
   - Menu ☰ > **Import from File**
   - Selecionar `data-collection-ibge.json`
   - **Import** > **Save**

**Caso 2: Workflow Inativo**

1. Ativar workflow:
   - Abrir `Data Collection - IBGE Sidra`
   - Toggle **Active** (verde)
   - Verificar mensagem: "Workflow activated"

**Caso 3: URL Base Incorreta**

1. **Verificar URL Base**:
   - Copiar URL do seu n8n: `https://SEU_WORKSPACE.app.n8n.cloud`

2. **Opção A: Usar Environment Variable**:
   - n8n > **Settings** > **Environment Variables**
   - **Add Variable**:
     - Name: `N8N_WEBHOOK_BASE_URL`
     - Value: `https://SEU_WORKSPACE.app.n8n.cloud`
   - **Save**

3. **Opção B: Hardcode no Orquestrador**:
   - Orquestrador > Nó `Call Specialist Workflow`
   - Campo **URL**: Substituir por:
     ```
     https://SEU_WORKSPACE.app.n8n.cloud/webhook/{{ $json.workflow_name }}
     ```
   - **Save**

#### ✅ VALIDAÇÃO

- [ ] Workflow IBGE está **Active** (verde)
- [ ] URL do webhook é acessível
- [ ] Orquestrador consegue chamar IBGE com sucesso (HTTP 200)

---

### 🟢 Problema 4: JavaScript Error no Orquestrador

#### ❌ SINTOMA

```
ERROR: ReferenceError: groupedBySo urce is not defined
```

Ou:

```
ERROR: Unexpected identifier
```

#### 🔍 DIAGNÓSTICO

Erro de sintaxe JavaScript nos nós de código.

#### 🔧 SOLUÇÃO

**Este problema foi CORRIGIDO na Sessão #19**. Se você ainda vê o erro:

1. **Reimportar Workflow Corrigido**:
   - Deletar workflow `Data Collection Orchestrator` antigo
   - Importar versão corrigida de `data-collection-orchestrator.json`

2. **Ou Corrigir Manualmente**:
   - Orquestrador > Nó `Group by Source`
   - Linha com erro: `const groupedBySo urce = {};`
   - Corrigir para: `const groupedBySource = {};`
   - **Save**

#### ✅ VALIDAÇÃO

- [ ] Workflow executa sem erros de JavaScript
- [ ] Nó `Group by Source` retorna array de grupos

---

## 🚀 Problemas de Execução

### 🟡 Problema 5: Timeout na API IBGE

#### ❌ SINTOMA

```
ERROR: Request timeout (30000ms exceeded)
```

Workflow IBGE falha em alguns municípios.

#### 🔍 DIAGNÓSTICO

1. **Verificar Timeout Configurado**:
   - Workflow IBGE > Nó `Call IBGE API`
   - Options > **Timeout**: Valor atual?
   - ❌ Se `30000` (30s): Pode ser insuficiente
   - ✅ Se `60000` (60s): Timeout adequado

2. **Testar API Manualmente**:
   ```bash
   curl -w "\nTime: %{time_total}s\n" \
     "https://apisidra.ibge.gov.br/values/t/6579/n6/1721000/v/allxp/p/last"
   ```
   - Se tempo > 30s: API IBGE está lenta
   - Se tempo < 5s: Problema pode ser outra coisa

#### 🔧 SOLUÇÃO

**Solução 1: Aumentar Timeout**

1. Workflow IBGE > Nó `Call IBGE API`
2. Options > **Timeout**: Alterar para `60000` (60s)
3. **Save**

**Solução 2: Reduzir Batch Size**

1. Workflow IBGE > Nó `Batch Municipalities`
2. **Batch Size**: Alterar de `10` para `5`
3. **Save**

**Solução 3: Adicionar Delay Entre Requisições**

1. Adicionar nó **Wait** após `Call IBGE API`
2. **Amount**: 500 ms
3. Conectar fluxo: `Call IBGE API` → `Wait` → `Parse Response`
4. **Save**

#### ✅ VALIDAÇÃO

- [ ] Execução completa sem timeouts
- [ ] Todos os 139 municípios coletados
- [ ] Tempo total de execução aceitável (< 30 min)

---

### 🟡 Problema 6: Parsing da API IBGE Falha

#### ❌ SINTOMA

Nó `Parse Response` retorna array vazio ou valores `null`.

Logs mostram:
```
[IBGE] ⚠️  Dados inválidos para ECON_PIB_TOTAL
```

#### 🔍 DIAGNÓSTICO

1. **Inspecionar Resposta da API**:
   - Execution > Nó `Call IBGE API`
   - Aba **Output** > Ver JSON
   - Verificar estrutura:
     ```json
     [
       ["Header..."],
       {"V": "123456", "D3N": "2023", ...}
     ]
     ```

2. **Identificar Problema**:
   - ❌ Estrutura diferente do esperado
   - ❌ Campo `V` ou `D3N` não existe
   - ❌ Endpoint retorna erro ou vazio

#### 🔧 SOLUÇÃO

**Solução 1: Endpoint Inválido**

Verificar endpoint no `indicator_dictionary`:

```sql
SELECT code, name, api_endpoint
FROM indicator_dictionary
WHERE code = 'ECON_PIB_TOTAL';
```

Testar manualmente:
```bash
curl "https://apisidra.ibge.gov.br/values/t/5938/n6/1721000/v/allxp/p/last"
```

Se retornar erro, atualizar endpoint:
```sql
UPDATE indicator_dictionary
SET api_endpoint = '<NOVO_ENDPOINT_CORRETO>'
WHERE code = 'ECON_PIB_TOTAL';
```

**Solução 2: Ajustar Lógica de Parsing**

Se estrutura JSON mudou, ajustar nó `Parse Response`:

```javascript
// Versão original (pode estar desatualizada)
let value, year;
if (data.V) {
  value = parseFloat(data.V.toString().replace(',', '.'));
}
if (data.D3N) {
  year = parseInt(data.D3N);
}

// Ajustar conforme estrutura real da API
// Inspecionar response no nó anterior para identificar campos corretos
```

#### ✅ VALIDAÇÃO

- [ ] Nó `Parse Response` retorna objetos com `value` e `year`
- [ ] Valores fazem sentido (PIB > 0, ano entre 2020-2024)
- [ ] Upsert insere registros no database

---

### 🔴 Problema 7: Nenhum Indicador Pendente (Orquestrador Vazio)

#### ❌ SINTOMA

Orquestrador executa mas logs mostram:
```
[ORCHESTRATOR] ℹ️  Nenhum indicador pendente de coleta.
[ORCHESTRATOR] Todos os indicadores estão atualizados.
```

#### 🔍 DIAGNÓSTICO

1. **Verificar Indicadores no Dictionary**:
   ```sql
   SELECT
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE is_active = true) as ativos,
     COUNT(*) FILTER (WHERE collection_method = 'api') as com_api,
     COUNT(*) FILTER (WHERE next_collection_date IS NULL OR next_collection_date <= CURRENT_DATE) as pendentes
   FROM indicator_dictionary;
   ```

2. **Interpretar Resultado**:
   - `total` = 0: ❌ Migration 008 não foi executada
   - `ativos` = 0: ❌ Todos desativados
   - `com_api` = 0: ❌ Nenhum configurado para coleta automática
   - `pendentes` = 0: ℹ️ Todos já foram coletados recentemente

#### 🔧 SOLUÇÃO

**Caso 1: Migration 008 Não Executada**

1. Executar migration:
   - Supabase Dashboard > **SQL Editor**
   - Abrir `supabase/migrations/008_create_indicator_dictionary.sql`
   - **Run**

**Caso 2: Indicadores Não Estão Pendentes**

Forçar indicadores como vencidos para teste:

```sql
UPDATE indicator_dictionary
SET next_collection_date = CURRENT_DATE - 1
WHERE source_name = 'IBGE Sidra'
  AND collection_method = 'api'
  AND is_active = true
LIMIT 5;

-- Verificar
SELECT code, name, next_collection_date
FROM indicator_dictionary
WHERE next_collection_date < CURRENT_DATE;
```

#### ✅ VALIDAÇÃO

- [ ] Query retorna 5 indicadores pendentes
- [ ] Orquestrador identifica e agrupa por fonte
- [ ] Workflows especialistas são chamados

---

## 📊 Problemas de Dados

### 🟡 Problema 8: Dictionary Não Atualiza Após Coleta

#### ❌ SINTOMA

Dados coletados em `indicator_values`, mas `indicator_dictionary` mantém:
- `last_ref_date` = NULL
- `last_update_date` = NULL
- `next_collection_date` = vencido

#### 🔍 DIAGNÓSTICO

1. **Verificar Execução do Workflow IBGE**:
   - n8n > **Executions** > Última execução do IBGE
   - Verificar nó `Update Dictionary`:
     - ❌ Não executou: Fluxo parou antes
     - ✅ Executou mas sem output: Query falhou
     - ✅ Executou com output: Verificar dados

2. **Verificar Output de `Prepare Dictionary Update`**:
   - Execution > Nó `Prepare Dictionary Update`
   - Deve retornar array:
     ```json
     [
       {"code": "SOCIAL_POPULACAO", "max_year": 2023}
     ]
     ```
   - ❌ Array vazio: Problema em `Upsert Indicator Value`

#### 🔧 SOLUÇÃO

**Solução 1: Nó `Upsert Indicator Value` Falhou**

1. Verificar logs do nó:
   - ❌ Erro de parâmetros SQL: Verificar mapeamento `$1-$6`
   - ❌ Erro de constraint: Verificar unicidade
   - ❌ Erro de tipo: Verificar conversão (decimal, uuid, etc)

2. Testar query manualmente:
   ```sql
   -- Teste com dados fictícios
   INSERT INTO indicator_values (
     indicator_id, municipality_id, year, value, data_quality, notes
   )
   SELECT
     id.id,
     (SELECT id FROM municipalities WHERE ibge_code = '1721000' LIMIT 1),
     2023,
     50000,
     'official',
     'Teste'
   FROM indicator_definitions id
   WHERE id.code = 'SOCIAL_POPULACAO'
   ON CONFLICT (indicator_id, municipality_id, year, month)
   DO UPDATE SET value = EXCLUDED.value
   RETURNING id;
   ```

**Solução 2: Query de Update Incorreta**

1. Verificar parâmetros em `Update Dictionary`:
   - n8n > Workflow IBGE > Nó `Update Dictionary`
   - Verificar mapeamento:
     - `$1`: `{{ $json.code }}`
     - `$2`: `{{ $json.max_year }}`

2. Testar query manualmente:
   ```sql
   UPDATE indicator_dictionary
   SET
     last_ref_date = make_date(2023, 12, 31),
     last_update_date = NOW()
   WHERE code = 'SOCIAL_POPULACAO'
   RETURNING code, last_ref_date, last_update_date;
   ```

#### ✅ VALIDAÇÃO

```sql
SELECT code, last_ref_date, last_update_date, next_collection_date
FROM indicator_dictionary
WHERE code IN ('SOCIAL_POPULACAO', 'ECON_PIB_TOTAL')
  AND last_update_date IS NOT NULL;
-- Esperado: Datas atualizadas
```

---

### 🟡 Problema 9: Valores Duplicados em `indicator_values`

#### ❌ SINTOMA

Query retorna múltiplos registros para o mesmo indicador + município + ano:

```sql
SELECT code, municipality_id, year, COUNT(*)
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
GROUP BY code, municipality_id, year
HAVING COUNT(*) > 1;
-- Retorna linhas duplicadas
```

#### 🔍 DIAGNÓSTICO

Constraint de unicidade não está funcionando.

1. **Verificar Constraint**:
   ```sql
   SELECT conname, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'indicator_values'::regclass
     AND contype = 'u';
   ```

   Esperado:
   ```
   UNIQUE (indicator_id, municipality_id, year, month)
   ```

#### 🔧 SOLUÇÃO

**Criar Constraint de Unicidade**:

1. **Limpar Duplicatas Existentes**:
   ```sql
   -- Backup antes de deletar
   CREATE TABLE indicator_values_backup AS
   SELECT * FROM indicator_values;

   -- Deletar duplicatas (mantém mais recente)
   DELETE FROM indicator_values iv1
   WHERE iv1.ctid NOT IN (
     SELECT MAX(iv2.ctid)
     FROM indicator_values iv2
     WHERE iv2.indicator_id = iv1.indicator_id
       AND iv2.municipality_id = iv1.municipality_id
       AND iv2.year = iv1.year
       AND COALESCE(iv2.month, 0) = COALESCE(iv1.month, 0)
     GROUP BY iv2.indicator_id, iv2.municipality_id, iv2.year, iv2.month
   );
   ```

2. **Criar Constraint**:
   ```sql
   ALTER TABLE indicator_values
   ADD CONSTRAINT indicator_values_unique_key
   UNIQUE (indicator_id, municipality_id, year, month);
   ```

#### ✅ VALIDAÇÃO

- [ ] Constraint criada
- [ ] Query de duplicatas retorna 0 linhas
- [ ] Workflow IBGE faz UPSERT corretamente (não duplica)

---

## ⚡ Problemas de Performance

### 🟡 Problema 10: Workflow IBGE Muito Lento (> 30 min)

#### ❌ SINTOMA

Coleta de 1 indicador em 139 municípios leva mais de 30 minutos.

#### 🔍 DIAGNÓSTICO

1. **Identificar Gargalo**:
   - Execution > Ver duração de cada nó
   - Possíveis gargalos:
     - `Call IBGE API`: API externa lenta
     - `Upsert Indicator Value`: Query lenta
     - `Batch Municipalities`: Batch muito grande

2. **Testar Velocidade da API**:
   ```bash
   time curl "https://apisidra.ibge.gov.br/values/t/6579/n6/1721000/v/allxp/p/last"
   ```
   - < 2s: ✅ API rápida
   - 2-5s: ⚠️ API média
   - > 5s: ❌ API lenta

#### 🔧 SOLUÇÃO

**Solução 1: Otimizar Batch Size**

- Reduzir de 10 para 5 municípios por batch
- Trade-off: Menos paralelização, mas menos overhead

**Solução 2: Adicionar Índices no Database**

```sql
-- Índice para Upsert mais rápido
CREATE INDEX IF NOT EXISTS idx_indicator_values_composite
ON indicator_values (indicator_id, municipality_id, year)
WHERE month IS NULL;

-- Índice para JOIN com indicator_definitions
CREATE INDEX IF NOT EXISTS idx_indicator_definitions_code
ON indicator_definitions (code);
```

**Solução 3: Executar Fora do Horário de Pico**

- Ajustar schedule para horário de menor uso da API IBGE (madrugada)

#### ✅ VALIDAÇÃO

- [ ] Coleta de 1 indicador < 15 min
- [ ] Coleta de 5 indicadores < 30 min
- [ ] Queries de upsert < 100ms cada

---

## 🔬 Diagnóstico Avançado

### Logs Detalhados do n8n

**Habilitar Debug Mode**:

1. n8n Cloud não suporta diretamente
2. Alternativa: Adicionar mais logs aos nós de código

Exemplo no nó `Parse Response`:

```javascript
console.log('[DEBUG] Response completa:', JSON.stringify(response, null, 2));
console.log('[DEBUG] Metadata:', JSON.stringify(metadata, null, 2));

// Lógica de parsing...

console.log('[DEBUG] Valor extraído:', value, 'Ano:', year);
```

### Queries de Diagnóstico do Sistema

#### Status Geral do Sistema

```sql
SELECT
  'Indicadores Ativos' as metrica,
  COUNT(*) as valor
FROM indicator_dictionary
WHERE is_active = true

UNION ALL

SELECT
  'Indicadores Coletados (30d)',
  COUNT(DISTINCT id.code)
FROM indicator_values iv
JOIN indicator_definitions idef ON iv.indicator_id = idef.id
JOIN indicator_dictionary id ON idef.code = id.code
WHERE iv.created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Taxa de Coleta (%)',
  ROUND(
    (SELECT COUNT(DISTINCT id.code)::numeric
     FROM indicator_values iv
     JOIN indicator_definitions idef ON iv.indicator_id = idef.id
     JOIN indicator_dictionary id ON idef.code = id.code
     WHERE iv.created_at > NOW() - INTERVAL '30 days'
    ) /
    (SELECT COUNT(*)::numeric
     FROM indicator_dictionary
     WHERE is_active = true
    ) * 100,
    2
  );
```

#### Performance de Queries

```sql
-- Habilitar tracking de queries (PostgreSQL)
SELECT
  query,
  calls,
  total_time / 1000 as total_time_sec,
  mean_time as mean_time_ms,
  max_time as max_time_ms
FROM pg_stat_statements
WHERE query LIKE '%indicator_%'
ORDER BY total_time DESC
LIMIT 10;
```

---

## 📞 Quando Escalar Problemas

Se após seguir este guia o problema persiste:

1. **Documentar**:
   - Sintoma exato
   - Passos de troubleshooting tentados
   - Logs relevantes

2. **Criar Issue no GitHub** (se aplicável):
   - Título descritivo
   - Reprodução step-by-step
   - Screenshots/logs

3. **Consultar Documentação**:
   - [n8n Docs](https://docs.n8n.io/)
   - [Supabase Docs](https://supabase.com/docs)
   - [API IBGE Sidra](https://apisidra.ibge.gov.br/)

---

**Última Atualização**: 2026-01-16
**Autor**: Claude Code (Sonnet 4.5)
**Sessão**: #19
