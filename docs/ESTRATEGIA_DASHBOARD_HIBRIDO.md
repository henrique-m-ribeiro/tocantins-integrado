# Estratégia de Implementação: Arquitetura Híbrida
## Fase 2 - Plano Detalhado de Integração

**Projeto:** Tocantins Integrado
**Estratégia:** Opção C - Arquitetura Híbrida
**Aprovado por:** CEO (Henrique M. Ribeiro)
**Executor:** Dev Team (Claude Code)
**Data:** 2026-01-08

---

## 1. Visão Geral da Estratégia

### 1.1 Objetivo

Integrar as funcionalidades avançadas do `framework-v6-mvp` no dashboard `tocantins-integrado`, **mantendo a base Next.js** e **portando componentes incrementalmente**.

### 1.2 Princípios da Arquitetura Híbrida

✅ **MANTER:**
- Next.js 14 (App Router, SSR)
- API robusta existente (`lib/api.ts`)
- Integração com backend separado (`src/api/`)
- Supabase e n8n funcionando

✅ **ADICIONAR:**
- Sistema de tabs dimensionais (6 tabs)
- shadcn/ui (componentes profissionais)
- Componentes avançados (KPICard, DataTable, etc.)
- Hooks customizados (formatters, metadata)
- Funcionalidades extras (comparação, export)

❌ **NÃO FAZER:**
- Migrar para React/Vite
- Reescrever API ou backend
- Alterar integrações com agentes/coletores
- Mudar estrutura de banco de dados

---

## 2. Arquitetura Final Proposta

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TOCANTINS INTEGRADO (HÍBRIDO)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CAMADA DE INTERFACE (Next.js)             │   │
│  │                                                              │   │
│  │  app/page.tsx (Dashboard Principal)                         │   │
│  │      ↓                                                       │   │
│  │  ┌────────────────────────────────────────────────────┐     │   │
│  │  │          SISTEMA DE TABS DIMENSIONAIS              │     │   │
│  │  │  ┌──────────┬──────────┬──────────┬──────────┐    │     │   │
│  │  │  │ Overview │ Economic │  Social  │Territorial│    │     │   │
│  │  │  └──────────┴──────────┴──────────┴──────────┘    │     │   │
│  │  │  ┌──────────┬──────────┐                          │     │   │
│  │  │  │ Environ  │Comparison│                          │     │   │
│  │  │  └──────────┴──────────┘                          │     │   │
│  │  └────────────────────────────────────────────────────┘     │   │
│  │      ↓                                                       │   │
│  │  ┌────────────────────────────────────────────────────┐     │   │
│  │  │       COMPONENTES HÍBRIDOS (Fonte + Atual)        │     │   │
│  │  │  • KPICard (Fonte)                                │     │   │
│  │  │  • DataTable (Fonte)                              │     │   │
│  │  │  • AIAnalysisBox (Fonte)                          │     │   │
│  │  │  • TerritorySelector (Fonte, adaptado)            │     │   │
│  │  │  • TocantinsMap (Atual, mantido)                  │     │   │
│  │  │  • ChatPanel (Atual, melhorado)                   │     │   │
│  │  └────────────────────────────────────────────────────┘     │   │
│  │      ↓                                                       │   │
│  │  ┌────────────────────────────────────────────────────┐     │   │
│  │  │         shadcn/ui (Radix UI Primitives)            │     │   │
│  │  │  Card | Select | Dialog | Tabs | Tooltip | ...    │     │   │
│  │  └────────────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              CAMADA DE DADOS (API Client)                    │   │
│  │                                                              │   │
│  │  lib/api.ts (Atual, robusto) + Adaptadores                  │   │
│  │      ↓                                                       │   │
│  │  hooks/ (Formatters, Metadata)                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          ↓                                           │
├─────────────────────────────────────────────────────────────────────┤
│                   BACKEND EXISTENTE (Não alterar)                   │
│  • src/api/ (Express)                                               │
│  • src/agents/ (Agentes dimensionais)                               │
│  • src/collectors/ (Coletores de dados)                             │
│  • n8n/workflows/ (Orquestração)                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Estrutura de Diretórios Final

