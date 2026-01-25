# Status da Migração para Schema de Territórios

**Última atualização**: 2026-01-18
**Versão do Schema**: Migration 009d
**Status geral**: 🟡 Em Progresso (40% completo)

---

## 📊 Visão Geral

A migração para o novo schema de territórios está em andamento. Este documento consolida o status de todas as camadas do sistema.

---

## ✅ Trabalho Concluído

### 1. Database Schema (100% ✅)

**Migration 009**: Schema de territórios unificado
- ✅ Tabela `territories` criada (substitui municipalities, microregions, mesoregions)
- ✅ Tabela `territory_relationships` criada (hierarquia explícita)
- ✅ Campo `territory_id` adicionado a `indicator_values`
- ✅ Views de compatibilidade criadas (v_municipalities_compat, v_hierarchy_antiga, v_hierarchy_nova)
- ✅ Índices otimizados criados
- ✅ Coexistência de `municipality_id` e `territory_id` garantida por 2 meses

**Migration 009b/009c**: Correções de dados
- ✅ Dados de municípios populados
- ✅ Hierarquias populadas
- ✅ Duplicados removidos

**Migration 009d**: Correção de códigos IBGE
- ✅ Códigos de municípios corrigidos (5 → 6 dígitos)
- ✅ Códigos de microrregiões corrigidos (5 → 6 dígitos)

**Arquivos**:
- `/supabase/migrations/009_territories_schema.sql`
- `/supabase/migrations/009b_fix_populate_municipalities.sql`
- `/supabase/migrations/009c_remove_duplicate_palmas.sql`
- `/supabase/migrations/009d_fix_microregion_codes.sql`

---

### 2. Workflows n8n (100% ✅)

**7 workflows refatorados** para compatibilidade com novo schema:

#### Coleta de Dados (3 workflows)
1. ✅ **data-collection-ibge-refactored.json** (Prioridade 1)
   - Query: `SELECT FROM territories WHERE type = 'municipio'`
   - Variáveis: `municipality_id` → `territory_id`
   - Campos: Adicionado `aggregation_method`, `is_aggregated`
   - INSERT: Usa `territory_id` e novo constraint

2. ✅ **data-collection-inep-refactored.json** (Placeholder)
   - Comentários atualizados com exemplos do novo schema
   - Instruções para implementação futura

3. ✅ **data-collection-mapbiomas-refactored.json** (Placeholder)
   - Comentários atualizados com exemplos do novo schema
   - Instruções para implementação futura

#### Agentes Dimensionais (4 workflows)
4. ✅ **agent-econ-refactored.json**
   - Query: JOINs com `territories` e `territory_relationships`
   - Usa `v_hierarchy_antiga` para navegação de hierarquia

5. ✅ **agent-social-refactored.json**
   - Nó "Preparar Contexto": `municipality_id` → `territory_id`
   - Mensagens GPT-4: "Município:" → "Território:"

6. ✅ **agent-ambient-refactored.json**
   - Nó "Preparar Contexto": `municipality_id` → `territory_id`
   - Mensagens GPT-4: "Município:" → "Território:"

7. ✅ **agent-terra-refactored.json**
   - Nó "Preparar Contexto": `municipality_id` → `territory_id`
   - Mensagens GPT-4: "Município:" → "Território:"

**Arquivos**:
- `/n8n/workflows/data-collection-ibge-refactored.json`
- `/n8n/workflows/data-collection-inep-refactored.json`
- `/n8n/workflows/data-collection-mapbiomas-refactored.json`
- `/n8n/workflows/agent-econ-refactored.json`
- `/n8n/workflows/agent-social-refactored.json`
- `/n8n/workflows/agent-ambient-refactored.json`
- `/n8n/workflows/agent-terra-refactored.json`

---

### 3. Documentação (100% ✅)

**3 documentos criados**:

1. ✅ **workflow-refactoring-plan.md** (~800 linhas)
   - Análise detalhada de impacto em 6 workflows (16 nós afetados)
   - Estratégia de migração completa
   - Queries de tradução `ibge_code` ↔ `territory_id`
   - Procedimentos de teste end-to-end
   - Análise de riscos e plano de rollback

