# Arquitetura do Sistema - Tocantins Integrado MVP

## Visão Geral

O Tocantins Integrado é uma plataforma de superinteligência territorial que combina análises pré-computadas para acesso imediato com agentes especialistas para análises complexas sob demanda.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUÁRIOS                                        │
│                    (Dashboard Web / WhatsApp)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APRESENTAÇÃO                             │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐│
│  │    Dashboard Replit │   │  API Express/Node   │   │  WhatsApp Evolution ││
│  │    (Next.js 14)     │   │  (REST endpoints)   │   │  (Webhook Handler)  ││
│  └─────────────────────┘   └─────────────────────┘   └─────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
┌────────────────────────┐ ┌────────────────────┐ ┌────────────────────────────┐
│   ANÁLISES RÁPIDAS     │ │  ANÁLISES COMPLEXAS │ │    COLETA DE DADOS        │
│   (Pré-computadas)     │ │  (n8n + Agentes)    │ │    (n8n Automático)       │
├────────────────────────┤ ├─────────────────────┤ ├────────────────────────────┤
│ • Perfis municipais    │ │ • Orquestrador      │ │ • IBGE SIDRA              │
│ • Fragmentos de análise│ │ • Agente ECON       │ │ • INEP                    │
│ • Rankings por dimensão│ │ • Agente SOCIAL     │ │ • DATASUS                 │
│ • Documentos PDF       │ │ • Agente TERRA      │ │ • Tesouro SICONFI         │
│                        │ │ • Agente AMBIENT    │ │ • MapBiomas               │
└────────────────────────┘ └─────────────────────┘ └────────────────────────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE DADOS                                     │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐│
│  │   PostgreSQL        │   │    Base de          │   │   Storage           ││
│  │   (Supabase)        │   │    Conhecimento     │   │   (PDFs/Docs)       ││
│  │   • Indicadores     │   │    • RAG Chunks     │   │                     ││
│  │   • Análises        │   │    • Embeddings     │   │                     ││
│  │   • Metadados       │   │    • Documentos     │   │                     ││
│  └─────────────────────┘   └─────────────────────┘   └─────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Dashboard Replit (Next.js)

**Localização:** `src/dashboard/`

O dashboard é a interface principal para exploração de dados, com foco em análises já prontas.

**Funcionalidades:**
- Mapa interativo do Tocantins com os 139 municípios
- Visualização de indicadores por dimensão (ECON, SOCIAL, TERRA, AMBIENT)
- Listagem e filtro de análises pré-computadas
- Download de documentos PDF
- Chat para exploração rápida de dados
- Fragmentos contextuais de análises

**Páginas:**
- `/` - Mapa principal com visão geral
- `/analises` - Listagem de todas as análises
- `/analises/[slug]` - Detalhe de uma análise
- `/documentos` - Download de PDFs e relatórios

### 2. Sistema de Análises Pré-computadas

**Localização:** `src/database/migrations/005_precomputed_analyses.sql`

Análises geradas periodicamente pelos workflows n8n e armazenadas para acesso imediato.

**Tabelas:**
- `precomputed_analyses` - Análises completas (perfis municipais, comparativas, etc.)
- `analysis_fragments` - Fragmentos para exibição contextual
- `generated_documents` - PDFs e exportações geradas

**Tipos de análise:**
- `municipal_profile` - Perfil completo do município
- `dimensional_summary` - Resumo por dimensão
- `comparative` - Análise comparativa entre municípios
- `microregional` - Análise de microrregião
- `thematic` - Análises temáticas
- `ranking` - Rankings e classificações

### 3. Workflows n8n

**Localização:** `n8n/workflows/`

#### 3.1 Orquestrador de Análise (`analysis-orchestrator.json`)

Recebe consultas complexas e coordena os agentes especialistas de análise.

**Fluxo:**
1. Webhook recebe a consulta
2. LLM classifica a consulta (dimensões, tipo, entidades)
3. Roteia para os agentes relevantes (ECON, SOCIAL, TERRA, AMBIENT)
4. Consolida respostas dos agentes
5. Retorna resposta integrada

#### 3.2 Agentes Especialistas

Cada dimensão possui um agente especialista:

- **Agente ECON** (`agent-econ.json`) - Economia e finanças públicas
- **Agente SOCIAL** - Educação, saúde, desenvolvimento social
- **Agente TERRA** - Infraestrutura e uso do solo
- **Agente AMBIENT** - Meio ambiente e sustentabilidade