```
src/dashboard/
├── app/
│   ├── page.tsx               # Dashboard principal com sistema de tabs
│   ├── layout.tsx             # Layout global (manter)
│   ├── providers.tsx          # React Query + Theme provider
│   ├── globals.css            # Estilos globais (adicionar shadcn)
│   └── [municipio]/           # Página de detalhes (futuro)
│
├── components/
│   ├── tabs/                  # ← NOVO: Sistema de tabs dimensionais
│   │   ├── OverviewTab.tsx
│   │   ├── EconomicTab.tsx
│   │   ├── SocialTab.tsx
│   │   ├── TerritorialTab.tsx
│   │   ├── EnvironmentalTab.tsx
│   │   └── ComparisonTab.tsx
│   │
│   ├── controls/              # ← NOVO: Controles avançados
│   │   ├── TerritorySelector.tsx
│   │   └── PeriodSelector.tsx
│   │
│   ├── shared/                # ← NOVO: Componentes compartilhados
│   │   ├── KPICard.tsx
│   │   ├── AIAnalysisBox.tsx
│   │   └── DataTable.tsx
│   │
│   ├── ui/                    # ← NOVO: shadcn/ui components
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (10-15 componentes)
│   │
│   ├── layout/                # Existente (adaptar)
│   │   ├── Header.tsx         # Adaptar para incluir controles
│   │   ├── Sidebar.tsx        # Manter ou remover (decidir)
│   │   └── TabNavigation.tsx  # ← NOVO: Navegação de tabs
│   │
│   ├── map/                   # Existente (manter)
│   │   └── TocantinsMap.tsx
│   │
│   ├── chat/                  # Existente (melhorar)
│   │   └── ChatPanel.tsx      # Adicionar contexto por tab
│   │
│   ├── municipality/          # Existente (integrar com tabs)
│   │   └── MunicipalityPanel.tsx
│   │
│   ├── stats/                 # Existente (mover para OverviewTab)
│   │   └── StatsOverview.tsx
│   │
│   └── indicators/            # Existente (manter)
│       └── IndicatorHistoryChart.tsx
│
├── hooks/                     # ← NOVO: Hooks customizados
│   ├── useIndicatorFormatter.ts
│   ├── useIndicatorMetadata.ts
│   └── use-toast.ts
│
├── lib/
│   ├── api.ts                 # Existente (estender)
│   ├── formatters.ts          # ← NOVO: Funções de formatação
│   └── utils.ts               # shadcn utils
│
├── package.json               # Atualizar dependências
├── tailwind.config.ts         # Configurar shadcn
├── components.json            # ← NOVO: Configuração shadcn
└── tsconfig.json              # Ajustar se necessário
```

---

## 3. Plano de Implementação em Fases

### 3.1 Fase 3.1: Setup e Infraestrutura (2-3 dias)

**Objetivo:** Preparar ambiente para novos componentes

**Tarefas:**
1. ✅ Instalar shadcn/ui
   ```bash
   npx shadcn-ui@latest init
   ```

2. ✅ Configurar `components.json`
   ```json
   {
     "style": "default",
     "tailwind": {
       "config": "tailwind.config.ts",
       "css": "app/globals.css",
       "baseColor": "slate"
     },
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils"
     }
   }
   ```

3. ✅ Adicionar componentes shadcn essenciais
   ```bash
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add tooltip
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add separator
   ```

4. ✅ Criar estrutura de diretórios
   ```bash
   mkdir -p components/{tabs,controls,shared,ui}
   mkdir -p hooks
   ```

5. ✅ Atualizar `package.json` com novas dependências
   - class-variance-authority
   - tailwind-merge
   - tailwindcss-animate
   - (opcional) framer-motion, next-themes

**Critério de sucesso:** Ambiente configurado, shadcn funcionando

---

### 3.2 Fase 3.2: Componentes Base (3-4 dias)

**Objetivo:** Portar componentes fundamentais da Fonte

**Prioridade 1: Hooks e Utilitários**
1. ✅ `hooks/useIndicatorFormatter.ts`
2. ✅ `hooks/useIndicatorMetadata.ts`
3. ✅ `lib/formatters.ts`

**Prioridade 2: Componentes Compartilhados**
4. ✅ `components/shared/KPICard.tsx`
   - Adaptar para usar API atual
   - Testar com dados de Palmas

5. ✅ `components/shared/AIAnalysisBox.tsx`
   - Adaptar markdown rendering
   - Integrar com análises pré-computadas

6. ✅ `components/controls/TerritorySelector.tsx`
   - Adaptar para API atual (`/api/municipalities`)
   - Mapear tipos (Estado/Município/Microregião)

7. ✅ `components/controls/PeriodSelector.tsx`
   - Componente simples, copiar diretamente

**Critério de sucesso:** Componentes base funcionando isoladamente

---

