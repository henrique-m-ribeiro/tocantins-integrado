# Guias de Operação

**Tocantins Integrado - Guias de Uso**

Este diretório contém guias práticos para operação da plataforma.

---

## Guias Disponíveis

### Instalação e Deploy

| Guia | Descrição | Status |
|------|-----------|--------|
| [Deploy no Replit](../DEPLOY_REPLIT.md) | Guia completo de deploy em produção | ✅ Disponível |
| [Validação Pós-Deploy](../DEPLOY_REPLIT.md#10-verificação-do-deploy) | Script de verificação | ✅ Disponível |

### Coleta de Dados

| Guia | Descrição | Status |
|------|-----------|--------|
| [Coleta Inicial](#coleta-inicial-de-dados) | Como executar a primeira coleta | ✅ Abaixo |
| [Coleta por Fonte](#coleta-por-fonte-de-dados) | Coletar dados de fontes específicas | ✅ Abaixo |
| [Fontes de Dados](../03-technical/DATA_SOURCES.md) | Documentação detalhada das APIs | ✅ Disponível |

### Dashboard e API

| Guia | Descrição | Status |
|------|-----------|--------|
| [Usando a API](#usando-a-api) | Endpoints disponíveis | ✅ Abaixo |
| [Dashboard](#acessando-o-dashboard) | Interface web | ✅ Abaixo |

### Agentes Dimensionais

| Guia | Descrição | Status |
|------|-----------|--------|
| [Agente ECON](../03-technical/agents/AGENT_ECON.md) | Análise econômica | ✅ Disponível |
| [Agente SOCIAL](../03-technical/agents/AGENT_SOCIAL.md) | Análise social | ✅ Disponível |
| [Agente TERRA](../03-technical/agents/AGENT_TERRA.md) | Análise territorial | ✅ Disponível |
| [Agente AMBIENT](../03-technical/agents/AGENT_AMBIENT.md) | Análise ambiental | ✅ Disponível |

---

## Coleta Inicial de Dados

### Pré-requisitos

1. Variáveis de ambiente configuradas (ver [Deploy](../DEPLOY_REPLIT.md))
2. Banco de dados com migrations executadas
3. Conexão com internet para APIs externas

### Executar Coleta Completa

```bash
# Coletar todos os indicadores de todas as fontes
npm run collect
```

### O que é coletado

| Fonte | Indicadores | Anos |
|-------|-------------|------|
| IBGE Sidra | PIB, População | 2019-2023 |
| SICONFI | Receitas, Despesas | 2019-2023 |
| INEP | IDEB | 2019, 2021, 2023 |
| DataSUS | Mortalidade, ESF | 2019-2023 |
| SNIS | Água, Esgoto | 2020-2022 |

### Resultado Esperado

```
✅ IBGE Sidra: X registros coletados
✅ SICONFI: X registros coletados
✅ INEP: X registros coletados
✅ DataSUS: X registros coletados
✅ SNIS: X registros coletados

Total: XXX registros
```

---

## Coleta por Fonte de Dados

### Coletar apenas IBGE

```bash
npm run collect:ibge
```

Coleta: PIB, PIB per capita, População

### Coletar apenas INEP

```bash
npm run collect:inep
```

Coleta: IDEB Anos Iniciais, Anos Finais, Fundamental

### Coletar apenas DataSUS

```bash
npm run collect:datasus
```

Coleta: Taxa de Mortalidade Infantil, Cobertura ESF

### Coletar apenas SICONFI

```bash
npm run collect:siconfi
```

Coleta: Receita Tributária, Despesa Total

### Coletar apenas SNIS

```bash
npm run collect:snis
```

Coleta: Cobertura de Água, Cobertura de Esgoto

---

## Teste Piloto

Para validar a coleta sem persistir no banco:

```bash
npm run test:pilot
```

Este comando:
1. Coleta dados apenas de Palmas (código IBGE: 1721000)
2. Valida qualidade dos dados
3. Exibe relatório de status
4. **NÃO** persiste no banco

### Interpretar Resultados

```
=== Resultado do Piloto ===
Total de registros: 89
Dados oficiais: 44 (49.4%)    ← Dados de fontes verificadas
Dados estimados: 0 (0%)       ← Deve ser sempre 0
Dados indisponíveis: 45 (50.6%) ← APIs não acessíveis
```

---

## Usando a API

### Iniciar Servidor

```bash
npm start
```

Servidor disponível em `http://localhost:3000`

### Endpoints Principais

#### Listar Municípios

```bash
GET /api/municipalities
```

Resposta:
```json
{
  "data": [
    {
      "id": "1721000",
      "name": "Palmas",
      "population": 313349,
      "area_km2": 2218.94
    }
  ]
}
```

#### Buscar Indicadores

```bash
GET /api/indicators?municipality_id=1721000&year=2023
```

Resposta:
```json
{
  "data": [
    {
      "code": "ECON_PIB_TOTAL",
      "name": "PIB Total",
      "value": 10333419,
      "unit": "R$ mil",
      "year": 2023,
      "source": "IBGE"
    }
  ]
}
```

#### Análise por Dimensão

```bash
POST /api/analysis
Content-Type: application/json

{
  "dimension": "SOCIAL",
  "municipality_id": "1721000",
  "task": "Analise a situação educacional do município"
}
```

### Autenticação

Para endpoints de escrita, inclua o header:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
```

---

## Acessando o Dashboard

### Modo Desenvolvimento

```bash
cd src/dashboard
npm install
npm run dev
```

Dashboard disponível em `http://localhost:3001`

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Mapa do Tocantins | Visualização geográfica com indicadores |
| Painel Municipal | Detalhes de cada município |
| Análises | Análises pré-computadas por dimensão |
| Chat | Interface conversacional com agentes |

### Navegação

1. **Home**: Visão geral do estado
2. **Análises**: Selecione dimensão (ECON, SOCIAL, TERRA, AMBIENT)
3. **Documentos**: Relatórios e exportações

---

## Troubleshooting

### Erro: "fetch failed"

**Causa:** API externa inacessível ou timeout.

**Solução:**
1. Verifique conexão de internet
2. Teste a API diretamente:
   ```bash
   curl "https://apisidra.ibge.gov.br/values/t/6579/n6/1721000/v/9324/p/2021"
   ```
3. Verifique se a API está no ar

### Erro: "SUPABASE_URL not defined"

**Causa:** Variável de ambiente não configurada.

**Solução:**
1. Verifique `.env` ou Secrets do Replit
2. Confirme que todas as variáveis estão preenchidas

### Erro: "relation does not exist"

**Causa:** Migrations não executadas.

**Solução:**
```bash
npm run migrate
```

### Dados indisponíveis (50%+)

**Causa:** APIs externas podem estar temporariamente indisponíveis.

**Solução:**
1. Aguarde e tente novamente
2. Execute `npm run validate` para diagnóstico
3. Verifique relatório de status das APIs

---

## Referências

- [Arquitetura do Sistema](../03-technical/ARCHITECTURE.md)
- [Fontes de Dados](../03-technical/DATA_SOURCES.md)
- [Documentação dos Agentes](../03-technical/agents/)
- [Glossário](../GLOSSARIO.md)

---

*Última atualização: Janeiro 2026*
