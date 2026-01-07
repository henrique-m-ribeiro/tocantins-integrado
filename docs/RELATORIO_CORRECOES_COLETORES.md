# Relatório de Correções nos Coletores de Dados

**Data:** 07/01/2026
**Versão:** 2.0

---

## 1. Resumo Executivo

### Situação Anterior (Piloto v1)
| Métrica | Valor |
|---------|-------|
| Total de registros | 89 |
| Dados oficiais | 44 (49.4%) |
| **Dados estimados** | **45 (50.6%)** |
| Dados indisponíveis | 0 |

### Situação Atual (Piloto v2 - Corrigido)
| Métrica | Valor |
|---------|-------|
| Total de registros | 89 |
| Dados oficiais | 44 (49.4%) |
| **Dados estimados** | **0 (0%)** |
| Dados indisponíveis | 45 (50.6%) |

**Resultado:** Todas as estimativas não validadas foram eliminadas. Dados agora são claramente oficiais ou marcados como indisponíveis até acesso à fonte oficial.

---

## 2. Correções Implementadas

### 2.1 MapBiomasCollector

**Problema:** Usava estimativas regionais baseadas em médias do Tocantins.

**Correção:** Dados marcados como `unavailable` até integração com download oficial.

**Arquivo:** `src/collectors/sources/MapBiomasCollector.ts`

```typescript
// ANTES
data_quality: 'estimated',
notes: 'Estimativa baseada em dados regionais do MapBiomas Coleção 8'

// DEPOIS
data_quality: 'unavailable',
notes: 'Dado requer download da planilha oficial MapBiomas Coleção 8. Ref: MapBiomas (2023)'
```

**Referência:** MapBiomas. Coleção 8 da Série Anual de Mapas de Uso e Cobertura da Terra do Brasil. 2023.

**Fonte oficial:** https://brasil.mapbiomas.org/estatisticas/

---

### 2.2 AtlasBrasilCollector

**Problema:** Projetava valores de IDH para anos sem Censo usando interpolação.

**Correção:** Retorna apenas dados oficiais do Censo 2010. Anos posteriores marcados como indisponíveis.

**Arquivo:** `src/collectors/sources/AtlasBrasilCollector.ts`

```typescript
// ANTES
if (year >= 2020 && idhData?.idh_2020_estimado) {
  this.addEstimatedIDH(ibge_code, year, idhData.idh_2020_estimado);
} else {
  const estimatedIdh = this.interpolateIDH(idhData.idh_2010, year);
  // ...
  data_quality: 'estimated'
}

// DEPOIS
if (year === 2010 && idhData) {
  this.addOfficialIDH(ibge_code, idhData);
} else {
  // Anos diferentes de 2010: marcar como indisponível
  data_quality: 'unavailable',
  notes: 'IDHM disponível apenas em anos de Censo (2010). Aguardando IDHM 2022. Ref: PNUD/IPEA/FJP (2013)'
}
```

**Referência:** PNUD; IPEA; FJP. Atlas do Desenvolvimento Humano no Brasil: Metodologia. Brasília: PNUD, 2013.

**Nota:** IDHM 2022 ainda não publicado pelo Atlas Brasil.

---

### 2.3 ComexStatCollector

**Problema:** Usava distribuição proporcional regional quando API não disponível.

**Correção:** Dados marcados como `unavailable` quando API não acessível. Zero estimativas.

**Arquivo:** `src/collectors/sources/ComexStatCollector.ts`

```typescript
// ANTES
const share = distribution[muni.ibge_code] || 0;
const value = Math.round(totalValue * share);
data_quality: value > 0 ? 'estimated' : 'official',
notes: 'Estimativa baseada em participação regional'

// DEPOIS
data_quality: 'unavailable',
notes: 'Dados requerem acesso à API Comex Stat. Consultar: http://comexstat.mdic.gov.br/pt/municipio. Ref: MDIC (2024)'
```

**Referência:** MDIC. Sistema de Análise das Informações de Comércio Exterior. 2024.

**Fonte oficial:** http://comexstat.mdic.gov.br/pt/municipio

---

### 2.4 SNISCollector

**Problema:** Extrapolava dados para anos fora do período 2020-2022 usando taxas de crescimento.

**Correção:** Retorna apenas dados oficiais (2020-2022). Anos fora marcados como indisponíveis.

**Arquivo:** `src/collectors/sources/SNISCollector.ts`

```typescript
// ANTES
private async collectWithExtrapolation(year: number): Promise<void> {
  const waterGrowthRate = 0.015; // 1.5% ao ano
  const extrapolatedWater = baseWater * Math.pow(1 + waterGrowthRate, yearsDiff);
  data_quality: 'estimated',
  notes: 'Projeção baseada em 2022 com taxa de crescimento'
}

// DEPOIS
private async markYearUnavailable(year: number): Promise<void> {
  data_quality: 'unavailable',
  notes: 'Dados SNIS disponíveis apenas para 2020-2022. Consultar: http://app4.mdr.gov.br/serieHistorica/. Ref: MDR (2023)'
}
```

**Referência:** MDR. Sistema Nacional de Informações sobre Saneamento - SNIS. 2023.

**Fonte oficial:** http://app4.mdr.gov.br/serieHistorica/

---

## 3. Dados Oficiais Disponíveis (Após Correção)

