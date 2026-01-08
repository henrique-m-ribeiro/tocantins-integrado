# Relatório de Análise Comparativa: Dashboard Frameworks
## Fase 1 - Análise para Refatoração

**Projeto:** Tocantins Integrado
**Solicitante:** CEO (Henrique M. Ribeiro)
**Aprovado por:** CTO (Manus)
**Executor:** Dev Team (Claude Code)
**Data:** 2026-01-08

---

## 1. Resumo Executivo

Este relatório compara dois dashboards para definir estratégia de integração:

- **Dashboard Atual** (`tocantins-integrado/src/dashboard/`) - Next.js básico
- **Dashboard Fonte** (`framework-v6-mvp/client/`) - React/Vite completo

### Conclusão Prévia

Os dashboards têm **arquiteturas fundamentalmente diferentes**:
- **Atual:** Next.js (SSR), estrutura de páginas, API externa
- **Fonte:** React/Vite (SPA), estrutura de tabs, API integrada

**Recomendação preliminar:** Opção C (Arquitetura Híbrida) parece mais viável.

---

## 2. Análise do Dashboard Atual (tocantins-integrado)

### 2.1 Tecnologias

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | Next.js | 14.2.0 |
| React | React | 18.3.0 |
| State Management | React Query | 5.60.0 |
| Mapas | Leaflet + React Leaflet | 1.9.4 / 4.2.1 |
| Gráficos | Recharts | 2.12.0 |
| UI | Lucide Icons + Custom | - |
| Styling | Tailwind CSS | 3.4.14 |

### 2.2 Estrutura de Arquivos

```
src/dashboard/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Página principal
│   ├── layout.tsx             # Layout global
│   ├── providers.tsx          # Providers (React Query)
│   ├── analises/              # Páginas de análises
│   └── documentos/            # Páginas de documentos
├── components/
│   ├── layout/                # Header, Sidebar
│   ├── map/                   # Mapa interativo do Tocantins
│   ├── chat/                  # Chat panel
│   ├── municipality/          # Painel de detalhes do município
│   ├── stats/                 # Overview de estatísticas
│   └── indicators/            # Gráficos e tooltips de indicadores
└── lib/
    └── api.ts                 # Cliente API (completo e robusto)
```

### 2.3 Funcionalidades Principais

**✅ Implementadas:**
- Mapa interativo do Tocantins (Leaflet)
- Seleção de municípios
- Painel de detalhes do município
- Chat panel (integração com n8n)
- Overview de estatísticas
- Gráficos de indicadores (séries históricas)
- Listagem de análises pré-computadas
- Listagem de documentos para download

**⚠️ Básicas:**
- Interface mais simples
- Sem tabs/dimensões organizadas
- Sem comparações complexas

### 2.4 Integração com Backend

**Cliente API robusto** (`lib/api.ts` - 427 linhas):

```typescript
class ApiClient {
  // Municípios
  - getMunicipalities()
  - getMunicipality(id)
  - getMunicipalityProfile(id)
  - getMicroregions()
  - getGeoJSON()

  // Análises
  - getMunicipalityAnalyses()
  - getAnalysisBySlug()
  - getAnalysisFragments()
  - getRecentAnalyses()

  // Indicadores
  - getIndicators()
  - getMunicipalityIndicators()
  - getIndicatorMetadata()
  - getIndicatorHistory()

  // Chat e n8n
  - sendExplorationChat()
  - requestComplexAnalysis()
  - checkAnalysisStatus()
}
```

**Pontos fortes:**
- API bem documentada
- Tipagem clara
- Suporte a n8n configurável (webhook URL + path)
- Separação clara de responsabilidades

---

## 3. Análise do Dashboard Fonte (framework-v6-mvp)

### 3.1 Tecnologias

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | React + Vite | 18.3.1 / 5.4.20 |
| Routing | Wouter | 3.3.5 |
| State Management | React Query | 5.60.5 |
| Mapas | Leaflet + React Leaflet | 1.9.4 / 4.2.1 |
| Gráficos | Recharts | 2.15.2 |
| UI | shadcn/ui (Radix UI) | Componentes completos |
| Styling | Tailwind CSS | 3.4.17 |
| Animações | Framer Motion | 11.13.1 |
| Backend | Express (integrado) | 4.21.2 |
| Database | Drizzle ORM + Postgres | 0.39.1 |

