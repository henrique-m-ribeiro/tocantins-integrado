# Agente TERRA

**Agente de Análise Territorial - Tocantins Integrado**

---

## Visão Geral

O Agente Territorial analisa indicadores de infraestrutura, saneamento, transporte, habitação e conectividade dos municípios tocantinenses.

| Atributo | Valor |
|----------|-------|
| **Dimensão** | TERRA |
| **Arquivo** | `src/agents/dimensional/TerraAgent.ts` |
| **Modelo** | GPT-4 Turbo |
| **Temperatura** | 0.3 |

---

## Áreas de Análise

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENTE TERRA                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐    │
│  │ SANEAMENTO  │  │INFRAESTRUT. │  │  CONECTIVIDADE    │    │
│  │             │  │   URBANA    │  │                   │    │
│  │  • Água     │  │             │  │  • Internet       │    │
│  │  • Esgoto   │  │  • Paviment.│  │  • Energia        │    │
│  │  • Lixo     │  │  • Iluminaç.│  │  • Dist. Capital  │    │
│  └─────────────┘  └─────────────┘  └───────────────────┘    │
│                                                             │
│           ┌─────────────────────────────┐                   │
│           │        HABITAÇÃO            │                   │
│           │  Déficit e domicílios       │                   │
│           └─────────────────────────────┘                   │
│                                                             │
│           ┌─────────────────────────────┐                   │
│           │   ÍNDICE INFRAESTRUTURA     │                   │
│           │   Composto (0-100)          │                   │
│           └─────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Indicadores Analisados

### Saneamento Básico

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `TERRA_AGUA_ENCANADA` | Acesso a água encanada | SNIS | % |
| `TERRA_ESGOTO` | Coleta de esgoto | SNIS | % |
| `TERRA_COLETA_LIXO` | Coleta de lixo | IBGE | % |
| `TERRA_ATERRO` | Destinação a aterro | SNIS | % |

### Infraestrutura Urbana

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `TERRA_PAVIMENTACAO` | Vias pavimentadas | IBGE | % |
| `TERRA_ILUMINACAO` | Iluminação pública | IBGE | % |
| `TERRA_DOMICILIOS` | Total de domicílios | IBGE | Nº |

### Conectividade

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `TERRA_INTERNET` | Acesso à internet | IBGE | % |
| `TERRA_ENERGIA` | Acesso à energia | IBGE | % |
| `TERRA_DISTANCIA_CAPITAL` | Distância de Palmas | IBGE | km |
| `TERRA_FROTA` | Frota de veículos | DENATRAN | Nº |

### Habitação

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `TERRA_DEFICIT_HAB` | Déficit habitacional | FJP | Nº |
| `TERRA_DOM_PROPRIO` | Domicílios próprios | IBGE | % |

---

## Métodos de Análise

### analyzeSanitation(municipalityId)

Analisa cobertura de saneamento básico:

```typescript
const sanitation = await agent.analyzeSanitation('1721000');
// Retorna:
{
  indicators: [...],
  waterAccess: number,      // % acesso água
  sewageCoverage: number,   // % coleta esgoto
  wasteCollection: number,  // % coleta lixo
  level: 'adequate' | 'partial' | 'precarious'
}
```

**Classificação:**
- `adequate`: Média das coberturas ≥ 80%
- `precarious`: Média < 50%
- `partial`: Entre 50% e 80%

### analyzeInfrastructure(municipalityId)

Analisa infraestrutura urbana:

```typescript
const infra = await agent.analyzeInfrastructure('1721000');
// Retorna:
{
  indicators: [...],
  paving: number,           // % pavimentação
  lighting: number,         // % iluminação
  level: 'adequate' | 'developing' | 'precarious'
}
```

**Classificação:**
- `adequate`: Pavimentação ≥ 70% E Iluminação ≥ 80%
- `precarious`: Pavimentação < 30% OU Iluminação < 50%
- `developing`: Demais casos

### analyzeConnectivity(municipalityId)

Analisa conectividade digital e acessibilidade:

```typescript
const connectivity = await agent.analyzeConnectivity('1721000');
// Retorna:
{
  indicators: [...],
  internet: number,
  energy: number,
  distanceCapital: number,
  digitalInclusion: 'adequate' | 'developing' | 'limited',
  accessibility: 'good' | 'regular' | 'difficult'
}
```

**Inclusão Digital:**
- `adequate`: Internet ≥ 70%
- `limited`: Internet < 30%

**Acessibilidade:**
- `good`: Distância < 100 km de Palmas
- `difficult`: Distância > 400 km

### analyzeHousing(municipalityId)

Analisa situação habitacional:

```typescript
const housing = await agent.analyzeHousing('1721000');
// Retorna:
{
  indicators: [...],
  housingDeficit: number,
  ownedHomes: number  // % domicílios próprios
}
```

### getTerritorialProfile(municipalityId)

