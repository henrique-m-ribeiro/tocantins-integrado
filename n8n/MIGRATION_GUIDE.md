# Guia de Migração: Workflows n8n para Schema de Territórios v2

**Data**: 2026-01-18
**Versão do Schema**: territories_v2 (Migration 009)
**Criticidade**: 🔴 ALTA - Migração obrigatória até 2026-03-18

---

## 📋 Visão Geral

Este guia detalha como importar e configurar os workflows n8n atualizados para o novo schema de territórios no Supabase.

### O Que Mudou?

| Campo Antigo | Campo Novo | Status |
|--------------|------------|---------|
| `municipalities` (tabela) | `territories` (tabela) | ✅ Substituído |
| `municipality_id` | `territory_id` | ✅ Novo campo UUID |
| - | `aggregation_method` | ✅ Obrigatório em INSERTs |
| - | `is_aggregated` | ✅ Novo campo BOOLEAN |

### Por Que Migrar?

1. **Campo `municipality_id` será removido** em ~2 meses (Fase 5)
2. **Suporte multi-escala**: Indicadores podem ser municipais, regionais ou estaduais
3. **Divisões do IBGE**: Suporta divisões antiga (pré-2017) e nova (pós-2017)
4. **Extensibilidade**: Futuras divisões (bacias, regiões de saúde) sem mudanças estruturais

---

## 1. Pré-Requisitos

### 1.1 Verificar Migration 009 no Supabase

**Executar no SQL Editor:**
```sql
-- Verificar se a migration foi executada
SELECT COUNT(*) as total_territories
FROM territories;

-- Esperado: 164 (1 estado + regiões + 139 municípios)
```

**Se retornar erro "relation territories does not exist":**
1. Execute `supabase/migrations/009_territories_schema.sql` no SQL Editor
2. Execute `supabase/migrations/009d_fix_microrregiao_codes.sql`
3. Valide novamente

### 1.2 Backup dos Workflows Antigos

**Antes de importar, fazer backup:**

1. No n8n Cloud, exportar cada workflow:
   - Abrir workflow
   - Menu "..." → "Download"
   - Salvar como `[workflow-name]-backup-20260118.json`

2. Ou via Git:
```bash
cd n8n/workflows
git checkout -b backup/pre-territories-migration
git add *.json
git commit -m "Backup: workflows antes da migração para territories"
git push origin backup/pre-territories-migration
```

---

## 2. Workflows a Serem Atualizados

### 2.1 Prioridade 1 (Crítico) 🔴

| Workflow | Arquivo | Nós Modificados |
|----------|---------|-----------------|
| **IBGE Sidra Specialist** | `data-collection-ibge-refactored.json` | 5 nós |

**⚠️ ATENÇÃO**: Este workflow é crítico para coleta de dados. Migração obrigatória.

### 2.2 Prioridade 2 (Alta) 🟡

| Workflow | Arquivo | Nós Modificados |
|----------|---------|-----------------|
| **Agent Econ** | `agent-econ-refactored.json` | 1 nó |
| **Agent Social** | `agent-social-refactored.json` | 2 nós |
| **Agent Ambient** | `agent-ambient-refactored.json` | 2 nós |
| **Agent Terra** | `agent-terra-refactored.json` | 2 nós |

### 2.3 Prioridade 3 (Baixa) 🟢

| Workflow | Arquivo | Status |
|----------|---------|--------|
| **INEP** | `data-collection-inep-refactored.json` | Template atualizado |
| **MapBiomas** | `data-collection-mapbiomas-refactored.json` | Template atualizado |

---

## 3. Como Importar Workflows

### 3.1 Importar via n8n Cloud UI

**Passo a passo:**

1. **Login no n8n Cloud**: https://app.n8n.cloud/
2. **Ir para Workflows**: Menu lateral → Workflows
3. **Importar Workflow**:
   - Botão "+" → "Import from File"
   - Selecionar `data-collection-ibge-refactored.json`
   - Clicar em "Import"

4. **Renomear Workflow** (opcional):
   - Renomear de "Data Collection - IBGE Sidra" para "Data Collection - IBGE Sidra v2"
   - Ou sobrescrever o workflow antigo (recomendado após teste)

5. **Configurar Credenciais**:
   - Abrir nó "Get Territories"
   - Verificar credencial "Supabase PostgreSQL"
   - Se não configurada, adicionar:
     - Host: `[seu-projeto].supabase.co`
     - Database: `postgres`
     - User: `postgres`
     - Password: [senha do projeto]
     - Port: `5432`
     - SSL: Enabled

