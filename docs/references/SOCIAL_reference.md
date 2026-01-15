# Referência - Dimensão Social (SOCIAL)

> Guia de indicadores sociais, educação, saúde e desenvolvimento humano

## 📊 Visão Geral

A dimensão social analisa educação, saúde, assistência social e desenvolvimento humano dos municípios tocantinenses.

**Importância**: Avaliar qualidade de vida, vulnerabilidade social e efetividade de políticas públicas.

## 📈 Principais Indicadores (17 indicadores)

### Educação
- `SOCIAL_IDEB_AI`: IDEB Anos Iniciais (INEP, anual)
- `SOCIAL_IDEB_AF`: IDEB Anos Finais (INEP, anual)
- `SOCIAL_TX_ANALFABETISMO`: Taxa de Analfabetismo (IBGE, censo)
- `SOCIAL_TX_ABANDONO_EF`: Taxa de Abandono EF (INEP, anual)
- `SOCIAL_MATRICULAS_EF`: Matrículas EF (INEP, anual)

### Saúde
- `SOCIAL_TX_MORTALIDADE_INF`: Mortalidade Infantil (DataSUS, anual)
- `SOCIAL_COBERTURA_ESF`: Cobertura ESF (e-Gestor AB, mensal)
- `SOCIAL_LEITOS_SUS`: Leitos SUS/1000 hab (DataSUS, anual)
- `SOCIAL_MEDICOS_SUS`: Médicos SUS/1000 hab (DataSUS, anual)

### Assistência Social
- `SOCIAL_FAMILIAS_BF`: Famílias Bolsa Família (MDS, mensal)
- `SOCIAL_CADUNICO`: Famílias CadÚnico (MDS, mensal)
- `SOCIAL_BPC`: Beneficiários BPC (MDS, mensal)

### IDHM
- `SOCIAL_IDHM`: IDHM (Atlas Brasil, censo)
- `SOCIAL_IDHM_E`: IDHM Educação (Atlas Brasil, censo)
- `SOCIAL_IDHM_L`: IDHM Longevidade (Atlas Brasil, censo)
- `SOCIAL_IDHM_R`: IDHM Renda (Atlas Brasil, censo)

## 🔌 Fontes de Dados

### INEP - Educação
**URL**: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos

**API IDEB**: Disponível (em desenvolvimento)
**Dados Abertos**: Censo Escolar (microdados anuais)

**Indicadores**:
- IDEB por município e rede
- Matrículas, docentes, infraestrutura
- Taxas de aprovação, reprovação, abandono

**Coleta**: Manual (download + processamento)

### DataSUS - Saúde
**URL**: http://tabnet.datasus.gov.br/

**Sistemas**:
- SINASC: Nascidos vivos
- SIM: Mortalidade
- CNES: Estabelecimentos e profissionais

**Método**: Scraping (TabNet não possui API pública)

**Nota**: e-Gestor AB possui API para cobertura ESF

### MDS - Assistência Social
**URL**: https://aplicacoes.mds.gov.br/sagi/

**Dados**: Bolsa Família, CadÚnico, BPC

**Método**: Manual (portal SAGI)

### Atlas Brasil - IDHM
**URL**: http://www.atlasbrasil.org.br/

**Dados**: IDHM e subíndices (censo)

**Método**: Manual (download de planilhas)

## 📊 Análises Típicas

### Perfil Educacional
```sql
SELECT
    m.name,
    MAX(CASE WHEN id.code = 'SOCIAL_IDEB_AI' THEN iv.value END) AS ideb_ai,
    MAX(CASE WHEN id.code = 'SOCIAL_IDEB_AF' THEN iv.value END) AS ideb_af,
    CASE
        WHEN MAX(CASE WHEN id.code = 'SOCIAL_IDEB_AI' THEN iv.value END) >= 6.0 THEN 'Adequado'
        WHEN MAX(CASE WHEN id.code = 'SOCIAL_IDEB_AI' THEN iv.value END) < 4.0 THEN 'Crítico'
        ELSE 'Em desenvolvimento'
    END AS classificacao
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('SOCIAL_IDEB_AI', 'SOCIAL_IDEB_AF')
GROUP BY m.name;
```

## 🎯 Contexto Tocantins

**IDEB Médio TO (2021)**: 
- Anos Iniciais: 5.5
- Anos Finais: 5.0

**Saúde**:
- Cobertura ESF > 80% (acima da média nacional)
- Mortalidade Infantil: ~12/1000 NV

**Vulnerabilidade**:
- 30-40% das famílias no CadÚnico em municípios pequenos

**Referências**:
- [INEP Dados Abertos](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos)
- [DataSUS TabNet](http://tabnet.datasus.gov.br/)
- [Atlas Brasil](http://www.atlasbrasil.org.br/)

---
**Última atualização**: Janeiro 2026