### 3.2 Estrutura de Arquivos

```
framework-v6-mvp/
├── client/                     # Frontend React/Vite
│   └── src/
│       ├── App.tsx            # Componente principal (Dashboard)
│       ├── components/
│       │   ├── tabs/          # 6 tabs dimensionais
│       │   │   ├── OverviewTab.tsx
│       │   │   ├── EconomicTab.tsx
│       │   │   ├── SocialTab.tsx
│       │   │   ├── TerritorialTab.tsx
│       │   │   ├── EnvironmentalTab.tsx
│       │   │   └── ComparisonTab.tsx
│       │   ├── layout/        # Header, TabNavigation, ChatSidebar
│       │   ├── controls/      # TerritorySelector, PeriodSelector
│       │   ├── shared/        # KPICard, AIAnalysisBox, DataTable
│       │   ├── map/           # InteractiveMap
│       │   └── ui/            # 30+ componentes shadcn/ui
│       ├── hooks/             # Hooks customizados
│       │   ├── useIndicatorFormatter.ts
│       │   ├── useIndicatorMetadata.ts
│       │   └── use-toast.ts
│       └── lib/               # Utilitários
│           ├── queryClient.ts
│           ├── formatters.ts
│           └── utils.ts
├── server/                    # Backend Express (integrado)
│   ├── index.ts              # Servidor Express
│   ├── routes.ts             # Rotas da API
│   ├── db.ts                 # Cliente Drizzle
│   └── services/             # Lógica de negócio
├── shared/                   # Código compartilhado
│   └── schema.ts            # Schemas Zod compartilhados
└── n8n/                     # Workflows (similar ao atual)
```

### 3.3 Funcionalidades Principais

**✅ Implementadas:**
- **Sistema de Tabs** (6 dimensões bem definidas)
  - Overview: Visão geral integrada
  - Economic: Análises econômicas
  - Social: Indicadores sociais
  - Territorial: Análises territoriais
  - Environmental: Meio ambiente
  - Comparison: Comparação entre territórios

- **Controles avançados:**
  - Territory Selector (Estado/Município/Microregião)
  - Period Selector (1/3/5/10 anos)
  - Filtros e busca

- **Componentes sofisticados:**
  - KPICard (cards de indicadores com variação)
  - AIAnalysisBox (análises de IA formatadas)
  - DataTable (tabelas com sorting/filtering)
  - InteractiveMap (mapa com múltiplas camadas)

- **Chat Sidebar:**
  - Contextual por tab
  - Histórico de conversas
  - Análises complexas via n8n

- **shadcn/ui:**
  - 30+ componentes UI profissionais
  - Accordion, Dialog, Select, Toast, etc.
  - Design system consistente

**🎨 Design:**
- Interface moderna e profissional
- Animações suaves (Framer Motion)
- Responsivo
- Dark/Light mode (next-themes)

### 3.4 Integração com Backend

**Arquitetura Monolítica Integrada:**
- Frontend e Backend no mesmo repositório
- API Express servida junto com o Vite
- Schemas compartilhados via `shared/`
- React Query consome `/api/*` endpoints

**Rotas da API** (assumidas, baseado em estrutura):
```typescript
// server/routes.ts
GET  /api/territories
GET  /api/territories/:id
GET  /api/indicators
GET  /api/indicators/:territoryId
POST /api/chat
POST /api/analysis (n8n trigger)
```

---

## 4. Comparação Lado a Lado

### 4.1 Arquitetura

| Aspecto | Dashboard Atual | Dashboard Fonte |
|---------|----------------|-----------------|
| **Framework** | Next.js 14 (SSR) | React + Vite (SPA) |
| **Routing** | App Router (file-based) | Wouter (programmatic) |
| **Build** | Next.js build | Vite build + esbuild |
| **Backend** | Separado (`src/api/`) | Integrado (`server/`) |
| **Deploy** | Next.js standalone | Node.js + Static files |

**Implicação:** Arquiteturas incompatíveis para substituição direta.

---

### 4.2 Estrutura de Componentes

