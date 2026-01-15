# Referência - Dimensão Econômica (ECON)

> Guia completo de indicadores econômicos, fontes de dados e metodologias de coleta

---

## 📊 Visão Geral da Dimensão

A dimensão econômica analisa a estrutura produtiva, finanças públicas e mercado de trabalho dos municípios do Tocantins. É fundamental para:

- Identificar vocações econômicas municipais
- Avaliar sustentabilidade fiscal
- Compreender dinâmicas de emprego e renda
- Orientar políticas de desenvolvimento

**Importância**: A análise econômica permite entender a capacidade de geração de riqueza, dependência de transferências governamentais e oportunidades de desenvolvimento econômico local.

---

## 📈 Principais Indicadores

### PIB e Valor Adicionado (6 indicadores)

| Código | Nome | Unidade | Fonte | Periodicidade |
|--------|------|---------|-------|---------------|
| `ECON_PIB_TOTAL` | PIB Municipal Total | R$ mil | IBGE Sidra | Anual |
| `ECON_PIB_PER_CAPITA` | PIB per Capita | R$/hab | IBGE Sidra | Anual |
| `ECON_VA_AGRO` | VA Agropecuária | R$ mil | IBGE Sidra | Anual |
| `ECON_VA_INDUSTRIA` | VA Indústria | R$ mil | IBGE Sidra | Anual |
| `ECON_VA_SERVICOS` | VA Serviços | R$ mil | IBGE Sidra | Anual |
| `ECON_VA_ADM_PUB` | VA Administração Pública | R$ mil | IBGE Sidra | Anual |

**Significado**: O PIB representa a soma de todas as riquezas produzidas no município. O Valor Adicionado (VA) mostra a contribuição de cada setor econômico.

**Análise Típica**:
- Setor principal = Maior VA
- Diversificação = Distribuição equilibrada entre setores
- Contexto TO: Predominância de Agro + Adm Pública

### Emprego e Renda (4 indicadores)

| Código | Nome | Unidade | Fonte | Periodicidade |
|--------|------|---------|-------|---------------|
| `ECON_EMPREGOS_FORMAIS` | Empregos Formais | Número | RAIS/CAGED | Anual |
| `ECON_SALARIO_MEDIO` | Salário Médio | R$ | RAIS | Anual |
| `ECON_RENDA_MEDIA` | Renda Média Domiciliar | R$ | IBGE | Censo |
| `ECON_TX_OCUPACAO` | Taxa de Ocupação | % | IBGE | Censo |

**Significado**: Retratam o mercado de trabalho formal e condições de renda da população.

**Análise Típica**:
- Emprego formal baixo = Informalidade alta
- Salário médio comparado ao salário mínimo
- Principais setores empregadores

### Finanças Públicas (5 indicadores)

| Código | Nome | Unidade | Fonte | Periodicidade |
|--------|------|---------|-------|---------------|
| `ECON_RECEITA_TOTAL` | Receita Total | R$ | SICONFI | Anual |
| `ECON_RECEITA_PROPRIA` | Receita Tributária Própria | R$ | SICONFI | Anual |
| `ECON_DESPESA_TOTAL` | Despesa Total | R$ | SICONFI | Anual |
| `ECON_FPM` | FPM | R$ | STN | Anual |
| `ECON_DEPENDENCIA_TRANSF` | Dependência de Transferências | % | Calculado | Anual |

**Significado**: Refletem a saúde fiscal e autonomia financeira municipal.

**Análise Típica**:
- Dependência < 60% = Boa autonomia
- Dependência > 80% = Alta vulnerabilidade fiscal
- Contexto TO: ~85% dos municípios têm alta dependência

**Fórmula de Dependência**:
```
Dependência (%) = (Transferências / Receita Total) × 100

Onde:
Transferências = Receita Total - Receita Própria
```

---

## 🔌 Fontes de Dados

### IBGE Sidra - PIB Municipal

**URL**: https://sidra.ibge.gov.br/tabela/5938

**Descrição**: Sistema IBGE de Recuperação Automática. Fornece dados de PIB e Valor Adicionado por setor econômico para todos os municípios brasileiros.

**API Endpoint**:
```
https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/{variable}/p/last
```

**Variáveis Principais**:
- `allxp`: PIB Total
- `37`: PIB per capita
- `513`: VA Agropecuária
- `514`: VA Indústria
- `515`: VA Serviços
- `516`: VA Administração Pública

**Formato de Resposta**:
```json
[
  {
    "D1C": "2021",
    "D1N": "2021",
    "D2C": "1721000",
    "D2N": "Palmas",
    "D3C": "513",
    "D3N": "Valor adicionado bruto da Agropecuária",
    "V": "234567.89",
    "D4C": "...",
    "D4N": "Mil Reais"
  }
]
```

**Documentação Completa**: https://apisidra.ibge.gov.br/

**Periodicidade**: Anual (divulgação ~T+2 anos)

**Exemplo de Coleta**:
```bash
# PIB Total de Palmas
curl "https://apisidra.ibge.gov.br/values/t/5938/n6/1721000/v/allxp/p/last/d/v37%202"
```

---

### SICONFI - Finanças Públicas

**URL**: https://apidatalake.tesouro.gov.br/

**Descrição**: Sistema de Informações Contábeis e Fiscais do Setor Público Brasileiro. Dados de receitas e despesas municipais.

**API Endpoint**:
```
https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra?an_exercicio={ano}&id_ente={ibge_code}&classe_conta={conta}
```

**Contas Principais**:
- `1`: Receita Orçamentária
- `2`: Despesa Orçamentária
- `1.1.1.2`: Receita Tributária
- `1.7`: Transferências Correntes