6. **Testar Workflow**:
   - Botão "Execute Workflow"
   - Fornecer payload de teste (ver seção 4)

### 3.2 Importar via CLI (Avançado)

**Requisitos**: n8n CLI instalado

```bash
# Instalar n8n CLI
npm install -g n8n

# Importar workflow
n8n import:workflow --input=n8n/workflows/data-collection-ibge-refactored.json

# Ou via curl (para n8n self-hosted)
curl -X POST http://localhost:5678/rest/workflows \
  -H "Content-Type: application/json" \
  -d @n8n/workflows/data-collection-ibge-refactored.json
```

---

## 4. Teste de Validação

### 4.1 Payload de Teste (IBGE Workflow)

**Chamar via webhook:**

```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "test-manual-territories-v2",
  "indicators": [
    {
      "code": "SOCIAL_POPULACAO",
      "name": "População Residente",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last"
    }
  ]
}
```

**Executar teste:**

1. No n8n Cloud, abrir workflow "Data Collection - IBGE Sidra v2"
2. Botão "Execute Workflow"
3. Fornecer payload acima
4. Aguardar execução (~2-3 minutos para 139 municípios)

### 4.2 Validar Dados no Supabase

**Query de validação:**

```sql
SELECT
    iv.id,
    iv.territory_id,
    t.name as territory_name,
    t.ibge_code,
    t.type,
    iv.year,
    iv.value,
    iv.aggregation_method,
    iv.is_aggregated,
    iv.created_at
FROM indicator_values iv
JOIN territories t ON iv.territory_id = t.id
WHERE iv.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY iv.created_at DESC
LIMIT 20;
```

**Resultados esperados:**

✅ `territory_id` preenchido (UUID válido, não NULL)
✅ `territory_name` mostra nome do município (ex: "Palmas")
✅ `aggregation_method` = `'raw'` para dados municipais brutos
✅ `is_aggregated` = `false`
✅ `type` = `'municipio'`
✅ ~139 registros inseridos (1 por município)

### 4.3 Verificar Constraint de Unicidade

```sql
-- Tentar inserir duplicata (deve falhar)
INSERT INTO indicator_values (
  indicator_id,
  territory_id,
  year,
  value,
  aggregation_method
) VALUES (
  (SELECT id FROM indicator_definitions WHERE code = 'SOCIAL_POPULACAO'),
  (SELECT id FROM territories WHERE ibge_code = '1721000' AND type = 'municipio'),
  2023,
  123456,
  'raw'
);

-- Executar 2x
-- 2ª execução deve retornar:
-- ERROR: duplicate key value violates unique constraint
--        "indicator_values_indicator_territory_year_month_unique"
```

---

## 5. Troubleshooting

### 5.1 Erro: "relation territories does not exist"

**Causa**: Migration 009 não foi executada no Supabase.

**Solução**:
```sql
-- Executar no SQL Editor do Supabase
-- 1. Migration principal
\i supabase/migrations/009_territories_schema.sql

-- 2. Correção de códigos
\i supabase/migrations/009d_fix_microrregiao_codes.sql
```

### 5.2 Erro: "column territory_id does not exist"

**Causa**: Campo `territory_id` não foi adicionado em `indicator_values`.

**Solução**:
```sql
-- Verificar se campo existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'indicator_values'
  AND column_name = 'territory_id';

-- Se não existir, adicionar manualmente
ALTER TABLE indicator_values
ADD COLUMN IF NOT EXISTS territory_id UUID
REFERENCES territories(id) ON DELETE CASCADE;
```

### 5.3 Erro: "constraint indicator_values_indicator_territory_year_month_unique"

**Causa**: Tentando inserir duplicata (mesmo indicador, território, ano e mês).

**Solução**: Isso é **esperado** e **correto**. A constraint está funcionando. Use `ON CONFLICT` para atualizar:

```sql
INSERT INTO indicator_values (...)
ON CONFLICT (indicator_id, territory_id, year, month)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

### 5.4 Erro: "null value in column aggregation_method"

**Causa**: Campo `aggregation_method` é obrigatório mas não foi fornecido.

**Solução**:
```javascript
// No nó Parse Response, garantir que retorna:
return [{
  ...
  aggregation_method: 'raw',  // ← ADICIONAR ESTE CAMPO
  is_aggregated: false
}];
```

### 5.5 Workflow executa mas nenhum dado inserido

**Diagnóstico**:

1. Verificar logs do n8n:
   - Abrir workflow → Executions → Ver última execução
   - Procurar por erros em "Upsert Indicator Value"

2. Verificar se tabela `territories` tem dados:
```sql
SELECT COUNT(*) FROM territories WHERE type = 'municipio';
-- Esperado: 139
```

3. Verificar se tabela `indicator_definitions` tem dados:
```sql
SELECT * FROM indicator_definitions WHERE code = 'SOCIAL_POPULACAO';
-- Deve retornar 1 registro
```

---

## 6. Rollback (Se Necessário)

### 6.1 Reverter Workflows no n8n

**Opção 1: Re-importar backups**

1. n8n Cloud → Workflows
2. Deletar workflows v2
3. Importar backups salvos em `*-backup-20260118.json`

**Opção 2: Restaurar do Git**

```bash
git checkout backup/pre-territories-migration -- n8n/workflows/
git reset --hard
```

### 6.2 Manter Ambos (Transição Gradual)

**Estratégia temporária**:

1. Manter workflow antigo: "Data Collection - IBGE Sidra (Legacy)"
2. Criar workflow novo: "Data Collection - IBGE Sidra v2"
3. Testar v2 por 1 semana
4. Se OK, desativar Legacy e usar apenas v2

**⚠️ Lembrar**: Campo `municipality_id` será removido em ~2 meses. Transição gradual OK por no máximo 4-6 semanas.

---

## 7. Cronograma de Depreciação

| Data | Ação | Status |
|------|------|--------|
| 2026-01-18 | 🟢 Workflows v2 disponíveis | Concluído |
| 2026-01-25 | 🟡 Deadline para importação (recomendado) | Futuro |
| 2026-02-01 | 🟡 Início de avisos de depreciação | Futuro |
| 2026-03-01 | 🔴 Última semana para migração | Futuro |
| 2026-03-18 | 🔴 Remoção de `municipality_id` | Futuro |

**Após 2026-03-18**: Workflows antigos PARARÃO de funcionar (erro de SQL).

---

## 8. Checklist de Migração

### Para Cada Workflow:

- [ ] Backup do workflow antigo criado
- [ ] Workflow v2 importado no n8n Cloud
- [ ] Credenciais Supabase configuradas
- [ ] Teste manual executado com sucesso
- [ ] Dados validados no Supabase (territory_id, aggregation_method)
- [ ] Constraint de unicidade testada
- [ ] Workflow adicionado ao orquestrador (se aplicável)
- [ ] Workflow antigo desativado ou deletado

### Para o Projeto:

- [ ] Migration 009 executada no Supabase
- [ ] Migration 009d executada no Supabase
- [ ] 139 municípios criados em `territories`
- [ ] Views de hierarquia funcionando (`v_hierarchy_antiga`, `v_hierarchy_nova`)
- [ ] Todos os workflows críticos migrados
- [ ] Teste end-to-end executado (orquestrador → especialista → banco)
- [ ] Documentação atualizada
- [ ] Time notificado sobre mudanças

---

## 9. Suporte

### Dúvidas Técnicas

**Consultar documentação**:
- `docs/guides/workflow-refactoring-plan.md` - Análise de impacto completa
- `docs/adr/005-granularidade-territorial-temporal.md` - Decisão arquitetural
- `supabase/migrations/009_territories_schema.sql` - Schema completo

### Queries de Helper

**Ver todas as queries úteis em**: `docs/guides/workflow-refactoring-plan.md` seção 4.

**Exemplos rápidos**:

```sql
-- Obter territory_id de um município
SELECT id FROM territories
WHERE ibge_code = '1721000' AND type = 'municipio';

-- Ver hierarquia completa
SELECT * FROM v_hierarchy_antiga WHERE municipio_nome = 'Palmas';

-- Listar todos os territórios
SELECT * FROM v_territories_summary;
```

---

## 10. Próximos Passos

Após migração bem-sucedida:

1. **Monitorar execuções** nos primeiros 7 dias
2. **Coletar métricas**: tempo de execução, taxa de erro, volume de dados
3. **Implementar agregações regionais**: usar territory_id para calcular indicadores de microrregiões
4. **Expandir para outras fontes**: aplicar mesmo padrão em workflows INEP, MapBiomas
5. **Desativar workflows legados** após 30 dias de estabilidade

---

**Última Atualização**: 2026-01-18
**Versão do Guia**: 1.0
**Feedback**: Reportar issues em GitHub ou documentar em `docs/CHANGELOG.md`
