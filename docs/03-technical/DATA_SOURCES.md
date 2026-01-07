# Fontes de Dados - Tocantins Integrado

Este documento detalha as fontes de dados oficiais utilizadas no sistema Tocantins Integrado, incluindo metodologia de coleta, limitações e tratamento de dados faltantes.

## Visão Geral

| Fonte | Indicadores | Anos Disponíveis | API | Atualização |
|-------|------------|------------------|-----|-------------|
| IBGE Sidra | PIB, População | 2010-2021 (PIB), 2020-2024 (Pop) | Sim | Anual |
| Atlas Brasil | IDH | 1991, 2000, 2010 | Não | Censo |
| INEP | IDEB | 2005-2023 (ímpares) | Parcial | Bienal |
| DataSUS | Mortalidade Infantil | 2000-2023 | TabNet | Anual |
| SNIS | Saneamento | 2001-2022 | Não | Anual |
| MapBiomas | Uso do Solo, Vegetação | 1985-2022 | Download | Anual |
| SICONFI/Tesouro | Receitas, Despesas | 2015-2024 | Sim | Anual |
| Comex Stat | Exportações, Importações | 1997-2024 | Sim | Mensal |

---

## 1. IBGE Sidra

### URL
- Portal: https://sidra.ibge.gov.br/
- API: https://apisidra.ibge.gov.br/

### Indicadores Coletados

#### PIB Municipal (Tabela 5938)
- **Código**: `PIB_TOTAL`, `PIB_PER_CAPITA`
- **Variáveis**: 37 (PIB), 513 (PIB per capita)
- **Unidade**: R$ (PIB), R$/hab (per capita)
- **Anos**: 2010-2021
- **Limitação**: Dados de PIB municipal têm defasagem de ~3 anos

#### População Estimada (Tabela 6579)
- **Código**: `POPULACAO`
- **Variável**: 93
- **Unidade**: habitantes
- **Anos**: 2020-2024
- **Fonte primária**: Estimativas anuais IBGE

### Metodologia de Coleta
```
GET https://apisidra.ibge.gov.br/values/t/5938/n6/in n3 17/v/37,513/p/2020,2021
```

### Tratamento de Dados Faltantes
- PIB para anos > 2021: Marcado como `unavailable`
- Municípios sem dados: NULL com nota explicativa

---

## 2. Atlas do Desenvolvimento Humano (PNUD/IPEA/FJP)

### URL
- Portal: https://www.atlasbrasil.org.br/
- Download: https://www.atlasbrasil.org.br/acervo/biblioteca

### Indicadores Coletados

#### IDH Municipal (IDHM)
- **Códigos**: `IDH`, `IDH_RENDA`, `IDH_LONGEVIDADE`, `IDH_EDUCACAO`
- **Escala**: 0 a 1
- **Anos oficiais**: 1991, 2000, 2010
- **Limitação crítica**: Não há IDHM oficial após 2010

### Classificação IDH
| Faixa | Classificação |
|-------|---------------|
| 0.800+ | Muito Alto |
| 0.700-0.799 | Alto |
| 0.600-0.699 | Médio |
| 0.500-0.599 | Baixo |
| < 0.500 | Muito Baixo |

### Tratamento de Dados Faltantes
- **Anos após 2010**: Estimativas baseadas em:
  - Taxa média de crescimento histórico (~0.5%/ano)
  - Projeções acadêmicas
  - Marcados como `data_quality: 'estimated'`
- **Aguardando**: Dados do Censo 2022 (previsão: 2025)

### Notas Importantes
> ⚠️ O IDHM mais recente é de 2010 (Censo). Valores para 2020+ são **estimativas** e devem ser interpretados com cautela.

---

## 3. INEP - Índice de Desenvolvimento da Educação Básica

### URL
- Portal: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb
- Resultados: https://ideb.inep.gov.br/resultado/

### Indicadores Coletados