2. ✅ **MIGRATION_GUIDE.md** (~250 linhas)
   - Instruções passo a passo para importar workflows
   - Procedimentos de validação
   - Troubleshooting de erros comuns
   - Timeline de depreciação

3. ✅ **backend-frontend-migration-analysis.md** (~1.000 linhas)
   - Análise de impacto em 48 arquivos TypeScript/React
   - 3 estratégias de migração propostas
   - Plano de implementação em 5 fases
   - Riscos e mitigações detalhados

**Arquivos**:
- `/docs/guides/workflow-refactoring-plan.md`
- `/n8n/MIGRATION_GUIDE.md`
- `/docs/guides/backend-frontend-migration-analysis.md`

---

## 🟡 Trabalho Pendente

### 4. Backend TypeScript (0% ⏳)

**48 arquivos** identificados que precisam de atualização:

#### API REST (3 arquivos) - Prioridade: ALTA
- ⏳ `src/api/routes/municipalities.ts` (346 linhas)
  - Criar nova rota `/api/territories` (estratégia de rotas paralelas)
  - Manter `/api/municipalities` por compatibilidade temporária
- ⏳ `src/api/routes/export.ts`
- ⏳ `src/api/server.ts`

#### Types/Interfaces (8 arquivos) - Prioridade: ALTA
- ⏳ `src/shared/types/indicators.ts` (148 linhas)
  - Adicionar `territory_id: string`
  - Adicionar `aggregation_method` e `is_aggregated`
  - Manter `municipality_id?: string` como deprecated
- ⏳ `src/shared/types/chat.ts`
- ⏳ `src/dashboard/types/index.ts`
- ⏳ Criar `src/shared/types/territories.ts` (NOVO)

#### Collectors (10 arquivos) - Prioridade: ALTA
- ⏳ `src/collectors/base/BaseCollector.ts` (240 linhas)
  - Adicionar método `convertIbgeCodeToTerritoryId()`
  - Atualizar `CollectionResult` com campos novos
- ⏳ `src/collectors/index.ts`
  - Atualizar lógica de INSERT para usar `territory_id`
- ⏳ `src/collectors/sources/*.ts` (8 coletores)
  - AtlasBrasilCollector, ComexStatCollector, DataSUSCollector
  - IBGESidraCollector, INEPCollector, MapBiomasCollector
  - SICONFICollector, SNISCollector

#### Frontend Components (12 arquivos) - Prioridade: MÉDIA
- ⏳ `src/dashboard/components/controls/TerritorySelector.tsx`
  - Atualizar para aceitar `territory_id`
  - Suportar seleção de diferentes tipos de território
- ⏳ `src/dashboard/components/map/TocantinsMap.tsx`
- ⏳ `src/dashboard/components/chat/ChatPanel.tsx`
- ⏳ `src/dashboard/hooks/useChartData.ts`
- ⏳ `src/dashboard/lib/api.ts`
- ⏳ Outros 7 componentes

#### Agents (8 arquivos) - Prioridade: BAIXA
- ⏳ `src/agents/dimensional/*.ts` (4 agentes)
  - EconAgent, SocialAgent, TerraAgent, AmbientAgent
- ⏳ `src/agents/orchestrator/Orchestrator.ts`
- ⏳ `src/agents/base/BaseAgent.ts`
- ⏳ Outros 2 arquivos

#### Database Seeds (4 arquivos) - Prioridade: BAIXA
- ⏳ `src/database/seeds/regions.ts` (obsoleto)
- ⏳ `src/database/seeds/002_sample_analyses.sql`
- ⏳ Outros 2 arquivos

---

## 📋 Estratégia Recomendada

### Rotas Paralelas (Estratégia 3) 🏆

**Abordagem**: Criar nova API `/api/territories` ao lado da antiga `/api/municipalities`

**Vantagens**:
- ✅ Baixo risco - rotas antigas continuam funcionando
- ✅ Frontend migra no seu ritmo
- ✅ Testagem incremental
- ✅ Rollback fácil por rota
- ✅ Aproveita features do novo schema progressivamente