### 3.3 Fase 3.3: Sistema de Tabs (4-5 dias)

**Objetivo:** Implementar estrutura dimensional com tabs

**Passo 1: Criar TabNavigation**
1. ✅ `components/layout/TabNavigation.tsx`
   - Usar shadcn/ui `Tabs`
   - 6 tabs: Overview, Economic, Social, Territorial, Environmental, Comparison
   - Estado de tab ativo

**Passo 2: Criar tabs básicas (conteúdo placeholder)**
2. ✅ `components/tabs/OverviewTab.tsx`
3. ✅ `components/tabs/EconomicTab.tsx`
4. ✅ `components/tabs/SocialTab.tsx`
5. ✅ `components/tabs/TerritorialTab.tsx`
6. ✅ `components/tabs/EnvironmentalTab.tsx`
7. ✅ `components/tabs/ComparisonTab.tsx`

**Passo 3: Integrar tabs no `app/page.tsx`**
8. ✅ Refatorar `app/page.tsx` para incluir sistema de tabs
9. ✅ Integrar TerritorySelector e PeriodSelector no Header
10. ✅ Passar contexto (territoryId, period) para tabs

**Critério de sucesso:** Sistema de tabs navegável, conteúdo placeholder exibindo

---

### 3.4 Fase 3.4: Populando Tabs com Conteúdo (5-6 dias)

**Objetivo:** Implementar conteúdo real em cada tab

**OverviewTab (2 dias)**
- ✅ Visão geral do território
- ✅ KPIs principais (População, PIB, IDEB, etc.)
- ✅ Mapa interativo (reusar `TocantinsMap`)
- ✅ Resumo por dimensão
- ✅ Análises recentes

**EconomicTab (1 dia)**
- ✅ KPIs econômicos (PIB, PIB per capita, Receitas, Despesas)
- ✅ Gráficos de evolução temporal
- ✅ Análises econômicas pré-computadas

**SocialTab (1 dia)**
- ✅ KPIs sociais (IDEB, Mortalidade, Cobertura ESF)
- ✅ Gráficos de indicadores sociais
- ✅ Análises sociais pré-computadas

**TerritorialTab (1 dia)**
- ✅ Dados territoriais
- ✅ Mapa destacado
- ✅ Informações geográficas

**EnvironmentalTab (1 dia)**
- ✅ Indicadores ambientais (quando disponíveis)
- ✅ Cobertura vegetal (MapBiomas)
- ✅ Análises ambientais

**ComparisonTab (2 dias - opcional)**
- ⚠️ Comparação entre múltiplos territórios
- ⚠️ Requer endpoint de comparação no backend (futuro)
- ⚠️ Pode ser deixado para versão posterior

**Critério de sucesso:** Todas as tabs com conteúdo real e funcional

---

### 3.5 Fase 3.5: Componentes Avançados (3-4 dias)

**Objetivo:** Adicionar funcionalidades extras

**DataTable (2 dias)**
1. ✅ `components/shared/DataTable.tsx`
2. ✅ Sorting, filtering, pagination
3. ✅ Usar em tabs para listar indicadores

**Funcionalidades extras (2 dias)**
4. ✅ Export/Share (botões no Header)
5. ✅ Reset (voltar ao estado inicial)
6. ✅ Dark mode (opcional, next-themes)

**Melhorias no ChatPanel**
7. ✅ Contexto dinâmico baseado em tab ativa
8. ✅ Mensagem inicial diferente por dimensão

**Critério de sucesso:** Funcionalidades extras implementadas e testadas

---

### 3.6 Fase 3.6: Polimento e Testes (2-3 dias)

**Objetivo:** Garantir qualidade e consistência

**Tarefas:**
1. ✅ Revisar responsividade (mobile, tablet, desktop)
2. ✅ Testar navegação entre tabs
3. ✅ Testar com múltiplos municípios
4. ✅ Verificar performance (lazy loading se necessário)
5. ✅ Revisar acessibilidade (aria-labels, keyboard navigation)
6. ✅ Documentar componentes novos
7. ✅ Atualizar README.md

**Critério de sucesso:** Dashboard funcionando perfeitamente, sem bugs críticos

---

## 4. Componentes a Portar (Detalhado)

### 4.1 Prioridade Alta (Críticos)

