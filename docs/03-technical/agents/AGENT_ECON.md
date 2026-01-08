# Agente ECON

**Agente de Análise Econômica - Tocantins Integrado**

---

## Visão Geral

O Agente Econômico analisa indicadores de PIB, emprego, renda, finanças públicas e atividades econômicas dos municípios tocantinenses.

| Atributo | Valor |
|----------|-------|
| **Dimensão** | ECON |
| **Arquivo** | `src/agents/dimensional/EconAgent.ts` |
| **Modelo** | GPT-4 Turbo |
| **Temperatura** | 0.3 |

---

## Áreas de Análise

```
┌─────────────────────────────────────────────────────────────┐
│                      AGENTE ECON                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  PIB E VALOR    │  │   EMPREGO E     │  │  FINANÇAS   │  │
│  │   ADICIONADO    │  │     RENDA       │  │  PÚBLICAS   │  │
│  │                 │  │                 │  │             │  │
│  │  • PIB Total    │  │  • Empregos     │  │  • Receitas │  │
│  │  • PIB per cap. │  │    formais      │  │  • Despesas │  │
│  │  • VA Agro      │  │  • Salário médio│  │  • FPM      │  │
│  │  • VA Indústria │  │  • Renda média  │  │  • Dependênc│  │
│  │  • VA Serviços  │  │                 │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
│           ┌─────────────────────────────┐                   │
│           │     PERFIL ECONÔMICO        │                   │
│           │  Setor + Fiscal + Potencial │                   │
│           └─────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Indicadores Analisados

### PIB e Valor Adicionado

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `ECON_PIB_TOTAL` | PIB Total | IBGE | R$ mil |
| `ECON_PIB_PER_CAPITA` | PIB per capita | IBGE | R$ |
| `ECON_VA_AGRO` | VA Agropecuária | IBGE | R$ mil |
| `ECON_VA_INDUSTRIA` | VA Indústria | IBGE | R$ mil |
| `ECON_VA_SERVICOS` | VA Serviços | IBGE | R$ mil |
| `ECON_VA_ADM_PUB` | VA Administração Pública | IBGE | R$ mil |

### Emprego e Renda

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `ECON_EMPREGOS_FORMAIS` | Empregos formais | RAIS/CAGED | Nº |
| `ECON_SALARIO_MEDIO` | Salário médio | RAIS | R$ |
| `ECON_RENDA_MEDIA` | Renda média domiciliar | IBGE | R$ |
| `ECON_TX_OCUPACAO` | Taxa de ocupação | IBGE | % |

### Finanças Públicas

| Código | Indicador | Fonte | Unidade |
|--------|-----------|-------|---------|
| `ECON_RECEITA_TOTAL` | Receita total | SICONFI | R$ |
| `ECON_RECEITA_PROPRIA` | Receita tributária própria | SICONFI | R$ |
| `ECON_DESPESA_TOTAL` | Despesa total | SICONFI | R$ |
| `ECON_FPM` | Transferência FPM | STN | R$ |
| `ECON_DEPENDENCIA_TRANSF` | Dependência de transferências | Calculado | % |

---

## Métodos de Análise

### analyzePIB(municipalityId, year?)

Analisa PIB e composição setorial:

```typescript
const pib = await agent.analyzePIB('1721000', 2022);
// Retorna array de indicator_values com:
// - ECON_PIB_TOTAL
// - ECON_PIB_PER_CAPITA
// - ECON_VA_AGRO, VA_INDUSTRIA, VA_SERVICOS, VA_ADM_PUB
```

### analyzeEmployment(municipalityId)

Analisa mercado de trabalho:

```typescript
const employment = await agent.analyzeEmployment('1721000');
// Retorna array de indicator_values com:
// - ECON_EMPREGOS_FORMAIS
// - ECON_SALARIO_MEDIO
// - ECON_RENDA_MEDIA
```

### analyzeFiscal(municipalityId)

Analisa finanças públicas:

```typescript
const fiscal = await agent.analyzeFiscal('1721000');
// Retorna array de indicator_values com:
// - ECON_RECEITA_TOTAL, RECEITA_PROPRIA
// - ECON_DEPENDENCIA_TRANSF
// - ECON_FPM
```

### getEconomicProfile(municipalityId)

Perfil econômico completo:

```typescript
const profile = await agent.getEconomicProfile('1721000');
// Retorna:
{
  mainSector: 'Serviços',
  sectorComposition: [
    { sector: 'Serviços', percentage: 45.2 },
    { sector: 'Administração Pública', percentage: 28.1 },
    { sector: 'Agropecuária', percentage: 18.5 },
    { sector: 'Indústria', percentage: 8.2 }
  ],
  fiscalHealth: 'good' | 'regular' | 'critical',
  dependencyLevel: 'low' | 'medium' | 'high'
}
```

---

## Classificações

### Saúde Fiscal

Baseada na dependência de transferências:

| Dependência | Classificação |
|-------------|---------------|
| < 60% | `good` (Boa) |
| 60-80% | `regular` |
| > 80% | `critical` (Crítica) |

### Perfil Setorial

O setor principal é identificado pelo maior percentual do Valor Adicionado:

- **Agropecuária**: Municípios rurais, produção de grãos ou pecuária
- **Indústria**: Polos industriais (raro no TO)
- **Serviços**: Centros urbanos, comércio, turismo
- **Administração Pública**: Pequenos municípios dependentes do funcionalismo

---

## Formato de Resposta JSON

```json
{
  "summary": "Resumo executivo da análise em 2-3 parágrafos",
  "key_findings": [
    "Achado 1",
    "Achado 2",
    "Achado 3"
  ],
  "strengths": [
    "Ponto forte 1",
    "Ponto forte 2"
  ],
  "weaknesses": [
    "Desafio 1",
    "Desafio 2"
  ],
  "recommendations": [
    "Recomendação 1",
    "Recomendação 2"
  ],
  "economic_profile": {
    "main_sector": "Setor dominante",
    "fiscal_health": "Boa/Regular/Crítica",
    "growth_potential": "Alto/Médio/Baixo"
  }
}
```

---

## Contexto Especializado

O agente possui conhecimento embarcado sobre:

### Tocantins Econômico
- Estado mais novo do Brasil (1988)
- Economia baseada em agropecuária e serviços
- 139 municípios com grande heterogeneidade
- Palmas concentra PIB de serviços
- Polo agroindustrial no sul (Gurupi)
- Alta dependência de FPM na maioria dos municípios

### Diretrizes de Análise
1. Contextualizar com comparações (estado, região, Brasil)
2. Identificar vocações econômicas
3. Avaliar dependência fiscal
4. Destacar oportunidades de desenvolvimento
5. Considerar contexto regional (Bico do Papagaio, Jalapão)

---

## Exemplos de Uso

### Via API

```bash
POST /api/analysis
{
  "dimension": "ECON",
  "municipality_id": "1721000",
  "task": "Analise a estrutura econômica de Palmas e identifique oportunidades de diversificação"
}
```

### Via Código

```typescript
import { getEconAgent } from './agents/dimensional';

const agent = getEconAgent();

// Análise de PIB
const pib = await agent.analyzePIB('1721000', 2022);

// Perfil econômico
const profile = await agent.getEconomicProfile('1721000');
console.log(`Setor principal: ${profile.mainSector}`);
console.log(`Saúde fiscal: ${profile.fiscalHealth}`);
```

---

## Métricas de Referência

### PIB per capita (2021)

| Referência | Valor (R$) |
|------------|------------|
| Brasil | 41.685 |
| Tocantins | 32.412 |
| Palmas | 32.947 |

### Dependência de Transferências

| Classificação | Faixa |
|---------------|-------|
| Baixa | < 60% |
| Média | 60-80% |
| Alta | > 80% |

**Média TO:** ~85% dos municípios têm alta dependência

---

## Referências

- [Dimensão Econômica](../dimensions/DIMENSION_ECON.md)
- [Fontes de Dados - IBGE Sidra](../DATA_SOURCES.md#ibge-sidra)
- [Fontes de Dados - SICONFI](../DATA_SOURCES.md#siconfi)
- [IBGE PIB Municípios](https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html)

---

*Última atualização: Janeiro 2026*