#### IDEB
- **Códigos**: `IDEB_ANOS_INICIAIS`, `IDEB_ANOS_FINAIS`, `IDEB_FUNDAMENTAL`
- **Escala**: 0 a 10
- **Anos**: 2005, 2007, 2009, 2011, 2013, 2015, 2017, 2019, 2021, 2023
- **Periodicidade**: Bienal (anos ímpares)

### Fórmula do IDEB
```
IDEB = N × P
Onde:
  N = Média de proficiência em Língua Portuguesa e Matemática
  P = Taxa de aprovação
```

### Metas
| Ano | Meta Brasil | Tocantins |
|-----|-------------|-----------|
| 2021 | 5.8 | 5.2 |
| 2023 | 6.0 | 5.4 |
| 2025 | 6.2 | 5.6 |

### Tratamento de Dados Faltantes
- **Anos pares**: Usar IDEB do ano ímpar anterior
- **Municípios sem dados**: Estimar com média microrregional
- **Escolas rurais/pequenas**: Podem não ter IDEB calculado

---

## 4. DataSUS - Sistema de Informações de Saúde

### URL
- Portal: https://datasus.saude.gov.br/
- TabNet: http://tabnet.datasus.gov.br/

### Indicadores Coletados

#### Taxa de Mortalidade Infantil
- **Código**: `MORTALIDADE_INFANTIL`
- **Unidade**: por 1.000 nascidos vivos
- **Fonte**: SIM (óbitos) + SINASC (nascidos vivos)
- **Anos**: 2000-2023

### Fórmula
```
TMI = (Óbitos < 1 ano / Nascidos vivos) × 1.000
```

### Referências
| Região | Taxa 2023 |
|--------|-----------|
| Brasil | 12.0 |
| Norte | 15.3 |
| Tocantins | 14.2 |
| Meta ODS 2030 | 12.0 |

#### Cobertura ESF
- **Código**: `COBERTURA_ESF`
- **Unidade**: % da população
- **Fonte**: e-Gestor AB
- **URL**: https://egestorab.saude.gov.br/

### Tratamento de Dados Faltantes
- Municípios pequenos com poucos nascimentos: dados podem ser instáveis
- Marcados com `data_quality: 'estimated'` quando extrapolados
- Nota indica a limitação estatística

---

## 5. SNIS - Sistema Nacional de Informações sobre Saneamento

### URL
- Portal: https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis
- Série Histórica: http://app4.mdr.gov.br/serieHistorica/

### Indicadores Coletados

#### Cobertura de Água (IN055)
- **Código**: `COBERTURA_AGUA`
- **Unidade**: % da população
- **Anos**: 2001-2022

#### Cobertura de Esgoto (IN056)
- **Código**: `COBERTURA_ESGOTO`
- **Unidade**: % da população
- **Anos**: 2001-2022

### Metas PLANSAB 2033
| Indicador | Meta |
|-----------|------|
| Água | 99% |
| Esgoto | 93% |

### Limitações
- Dados autodeclarados pelos prestadores de serviço
- Municípios sem prestador formal podem não ter dados
- Última publicação: 2022

### Tratamento de Dados Faltantes
- **Anos > 2022**: Projeção com taxa de crescimento estimada
  - Água: 1.5%/ano
  - Esgoto: 2.5%/ano
- **Municípios sem dados**: Estimativa regional baseada em:
  - Porte do município
  - Microrregião
  - Média estadual

---

## 6. MapBiomas - Uso e Cobertura do Solo

### URL
- Portal: https://brasil.mapbiomas.org/
- Estatísticas: https://brasil.mapbiomas.org/estatisticas/
- Plataforma: https://plataforma.brasil.mapbiomas.org/

### Indicadores Coletados

#### Cobertura de Vegetação Nativa
- **Código**: `VEGETACAO_NATIVA_PCT`
- **Unidade**: % do território municipal
- **Anos**: 1985-2022 (Coleção 8)
- **Resolução**: 30 metros

#### Desmatamento Anual
- **Código**: `DESMATAMENTO_HA`
- **Unidade**: hectares/ano
- **Cálculo**: Variação de vegetação nativa entre anos

