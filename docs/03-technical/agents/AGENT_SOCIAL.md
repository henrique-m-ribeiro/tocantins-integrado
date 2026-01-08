# Agente SOCIAL

**Agente de Análise Social - Tocantins Integrado**

---

## Visão Geral

O Agente Social é responsável por analisar indicadores de desenvolvimento humano e políticas sociais dos municípios tocantinenses.

| Atributo | Valor |
|----------|-------|
| **Dimensão** | SOCIAL |
| **Arquivo** | `src/agents/dimensional/SocialAgent.ts` |
| **Modelo** | GPT-4 Turbo |
| **Temperatura** | 0.3 |

---

## Áreas de Análise

```
┌─────────────────────────────────────────────────────────┐
│                    AGENTE SOCIAL                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  EDUCAÇÃO   │  │   SAÚDE     │  │ VULNERABILIDADE │  │
│  │             │  │             │  │                 │  │
│  │  • IDEB AI  │  │  • Mortali- │  │  • Bolsa        │  │
│  │  • IDEB AF  │  │    dade Inf │  │    Família      │  │
│  │  • Analfab. │  │  • Cobert.  │  │  • CadÚnico     │  │
│  │  • Abandono │  │    ESF      │  │  • BPC          │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                         │
│           ┌─────────────────────────────┐               │
│           │         IDHM               │               │
│           │  Índice de Desenv. Humano  │               │
│           └─────────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Indicadores Analisados

### Educação

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `SOCIAL_IDEB_AI` | IDEB Anos Iniciais | INEP | Nota (0-10) |
| `SOCIAL_IDEB_AF` | IDEB Anos Finais | INEP | Nota (0-10) |
| `SOCIAL_TX_ANALFABETISMO` | Taxa de Analfabetismo | IBGE | % |
| `SOCIAL_TX_ABANDONO_EF` | Taxa de Abandono EF | INEP | % |
| `SOCIAL_MATRICULAS_EF` | Matrículas Ensino Fund. | INEP | Nº absoluto |

### Saúde

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `SOCIAL_TX_MORTALIDADE_INF` | Mortalidade Infantil | DataSUS | por 1.000 NV |
| `SOCIAL_COBERTURA_ESF` | Cobertura ESF | e-Gestor AB | % |
| `SOCIAL_LEITOS_SUS` | Leitos SUS | DataSUS | por 1.000 hab |
| `SOCIAL_MEDICOS_SUS` | Médicos SUS | DataSUS | por 1.000 hab |

### Assistência Social

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `SOCIAL_FAMILIAS_BF` | Famílias Bolsa Família | MDS | Nº absoluto |
| `SOCIAL_CADUNICO` | Famílias CadÚnico | MDS | Nº absoluto |
| `SOCIAL_BPC` | Beneficiários BPC | MDS | Nº absoluto |

### Desenvolvimento Humano

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `SOCIAL_IDHM` | IDHM | Atlas Brasil | Índice (0-1) |
| `SOCIAL_IDHM_E` | IDHM Educação | Atlas Brasil | Índice (0-1) |
| `SOCIAL_IDHM_L` | IDHM Longevidade | Atlas Brasil | Índice (0-1) |
| `SOCIAL_IDHM_R` | IDHM Renda | Atlas Brasil | Índice (0-1) |

---

## Métodos de Análise

### analyzeEducation(municipalityId)

Analisa indicadores educacionais e classifica o nível:

```typescript
const education = await agent.analyzeEducation('1721000');
// Retorna:
{
  indicators: [...],
  level: 'adequate' | 'developing' | 'critical'
}
```

**Classificação:**
- `adequate`: IDEB AI ≥ 6.0 E IDEB AF ≥ 5.5
- `critical`: IDEB AI < 4.0 OU Analfabetismo > 20%
- `developing`: Demais casos

### analyzeHealth(municipalityId)

Analisa indicadores de saúde:

```typescript
const health = await agent.analyzeHealth('1721000');
// Retorna:
{
  indicators: [...],
  level: 'adequate' | 'developing' | 'critical'
}
```

**Classificação:**
- `adequate`: Mortalidade < 10/1000 E Cobertura ESF > 80%
- `critical`: Mortalidade > 20/1000
- `developing`: Demais casos

### analyzeVulnerability(municipalityId)

Analisa vulnerabilidade social:

```typescript
const vulnerability = await agent.analyzeVulnerability('1721000');
// Retorna:
{
  indicators: [...],
  vulnerabilityIndex: 'low' | 'medium' | 'high',
  vulnerabilityRate: number // % de famílias vulneráveis
}
```

**Classificação:**
- `low`: < 20% de famílias no CadÚnico
- `high`: > 40% de famílias no CadÚnico
- `medium`: Entre 20% e 40%

### getSocialProfile(municipalityId)

Perfil social completo combinando todas as análises:

```typescript
const profile = await agent.getSocialProfile('1721000');
// Retorna:
{
  education: { indicators, level },
  health: { indicators, level },
  vulnerability: { indicators, vulnerabilityIndex, vulnerabilityRate },
  idhm: number,
  idhmLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low',
  overallAssessment: 'good' | 'regular' | 'concerning' | 'critical'
}
```

---

## Formato de Resposta JSON

```json
{
  "summary": "Resumo executivo da análise social em 2-3 parágrafos",
  "key_findings": [
    "Achado 1",
    "Achado 2",
    "Achado 3"
  ],
  "education_assessment": {
    "level": "Adequado/Em desenvolvimento/Crítico",
    "main_challenges": ["Desafio 1", "Desafio 2"],
    "highlights": ["Destaque 1"]
  },
  "health_assessment": {
    "level": "Adequado/Em desenvolvimento/Crítico",
    "main_challenges": ["Desafio 1"],
    "highlights": ["Destaque 1"]
  },
  "vulnerability_index": "Baixo/Médio/Alto",
  "recommendations": [
    "Recomendação 1",
    "Recomendação 2"
  ],
  "priority_actions": [
    "Ação prioritária 1",
    "Ação prioritária 2"
  ]
}
```

---

## Contexto Especializado

O agente possui conhecimento embarcado sobre:

### Tocantins Social
- População de ~1,6 milhão de habitantes
- Diversidade: comunidades indígenas, quilombolas, ribeirinhos
- IDHM varia de 0.5 a 0.8 entre municípios
- Cobertura ESF acima da média nacional
- Alta urbanização concentrada em poucos municípios

### Diretrizes de Análise
1. Priorizar indicadores de resultado sobre estrutura
2. Comparar com metas do PNE e ODS
3. Identificar populações vulneráveis
4. Considerar intersetorialidade
5. Destacar boas práticas replicáveis

---

## Exemplos de Uso

### Via API

```bash
POST /api/analysis
{
  "dimension": "SOCIAL",
  "municipality_id": "1721000",
  "task": "Analise a situação educacional de Palmas comparando com as metas do IDEB"
}
```

### Via Código

```typescript
import { getSocialAgent } from './agents/dimensional';