**Estrutura comum:**
1. Webhook trigger
2. Buscar indicadores relevantes
3. Buscar contexto da base de conhecimento
4. Preparar contexto para LLM
5. Análise com GPT-4
6. Formatação da resposta

#### 3.3 Orquestrador de Coleta (`data-collection-orchestrator.json`)

Coordena a coleta automatizada de indicadores de forma metadata-driven.

**Agendamento:** Diário às 3h

**Fluxo:**
1. Consulta `v_indicators_pending_collection` (indicadores que precisam atualização)
2. Agrupa indicadores por `source_name` (IBGE Sidra, INEP, MapBiomas, etc.)
3. Para cada fonte, chama o workflow especialista correspondente via webhook
4. Passa lista de indicadores com metadados de coleta (api_endpoint, api_params)
5. Consolida resultados de todos os especialistas
6. Registra logs e estatísticas de execução

**Mapeamento fonte → workflow:**
- `IBGE Sidra` → `data-collection-ibge.json`
- `INEP` → `data-collection-inep.json` (placeholder)
- `MapBiomas` → `data-collection-mapbiomas.json` (placeholder)

**Documentação:**
- [ADR 004 - Sistema de Coleta Orientado a Metadados](../../adr/004-sistema-coleta-orientado-metadados.md)
- [Guia de Setup dos Workflows](../../guides/workflows-n8n-setup.md)
- [Guia de Configuração da Coleta](../../guides/data-collection-setup.md)

#### 3.4 Workflows Especialistas de Coleta

##### 3.4.1 IBGE Specialist (`data-collection-ibge.json`)

**Status:** ✅ Implementado e funcional

**Trigger:** Webhook (chamado pelo orquestrador de coleta)

**Payload recebido:**
```json
{
  "source_name": "IBGE Sidra",
  "orchestrator_run_id": "uuid",
  "indicators": [
    {
      "code": "ECON_PIB_TOTAL",
      "api_endpoint": "https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last"
    }
  ]
}
```

**Fluxo:**
1. Recebe lista de indicadores com metadados de API
2. Busca todos os 139 municípios do Tocantins
3. Para cada município e indicador:
   - Constrói URL substituindo `{ibge_code}` pelo código IBGE do município
   - Chama API IBGE Sidra
   - Parseia resposta JSON
   - UPSERT em `indicator_values` (evita duplicatas)
4. Atualiza `indicator_dictionary` com `last_ref_date` e `last_update_date`
5. Retorna resumo: total processado, sucessos, erros

**Indicadores coletados:**
- PIB Municipal Total e per capita
- Valor Adicionado por setor (Agropecuária, Indústria, Serviços)
- População estimada

##### 3.4.2 INEP e MapBiomas

**Status:** ⏳ Placeholders implementados

Workflows retornam `status: "not_implemented"` sem causar erros no orquestrador. Serão implementados em ciclos futuros quando houver necessidade de coleta dessas fontes.

#### 3.5 Coleta de Dados (Legacy - `data-collection-ibge.json` antigo)

**Agendamento:** Mensal (dia 1, às 3h)

**Fontes configuradas:**
- IBGE SIDRA - PIB, população
- IBGE Cidades - Dados gerais
- INEP - Dados educacionais
- DATASUS TabNet - Dados de saúde
- Tesouro SICONFI - Dados fiscais
- MapBiomas - Cobertura do solo
- INPE PRODES - Desmatamento

### 4. Base de Conhecimento (RAG)

**Localização:** `src/database/migrations/006_knowledge_base.sql`

Sistema de RAG para contextualização das análises.

**Tabelas:**
- `knowledge_documents` - Documentos fonte (relatórios, estudos, notícias)
- `knowledge_chunks` - Fragmentos indexados com embeddings

**Função de busca:**
```sql
search_knowledge_base(
  query_embedding JSONB,
  match_threshold FLOAT,
  match_count INT,
  filter_dimensions TEXT[]
)
```

### 5. API REST

**Localização:** `src/api/`

Endpoints principais:

```
GET  /api/municipalities              # Lista municípios
GET  /api/municipalities/:id          # Detalhes do município
GET  /api/municipalities/:id/profile  # Perfil com indicadores

GET  /api/analyses/recent             # Análises recentes
GET  /api/analyses/municipality/:id   # Análises de um município
GET  /api/analyses/:slug              # Análise por slug
GET  /api/analyses/fragments          # Fragmentos contextuais
POST /api/analyses/:id/download       # Registrar download

GET  /api/documents                   # Lista documentos
POST /api/documents/:id/download      # Registrar download

POST /api/chat/explore                # Chat de exploração
```

## Fluxo de Dados