Perfil territorial completo:

```typescript
const profile = await agent.getTerritorialProfile('1721000');
// Retorna:
{
  sanitation: {...},
  infrastructure: {...},
  connectivity: {...},
  housing: {...},
  infrastructureIndex: number,      // Índice 0-100
  investmentPriorities: string[]    // Top 5 áreas prioritárias
}
```

---

## Índice de Infraestrutura

Cálculo do índice composto (0-100):

```
Índice = (Saneamento × 0.40) + (Infraestrutura × 0.30) + (Conectividade × 0.30)

Onde:
- Saneamento = (Água + Esgoto + Lixo) / 3
- Infraestrutura = (Pavimentação + Iluminação) / 2
- Conectividade = (Internet + Energia) / 2
```

| Faixa | Classificação |
|-------|---------------|
| 80-100 | Excelente |
| 60-79 | Bom |
| 40-59 | Regular |
| 20-39 | Precário |
| 0-19 | Crítico |

---

## Priorização de Investimentos

O agente identifica automaticamente as 5 principais prioridades de investimento baseado nos déficits:

| Área | Meta | Déficit calculado |
|------|------|-------------------|
| Abastecimento de água | 90% | 90 - cobertura atual |
| Esgotamento sanitário | 60% | 60 - cobertura atual |
| Coleta de resíduos | 80% | 80 - cobertura atual |
| Pavimentação urbana | 50% | 50 - cobertura atual |
| Inclusão digital | 50% | 50 - cobertura atual |
| Habitação | 0 déficit | déficit absoluto / 10 |

---

## Formato de Resposta JSON

```json
{
  "summary": "Resumo executivo da análise territorial em 2-3 parágrafos",
  "key_findings": [
    "Achado 1",
    "Achado 2",
    "Achado 3"
  ],
  "infrastructure_assessment": {
    "level": "Adequado/Em desenvolvimento/Precário",
    "main_gaps": ["Lacuna 1", "Lacuna 2"],
    "strengths": ["Ponto forte 1"]
  },
  "sanitation_assessment": {
    "water_access": "percentual ou classificação",
    "sewage_coverage": "percentual ou classificação",
    "waste_management": "Adequado/Parcial/Inadequado"
  },
  "connectivity_assessment": {
    "road_access": "Bom/Regular/Precário",
    "digital_inclusion": "Adequado/Em desenvolvimento/Limitado"
  },
  "investment_priorities": [
    "Prioridade 1",
    "Prioridade 2",
    "Prioridade 3"
  ],
  "recommendations": [
    "Recomendação 1",
    "Recomendação 2"
  ]
}
```

---

## Contexto Especializado

O agente possui conhecimento embarcado sobre:

### Tocantins Territorial
- Área de 277.720 km² (4º maior do Norte)
- Baixa densidade demográfica (5,8 hab/km²)
- Municípios de até 10.000 km²
- BR-153 (Belém-Brasília) como eixo principal
- Desafios de saneamento em áreas rurais
- Expansão de energia e telecomunicações

### Diretrizes de Análise
1. Priorizar déficits que afetam qualidade de vida
2. Considerar viabilidade técnica dado contexto territorial
3. Comparar com metas do Plano Nacional de Saneamento
4. Identificar gargalos logísticos
5. Avaliar custo-benefício em baixa densidade

---

## Exemplos de Uso

### Via API

```bash
POST /api/analysis
{
  "dimension": "TERRA",
  "municipality_id": "1721000",
  "task": "Identifique as principais lacunas de infraestrutura em Palmas"
}
```

### Via Código

```typescript
import { getTerraAgent } from './agents/dimensional';

const agent = getTerraAgent();

// Análise de saneamento
const sanitation = await agent.analyzeSanitation('1721000');
console.log(`Cobertura água: ${sanitation.waterAccess}%`);

// Perfil completo
const profile = await agent.getTerritorialProfile('1721000');
console.log(`Índice infraestrutura: ${profile.infrastructureIndex}`);
console.log(`Prioridades: ${profile.investmentPriorities.join(', ')}`);
```

---

## Metas de Referência

### PLANSAB (Plano Nacional de Saneamento)

| Indicador | Meta 2033 |
|-----------|-----------|
| Água tratada | 99% |
| Coleta de esgoto | 90% |
| Tratamento de esgoto | 93% |
| Coleta de resíduos | 100% |

### ODS 6 (Água e Saneamento)

- Acesso universal à água potável
- Acesso universal a saneamento adequado
- Reduzir pela metade a proporção de águas residuais não tratadas

---

## Referências

- [Dimensão Territorial](../dimensions/DIMENSION_TERRA.md)
- [Fontes de Dados - SNIS](../DATA_SOURCES.md#snis)
- [IBGE Cidades](https://cidades.ibge.gov.br/)

---

*Última atualização: Janeiro 2026*