#### Uso Agropecuário
- **Códigos**: `AGRICULTURA_HA`, `PASTAGEM_HA`
- **Unidade**: hectares
- **Classes MapBiomas**: 15 (pastagem), 18-48 (agricultura)

### Metodologia de Coleta
```
Download: https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_8/downloads/statistics/
Arquivo: MAPBIOMAS_COL8_TOCANTINS_MUNICIPIO.csv
```

### Classes de Uso (Nível 1)
| Código | Classe |
|--------|--------|
| 1 | Floresta |
| 2 | Formação Natural não Florestal |
| 3 | Agropecuária |
| 4 | Área não Vegetada |
| 5 | Corpo d'Água |

### Tratamento de Dados Faltantes
- **Anos > 2022**: Aguardar Coleção 9 (previsão: Agosto 2024)
- **Municípios**: Todos os 139 municípios possuem dados
- **Estimativas**: Baseadas em médias regionais quando necessário

### Limitações
- Dados via download (não há API REST pública)
- Atualização anual com defasagem de 6-12 meses
- Algumas classes podem ter confusão em áreas de transição

---

## 7. SICONFI - Sistema de Informações Contábeis e Fiscais

### URL
- Portal: https://siconfi.tesouro.gov.br/
- API: https://apidatalake.tesouro.gov.br/
- Documentação: https://apidatalake.tesouro.gov.br/docs/siconfi/

### Indicadores Coletados

#### Receita Corrente Líquida (RCL)
- **Código**: `RECEITA_CORRENTE_LIQUIDA`
- **Unidade**: R$
- **Fonte**: DCA (Declaração de Contas Anuais) / RREO

#### Receitas Tributárias
- **Códigos**: `RECEITA_TRIBUTARIA`, `RECEITA_IPTU`, `RECEITA_ISS`, `RECEITA_ITBI`
- **Unidade**: R$
- **Classificação**: Código de conta 1.1.x

#### Despesas por Função
- **Códigos**: `DESPESA_EDUCACAO`, `DESPESA_SAUDE`, `DESPESA_PESSOAL`
- **Unidade**: R$
- **Funções**: 12 (Educação), 10 (Saúde)

#### Índice de Dependência de Transferências
- **Código**: `INDICE_DEPENDENCIA_TRANSFERENCIAS`
- **Fórmula**: (Transferências Correntes / RCL) × 100
- **Interpretação**: >70% indica alta dependência

### Metodologia de Coleta (API REST)
```
# Receitas - DCA
GET https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca_orcamentaria
    ?an_exercicio=2023
    &no_anexo=DCA-Anexo%20I-C
    &id_ente=1721000

# Despesas - DCA
GET https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca_orcamentaria
    ?an_exercicio=2023
    &no_anexo=DCA-Anexo%20I-E
    &id_ente=1721000
```

### Demonstrativos Disponíveis
| Sigla | Nome | Periodicidade |
|-------|------|---------------|
| DCA | Declaração de Contas Anuais | Anual |
| RREO | Relatório Resumido Execução Orçamentária | Bimestral |
| RGF | Relatório de Gestão Fiscal | Quadrimestral |

### Tratamento de Dados Faltantes
- **Municípios sem DCA**: Usar dados do RREO (último bimestre)
- **Anos recentes**: Podem ter atraso de envio pelos municípios
- **Validação**: Cruzar com dados do FINBRA quando disponível

### Limitações
- Dependente do envio pelos municípios
- Qualidade dos dados varia
- Padronização contábil em implementação

---

## 8. Comex Stat - Estatísticas de Comércio Exterior

### URL
- Portal: http://comexstat.mdic.gov.br/
- Documentação: http://comexstat.mdic.gov.br/pt/about

### Indicadores Coletados

#### Exportações
- **Código**: `EXPORTACOES_FOB_USD`
- **Unidade**: US$ (valor FOB)
- **Desagregação**: Município, produto (NCM/SH)

#### Importações
- **Código**: `IMPORTACOES_FOB_USD`
- **Unidade**: US$ (valor FOB)

