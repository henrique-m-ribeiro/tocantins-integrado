# Análise de Impacto: Migração Backend/Frontend para Schema de Territórios

**Data**: 2026-01-18
**Versão**: 1.0
**Relacionado**: Migration 009 (Schema de Territórios)

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Arquivos Afetados](#arquivos-afetados)
3. [Análise por Camada](#análise-por-camada)
4. [Estratégias de Migração](#estratégias-de-migração)
5. [Plano de Implementação Recomendado](#plano-de-implementação-recomendado)
6. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 1. Resumo Executivo

### Contexto

A Migration 009 introduziu o novo schema de territórios no Supabase, substituindo as tabelas `municipalities`, `microregions`, `mesoregions` por uma tabela unificada `territories` com hierarquia explícita.

**Status atual**:
- ✅ **Migration 009 aplicada**: Schema de territórios criado no Supabase
- ✅ **Workflows n8n refatorados**: 7 workflows atualizados
- ⏳ **Backend TypeScript**: 48 arquivos ainda usam schema antigo
- ⏳ **Frontend React**: Componentes ainda esperam `municipality_id`
- ⏳ **Collectors**: Sistema de coleta usa `Municipality` type

### Escopo do Impacto

| Camada | Arquivos | Status | Prioridade |
|--------|----------|--------|------------|
| **API REST** | 3 arquivos | Funciona com views de compatibilidade | Média |
| **Types/Interfaces** | 8 arquivos | Requer atualização | Alta |
| **Collectors** | 10 arquivos | Funciona mas INSERT precisa atualização | Alta |
| **Frontend Components** | 12 arquivos | Funciona com API antiga | Média |
| **Database Seeds** | 4 arquivos | Requer atualização | Baixa |
| **Agents** | 8 arquivos | Funciona com views | Baixa |

**Total**: ~48 arquivos TypeScript/TSX afetados

---

## 2. Arquivos Afetados

### 2.1 API REST (3 arquivos)

#### `src/api/routes/municipalities.ts` (346 linhas)
**Status**: Funciona com views de compatibilidade
**Impacto**: Médio

**Endpoints afetados**:
```typescript
GET  /api/municipalities              → v_municipalities_full
GET  /api/municipalities/:id          → v_municipalities_full
GET  /api/municipalities/:id/indicators → v_latest_indicators (usa municipality_id)
GET  /api/municipalities/:id/profile   → Múltiplas views com municipality_id
GET  /api/municipalities/compare       → v_latest_indicators
GET  /api/municipalities/regions/microregions → v_microregions_summary
GET  /api/municipalities/geo/geojson   → v_municipalities_full
```

**Queries que precisam de atenção**:
```typescript
// Linha 98: Filtro por municipality_id
.eq('municipality_id', id)

// Linha 126: Retorno usa municipality_id
municipality_id: id

// Linha 169-175: JOINs implícitos via views
```

#### `src/api/routes/export.ts`
**Status**: Usa views de compatibilidade
**Impacto**: Baixo

#### `src/api/server.ts`
**Status**: Registra rota `municipalityRouter`
**Impacto**: Baixo (apenas nome)

---

### 2.2 TypeScript Types (8 arquivos)

#### `src/shared/types/indicators.ts` (148 linhas)
**Status**: Define schema antigo
**Impacto**: **ALTO** - Tipo base usado em todo o sistema

**Interfaces afetadas**:
```typescript
// Linha 47-60: IndicatorValue usa municipality_id
export interface IndicatorValue {
  id: string;
  indicator_id: string;
  municipality_id: string;  // ❌ DEVE MUDAR PARA territory_id
  year: number;
  month?: number;
  value: number;
  // ... sem aggregation_method, is_aggregated
}

// Linha 67-81: DimensionalSummary
export interface DimensionalSummary {
  dimension: Dimension;
  // ... usa municipality implicitamente
}

// Linha 84-93: MultidimensionalAnalysis
export interface MultidimensionalAnalysis {
  municipality_id: string;        // ❌ DEVE MUDAR
  municipality_name: string;       // ❌ DEVE MUDAR
  // ...
}

// Linha 96-113: ComparisonAnalysis
export interface ComparisonAnalysis {
  type: 'municipality' | 'microregion';  // ❌ DEVE ADICIONAR territory types
  // ...
}
```

**Campos faltantes**:
- ❌ `territory_id: string`
- ❌ `aggregation_method: string`
- ❌ `is_aggregated: boolean`

#### `src/shared/types/chat.ts`
**Status**: Referencia `municipality` em contexto de chat
**Impacto**: Médio

#### `src/dashboard/types/index.ts`
**Status**: Define `Municipality`, `Microregion` types para frontend
**Impacto**: Alto

```typescript
export interface Municipality {
  id: string;
  name: string;
  ibge_code: string;
  // ...
}

export interface Microregion {
  id: string;
  name: string;
  // ...
}
```

**Deve ser substituído por**:
```typescript
export interface Territory {
  id: string;
  type: 'estado' | 'mesorregiao' | 'microrregiao' | 'regiao_intermediaria' | 'regiao_imediata' | 'municipio';
  ibge_code: string;
  name: string;
  division_scheme: 'antiga' | 'nova' | null;
  // ...
}
```

---

### 2.3 Data Collectors (10 arquivos)

#### `src/collectors/base/BaseCollector.ts` (240 linhas)
**Status**: Usa `Municipality` type
**Impacto**: **ALTO** - Classe base de todos os coletores

**Problemas**:
```typescript
// Linha 6: Import do schema antigo
import { TOCANTINS_MUNICIPALITIES, Municipality } from '../config/municipalities';

// Linha 8-19: CollectionResult usa municipality_ibge
export interface CollectionResult {
  indicator_code: string;
  municipality_ibge: string;  // ✅ OK para APIs externas (IBGE usa código)
  year: number;
  value: number | null;
  // ... MAS faltam campos novos
}
```

**Nota importante**:
- `municipality_ibge` é CORRETO para coleta de APIs externas (IBGE Sidra, INEP, etc.)
- APIs externas esperam códigos IBGE, não UUIDs
- O problema é na **inserção no banco** - deve converter `ibge_code` → `territory_id`

**Inserção atual** (não mostrada no BaseCollector, mas inferida):
```typescript
// ❌ ERRADO - Insert direto com municipality_id
INSERT INTO indicator_values (indicator_id, municipality_id, year, value)
VALUES (...)

// ✅ CORRETO - Converter ibge_code para territory_id
const { data: territory } = await supabase
  .from('territories')
  .select('id')
  .eq('ibge_code', result.municipality_ibge)
  .eq('type', 'municipio')
  .single();

INSERT INTO indicator_values (
  indicator_id,
  territory_id,           -- UUID do território
  year,
  value,
  aggregation_method,     -- NOVO campo obrigatório
  is_aggregated           -- NOVO campo obrigatório
) VALUES (...)
```

#### `src/collectors/config/municipalities.ts`
**Status**: Define lista estática de municípios
**Impacto**: Baixo - pode continuar existindo para referência de códigos IBGE

#### `src/collectors/sources/*.ts` (8 coletores)
**Status**: Importam `TOCANTINS_MUNICIPALITIES`
**Impacto**: Baixo para coleta, Alto para inserção

**Coletores afetados**:
1. `AtlasBrasilCollector.ts`
2. `ComexStatCollector.ts`
3. `DataSUSCollector.ts`
4. `IBGESidraCollector.ts`
5. `INEPCollector.ts`
6. `MapBiomasCollector.ts`
7. `SICONFICollector.ts`
8. `SNISCollector.ts`

**O que cada um precisa**:
- ✅ Continuar usando `TOCANTINS_MUNICIPALITIES` para obter códigos IBGE
- ✅ Continuar usando `municipality_ibge` ao chamar APIs externas
- ❌ ATUALIZAR lógica de inserção para converter `ibge_code` → `territory_id`
- ❌ ADICIONAR campos `aggregation_method` e `is_aggregated`

---

### 2.4 Frontend Components (12 arquivos)

#### `src/dashboard/components/controls/TerritorySelector.tsx`
**Status**: Selector de município/microrregião
**Impacto**: Alto

**Atual**:
```tsx
import type { Municipality, Microregion } from '@/types';

// Componente permite selecionar município ou microrregião
// Retorna municipality_id
```

**Deve ser atualizado para**:
```tsx
import type { Territory } from '@/types';

// Componente permite selecionar qualquer tipo de território
// Pode filtrar por type: 'municipio' | 'microrregiao' | etc.
// Retorna territory_id
```

#### `src/dashboard/components/map/TocantinsMap.tsx`
**Status**: Mapa de municípios
**Impacto**: Médio

#### `src/dashboard/components/chat/ChatPanel.tsx`
**Status**: Chat que usa contexto de município
**Impacto**: Médio

#### `src/dashboard/hooks/useChartData.ts`
**Status**: Hook para dados de municípios
**Impacto**: Médio

#### Outros componentes (8 arquivos)
- `src/dashboard/app/analises/page.tsx`
- `src/dashboard/components/layout/Sidebar.tsx`
- `src/dashboard/components/tabs/ComparisonTab.tsx`
- `src/dashboard/hooks/useTerritory.ts`
- `src/dashboard/lib/api.ts`

---

### 2.5 Agents (8 arquivos)

#### `src/agents/dimensional/*.ts` (4 agentes)
**Status**: Usam views de compatibilidade
**Impacto**: Baixo - podem continuar usando views

**Agentes**:
1. `EconAgent.ts`
2. `SocialAgent.ts`
3. `TerraAgent.ts`
4. `AmbientAgent.ts`

**Queries atuais** (exemplo):
```typescript
// Provavelmente usa v_latest_indicators
const indicators = await supabase
  .from('v_latest_indicators')
  .select('*')
  .eq('municipality_id', municipalityId);  // ❌ Pode falhar se view não tiver municipality_id
```

**Deve ser atualizado para**:
```typescript
const indicators = await supabase
  .from('indicator_values')
  .select(`
    *,
    territory:territories!territory_id(id, name, ibge_code, type)
  `)
  .eq('territory_id', territoryId);
```

#### `src/agents/orchestrator/Orchestrator.ts`
**Status**: Orquestrador de agentes
**Impacto**: Médio

#### `src/agents/base/BaseAgent.ts`
**Status**: Classe base
**Impacto**: Médio

---

### 2.6 Database Seeds (4 arquivos)

#### `src/database/seeds/regions.ts`
**Status**: Seed de municípios/regiões antigos
**Impacto**: Baixo - já substituído pela Migration 009

#### Outras migrations antigas
- `src/database/migrations/001_create_regions.sql` - Obsoleta
- `src/database/seeds/002_sample_analyses.sql` - Usa municipality_id
- `src/database/seeds/003_indicator_metadata_history.sql`

---

## 3. Análise por Camada

### 3.1 Camada de Persistência (Supabase)

**Status**: ✅ Migration 009 completa

**Views de compatibilidade disponíveis**:
```sql
-- Funcionam para SELECT apenas
v_municipalities_compat      -- Emula municipalities table
v_microregions_summary       -- Agregações de microregiões
v_municipalities_full        -- Join de dados completos
v_latest_indicators          -- Provavelmente usa municipality_id (?)

-- Views de hierarquia (NOVO schema)
v_hierarchy_antiga           -- Hierarquia divisão antiga
v_hierarchy_nova             -- Hierarquia divisão nova
```

**Compatibilidade**:
- ✅ **SELECTs**: Views de compatibilidade funcionam
- ❌ **INSERTs**: DEVEM usar tabela `territories` e `territory_id`
- ❌ **Constraint**: Mudou de `(indicator_id, municipality_id, year, month)` para `(indicator_id, territory_id, year, month)`

---

### 3.2 Camada de API (Express)

**Status**: ⚠️ Funciona com views, mas deve ser refatorado

**Endpoints atuais**:
- `/api/municipalities` - Funciona com `v_municipalities_full`
- `/api/municipalities/:id/indicators` - Usa `municipality_id` em WHERE

**Problemas**:
1. API expõe conceito antigo de "municipality" apenas
2. Não permite consultar outros tipos de território (microrregiões, mesorregiões, etc.)
3. Cliente frontend fica preso ao schema antigo

**Benefícios de refatorar**:
- API se torna mais flexível (qualquer tipo de território)
- Frontend pode exibir indicadores para microregiões, estados, etc.
- Preparado para agregações futuras

---

### 3.3 Camada de Coleta (Collectors)

**Status**: ⚠️ Funciona para coleta, falha para inserção

**Fluxo atual**:
```
1. Collector busca dados de API externa (IBGE, INEP, etc.)
2. API externa espera código IBGE (6 dígitos)
3. Collector retorna CollectionResult com municipality_ibge
4. Sistema insere no banco...
   ❌ PROBLEMA: Como converte ibge_code → territory_id?
   ❌ PROBLEMA: Como define aggregation_method?
```

**Fluxo correto**:
```
1. Collector busca dados de API externa (IBGE, INEP, etc.)
2. API externa espera código IBGE (6 dígitos) ✅
3. Collector retorna CollectionResult com municipality_ibge ✅
4. Sistema faz lookup: ibge_code → territory_id
5. Sistema insere com territory_id, aggregation_method='raw', is_aggregated=false ✅
```

**Onde está o INSERT atualmente?**
- Provavelmente em `src/collectors/index.ts` ou em cada coletor
- Precisa ser identificado e atualizado

---

### 3.4 Camada de Apresentação (React)

**Status**: ⚠️ Funciona com API antiga

**Componentes afetados**:
- `TerritorySelector`: Seleção de município/microrregião
- `TocantinsMap`: Mapa de municípios
- `ChatPanel`: Chat com contexto de município
- `ComparisonTab`: Comparação entre municípios

**Impacto da migração**:
- Componentes devem aceitar `territory_id` em vez de `municipality_id`
- TerritorySelector pode permitir seleção de qualquer tipo (não só município)
- Mapa pode exibir diferentes níveis de agregação

---

## 4. Estratégias de Migração

### Estratégia 1: Retrocompatibilidade Temporária (CONSERVADORA)

**Abordagem**: Manter ambas as interfaces por período de transição

**Implementação**:
1. ✅ Manter API `/api/municipalities` funcionando com views
2. ✅ Adicionar novos campos aos types (municipality_id E territory_id)
3. ✅ Collectors fazem INSERT com ambos os campos (período de coexistência)
4. ✅ Frontend continua usando municipality_id
5. ⏳ Após 2-3 meses, deprecar municipality_id

**Exemplo de type atualizado**:
```typescript
export interface IndicatorValue {
  id: string;
  indicator_id: string;

  // Retrocompatibilidade
  municipality_id?: string;  // @deprecated - Usar territory_id

  // Novo schema
  territory_id: string;

  year: number;
  month?: number;
  value: number;
  aggregation_method: string;
  is_aggregated: boolean;
  // ...
}
```

**Prós**:
- ✅ Baixo risco de quebra
- ✅ Transição gradual
- ✅ Rollback fácil

**Contras**:
- ❌ Duplicação de código
- ❌ Confusão sobre qual campo usar
- ❌ Debt técnico temporário
- ❌ Migration 009 já garante coexistência no DB por 2 meses

---

### Estratégia 2: Refatoração Completa Imediata (AGRESSIVA)

**Abordagem**: Atualizar todo o código de uma vez

**Implementação**:
1. ❌ Renomear `/api/municipalities` → `/api/territories`
2. ❌ Atualizar todos os types para usar `territory_id`
3. ❌ Refatorar todos os collectors
4. ❌ Atualizar todo o frontend
5. ❌ Testar e deploy simultâneo de todas as camadas

**Exemplo**:
```typescript
export interface IndicatorValue {
  id: string;
  indicator_id: string;
  territory_id: string;      // Apenas territory_id
  year: number;
  value: number;
  aggregation_method: string;
  is_aggregated: boolean;
}
```

**Prós**:
- ✅ Código limpo e consistente
- ✅ Sem debt técnico
- ✅ Aproveita todas as features do novo schema imediatamente

**Contras**:
- ❌ Alto risco de quebra
- ❌ Deploy complexo (todas as camadas sincronizadas)
- ❌ Rollback difícil
- ❌ Pode quebrar features existentes

---

### Estratégia 3: Rotas Paralelas (RECOMENDADA) 🏆

**Abordagem**: Criar novas rotas `/api/territories` ao lado das antigas

**Implementação**:
1. ✅ Manter `/api/municipalities` (views de compatibilidade)
2. ✅ Criar `/api/territories` (novo schema)
3. ✅ Atualizar types para incluir ambos os campos
4. ✅ Collectors inserem com territory_id (campos novos)
5. ✅ Frontend migra gradualmente para `/api/territories`
6. ⏳ Após validação (1-2 meses), deprecar rotas antigas

**Estrutura de rotas**:
```
API ANTIGA (compatibilidade por 2-3 meses):
GET /api/municipalities
GET /api/municipalities/:id
GET /api/municipalities/:id/indicators

API NOVA (território unificado):
GET /api/territories?type=municipio
GET /api/territories/:id
GET /api/territories/:id/indicators
```

**Exemplo de implementação**:
```typescript
// src/api/routes/territories.ts (NOVO arquivo)
router.get('/', async (req, res) => {
  const { type, search, limit = 200 } = req.query;

  let query = supabase
    .from('territories')
    .select('*')
    .order('name');

  if (type) {
    query = query.eq('type', type);  // Filtrar por tipo
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query.limit(Number(limit));
  res.json({ count: data?.length, territories: data });
});

router.get('/:id/indicators', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('indicator_values')
    .select(`
      *,
      indicator:indicator_definitions(id, code, name, unit),
      territory:territories(id, name, ibge_code, type)
    `)
    .eq('territory_id', id)  // Usa territory_id
    .order('year', { ascending: false });

  res.json({ territory_id: id, indicators: data });
});
```

**Types atualizados**:
```typescript
// src/shared/types/indicators.ts
export interface IndicatorValue {
  id: string;
  indicator_id: string;

  // Suporte a ambos durante transição
  municipality_id?: string;  // @deprecated Remover em v2.0
  territory_id: string;

  year: number;
  month?: number;
  value: number;

  // Novos campos
  aggregation_method: 'raw' | 'sum' | 'avg' | 'weighted_avg' | 'median' | 'min' | 'max';
  is_aggregated: boolean;

  // Metadados
  data_quality: 'official' | 'estimated' | 'unavailable';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Territory {
  id: string;
  type: 'estado' | 'mesorregiao' | 'microrregiao' | 'regiao_intermediaria' | 'regiao_imediata' | 'municipio';
  ibge_code: string;
  name: string;
  division_scheme?: 'antiga' | 'nova';
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Prós**:
- ✅ Baixo risco - rotas antigas continuam funcionando
- ✅ Frontend migra no seu ritmo
- ✅ Testagem incremental
- ✅ Rollback por rota (se nova rota falhar, antiga continua)
- ✅ Aproveita features do novo schema progressivamente

**Contras**:
- ⚠️ Código duplicado temporariamente (2-3 meses)
- ⚠️ Precisa manter ambas as rotas sincronizadas

---

## 5. Plano de Implementação Recomendado

### 📋 Estratégia: Rotas Paralelas (Estratégia 3)

### Fase 1: Fundação (Semana 1)

**1.1 Atualizar Types TypeScript**
- [ ] `src/shared/types/indicators.ts`:
  - Adicionar `territory_id: string`
  - Adicionar `aggregation_method` e `is_aggregated`
  - Manter `municipality_id?: string` como deprecated
- [ ] `src/shared/types/territories.ts` (NOVO):
  - Criar `Territory` interface
  - Criar `TerritoryRelationship` interface
  - Criar `TerritoryType` enum
- [ ] `src/dashboard/types/index.ts`:
  - Exportar novos types
  - Manter types antigos com `@deprecated`

**1.2 Criar Nova API de Territórios**
- [ ] `src/api/routes/territories.ts` (NOVO):
  - `GET /api/territories` - Lista territórios (com filtro por type)
  - `GET /api/territories/:id` - Detalhes de território
  - `GET /api/territories/:id/indicators` - Indicadores do território
  - `GET /api/territories/:id/hierarchy` - Hierarquia (pais/filhos)
  - `GET /api/territories/compare` - Comparação entre territórios
- [ ] `src/api/server.ts`:
  - Registrar nova rota `territoriesRouter`
  - Manter `municipalityRouter` por compatibilidade

**1.3 Atualizar Collectors**
- [ ] `src/collectors/base/BaseCollector.ts`:
  - Adicionar método `convertIbgeCodeToTerritoryId()`
  - Atualizar `CollectionResult` para incluir campos novos
- [ ] `src/collectors/index.ts`:
  - Atualizar lógica de INSERT para usar `territory_id`
  - Adicionar `aggregation_method='raw'` e `is_aggregated=false`
  - Fazer lookup de `ibge_code` → `territory_id` antes do INSERT

**Exemplo de atualização**:
```typescript
// src/collectors/base/BaseCollector.ts
protected async convertIbgeCodeToTerritoryId(ibgeCode: string): Promise<string | null> {
  const { data, error } = await this.supabase
    .from('territories')
    .select('id')
    .eq('ibge_code', ibgeCode)
    .eq('type', 'municipio')
    .single();

  if (error || !data) {
    this.addError(`Failed to convert IBGE code ${ibgeCode} to territory_id: ${error?.message}`);
    return null;
  }

  return data.id;
}

// src/collectors/index.ts
async function insertIndicatorValues(results: CollectionResult[]) {
  for (const result of results) {
    // Converter ibge_code → territory_id
    const territoryId = await convertIbgeCodeToTerritoryId(result.municipality_ibge);

    if (!territoryId) {
      console.error(`Skipping insert: territory not found for IBGE code ${result.municipality_ibge}`);
      continue;
    }

    // INSERT com novo schema
    const { error } = await supabase
      .from('indicator_values')
      .insert({
        indicator_id: result.indicator_id,
        territory_id: territoryId,           // NOVO
        year: result.year,
        month: result.month,
        value: result.value,
        aggregation_method: 'raw',           // NOVO
        is_aggregated: false,                // NOVO
        data_quality: result.data_quality,
        notes: result.notes
      });
  }
}
```

---

### Fase 2: Backend (Semana 2)

**2.1 Testar Nova API**
- [ ] Criar testes unitários para `/api/territories`
- [ ] Validar que retorna municípios corretamente (`type=municipio`)
- [ ] Validar que retorna microrregiões (`type=microrregiao`)
- [ ] Testar hierarquia (pais/filhos)
- [ ] Testar comparação entre territórios

**2.2 Validar Collectors**
- [ ] Executar collectors em ambiente de staging
- [ ] Validar INSERTs em `indicator_values` com `territory_id`
- [ ] Validar que `aggregation_method` e `is_aggregated` estão corretos
- [ ] Verificar que dados históricos com `municipality_id` ainda são acessíveis

**2.3 Documentação**
- [ ] Atualizar API docs (OpenAPI/Swagger)
- [ ] Criar guia de migração para desenvolvedores
- [ ] Documentar deprecation timeline (3 meses)

---

### Fase 3: Frontend (Semanas 3-4)

**3.1 Criar Hook useTerritory V2**
- [ ] `src/dashboard/hooks/useTerritory.ts`:
  - Atualizar para usar `/api/territories`
  - Suportar seleção de qualquer tipo de território
  - Manter hook antigo como deprecated

**3.2 Atualizar Componentes Principais**
- [ ] `src/dashboard/components/controls/TerritorySelector.tsx`:
  - Aceitar prop `types` para filtrar tipos de território
  - Retornar `territory_id` em vez de `municipality_id`
  - Manter prop `municipalityId` deprecated por compatibilidade
- [ ] `src/dashboard/components/map/TocantinsMap.tsx`:
  - Atualizar para trabalhar com territories
  - Suportar exibição de diferentes níveis (município, microrregião)

**3.3 Atualizar Páginas**
- [ ] `src/dashboard/app/analises/page.tsx`:
  - Usar novo hook `useTerritory`
  - Atualizar queries para usar `territory_id`
- [ ] Outras páginas que usam município

---

### Fase 4: Validação e Monitoramento (Semana 5)

**4.1 Testes End-to-End**
- [ ] Fluxo completo: Seleção de território → Visualização de indicadores
- [ ] Comparação entre territórios
- [ ] Coleta de dados → INSERT → Visualização
- [ ] Performance (queries com territory_id vs municipality_id)

**4.2 Deploy Gradual**
- [ ] Deploy backend (nova API + coletores atualizados)
- [ ] Monitorar logs por 48h
- [ ] Deploy frontend (novos componentes)
- [ ] Monitorar métricas de uso

**4.3 Comunicação**
- [ ] Anunciar nova API para equipe
- [ ] Marcar API antiga como deprecated (headers HTTP)
- [ ] Estabelecer data de sunset (3 meses)

---

### Fase 5: Deprecação (Mês 3-4)

**5.1 Remover Código Antigo**
- [ ] Remover `/api/municipalities` (após validar que não tem mais uso)
- [ ] Remover `municipality_id` dos types
- [ ] Remover views de compatibilidade (coordenar com DBA)
- [ ] Limpar imports e types deprecated

**5.2 Cleanup no Banco**
- [ ] Migration para remover coluna `municipality_id` de `indicator_values`
- [ ] Remover views de compatibilidade antigas
- [ ] Reindexar tabelas se necessário

---

## 6. Riscos e Mitigações

### Risco 1: Dados históricos inacessíveis

**Descrição**: Indicadores antigos com `municipality_id` podem ficar inacessíveis após remoção da coluna.

**Probabilidade**: Baixa
**Impacto**: Alto

**Mitigação**:
- ✅ Migration 009 já garante coexistência de ambas as colunas por 2 meses
- ✅ Backfill: Popular `territory_id` em todos os registros antigos antes de remover `municipality_id`
- ✅ Backup completo antes de qualquer remoção

**Query de backfill**:
```sql
-- Popular territory_id em registros antigos
UPDATE indicator_values iv
SET territory_id = (
  SELECT t.id
  FROM territories t
  JOIN municipalities m ON m.ibge_code = t.ibge_code
  WHERE m.id = iv.municipality_id
  AND t.type = 'municipio'
)
WHERE territory_id IS NULL AND municipality_id IS NOT NULL;
```

---

### Risco 2: Frontend quebra ao usar nova API

**Descrição**: Componentes podem quebrar se API retornar estrutura diferente.

**Probabilidade**: Média
**Impacto**: Alto

**Mitigação**:
- ✅ Testes de integração antes do deploy
- ✅ Feature flags para habilitar nova API gradualmente
- ✅ Rollback rápido (nova API é adicional, não substitui)
- ✅ Monitoramento de erros (Sentry, Datadog)

---

### Risco 3: Performance degradada

**Descrição**: Queries com `territory_id` podem ser mais lentas que com `municipality_id`.

**Probabilidade**: Baixa
**Impacto**: Médio

**Mitigação**:
- ✅ Índices já criados na Migration 009:
  ```sql
  CREATE INDEX idx_indicator_values_territory_id ON indicator_values(territory_id);
  CREATE INDEX idx_indicator_values_lookup ON indicator_values(indicator_id, territory_id, year, month);
  ```
- ✅ Benchmarking antes e depois
- ✅ EXPLAIN ANALYZE em queries críticas

---

### Risco 4: Collectors falham ao converter ibge_code → territory_id

**Descrição**: Se território não for encontrado para um código IBGE, INSERT falha.

**Probabilidade**: Média
**Impacto**: Alto

**Mitigação**:
- ✅ Validação: Todos os 139 municípios do TO estão em `territories`
- ✅ Logs detalhados quando conversão falhar
- ✅ Fallback: Criar território automaticamente se não existir
- ✅ Monitoramento de taxa de sucesso de INSERTs

**Query de validação**:
```sql
-- Verificar que todos os municípios existem em territories
SELECT m.ibge_code, m.name
FROM municipalities m
LEFT JOIN territories t ON t.ibge_code = m.ibge_code AND t.type = 'municipio'
WHERE t.id IS NULL;
-- Deve retornar 0 linhas
```

---

### Risco 5: Confusão entre municipality_id e territory_id

**Descrição**: Desenvolvedores podem usar campo errado durante período de transição.

**Probabilidade**: Alta
**Impacto**: Médio

**Mitigação**:
- ✅ Documentação clara sobre qual campo usar
- ✅ Comentários `@deprecated` em types
- ✅ Linter rules (ESLint) para avisar sobre uso de campos deprecated
- ✅ Code review rigoroso

**Exemplo de ESLint rule**:
```json
{
  "rules": {
    "no-deprecated-api": [
      "warn",
      {
        "deprecated": ["municipality_id"]
      }
    ]
  }
}
```

---

## 7. Checklist de Validação

Antes de considerar a migração completa:

### Backend
- [ ] Nova API `/api/territories` retorna dados corretos
- [ ] Endpoints antigos `/api/municipalities` ainda funcionam
- [ ] Collectors inserem com `territory_id`, `aggregation_method`, `is_aggregated`
- [ ] Conversão `ibge_code` → `territory_id` tem taxa de sucesso 100%
- [ ] Performance das queries com `territory_id` é aceitável (<100ms)

### Frontend
- [ ] Componentes funcionam com `territory_id`
- [ ] TerritorySelector permite seleção de diferentes tipos
- [ ] Mapa exibe territórios corretamente
- [ ] Chat funciona com contexto de território
- [ ] Nenhum erro no console do navegador

### Dados
- [ ] Todos os registros em `indicator_values` têm `territory_id`
- [ ] Backfill de dados históricos completo
- [ ] Queries com JOINs em territories funcionam
- [ ] Views de compatibilidade funcionam (durante período de transição)

### Documentação
- [ ] API docs atualizados (OpenAPI/Swagger)
- [ ] Guia de migração para desenvolvedores criado
- [ ] README atualizado com novo schema
- [ ] Changelog atualizado

---

## 8. Próximos Passos

### Decisão Necessária

**Pergunta para o time**: Qual estratégia de migração preferimos?

1. **Estratégia 1**: Retrocompatibilidade Temporária (conservadora)
2. **Estratégia 2**: Refatoração Completa Imediata (agressiva)
3. **Estratégia 3**: Rotas Paralelas (recomendada) 🏆

### Após Decisão

Se **Estratégia 3** for escolhida:
1. Criar issues no GitHub para cada fase
2. Estimar esforço (story points)
3. Priorizar no sprint planning
4. Começar pela Fase 1 (Fundação)

---

## 9. Recursos Adicionais

### Documentos Relacionados
- `/supabase/migrations/009_territories_schema.sql` - Migration original
- `/docs/guides/workflow-refactoring-plan.md` - Refatoração dos workflows n8n
- `/n8n/MIGRATION_GUIDE.md` - Guia para workflows n8n

### Queries Úteis

**Verificar dados com territory_id**:
```sql
SELECT
  COUNT(*) as total,
  COUNT(territory_id) as with_territory_id,
  COUNT(municipality_id) as with_municipality_id,
  COUNT(*) FILTER (WHERE territory_id IS NULL AND municipality_id IS NOT NULL) as needs_backfill
FROM indicator_values;
```

**Listar territórios por tipo**:
```sql
SELECT type, COUNT(*) as count
FROM territories
GROUP BY type
ORDER BY type;
```

**Hierarquia de um território**:
```sql
SELECT
  child.name as child_name,
  child.type as child_type,
  parent.name as parent_name,
  parent.type as parent_type,
  tr.relationship_type
FROM territory_relationships tr
JOIN territories child ON child.id = tr.child_territory_id
JOIN territories parent ON parent.id = tr.parent_territory_id
WHERE child.id = 'uuid-here';
```

---

**Fim do documento**