**Timeline**:
- **Semana 1**: Fundação (types, nova API, collectors)
- **Semana 2**: Backend (testes, validação)
- **Semanas 3-4**: Frontend (hooks, componentes)
- **Semana 5**: Validação (E2E, deploy)
- **Mês 3-4**: Deprecação (remoção de código antigo)

---

## 🎯 Próximos Passos Imediatos

### Decisão Necessária ⚠️

**Pergunta para o time**: Qual estratégia de migração escolhemos?

1. **Estratégia 1**: Retrocompatibilidade Temporária (conservadora)
2. **Estratégia 2**: Refatoração Completa Imediata (agressiva)
3. **Estratégia 3**: Rotas Paralelas (recomendada) 🏆

### Após Decisão

Se **Estratégia 3** for escolhida, começar pela **Fase 1: Fundação**:

1. **Atualizar Types TypeScript** (1-2 dias)
   - `src/shared/types/indicators.ts`
   - Criar `src/shared/types/territories.ts`
   - `src/dashboard/types/index.ts`

2. **Criar Nova API** (2-3 dias)
   - `src/api/routes/territories.ts`
   - Implementar endpoints: GET /territories, GET /territories/:id, etc.
   - Registrar rota em `server.ts`

3. **Atualizar Collectors** (2-3 dias)
   - `src/collectors/base/BaseCollector.ts`
   - `src/collectors/index.ts`
   - Implementar conversão `ibge_code` → `territory_id`

**Esforço estimado Fase 1**: ~1 semana (5-8 dias úteis)

---

## 📈 Progresso Geral

```
Database Schema:     ████████████████████ 100%
Workflows n8n:       ████████████████████ 100%
Documentação:        ████████████████████ 100%
Backend TypeScript:  ░░░░░░░░░░░░░░░░░░░░   0%
Frontend React:      ░░░░░░░░░░░░░░░░░░░░   0%
Agents:              ░░░░░░░░░░░░░░░░░░░░   0%

GERAL:               ████████░░░░░░░░░░░░  40%
```

---

## 🔗 Links Úteis

### Documentação
- [Análise de Impacto Workflows n8n](./guides/workflow-refactoring-plan.md)
- [Guia de Migração n8n](../n8n/MIGRATION_GUIDE.md)
- [Análise de Impacto Backend/Frontend](./guides/backend-frontend-migration-analysis.md)

### Migrations
- [Migration 009: Schema de Territórios](../supabase/migrations/009_territories_schema.sql)
- [Migration 009d: Correção de Códigos](../supabase/migrations/009d_fix_microregion_codes.sql)

### Workflows Refatorados
- [IBGE Refatorado](../n8n/workflows/data-collection-ibge-refactored.json)
- [Agentes Refatorados](../n8n/workflows/)

---

## ⚠️ Avisos Importantes

### Para Desenvolvedores

1. **Não usar `municipality_id` em código novo**
   - Sempre usar `territory_id`
   - Campo `municipality_id` será removido em ~2 meses

2. **INSERTs em `indicator_values` devem incluir**:
   - `territory_id` (UUID)
   - `aggregation_method` ('raw', 'sum', 'avg', etc.)
   - `is_aggregated` (boolean)

3. **Views de compatibilidade**:
   - ✅ Funcionam para SELECT
   - ❌ NÃO funcionam para INSERT/UPDATE

4. **APIs externas continuam usando códigos IBGE**:
   - ✅ Collectors devem usar `ibge_code` ao chamar APIs
   - ✅ Mas devem converter para `territory_id` antes de INSERT

### Para Importação de Workflows n8n

1. **Fazer backup** dos workflows atuais antes de importar
2. **Testar em staging** antes de produção
3. **Validar INSERTs** com queries de verificação
4. **Monitorar logs** por 24-48h após importação

---

## 📞 Contato

**Dúvidas sobre a migração?**
- Consultar documentação detalhada em `/docs/guides/`
- Abrir issue no repositório
- Contatar equipe de arquitetura

---

**Última revisão**: 2026-01-18
**Responsável**: Claude Code
**Branch**: `claude/review-handoff-docs-7ruBN`