**Exemplo de Coleta**:
```bash
# Receitas de Palmas em 2022
curl "https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra?an_exercicio=2022&id_ente=1721000&classe_conta=1"
```

**Documentação**: https://apidatalake.tesouro.gov.br/docs/siconfi

**Periodicidade**: Anual (divulgação ~T+1 ano)

---

### RAIS/CAGED - Emprego e Renda

**URL**: https://bi.mte.gov.br/bgcaged/

**Descrição**: Relação Anual de Informações Sociais. Dados de emprego formal, salários e vínculos empregatícios.

**Método de Coleta**: **Manual** (download de arquivos)

**Arquivos Disponíveis**:
- Microdados RAIS (FTP)
- Tabulações agregadas por município

**Indicadores Extraíveis**:
- Número de vínculos ativos
- Salário médio por setor
- Distribuição por CBO (ocupação)

**Periodicidade**: Anual

**Nota**: Coleta manual devido à complexidade dos microdados. API pública limitada.

---

## 🔄 Metodologia de Coleta

### Coleta Automática via API

**Indicadores com API disponível**:
- PIB e VA (IBGE Sidra) ✅
- Finanças Públicas (SICONFI) ✅

**Fluxo de Coleta**:
```
1. Consultar indicator_dictionary
2. Para cada município:
   a. Construir URL com ibge_code
   b. Fazer requisição HTTP GET
   c. Parsear JSON de resposta
   d. Extrair valor e ano de referência
3. Inserir/atualizar indicator_values
4. Atualizar last_ref_date no dictionary
```

**Tratamento de Erros**:
- Timeout: Retry 3x com backoff exponencial
- HTTP 404: Marcar como "sem dados disponíveis"
- Formato inválido: Log e pular

### Coleta Manual

**Indicadores sem API**:
- Emprego e Renda (RAIS) ❌
- Taxa de Ocupação (Censo) ❌

**Procedimento**:
1. Acessar portal da fonte
2. Download de arquivos (CSV, XLS)
3. Processamento local (script Python/R)
4. Importação no banco via SQL

**Scripts de Importação**: `/scripts/import/`

---

## 📊 Exemplos de Análise

### Perfil Econômico de um Município

```sql
-- Composição setorial do PIB
SELECT
    m.name AS municipio,
    year,
    SUM(CASE WHEN id.code = 'ECON_VA_AGRO' THEN iv.value END) AS va_agro,
    SUM(CASE WHEN id.code = 'ECON_VA_INDUSTRIA' THEN iv.value END) AS va_industria,
    SUM(CASE WHEN id.code = 'ECON_VA_SERVICOS' THEN iv.value END) AS va_servicos,
    SUM(CASE WHEN id.code = 'ECON_VA_ADM_PUB' THEN iv.value END) AS va_adm_pub
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code IN ('ECON_VA_AGRO', 'ECON_VA_INDUSTRIA', 'ECON_VA_SERVICOS', 'ECON_VA_ADM_PUB')
  AND m.ibge_code = '1721000'
  AND iv.year = 2021
GROUP BY m.name, year;
```

### Dependência Fiscal

```sql
-- Municípios com alta dependência de transferências
SELECT
    m.name AS municipio,
    iv.year,
    iv.value AS dependencia_pct,
    CASE
        WHEN iv.value < 60 THEN 'Baixa'
        WHEN iv.value BETWEEN 60 AND 80 THEN 'Média'
        ELSE 'Alta'
    END AS classificacao
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN municipalities m ON iv.municipality_id = m.id
WHERE id.code = 'ECON_DEPENDENCIA_TRANSF'
ORDER BY iv.value DESC;
```

---

## 📚 Referências

### Conceitos Econômicos

- **PIB**: [IBGE - PIB dos Municípios](https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html)
- **Finanças Públicas**: [STN - Manual SICONFI](https://siconfi.tesouro.gov.br/siconfi/pages/public/conteudo/conteudo.jsf?id=19649)
- **Emprego Formal**: [MTE - Metodologia RAIS](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/rais)

### Manuais Técnicos

- [Contas Regionais do Brasil - Metodologia](https://biblioteca.ibge.gov.br/visualizacao/livros/liv101736_metodologia.pdf)
- [Manual FINBRA](https://siconfi.tesouro.gov.br/siconfi/pages/public/conteudo/conteudo.jsf?id=19637)

### APIs e Dados Abertos

- [IBGE APIs](https://servicodados.ibge.gov.br/api/docs)
- [Portal de Dados Abertos do Tesouro](https://www.tesourotransparente.gov.br/dados-abertos)

---

## 🎯 Contexto Tocantins

### Perfil Econômico Estadual

- **PIB TO (2021)**: R$ 51,5 bilhões (0,6% do PIB nacional)
- **PIB per capita**: ~R$ 32.400 (abaixo da média nacional)
- **Principais setores**:
  - Agropecuária: 18% (acima da média nacional)
  - Serviços: 60%
  - Indústria: 10%
  - Administração Pública: 12%

### Características Municipais

**Palmas (capital)**:
- Concentra ~30% do PIB estadual
- Economia de serviços
- Maior PIB per capita do estado

**Municípios do interior**:
- Base agropecuária forte
- Alta dependência de FPM (>85%)
- Administração Pública como principal empregador

**Polos Regionais**:
- Araguaína (norte): Comércio e serviços
- Gurupi (sul): Agroindustrial
- Porto Nacional: Serviços

---

**Última atualização**: Janeiro 2026
**Versão do Documento**: 1.0
