# Agente AMBIENT

**Agente de Análise Ambiental - Tocantins Integrado**

---

## Visão Geral

O Agente Ambiental analisa indicadores de meio ambiente, sustentabilidade e gestão ambiental dos municípios tocantinenses, com foco especial nos biomas Cerrado e Amazônia.

| Atributo | Valor |
|----------|-------|
| **Dimensão** | AMBIENT |
| **Arquivo** | `src/agents/dimensional/AmbientAgent.ts` |
| **Modelo** | GPT-4 Turbo |
| **Temperatura** | 0.3 |

---

## Áreas de Análise

```
┌─────────────────────────────────────────────────────────────────┐
│                      AGENTE AMBIENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   VEGETAÇÃO     │  │ ÁREAS PROTEGIDAS│  │   GOVERNANÇA    │  │
│  │                 │  │                 │  │                 │  │
│  │  • Cobertura    │  │  • UCs          │  │  • Órgão        │  │
│  │    nativa       │  │  • Terras       │  │    ambiental    │  │
│  │  • Desmatamento │  │    Indígenas    │  │  • Conselho     │  │
│  │  • Bioma        │  │  • APPs         │  │  • Fundo        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│           ┌─────────────────────────────────┐                   │
│           │      RISCOS AMBIENTAIS          │                   │
│           │   Queimadas e vulnerabilidade   │                   │
│           └─────────────────────────────────┘                   │
│                                                                 │
│           ┌─────────────────────────────────┐                   │
│           │    ÍNDICE AMBIENTAL (0-100)     │                   │
│           │  Vegetação + Proteção + Govern. │                   │
│           └─────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Indicadores Analisados

### Cobertura Vegetal

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `AMBIENT_COBERTURA_NATIVA` | Vegetação nativa | MapBiomas | % |
| `AMBIENT_TX_DESMATAMENTO` | Taxa de desmatamento | PRODES/MapBiomas | %/ano |
| `AMBIENT_BIOMA` | Bioma predominante | IBGE | Texto |

### Áreas Protegidas

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `AMBIENT_UC_AREA` | Área em UCs | ICMBio/SEMA | km² |
| `AMBIENT_TI_AREA` | Terras Indígenas | FUNAI | km² |
| `AMBIENT_APP` | Áreas de Preservação | CAR | km² |

### Gestão Ambiental

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `AMBIENT_ORGAO_AMBIENTAL` | Possui órgão ambiental | IBGE MUNIC | Sim/Não |
| `AMBIENT_CONSELHO` | Possui conselho ambiental | IBGE MUNIC | Sim/Não |
| `AMBIENT_FUNDO` | Possui fundo ambiental | IBGE MUNIC | Sim/Não |

### Riscos

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `AMBIENT_QUEIMADAS` | Focos de queimadas | INPE | Nº/ano |

---

## Métodos de Análise

### analyzeVegetation(municipalityId)

Analisa cobertura vegetal e pressão de desmatamento:

```typescript
const vegetation = await agent.analyzeVegetation('1721000');
// Retorna:
{
  indicators: [...],
  nativeVegetation: number,    // % de vegetação nativa
  deforestationRate: number,   // Taxa anual de desmatamento
  biome: string,               // 'Cerrado' ou 'Amazônia'
  conservationStatus: 'well_conserved' | 'moderate' | 'critical'
}
```

**Classificação:**
- `well_conserved`: Vegetação ≥ 70% E Desmatamento < 0.5%/ano
- `critical`: Vegetação < 30% OU Desmatamento > 2%/ano
- `moderate`: Demais casos

### analyzeProtectedAreas(municipalityId)

Analisa cobertura de áreas protegidas:

```typescript
const protected = await agent.analyzeProtectedAreas('1721000');
// Retorna:
{
  indicators: [...],
  ucArea: number,              // km² em UCs
  tiArea: number,              // km² em TIs
  totalProtectedArea: number,  // Total protegido
  protectedPercent: number,    // % do território
  hasSignificantProtection: boolean  // > 10%?
}
```

### analyzeEnvironmentalGovernance(municipalityId)

Analisa capacidade institucional ambiental:

```typescript
const governance = await agent.analyzeEnvironmentalGovernance('1721000');
// Retorna:
{
  indicators: [...],
  hasEnvironmentalAgency: boolean,
  hasEnvironmentalCouncil: boolean,
  hasEnvironmentalFund: boolean,
  institutionalCapacity: 'high' | 'medium' | 'low'
}
```

**Classificação:**
- `high`: 3 de 3 instrumentos presentes
- `medium`: 2 de 3
- `low`: 0 ou 1

### analyzeEnvironmentalRisks(municipalityId)

Analisa riscos de queimadas:

```typescript
const risks = await agent.analyzeEnvironmentalRisks('1721000');
// Retorna:
{
  fireSpots: number,
  fireRisk: 'low' | 'moderate' | 'high' | 'critical'
}
```

**Classificação:**
- `low`: < 100 focos/ano
- `moderate`: 100-500 focos
- `high`: 500-1000 focos
- `critical`: > 1000 focos

### getEnvironmentalProfile(municipalityId)

Perfil ambiental completo:

```typescript
const profile = await agent.getEnvironmentalProfile('1721000');
// Retorna:
{
  vegetation: {...},
  protectedAreas: {...},
  governance: {...},
  risks: {...},
  climateVulnerability: 'low' | 'medium' | 'high',
  sustainabilityOpportunities: string[],
  environmentalIndex: number  // 0-100
}
```

---

## Índice Ambiental

Cálculo do índice composto (0-100):

```
Índice = (Vegetação × 0.50) + (Proteção × 0.25) + (Governança × 0.25)

