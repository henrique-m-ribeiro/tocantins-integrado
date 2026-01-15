# 🚀 Guia de Configuração - Coleta de Dados IBGE

> Workflow simplificado para coletar dados de PIB e População do IBGE SIDRA

## 📋 Visão Geral

Este workflow coleta automaticamente dados do IBGE para todos os municípios do Tocantins:

- **PIB Municipal** (Tabela SIDRA 5938)
- **População Total** (Tabela SIDRA 6579)

### Características

✅ **Simplificado**: Funciona SEM tabelas de coleta auxiliares
✅ **Idempotente**: Pode ser executado múltiplas vezes sem duplicar dados
✅ **Agendável**: Configurado para rodar mensalmente
✅ **Lote**: Processa 10 municípios por vez para evitar sobrecarga
✅ **Resiliente**: Continua mesmo se alguns municípios falharem

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de que você tem:

1. **Supabase configurado** com o schema do Tocantins Integrado
2. **n8n Cloud ou Self-hosted** com acesso
3. **Credencial PostgreSQL** configurada no n8n apontando para o Supabase
4. **Municípios cadastrados** na tabela `municipalities`

---

## 📦 Passo 1: Setup do Banco de Dados

### 1.1. Acessar o Supabase

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto: **uyjrltzujeyploconacx**
3. Clique em **SQL Editor** no menu lateral

### 1.2. Verificar Tabelas Necessárias

Execute esta query para confirmar que as tabelas existem:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('municipalities', 'indicator_categories', 'indicator_definitions', 'indicator_values')
ORDER BY table_name;
```

**Resultado esperado**: 4 tabelas listadas.

### 1.3. Executar Script de Setup

1. Abra o arquivo: `n8n/workflows/setup-ibge-indicators.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

**Resultado esperado**:
```
✅ Setup concluído com sucesso!

📊 Indicadores criados:
   • ECON_PIB_TOTAL (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
   • SOCIAL_POPULACAO (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

🚀 Próximo passo:
   Importe o workflow data-collection-ibge-simplified.json no n8n
```

### 1.4. Verificar Municípios

Execute para ver quantos municípios estão cadastrados:

```sql
SELECT COUNT(*) AS total_municipios FROM municipalities;
```

**Esperado**: Pelo menos 1 município (Palmas). Idealmente, os 139 municípios do Tocantins.

---

## 📥 Passo 2: Importar Workflow no n8n

### 2.1. Acessar o n8n

Abra seu n8n Cloud ou instância self-hosted.

### 2.2. Importar o Workflow

1. Clique no menu **☰** (hamburger) no canto superior esquerdo
2. Selecione **Import from File**
3. Navegue até: `n8n/workflows/data-collection-ibge-simplified.json`
4. Clique em **Import**

### 2.3. Salvar o Workflow

1. O workflow será aberto automaticamente
2. Clique em **Save** no canto superior direito
3. Nome sugerido: "Tocantins Integrado - Coleta IBGE"

---

## 🔑 Passo 3: Configurar Credenciais

### 3.1. Verificar Credencial PostgreSQL

O workflow usa uma credencial chamada **"Supabase PostgreSQL"**.

1. Clique em qualquer nó PostgreSQL (ex: "Buscar Municípios")
2. Na seção **Credential for PostgreSQL**, verifique se está selecionado
3. Se não existir, clique em **+ Add new credential**

### 3.2. Criar Credencial (se necessário)

Se você ainda não tem a credencial configurada:

1. **Connection Type**: `Host`
2. **Host**: `aws-0-sa-east-1.pooler.supabase.com` (ou seu host do Supabase)
3. **Database**: `postgres`
4. **User**: `postgres.uyjrltzujeyploconacx`
5. **Password**: Sua senha do Supabase
6. **Port**: `6543`
7. **SSL**: `Allow` ou `Require`

**Como encontrar as credenciais do Supabase**:
1. Supabase Dashboard > Settings > Database
2. Copie as informações de **Connection String** ou **Connection Pooling**

### 3.3. Testar Conexão

1. Na tela de credencial, clique em **Test Connection**
2. Deve retornar: ✅ "Connection successful"
3. Clique em **Save**

### 3.4. Atualizar Todos os Nós

O workflow tem 3 nós PostgreSQL que precisam da credencial:
- **Buscar Municípios**
- **Inserir/Atualizar Indicadores**

Verifique se todos estão usando a mesma credencial.

---

## ▶️ Passo 4: Testar o Workflow

### 4.1. Teste Manual

1. Desative o trigger agendado temporariamente:
   - Clique no nó **"Agendamento Mensal"**
   - Toggle OFF (desabilitar)
2. Clique no botão **"Execute Workflow"** no canto superior direito
3. Aguarde a execução (pode levar alguns minutos)

### 4.2. Acompanhar Execução

Durante a execução, você verá:
- ✅ Nós verdes = sucesso
- 🔴 Nós vermelhos = erro
- 🔵 Nós azuis = em progresso

**Console de logs**:
- Abra a aba **Executions** (barra lateral esquerda)
- Clique na execução em andamento
- Veja os logs de cada nó

### 4.3. Verificar Resultados no Supabase

Após a execução, verifique se os dados foram inseridos:

```sql
-- Ver indicadores coletados recentemente
SELECT
  m.name AS municipio,
  id.name AS indicador,
  iv.year AS ano,
  iv.value AS valor,
  id.unit AS unidade,
  iv.created_at AS coletado_em
FROM indicator_values iv
JOIN municipalities m ON iv.municipality_id = m.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO')
ORDER BY iv.created_at DESC
LIMIT 20;
```