### 1. Consulta Rápida (Dashboard)

```
Usuário → Dashboard → API → Banco (pré-computado) → Dashboard → Usuário
         ~100ms                                       ~500ms total
```

### 2. Consulta Complexa (n8n)

```
Usuário → Dashboard → API → n8n Webhook → Orquestrador
                                              │
                                    ┌─────────┼─────────┐
                                    ▼         ▼         ▼
                                  ECON     SOCIAL    TERRA
                                    │         │         │
                                    └─────────┼─────────┘
                                              ▼
                                      Consolidador LLM
                                              │
                                              ▼
                          Dashboard ← API ← Resposta
                          ~5-15 segundos total
```

### 3. Coleta Automatizada (Metadata-Driven)

```
Cron (diário 3h) → Orquestrador de Coleta
                         │
                         ▼
               Consulta indicator_dictionary
            (v_indicators_pending_collection)
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      Workflow IBGE  Workflow INEP  Workflow MapBiomas
            │            │            │
            ▼            ▼            ▼
      Construção dinâmica de URLs via metadados
            │            │            │
            ▼            ▼            ▼
        APIs Externas (IBGE Sidra, INEP, etc.)
            │            │            │
            └────────────┼────────────┘
                         ▼
              UPSERT indicator_values
                         │
                         ▼
         Atualização indicator_dictionary
              (last_ref_date, last_update_date)
```

## Estrutura de Diretórios

```
tocantins-integrado/
├── src/
│   ├── api/                    # API Express
│   │   ├── routes/
│   │   └── index.ts
│   ├── agents/                 # Agentes TypeScript (referência)
│   │   ├── BaseAgent.ts
│   │   ├── EconAgent.ts
│   │   └── ...
│   ├── dashboard/              # Next.js Dashboard
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── analises/
│   │   │   └── documentos/
│   │   ├── components/
│   │   └── lib/
│   │       └── api.ts
│   ├── database/               # Migrações SQL
│   │   ├── migrations/
│   │   │   ├── 001_regions_municipalities.sql
│   │   │   ├── 002_indicator_structure.sql
│   │   │   ├── 003_chat_feedback.sql
│   │   │   ├── 004_views_and_functions.sql
│   │   │   ├── 005_precomputed_analyses.sql
│   │   │   ├── 006_knowledge_base.sql
│   │   │   ├── 007_data_collection.sql
│   │   │   └── 008_create_indicator_dictionary.sql
│   │   └── seeds/
│   └── integrations/           # Integrações externas
│       └── whatsapp/
├── n8n/
│   └── workflows/              # Workflows n8n (JSON)
│       ├── analysis-orchestrator.json
│       ├── data-collection-orchestrator.json
│       ├── agent-econ.json
│       ├── agent-social.json
│       ├── agent-terra.json
│       ├── agent-ambient.json
│       ├── data-collection-ibge.json
│       ├── data-collection-inep.json
│       └── data-collection-mapbiomas.json
├── docs/
│   ├── 00-project/
│   │   └── PRD.md
│   ├── 01-research/
│   └── 03-technical/
│       └── ARCHITECTURE.md
└── package.json
```

## Variáveis de Ambiente

```env
# API
API_PORT=3001
DATABASE_URL=postgresql://...

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_N8N_URL=http://localhost:5678

# n8n
N8N_BASE_URL=http://localhost:5678
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# WhatsApp (Evolution API)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=...
```

## Deploy

### Replit (Dashboard)

1. Importar repositório no Replit
2. Configurar variáveis de ambiente
3. `npm install && npm run build:dashboard`
4. Run: `npm run start:dashboard`

### n8n (Railway/Render)

1. Deploy com Docker image oficial do n8n
2. Configurar PostgreSQL para persistência
3. Importar workflows via UI ou API
4. Configurar credenciais (OpenAI, PostgreSQL)

### Supabase (Banco de Dados)

1. Criar projeto no Supabase
2. Executar migrações em ordem
3. Configurar RLS policies se necessário
4. Inserir dados de seed

## Considerações de Segurança

- API keys nunca no código fonte
- Webhooks n8n com autenticação básica ou API key
- RLS no Supabase para dados sensíveis
- Rate limiting na API
- Sanitização de inputs em consultas

## Próximos Passos

1. [ ] Implementar workflows para SOCIAL, TERRA, AMBIENT
2. [ ] Configurar pipeline de geração automática de análises
3. [ ] Adicionar mais fontes de dados
4. [ ] Implementar cache Redis para consultas frequentes
5. [ ] Dashboard de monitoramento dos workflows