Onde:
- Vegetação = % de cobertura nativa
- Proteção = min(% protegido × 2, 100)
- Governança = (órgão?33 + conselho?33 + fundo?34)
```

| Faixa | Classificação |
|-------|---------------|
| 80-100 | Excelente |
| 60-79 | Bom |
| 40-59 | Regular |
| 20-39 | Preocupante |
| 0-19 | Crítico |

---

## Vulnerabilidade Climática

Calculada combinando:
- Cobertura vegetal (menor = mais vulnerável)
- Risco de queimadas (maior = mais vulnerável)

```typescript
climateVulnerability = f(vegetationScore, fireRisk)
```

| Resultado | Significado |
|-----------|-------------|
| `low` | Boa resiliência climática |
| `medium` | Vulnerabilidade moderada |
| `high` | Alta vulnerabilidade, atenção necessária |

---

## Oportunidades de Sustentabilidade

O agente identifica automaticamente oportunidades baseado no perfil:

| Condição | Oportunidades |
|----------|---------------|
| Vegetação ≥ 50% | PSA, Ecoturismo |
| Áreas protegidas > 10% | Turismo em UCs, Pesquisa |
| Governança alta | Certificação, Fundos climáticos |
| Bioma Cerrado | Frutos do Cerrado, Extrativismo |
| Bioma Amazônia | REDD+, Manejo florestal |

---

## Formato de Resposta JSON

```json
{
  "summary": "Resumo executivo da análise ambiental em 2-3 parágrafos",
  "key_findings": [
    "Achado 1",
    "Achado 2",
    "Achado 3"
  ],
  "conservation_status": {
    "level": "Bem conservado/Moderado/Crítico",
    "native_vegetation_percent": "percentual",
    "protected_areas_percent": "percentual",
    "main_threats": ["Ameaça 1", "Ameaça 2"]
  },
  "environmental_governance": {
    "institutional_capacity": "Alta/Média/Baixa",
    "has_environmental_council": true,
    "has_environmental_fund": false
  },
  "climate_vulnerability": "Baixa/Média/Alta",
  "sustainability_opportunities": [
    "Oportunidade 1",
    "Oportunidade 2"
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

### Tocantins Ambiental
- Localizado na transição Amazônia-Cerrado (ecótono)
- 91% Cerrado, 9% Amazônia Legal
- Rica biodiversidade, incluindo o Jalapão
- Bacias dos rios Tocantins e Araguaia
- Pressão do agronegócio sobre vegetação nativa
- Desafios: desmatamento, queimadas sazonais

### Diretrizes de Análise
1. Contextualizar na agenda climática e ODS
2. Considerar Cerrado como "berço das águas"
3. Avaliar equilíbrio desenvolvimento-preservação
4. Identificar serviços ecossistêmicos
5. Destacar oportunidades de economia verde

---

## Exemplos de Uso

### Via API

```bash
POST /api/analysis
{
  "dimension": "AMBIENT",
  "municipality_id": "1721000",
  "task": "Avalie o status de conservação ambiental de Palmas e identifique oportunidades de economia verde"
}
```

### Via Código

```typescript
import { getAmbientAgent } from './agents/dimensional';

const agent = getAmbientAgent();

// Análise de vegetação
const veg = await agent.analyzeVegetation('1721000');
console.log(`Vegetação nativa: ${veg.nativeVegetation}%`);
console.log(`Status: ${veg.conservationStatus}`);

// Perfil completo
const profile = await agent.getEnvironmentalProfile('1721000');
console.log(`Índice ambiental: ${profile.environmentalIndex}`);
console.log(`Oportunidades: ${profile.sustainabilityOpportunities.join(', ')}`);
```

---

## Metas de Referência

### Código Florestal

| Bioma | Reserva Legal Mínima |
|-------|---------------------|
| Amazônia | 80% |
| Cerrado (Amazônia Legal) | 35% |
| Cerrado (fora AL) | 20% |

### ODS 15 (Vida Terrestre)

- Conservar ecossistemas terrestres
- Combater desertificação
- Deter e reverter degradação do solo
- Deter perda de biodiversidade

### Acordo de Paris

- Redução de emissões via desmatamento zero
- Restauração de 12 milhões de hectares até 2030

---

## Referências

- [Dimensão Ambiental](../dimensions/DIMENSION_AMBIENT.md)
- [MapBiomas](https://mapbiomas.org/)
- [PRODES/INPE](http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes)
- [ICMBio](https://www.icmbio.gov.br/)

---

*Última atualização: Janeiro 2026*
