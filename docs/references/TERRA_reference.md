# Referência - Dimensão Territorial (TERRA)

> Guia de indicadores de infraestrutura, saneamento e conectividade

## 📊 Visão Geral

Analisa infraestrutura urbana, saneamento básico, habitação e conectividade dos municípios.

## 📈 Principais Indicadores (13 indicadores)

### Saneamento (4)
- `TERRA_AGUA_ENCANADA`: Água encanada (SNIS, anual)
- `TERRA_ESGOTO`: Coleta de esgoto (SNIS, anual) 
- `TERRA_COLETA_LIXO`: Coleta de lixo (IBGE, censo)
- `TERRA_ATERRO`: Aterro sanitário (SNIS, anual)

### Infraestrutura (3)
- `TERRA_PAVIMENTACAO`: Vias pavimentadas (IBGE, censo)
- `TERRA_ILUMINACAO`: Iluminação pública (IBGE, censo)
- `TERRA_DOMICILIOS`: Total domicílios (IBGE, censo)

### Conectividade (4)
- `TERRA_INTERNET`: Acesso internet (IBGE, censo)
- `TERRA_ENERGIA`: Energia elétrica (IBGE, censo)
- `TERRA_DISTANCIA_CAPITAL`: Distância Palmas (IBGE, fixo)
- `TERRA_FROTA`: Frota de veículos (DENATRAN, mensal)

### Habitação (2)
- `TERRA_DEFICIT_HAB`: Déficit habitacional (FJP, anual)
- `TERRA_DOM_PROPRIO`: Domicílios próprios % (IBGE, censo)

## 🔌 Fontes Principais

### SNIS - Sistema Nacional de Informações sobre Saneamento
**URL**: http://www.snis.gov.br/
**API**: http://appsnis.mdr.gov.br/api

**Indicadores SNIS**:
- IN055: Índice atendimento água
- IN056: Índice atendimento esgoto  
- IN031: Coleta de resíduos

**Coleta**: API pública (JSON)

### IBGE - Censo e Pesquisas
**Dados censitários**: Periodicidade 10 anos
**Método**: Manual (download)

### DENATRAN - Frota
**URL**: https://www.gov.br/transportes/pt-br/assuntos/transito
**Método**: Manual

## 📊 Índice de Infraestrutura

```
Índice = (Saneamento × 0.40) + (Infraestrutura × 0.30) + (Conectividade × 0.30)

Saneamento = (Água + Esgoto + Lixo) / 3
Infraestrutura = (Pavimentação + Iluminação) / 2
Conectividade = (Internet + Energia) / 2
```

## 🎯 Metas PLANSAB 2033

- Água tratada: 99%
- Coleta esgoto: 90%
- Tratamento esgoto: 93%
- Coleta resíduos: 100%

---
**Última atualização**: Janeiro 2026