| Componente | Fonte | Esforço | Dependências | Adaptações Necessárias |
|------------|-------|---------|--------------|------------------------|
| **TabNavigation** | Layout | Baixo | shadcn/ui Tabs | Adaptar para Next.js |
| **TerritorySelector** | Controls | Médio | shadcn/ui Select | Mapear API `/municipalities` |
| **PeriodSelector** | Controls | Baixo | shadcn/ui Select | Copiar direto |
| **KPICard** | Shared | Baixo | shadcn/ui Card | Adaptar dados da API |
| **OverviewTab** | Tabs | Alto | KPICard, Map | Integrar com componentes existentes |
| **EconomicTab** | Tabs | Médio | KPICard, Charts | Usar API de indicadores |
| **SocialTab** | Tabs | Médio | KPICard, Charts | Usar API de indicadores |
| **useIndicatorFormatter** | Hooks | Baixo | - | Copiar direto |

### 4.2 Prioridade Média (Importantes)

| Componente | Fonte | Esforço | Dependências | Adaptações Necessárias |
|------------|-------|---------|--------------|------------------------|
| **AIAnalysisBox** | Shared | Médio | Markdown renderer | Adaptar para análises pré-computadas |
| **TerritorialTab** | Tabs | Médio | Map | Integrar TocantinsMap |
| **EnvironmentalTab** | Tabs | Médio | Charts | Adaptar para dados disponíveis |
| **DataTable** | Shared | Alto | shadcn/ui Table | Implementar sorting/filtering |

### 4.3 Prioridade Baixa (Opcionais)

| Componente | Fonte | Esforço | Dependências | Adaptações Necessárias |
|------------|-------|---------|--------------|------------------------|
| **ComparisonTab** | Tabs | Alto | Backend endpoint | Requer novo endpoint de comparação |
| **Export/Share** | Header | Baixo | - | Implementar funções simples |
| **Dark mode** | Global | Médio | next-themes | Configurar provider |

---

## 5. Guia de Migração de Componentes

### 5.1 Processo Padrão

Para cada componente da Fonte:

**1. Ler componente original**
```bash
cat /tmp/framework-v6-mvp/client/src/components/[caminho]/[Componente].tsx
```

**2. Identificar dependências**
- shadcn/ui components
- Hooks customizados
- Funções utilitárias
- APIs/endpoints

**3. Adaptar importações**
```typescript
// De (Fonte):
import { useQuery } from "@tanstack/react-query";

// Para (Atual):
import { useQuery } from "@tanstack/react-query"; // Mesmo ✅

// De (Fonte):
import type { Territory } from "@shared/schema";

// Para (Atual):
import type { Municipality } from "@/lib/api"; // Adaptar tipo
```

**4. Adaptar chamadas de API**
```typescript
// De (Fonte):
const { data: territories } = useQuery<Territory[]>({
  queryKey: ["/api/territories"],
});

// Para (Atual):
const { data: response } = useQuery({
  queryKey: ["municipalities"],
  queryFn: () => api.getMunicipalities(),
});
const municipalities = response?.municipalities || [];
```

**5. Testar isoladamente**
- Criar página de teste temporária
- Verificar renderização
- Verificar dados da API

**6. Integrar no dashboard**
- Importar no `app/page.tsx` ou tab relevante
- Passar props necessárias
- Testar navegação

### 5.2 Exemplo: Migrando TerritorySelector

**Passo 1: Ler original**
```typescript
// /tmp/framework-v6-mvp/client/src/components/controls/TerritorySelector.tsx
import { Select } from "@/components/ui/select";

export function TerritorySelector({
  territoryType,
  onTypeChange,
  territory,
  onTerritoryChange,
  territories
}) {
  // ...
}
```

**Passo 2: Adaptar para API atual**
```typescript
// src/dashboard/components/controls/TerritorySelector.tsx
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function TerritorySelector({
  territoryType, // "Estado" | "Município" | "Microregião"
  onTypeChange,
  territoryId,   // ibge_code
  onTerritoryChange
}) {
  // Buscar municípios da API atual
  const { data: response } = useQuery({
    queryKey: ["municipalities", territoryType],
    queryFn: () => api.getMunicipalities({
      // Filtrar por tipo se necessário
    }),
  });

  const territories = response?.municipalities.map(m => ({
    value: m.ibge_code,
    label: m.name,
  })) || [];

  // ... resto do componente
}
```

**Passo 3: Testar**
```typescript
// app/page.tsx (temporário)
<TerritorySelector
  territoryType="Município"
  onTypeChange={setType}
  territoryId={selectedId}
  onTerritoryChange={setSelectedId}
/>
```

### 5.3 Checklist de Migração

Para cada componente:

- [ ] Lido componente original
- [ ] Identificadas dependências
- [ ] Instaladas dependências (shadcn/ui)
- [ ] Adaptadas importações
- [ ] Adaptadas chamadas de API
- [ ] Testado isoladamente
- [ ] Integrado no dashboard
- [ ] Testado em contexto real
- [ ] Documentado (comentários)

---

## 6. Dependências a Adicionar

### 6.1 Essenciais

```json
{
  "dependencies": {
    // shadcn/ui base
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-tooltip": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

**Instalação:**
```bash
cd src/dashboard
npm install @radix-ui/react-accordion @radix-ui/react-dialog \
  @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-tabs @radix-ui/react-tooltip \
  class-variance-authority tailwind-merge tailwindcss-animate
```

### 6.2 Opcionais (Recomendados)

```json
{
  "dependencies": {
    "framer-motion": "^11.13.1",      // Animações suaves
    "next-themes": "^0.4.6",          // Dark mode
    "date-fns": "^3.6.0"              // Formatação de datas
  }
}
```

**Instalação:**
```bash
npm install framer-motion next-themes date-fns
```

---

## 7. Riscos e Mitigações

### 7.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Incompatibilidade shadcn/ui com Next.js 14** | Baixa | Alto | Testar instalação primeiro, shadcn é compatível |
| **Performance com muitos componentes** | Média | Médio | Lazy loading de tabs, code splitting |
| **Conflitos de estilo Tailwind** | Baixa | Baixo | Namespace do shadcn, usar `cn()` utility |
| **API não suporta queries dos tabs** | Média | Alto | Estender API conforme necessário |
| **Tipo de dados incompatíveis** | Média | Médio | Criar camada de adaptação/wrapper |

### 7.2 Riscos de Cronograma

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Subestimativa de esforço** | Alta | Médio | Buffer de 20% no cronograma |
| **Bloqueios por falta de dados** | Média | Médio | Mockar dados temporariamente |
| **Mudanças de requisitos** | Baixa | Alto | Aprovação formal antes de Fase 3 |

### 7.3 Riscos de Integração

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Quebrar funcionalidades existentes** | Baixa | Alto | Testes regressivos, commits incrementais |
| **Conflitos com deploy em andamento** | Média | Médio | Branch separada, merge após deploy |

---

## 8. Cronograma Sugerido

### 8.1 Estimativa Conservadora (20 dias úteis / 4 semanas)

| Fase | Duração | Dias Úteis | Entregável |
|------|---------|------------|------------|
| 3.1 Setup | 2-3 dias | Dias 1-3 | Ambiente configurado |
| 3.2 Componentes Base | 3-4 dias | Dias 4-7 | Hooks, KPICard, Selectors |
| 3.3 Sistema de Tabs | 4-5 dias | Dias 8-12 | Tabs navegáveis |
| 3.4 Populando Tabs | 5-6 dias | Dias 13-18 | Conteúdo real |
| 3.5 Componentes Avançados | 3-4 dias | Dias 19-22 | DataTable, extras |
| 3.6 Polimento | 2-3 dias | Dias 23-25 | Testes, documentação |
| **Total** | **19-25 dias** | **~4 semanas** | **Dashboard completo** |

### 8.2 Estimativa Otimista (15 dias úteis / 3 semanas)

Se houver foco total e sem bloqueios:
- Fase 3.1: 2 dias
- Fase 3.2: 3 dias
- Fase 3.3: 4 dias
- Fase 3.4: 4 dias (pular ComparisonTab)
- Fase 3.5: 2 dias (sem dark mode)
- Fase 3.6: 2 dias
- **Total: 17 dias / ~3 semanas**

### 8.3 Marcos (Milestones)

| Milestone | Data (estimada) | Critério |
|-----------|-----------------|----------|
| M1: shadcn/ui funcionando | Dia 3 | Componentes shadcn renderizando |
| M2: Primeiro tab funcional | Dia 10 | OverviewTab com dados reais |
| M3: Todos os tabs navegáveis | Dia 18 | 6 tabs com conteúdo |
| M4: Dashboard completo | Dia 25 | Pronto para produção |

---

## 9. Branch Strategy

### 9.1 Branch de Desenvolvimento

**Nome:** `feature/dashboard-hybrid-integration`

**Criação:**
```bash
git checkout main
git pull origin main
git checkout -b feature/dashboard-hybrid-integration
```

### 9.2 Commits Incrementais

**Estrutura de commits:**
```
feat(dashboard): [Fase 3.X] Descrição breve