| Indicador | Fonte | Anos Disponíveis | Registros |
|-----------|-------|------------------|-----------|
| IDEB_ANOS_INICIAIS | INEP/MEC | 2019, 2021, 2023 | 6 |
| IDEB_ANOS_FINAIS | INEP/MEC | 2019, 2021, 2023 | 6 |
| IDEB_FUNDAMENTAL | INEP/MEC | 2019, 2021, 2023 | 6 |
| MORTALIDADE_INFANTIL | DataSUS/SIM | 2019-2023 | 10 |
| COBERTURA_ESF | DataSUS/e-Gestor | 2022-2023 | 4 |
| COBERTURA_AGUA | SNIS/MDR | 2020-2022 | 6 |
| COBERTURA_ESGOTO | SNIS/MDR | 2020-2022 | 6 |
| **TOTAL OFICIAL** | | | **44** |

---

## 4. Dados Indisponíveis (Requerem Ação)

| Indicador | Fonte | Motivo | Ação Necessária |
|-----------|-------|--------|-----------------|
| VEGETACAO_NATIVA_PCT | MapBiomas | Sem download automático | Integrar planilha oficial |
| AGRICULTURA_HA | MapBiomas | Sem download automático | Integrar planilha oficial |
| PASTAGEM_HA | MapBiomas | Sem download automático | Integrar planilha oficial |
| IDH | Atlas Brasil | Apenas Censo 2010 | Aguardar IDHM 2022 |
| EXPORTACOES_FOB_USD | Comex Stat | API inacessível sandbox | Testar em produção |
| IMPORTACOES_FOB_USD | Comex Stat | API inacessível sandbox | Testar em produção |
| BALANCA_COMERCIAL_USD | Comex Stat | API inacessível sandbox | Testar em produção |
| COBERTURA_AGUA (2019, 2023) | SNIS | Fora período oficial | Aguardar publicação |
| COBERTURA_ESGOTO (2019, 2023) | SNIS | Fora período oficial | Aguardar publicação |
| PIB_PERCAPITA | IBGE Sidra | API inacessível sandbox | Testar em produção |
| POPULACAO | IBGE Sidra | API inacessível sandbox | Testar em produção |
| Dados fiscais (SICONFI) | STN | API inacessível sandbox | Testar em produção |

---

## 5. Problemas Persistentes

### 5.1 Conectividade de APIs (Ambiente Sandbox)

| API | Status | Erro | Resolução |
|-----|--------|------|-----------|
| IBGE Sidra | FALHA | `fetch failed` | Testar em ambiente com acesso externo |
| SICONFI/Tesouro | FALHA | `fetch failed` | Testar em ambiente com acesso externo |
| Comex Stat | FALHA | `fetch failed` | Testar em ambiente com acesso externo |

**Diagnóstico:** O ambiente sandbox bloqueia chamadas HTTP para algumas APIs externas. APIs que retornam dados pré-processados (INEP, DataSUS, SNIS) funcionam corretamente.

### 5.2 Dados Estruturalmente Indisponíveis

| Dado | Motivo | Solução |
|------|--------|---------|
| IDHM 2019-2023 | Apenas calculado em Censos | Aguardar publicação IDHM 2022 |
| SNIS 2019 | Dados não publicados | Sem solução |
| SNIS 2023 | Dados não publicados | Aguardar publicação 2024 |

### 5.3 Fontes que Requerem Download Manual

| Fonte | Tipo | URL | Formato |
|-------|------|-----|---------|
| MapBiomas | Planilha | https://brasil.mapbiomas.org/estatisticas/ | XLSX |
| Atlas Brasil | Planilha | https://www.atlasbrasil.org.br/ranking | CSV/XLSX |

---

## 6. Comparativo de Qualidade

### Antes das Correções
```
[PROBLEMA] 50.6% dos dados eram "estimados" sem metodologia validada
           ou citação de referência oficial.

Exemplos de estimativas removidas:
- IDH interpolado com taxa de 0.5%/ano (sem referência)
- Comércio exterior distribuído por participação regional
- Cobertura de saneamento extrapolada com taxa de 1.5-2.5%/ano
- Uso do solo estimado por médias regionais
```

### Depois das Correções
```
[OK] 0% de dados estimados
[OK] 49.4% de dados oficiais com fonte e referência
[OK] 50.6% de dados marcados como indisponíveis (honestidade)

Cada registro agora contém:
- Referência bibliográfica (Ref: FONTE (ANO))
- URL da fonte oficial
- Nota explicando motivo de indisponibilidade
```

---

## 7. Próximos Passos para 100% Oficial

### Prioridade 1: Resolver Conectividade
1. Testar coletores em ambiente com acesso externo completo
2. Validar APIs IBGE Sidra, SICONFI, Comex Stat

### Prioridade 2: Integrar Downloads Manuais
3. Implementar parser para planilha MapBiomas (XLSX)
4. Carregar dados IDHM 2010 completos do Atlas Brasil

### Prioridade 3: Expansão
5. Implementar coletor PRODES/INPE (desmatamento)
6. Implementar coletor BDQueimadas (focos de calor)

---

## 8. Conclusão

As correções implementadas garantem que o MVP não contenha dados estimados sem validação. O sistema agora opera com o princípio:

> **"Melhor não ter o dado do que ter um dado incorreto."**

Dados indisponíveis são claramente sinalizados com:
- Fonte oficial de onde obter
- Referência bibliográfica
- Motivo da indisponibilidade

O próximo passo é testar em ambiente de produção com acesso completo às APIs externas.

---

*Documento gerado em: 07/01/2026*
*Versão: 2.0*