const agent = getSocialAgent();

// Análise de educação
const edu = await agent.analyzeEducation('1721000');
console.log(`Nível educacional: ${edu.level}`);

// Perfil completo
const profile = await agent.getSocialProfile('1721000');
console.log(`Avaliação geral: ${profile.overallAssessment}`);
```

---

## Métricas de Referência

### IDEB - Metas 2021

| Nível | Meta Brasil | Tocantins |
|-------|-------------|-----------|
| Anos Iniciais | 6.0 | 5.5 |
| Anos Finais | 5.5 | 5.0 |

### Mortalidade Infantil

| Classificação | Taxa (por 1.000 NV) |
|---------------|---------------------|
| Baixa | < 10 |
| Média | 10-20 |
| Alta | > 20 |

### IDHM

| Classificação | Faixa |
|---------------|-------|
| Muito Alto | ≥ 0.800 |
| Alto | 0.700 - 0.799 |
| Médio | 0.600 - 0.699 |
| Baixo | 0.500 - 0.599 |
| Muito Baixo | < 0.500 |

---

## Referências

- [Dimensão Social](../dimensions/DIMENSION_SOCIAL.md)
- [Fontes de Dados - INEP](../DATA_SOURCES.md#inep)
- [Fontes de Dados - DataSUS](../DATA_SOURCES.md#datasus)
- [Atlas Brasil](http://www.atlasbrasil.org.br/)

---

*Última atualização: Janeiro 2026*