| Categoria | Dashboard Atual | Dashboard Fonte |
|-----------|----------------|-----------------|
| **Organização** | Por tipo (layout/map/chat) | Por tabs + shared |
| **UI Library** | Custom + Lucide | shadcn/ui (Radix) |
| **Tabs/Dimensões** | ❌ Não estruturado | ✅ 6 tabs dimensionais |
| **Comparação** | ❌ Não implementado | ✅ ComparisonTab |
| **Controles** | ❌ Simples (props) | ✅ Componentes dedicados |

---

### 4.3 Funcionalidades

| Funcionalidade | Dashboard Atual | Dashboard Fonte |
|----------------|----------------|-----------------|
| Mapa interativo | ✅ Leaflet | ✅ Leaflet |
| Seleção município | ✅ Simples | ✅ Avançada (tipo+filtro) |
| Chat | ✅ Panel lateral | ✅ Sidebar contextual |
| Análises dimensionais | ⚠️ Básico | ✅ 6 tabs estruturadas |
| KPIs | ⚠️ Cards simples | ✅ KPICard com variação |
| Tabelas de dados | ❌ | ✅ DataTable completa |
| Comparação | ❌ | ✅ ComparisonTab |
| Análises de IA | ✅ Pré-computadas | ✅ AI Analysis Box |
| Gráficos | ✅ Recharts | ✅ Recharts |
| Export/Share | ❌ | ✅ Implementado |
| Reset | ❌ | ✅ Implementado |

---

### 4.4 Integração com API

| Aspecto | Dashboard Atual | Dashboard Fonte |
|---------|----------------|-----------------|
| **Cliente API** | ✅ Completo (427 linhas) | ⚠️ React Query direto |
| **Tipagem** | ✅ Types inline | ✅ Schemas Zod (`shared/`) |
| **Documentação** | ✅ Comentários JSDoc | ⚠️ Implícita |
| **n8n Integration** | ✅ Configurável | ✅ Hardcoded |
| **Error Handling** | ✅ Try/catch | ⚠️ Básico |

**Ponto forte do Atual:** Cliente API mais robusto e documentado.

**Ponto forte da Fonte:** Schemas compartilhados garantem consistência.

---

### 4.5 Dependências Importantes

**Exclusivas do Dashboard Fonte:**
- shadcn/ui (30+ componentes Radix UI)
- Framer Motion (animações)
- Wouter (routing)
- next-themes (dark mode)
- Drizzle ORM (se integrar backend)
- Express integrado (monólito)

**Já presentes no Atual:**
- React Query ✅
- Leaflet ✅
- Recharts ✅
- Tailwind CSS ✅
- Lucide Icons ✅

**Adições necessárias:**
- shadcn/ui (~15 componentes essenciais)
- Framer Motion (opcional, mas recomendado)
- Radix UI primitives (base do shadcn)

---

## 5. Pontos de Integração com API Atual

### 5.1 API Endpoints Comuns

**✅ Já compatíveis:**
- `/api/municipalities` → TerritorySelector
- `/api/municipalities/:id` → Detalhes do território
- `/api/indicators` → OverviewTab, EconomicTab, etc.
- `/api/indicators/:code/history/:municipalityId` → Gráficos de séries
- `/api/chat/explore` → ChatSidebar
- `/api/analyses/municipality/:id` → Análises pré-computadas

**⚠️ Requer adaptação:**
- `GET /api/territories` (framework-v6-mvp)
  → Deve mapear para `/api/municipalities` (atual)

- `GET /api/territories/:id`
  → Deve usar `/api/municipalities/:id/profile` (atual)

**❌ Faltam no atual:**
- Endpoint de comparação de territórios (ComparisonTab)
- Endpoint de análises ambientais específicas
- Endpoints de exportação/PDF

### 5.2 Estrutura de Dados

**Dashboard Fonte espera:**
```typescript
interface Territory {
  id: string;
  name: string;
  type: "Estado" | "Município" | "Microrregião";
  // ... outros campos
}
```

**Dashboard Atual retorna:**
```typescript
interface Municipality {
  ibge_code: string;  // ← mapear para 'id'
  name: string;
  microregion: string;
  // ... outros campos
}
```

**Solução:** Criar camada de adaptação (wrapper) no cliente API.

---

## 6. Gaps e Incompatibilidades

### 6.1 Gaps Funcionais (Fonte tem, Atual não)