**Resultado esperado**: Linhas com dados de PIB e População de diversos municípios.

---

## 🔄 Passo 5: Ativar Agendamento

### 5.1. Configurar Schedule

1. Clique no nó **"Agendamento Mensal"**
2. Verifique as configurações:
   - **Trigger at**: `3:00 AM`
   - **Days interval**: `30` (mensal)
3. Toggle **ON** para ativar

### 5.2. Ativar Workflow

1. No topo da página, verifique se o switch **"Active"** está ON
2. Isso garantirá que o workflow rode automaticamente todo mês

---

## 🐛 Troubleshooting

### Erro: "Credential not found"

**Causa**: Credencial PostgreSQL não configurada.

**Solução**:
1. Siga o [Passo 3: Configurar Credenciais](#-passo-3-configurar-credenciais)
2. Certifique-se de salvar a credencial

---

### Erro: "Could not connect to database"

**Causa**: Credenciais incorretas ou firewall bloqueando conexão.

**Solução**:
1. Verifique host, porta, user, password no Supabase Dashboard
2. Certifique-se de usar **Connection Pooling** (porta 6543), não Direct Connection
3. Verifique se o SSL está configurado corretamente

---

### Erro: "No data found for municipality"

**Causa**: API do IBGE não retornou dados para aquele município.

**Solução**:
- **Esperado**: Alguns municípios podem não ter dados recentes
- O workflow continuará processando os demais
- Verifique logs do nó "Processar Dados" para detalhes

---

### Erro: "Indicator definition not found"

**Causa**: Indicadores `ECON_PIB_TOTAL` ou `SOCIAL_POPULACAO` não existem no banco.

**Solução**:
1. Execute novamente o script: `setup-ibge-indicators.sql`
2. Verifique se as categorias existem:
```sql
SELECT * FROM indicator_categories
WHERE dimension IN ('ECON', 'SOCIAL');
```

---

### Workflow executa mas não insere dados

**Causa possível 1**: Municípios não têm `ibge_code` válido.

**Verificação**:
```sql
SELECT id, ibge_code, name
FROM municipalities
WHERE ibge_code IS NULL OR LENGTH(ibge_code) != 7;
```

**Solução**: Corrija os códigos IBGE dos municípios.

---

**Causa possível 2**: API do IBGE mudou formato de resposta.

**Verificação**:
1. Teste a API manualmente:
   - PIB: https://apisidra.ibge.gov.br/values/t/5938/n6/1721000/v/allxp/p/last/d/v37%202
   - População: https://apisidra.ibge.gov.br/values/t/6579/n6/1721000/v/allxp/p/last
2. Verifique se retorna JSON válido

**Solução**: Ajuste o código no nó "Processar Dados" se necessário.

---

## 📊 Monitoramento

### Ver Estatísticas de Coleta

```sql
-- Total de indicadores por município
SELECT
  m.name AS municipio,
  COUNT(*) AS total_indicadores,
  MAX(iv.year) AS ano_mais_recente
FROM indicator_values iv
JOIN municipalities m ON iv.municipality_id = m.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
WHERE id.code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO')
GROUP BY m.name
ORDER BY total_indicadores DESC;
```

### Ver Municípios Sem Dados

```sql
-- Municípios que ainda não têm dados coletados
SELECT m.name, m.ibge_code
FROM municipalities m
WHERE NOT EXISTS (
  SELECT 1 FROM indicator_values iv
  WHERE iv.municipality_id = m.id
  AND iv.indicator_id IN (
    SELECT id FROM indicator_definitions
    WHERE code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO')
  )
)
ORDER BY m.name;
```

---

## 🎯 Próximos Passos

Após configurar a coleta IBGE, você pode:

1. **Adicionar mais indicadores**:
   - Criar novos `indicator_definitions` no banco
   - Adicionar nós HTTP Request para outras APIs do IBGE
   - Atualizar o código de processamento

2. **Criar workflows para outras fontes**:
   - INEP (educação)
   - DataSUS (saúde)
   - Tesouro Nacional (finanças públicas)

3. **Adicionar tabelas de monitoramento** (opcional):
   - Execute a migration `007_data_collection.sql` para criar:
     - `data_sources`
     - `collection_jobs`
     - `collection_logs`
   - Adapte o workflow para usar essas tabelas

4. **Configurar alertas**:
   - Adicione um nó no final do workflow para enviar email/Slack se houver falhas
   - Use o nó "Send Email" ou "Slack" do n8n

---

## 📚 Referências

### APIs IBGE SIDRA

- **Documentação**: https://apisidra.ibge.gov.br/
- **Tabela 5938** (PIB): https://sidra.ibge.gov.br/tabela/5938
- **Tabela 6579** (População): https://sidra.ibge.gov.br/tabela/6579

### Schema do Banco

- **Migrations**: `src/database/migrations/`
- **Schema consolidado**: `supabase_setup_consolidated.sql`

### n8n

- **Documentação**: https://docs.n8n.io/
- **HTTP Request node**: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- **Postgres node**: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/

---

## 💬 Suporte

Se encontrar problemas:

1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Consulte os logs de execução no n8n
3. Revise o código do nó "Processar Dados" para entender a lógica
4. Teste as APIs do IBGE diretamente no navegador

---

**Última atualização**: 2026-01-15
**Versão do workflow**: 1.0 (Simplificado)
