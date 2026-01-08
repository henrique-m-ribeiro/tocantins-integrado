# Agentes Dimensionais

**Tocantins Integrado - Sistema de Agentes de Análise**

---

## Visão Geral

Os agentes dimensionais são componentes de IA especializados em analisar indicadores de uma dimensão específica do desenvolvimento territorial. Cada agente combina:

1. **Dados estruturados** do banco de dados (indicadores coletados)
2. **Conhecimento contextual** do Tocantins (via prompt de sistema)
3. **Capacidade analítica** de LLM (GPT-4 Turbo)

```
┌─────────────────────────────────────────────────────────────┐
│                      ORQUESTRADOR                           │
│              Coordena análises multidimensionais            │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Agente ECON  │  │ Agente SOCIAL │  │ Agente TERRA  │
│  Economia     │  │ Desenvolvimento│  │ Infraestrutura│
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                   ┌───────────────┐
                   │Agente AMBIENT │
                   │Meio Ambiente  │
                   └───────────────┘
```

---

## Arquitetura

### BaseAgent

Todos os agentes herdam de `BaseAgent` (`src/agents/base/BaseAgent.ts`):

```typescript
abstract class BaseAgent {
  // Configuração
  dimension: Dimension;      // ECON | SOCIAL | TERRA | AMBIENT
  config: AgentConfig;       // Prompts, modelo, temperatura

  // Conexões
  openai: OpenAI;           // Cliente OpenAI
  supabase: SupabaseClient; // Cliente Supabase

  // Métodos principais
  process(request): Promise<AgentResponse>;
  fetchData(request): Promise<DataPoints>;
  generateAnalysis(context, task): Promise<Analysis>;
}
```

### Fluxo de Processamento

```
1. Requisição    →  { municipality_id, task, context }
2. Busca dados   →  SELECT FROM v_latest_indicators WHERE dimension = X
3. Prepara ctx   →  Formata indicadores + contexto do município
4. Gera análise  →  OpenAI GPT-4 com prompt especializado
5. Resposta      →  { summary, key_findings, recommendations }
```

---

## Agentes Disponíveis

| Agente | Dimensão | Indicadores | Documentação |
|--------|----------|-------------|--------------|
| **EconAgent** | ECON | PIB, VAB, Emprego, Finanças | [AGENT_ECON.md](./AGENT_ECON.md) |
| **SocialAgent** | SOCIAL | IDEB, Mortalidade, IDH | [AGENT_SOCIAL.md](./AGENT_SOCIAL.md) |
| **TerraAgent** | TERRA | Saneamento, Infraestrutura | [AGENT_TERRA.md](./AGENT_TERRA.md) |
| **AmbientAgent** | AMBIENT | Vegetação, Conservação | [AGENT_AMBIENT.md](./AGENT_AMBIENT.md) |

---

## Formato de Resposta

Todos os agentes retornam JSON estruturado:

```json
{
  "summary": "Resumo executivo em 2-3 parágrafos",
  "key_findings": [
    "Achado principal 1",
    "Achado principal 2",
    "Achado principal 3"
  ],
  "[dimension]_assessment": {
    "level": "Adequado/Em desenvolvimento/Crítico",
    "main_challenges": ["Desafio 1", "Desafio 2"],
    "highlights": ["Destaque 1"]
  },
  "recommendations": [
    "Recomendação 1",
    "Recomendação 2"
  ]
}
```

---

## Uso via API

### Requisição de Análise

```bash
POST /api/analysis
Content-Type: application/json

{
  "dimension": "SOCIAL",
  "municipality_id": "1721000",
  "task": "Analise a situação educacional de Palmas"
}
```

### Resposta

```json
{
  "request_id": "uuid",
  "dimension": "SOCIAL",
  "status": "completed",
  "analysis": {
    "summary": "Palmas apresenta indicadores educacionais...",
    "key_findings": ["IDEB acima da média estadual", "..."],
    "data_points": [...],
    "recommendations": ["Investir em...", "..."]
  },
  "metadata": {
    "processing_time_ms": 2340,
    "indicators_analyzed": 12,
    "data_sources": ["INEP", "DataSUS"]
  }
}
```

---

## Uso Programático

```typescript
import { getSocialAgent } from './agents/dimensional';

const agent = getSocialAgent();

// Análise completa
const profile = await agent.getSocialProfile('1721000');

// Análises específicas
const education = await agent.analyzeEducation('1721000');
const health = await agent.analyzeHealth('1721000');
const vulnerability = await agent.analyzeVulnerability('1721000');
```

---

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `OPENAI_API_KEY` | Chave da API OpenAI | (obrigatório) |
| `OPENAI_MODEL` | Modelo a usar | `gpt-4-turbo-preview` |

### Parâmetros dos Agentes

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `temperature` | 0.3 | Baixa para respostas consistentes |
| `max_tokens` | 2000 | Limite de resposta |
| `response_format` | `json_object` | Força saída JSON |

---

## Orquestrador

O `Orchestrator` (`src/agents/orchestrator/Orchestrator.ts`) coordena análises multidimensionais:

```typescript
import { Orchestrator } from './agents/orchestrator';

const orchestrator = new Orchestrator();

// Análise completa de um município
const fullAnalysis = await orchestrator.analyzeFullProfile('1721000');

// Análise comparativa
const comparison = await orchestrator.compareMunicipalities(['1721000', '1720400']);

// Análise temática
const thematic = await orchestrator.analyzeTheme('educacao', ['1721000']);
```

---

## Extensão

### Criando Novo Agente

1. Criar classe que estende `BaseAgent`:

```typescript
// src/agents/dimensional/NewAgent.ts
import { BaseAgent } from '../base/BaseAgent';

const SYSTEM_PROMPT = `Você é um especialista em...`;

export class NewAgent extends BaseAgent {
  constructor() {
    super({
      dimension: 'NEW',
      name: 'Agente Novo',
      description: '...',
      system_prompt: SYSTEM_PROMPT,
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      max_tokens: 2000,
      tools: [...]
    });
  }

  async analyzeSpecific(municipalityId: string) {
    // Implementação específica
  }
}
```

2. Registrar no `index.ts`
3. Documentar em `docs/03-technical/agents/`

---

## Referências

- [Arquitetura Geral](../ARCHITECTURE.md)
- [Fontes de Dados](../DATA_SOURCES.md)
- [Dimensões de Análise](../dimensions/)

---

*Última atualização: Janeiro 2026*