- Detalhe 1
- Detalhe 2
- Detalhe 3
```

**Exemplo:**
```
feat(dashboard): [Fase 3.1] Configurar shadcn/ui e estrutura base

- Instalar dependências shadcn/ui
- Adicionar components.json
- Criar diretórios components/tabs, components/shared
- Instalar componentes essenciais (Card, Tabs, Select)
```

### 9.3 Pull Request

**Quando:** Após Fase 3.6 (dashboard completo)

**Título:** `feat: Integração Dashboard Framework V6 (Arquitetura Híbrida)`

**Descrição:** Incluir:
- Link para este documento de estratégia
- Link para análise comparativa (Fase 1)
- Screenshots de cada tab
- Checklist de funcionalidades implementadas
- Instruções de teste

---

## 10. Testes e Validação

### 10.1 Testes por Fase

**Fase 3.2 (Componentes Base):**
- [ ] KPICard renderiza com dados de Palmas
- [ ] TerritorySelector lista todos os municípios
- [ ] PeriodSelector funciona corretamente

**Fase 3.3 (Tabs):**
- [ ] Navegação entre tabs funciona
- [ ] Estado de tab ativa persiste
- [ ] Contexto (territoryId, period) passa para tabs

**Fase 3.4 (Conteúdo):**
- [ ] OverviewTab exibe dados reais
- [ ] EconomicTab exibe KPIs econômicos
- [ ] SocialTab exibe KPIs sociais
- [ ] Gráficos renderizam corretamente

**Fase 3.5 (Avançados):**
- [ ] DataTable com sorting funciona
- [ ] Export gera PDF/print
- [ ] ChatPanel contextual por tab

**Fase 3.6 (Polimento):**
- [ ] Responsivo em mobile, tablet, desktop
- [ ] Sem erros no console
- [ ] Performance aceitável (< 3s load)

### 10.2 Checklist de Aceitação Final

Dashboard pronto quando:

- [ ] 6 tabs navegáveis (ou 5 sem Comparison)
- [ ] TerritorySelector funcionando
- [ ] PeriodSelector funcionando
- [ ] KPIs exibindo dados reais
- [ ] Gráficos renderizando
- [ ] Mapa integrado
- [ ] ChatPanel contextual
- [ ] Análises pré-computadas exibidas
- [ ] Responsivo
- [ ] Sem bugs críticos
- [ ] Documentação atualizada

---

## 11. Aprovação e Próximos Passos

### 11.1 Checklist de Aprovação

Antes de iniciar Fase 3 (Implementação), confirmar:

- [ ] Estratégia C aprovada (✅ Aprovado)
- [ ] Cronograma aceitável (4 semanas)
- [ ] Prioridades definidas:
  - [ ] Quais tabs são essenciais? (Sugestão: Overview, Economic, Social)
  - [ ] ComparisonTab é necessário? (Sugestão: Deixar para v2)
  - [ ] Dark mode é prioritário? (Sugestão: Opcional)
- [ ] Deploy pode esperar? Ou implementar após deploy?
- [ ] Recursos disponíveis (tempo, foco)

### 11.2 Decisão Final Requerida

**CEO/CTO, preciso confirmar:**

1. **Timing:** Implementar agora ou após deploy em produção?
   - Opção A: Implementar agora (4 semanas)
   - Opção B: Deploy primeiro, depois refatorar

2. **Escopo:** Full (6 tabs) ou MVP (3 tabs)?
   - Full: Overview, Economic, Social, Territorial, Environmental, Comparison
   - MVP: Overview, Economic, Social (priorizar)

3. **Branch:** Criar nova branch `feature/dashboard-hybrid-integration`?

4. **Aprovação formal:** Este plano está aprovado para execução?

---

## 12. Conclusão

### Resumo da Estratégia

**Arquitetura Híbrida = Melhor dos dois mundos:**
- ✅ Mantém Next.js (estável, performático)
- ✅ Mantém API robusta (já funciona)
- ✅ Adiciona interface moderna (shadcn/ui)
- ✅ Adiciona estrutura dimensional (tabs)
- ✅ Risco controlado (implementação incremental)

**Cronograma:** 3-4 semanas (15-25 dias úteis)

**Próximo passo:** Aguardando sua aprovação final para iniciar Fase 3.

---

**Status:** ⏸️ **AGUARDANDO APROVAÇÃO DO CEO**

**Executor:** Dev Team (Claude Code)
**Data:** 2026-01-08
**Fase:** 2 (Estratégia) completa → Fase 3 (Implementação) pendente