| Funcionalidade | Impacto | Esforço para Implementar |
|----------------|---------|---------------------------|
| **Sistema de Tabs Dimensionais** | Alto | Alto (reestruturar layout) |
| **ComparisonTab** | Médio | Alto (backend + frontend) |
| **TerritorySelector avançado** | Médio | Médio (componente + lógica) |
| **KPICard com variação** | Baixo | Baixo (componente simples) |
| **DataTable com sorting** | Médio | Médio (componente complexo) |
| **Export/Share** | Baixo | Baixo (funções simples) |
| **shadcn/ui components** | Alto | Médio (instalar biblioteca) |
| **Dark mode** | Baixo | Baixo (next-themes) |

### 6.2 Gaps Arquiteturais

| Aspecto | Dashboard Atual | Dashboard Fonte | Solução |
|---------|----------------|-----------------|---------|
| **SSR vs SPA** | Next.js (SSR) | React/Vite (SPA) | Manter Next.js |
| **Routing** | File-based | Programmatic | Manter App Router |
| **Backend** | Separado | Integrado | Manter separado |
| **Monorepo** | Não | Sim (client/server/shared) | Adaptar estrutura |

### 6.3 Incompatibilidades Críticas

**🔴 Incompatível:**
1. **Framework base:** Next.js vs React/Vite
2. **Routing:** App Router vs Wouter
3. **Build system:** Next.js vs Vite

**🟡 Requer adaptação:**
1. **Estrutura de pastas:** Páginas vs Tabs
2. **Backend integration:** API externa vs Monólito
3. **Data fetching:** React Query com API client vs React Query direto

**🟢 Compatível:**
1. React Query ✅
2. Leaflet/React Leaflet ✅
3. Recharts ✅
4. Tailwind CSS ✅

---

## 7. Análise de Complexidade

### 7.1 Complexidade por Estratégia

| Estratégia | Complexidade | Tempo Estimado | Risco |
|------------|--------------|----------------|-------|
| **A: Substituição Completa** | 🔴 Muito Alta | 4-6 semanas | Alto |
| **B: Migração Incremental** | 🟡 Alta | 6-8 semanas | Médio |
| **C: Arquitetura Híbrida** | 🟢 Média | 2-4 semanas | Baixo |

### 7.2 Componentes a Portar (Prioridade)

**Alta prioridade:**
1. Sistema de Tabs (estrutura dimensional)
2. TerritorySelector (controle avançado)
3. KPICard (cards com variação)
4. shadcn/ui base (10 componentes essenciais)

**Média prioridade:**
5. DataTable (tabelas avançadas)
6. ComparisonTab (comparação de territórios)
7. AIAnalysisBox (formatação de análises IA)
8. Dark mode

**Baixa prioridade:**
9. Export/Share (funcionalidades extras)
10. Animações (Framer Motion)
11. Componentes UI avançados (restante do shadcn)

---

## 8. Recomendações Preliminares

### 8.1 Estratégia Recomendada: **Opção C (Arquitetura Híbrida)**

**Justificativa:**
- ✅ Mantém Next.js (já funciona bem)
- ✅ Aproveita API robusta existente
- ✅ Porta gradualmente funcionalidades da Fonte
- ✅ Menor risco e tempo de implementação
- ✅ Permite deploy incremental

**Abordagem:**
1. **Manter base Next.js** do dashboard atual
2. **Criar sistema de tabs** dentro do App Router
3. **Portar componentes** da Fonte (shadcn/ui)
4. **Adaptar hooks e formatters** da Fonte
5. **Estender API** quando necessário (comparação, etc.)

### 8.2 Componentes a Reutilizar da Fonte

**Pode copiar diretamente** (com ajustes mínimos):
- `components/tabs/*Tab.tsx` → Adaptar para Next.js
- `components/shared/KPICard.tsx`
- `components/shared/AIAnalysisBox.tsx`
- `components/controls/TerritorySelector.tsx`
- `components/controls/PeriodSelector.tsx`
- `hooks/useIndicatorFormatter.ts`
- `hooks/useIndicatorMetadata.ts`
- `lib/formatters.ts`

**Requer reescrita:**
- `App.tsx` → Integrar lógica no `app/page.tsx`
- `components/layout/*` → Adaptar para estrutura Next.js
- Routing (Wouter) → Usar App Router

**shadcn/ui:**
- Instalar base do shadcn/ui
- Copiar componentes necessários de `components/ui/`
- Configurar `components.json`