#### Balança Comercial
- **Código**: `BALANCA_COMERCIAL_USD`
- **Fórmula**: Exportações - Importações

### Principais Produtos do Tocantins
| Posição | Produto | % Exportações |
|---------|---------|---------------|
| 1 | Soja em grãos | ~65% |
| 2 | Carne bovina | ~20% |
| 3 | Milho | ~8% |
| 4 | Óleo de soja | ~4% |
| 5 | Celulose | ~2% |

### Metodologia de Coleta
```
# Exportações por município
POST http://api.comexstat.mdic.gov.br/cities
{
  "coAno": 2023,
  "coUfIbge": "17",
  "fluxo": 1
}
```

### Tratamento de Dados Faltantes
- **Municípios sem atividade**: Registrar como zero (valor oficial)
- **Dados confidenciais**: Alguns produtos são omitidos por sigilo
- **Estimativas**: Baseadas em participação histórica no comércio estadual

### Limitações
- Muitos municípios pequenos não têm atividade exportadora
- Concentração em poucos municípios produtores de soja/carne
- API pode ter instabilidades

---

## Execução da Coleta

### Comando
```bash
# Coletar todos os indicadores, anos 2020-2024
npx ts-node src/collectors/index.ts

# Especificar anos
npx ts-node src/collectors/index.ts --years=2022,2023,2024

# Saída em JSON
npx ts-node src/collectors/index.ts --output=json

# Teste piloto apenas para Palmas
npx ts-node src/tests/integration/test-palmas.ts

# Teste de integração completo
npx ts-node src/tests/integration/test-full-flow.ts

# Teste de um único município
npx ts-node src/tests/integration/test-full-flow.ts --municipality=1721000
```

### Saída
Os dados coletados são salvos em:
- `src/database/seeds/collected/data_collection_YYYY-MM-DD.sql`
- `src/database/seeds/collected/data_collection_YYYY-MM-DD.json`

### Workflows n8n

Para coleta automatizada, importar os workflows:

| Workflow | Arquivo | Descrição |
|----------|---------|-----------|
| Coleta Inicial | `n8n/workflows/data-collection-initial.json` | Carga inicial de todos os dados |
| Coleta Mensal | `n8n/workflows/data-collection-scheduled.json` | Atualização mensal (cron: dia 1, 3h) |
| Monitoramento | `n8n/workflows/data-sources-monitor.json` | Verifica disponibilidade das APIs (semanal) |

#### Configuração do Monitoramento
O workflow de monitoramento verifica:
- Disponibilidade das APIs (HTTP 200)
- Tempo de resposta
- Novas versões de dados (ex: MapBiomas Coleção)

Alertas são enviados via Slack quando há problemas detectados.

---

## Qualidade dos Dados

### Classificação
| Código | Significado |
|--------|-------------|
| `official` | Dado oficial da fonte primária |
| `estimated` | Estimativa baseada em metodologia documentada |
| `unavailable` | Dado não disponível na fonte |

### Recomendações de Uso
1. **Priorizar dados `official`** para análises críticas
2. **Dados `estimated`** podem ser usados para tendências
3. **Sempre verificar a nota** (`notes`) para contexto
4. **Atualizar periodicamente** quando novas fontes disponíveis

---

## Próximas Atualizações Esperadas

| Fonte | Dado | Previsão |
|-------|------|----------|
| IBGE | PIB 2022 | 2025 |
| Atlas Brasil | IDHM Censo 2022 | 2025 |
| INEP | IDEB 2025 | Set/2026 |
| DataSUS | Mortalidade 2024 | Jun/2025 |
| SNIS | Saneamento 2023 | Dez/2024 |

---

## Contato e Suporte

Para questões sobre os dados:
- IBGE: https://www.ibge.gov.br/acesso-informacao/fale-conosco.html
- INEP: https://www.gov.br/inep/pt-br/acesso-a-informacao/fale-conosco
- DataSUS: https://datasus.saude.gov.br/fale-conosco/
- SNIS: snis@mdr.gov.br