### 8.3 Estrutura Proposta (Híbrida)

```
src/dashboard/
├── app/
│   ├── page.tsx                # Dashboard principal com tabs
│   ├── layout.tsx              # Layout global
│   └── [municipio]/            # Página de detalhes (se necessário)
├── components/
│   ├── tabs/                   # ← NOVO: Portar da Fonte
│   │   ├── OverviewTab.tsx
│   │   ├── EconomicTab.tsx
│   │   ├── SocialTab.tsx
│   │   ├── TerritorialTab.tsx
│   │   ├── EnvironmentalTab.tsx
│   │   └── ComparisonTab.tsx
│   ├── controls/               # ← NOVO: Portar da Fonte
│   │   ├── TerritorySelector.tsx
│   │   └── PeriodSelector.tsx
│   ├── shared/                 # ← NOVO: Portar da Fonte
│   │   ├── KPICard.tsx
│   │   ├── AIAnalysisBox.tsx
│   │   └── DataTable.tsx
│   ├── ui/                     # ← NOVO: shadcn/ui
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   └── ... (outros 10-15 componentes)
│   ├── layout/                 # Manter e adaptar
│   ├── map/                    # Manter (já funciona)
│   └── chat/                   # Manter e melhorar
├── hooks/                      # ← NOVO: Portar da Fonte
│   ├── useIndicatorFormatter.ts
│   └── useIndicatorMetadata.ts
└── lib/
    ├── api.ts                  # Manter e estender
    └── formatters.ts           # ← NOVO: Portar da Fonte
```

---

## 9. Próximos Passos (Fase 2)

### 9.1 Decisão Requerida do CEO/CTO

Aprovar uma das seguintes estratégias:

**Opção A: Substituição Completa**
- Migrar para React/Vite
- Reescrever tudo do zero
- Alto risco, longo prazo

**Opção B: Migração Incremental**
- Manter Next.js
- Reescrever página por página
- Médio risco, médio prazo

**Opção C: Arquitetura Híbrida** ⭐ (Recomendada)
- Manter Next.js e API
- Portar componentes e funcionalidades
- Baixo risco, curto prazo

### 9.2 Informações Adicionais Necessárias

Antes de implementar, esclarecer:

1. **Prioridade de funcionalidades:**
   - Quais tabs são essenciais? (Overview, Economic, Social?)
   - ComparisonTab é crítico?
   - Dark mode é necessário?

2. **Compatibilidade com deploy:**
   - Deploy em Replit suporta shadcn/ui?
   - Performance com Next.js + shadcn é aceitável?

3. **API Backend:**
   - Há planos de adicionar endpoints de comparação?
   - API atual suporta todas as queries dos tabs?

4. **Cronograma:**
   - Refatoração agora ou após deploy funcional?
   - CTO sugeriu completar deploy primeiro (concordo)

---

## 10. Anexos

### 10.1 Dependências a Adicionar

```json
{
  "dependencies": {
    // shadcn/ui base
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-tooltip": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",

    // Opcionais mas recomendados
    "framer-motion": "^11.13.1",
    "next-themes": "^0.4.6",
    "date-fns": "^3.6.0"
  }
}
```

### 10.2 Scripts de Migração

```bash
# Instalar shadcn/ui
npx shadcn-ui@latest init

# Adicionar componentes essenciais
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
```

---

## 11. Conclusão

### Resumo da Análise

**Dashboard Atual:**
- ✅ Base sólida (Next.js + API robusta)
- ⚠️ Interface básica
- ❌ Falta estrutura dimensional

**Dashboard Fonte:**
- ✅ Interface avançada e organizada
- ✅ Sistema de tabs bem definido
- ❌ Arquitetura incompatível (Vite vs Next.js)

**Recomendação Final:**
Adotar **Opção C (Arquitetura Híbrida)** para combinar o melhor dos dois mundos:
- Manter a base Next.js e API do atual
- Portar funcionalidades e componentes da Fonte
- Implementação gradual e de baixo risco

**Próximo passo:** Aguardar aprovação do CEO/CTO para prosseguir com Fase 2 (definição da estratégia detalhada).

---

**Status:** ⏸️ **Aguardando aprovação para Fase 2**

**Executor:** Dev Team (Claude Code)
**Data:** 2026-01-08
**Relatório:** Fase 1 completa
