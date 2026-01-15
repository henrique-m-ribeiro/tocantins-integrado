# Referência - Dimensão Ambiental (AMBIENT)

> Guia de indicadores ambientais, vegetação, áreas protegidas e governança

## 📊 Visão Geral

Analisa meio ambiente, sustentabilidade e gestão ambiental com foco nos biomas Cerrado e Amazônia.

## 📈 Principais Indicadores (11 indicadores)

### Cobertura Vegetal (3)
- `AMBIENT_COBERTURA_NATIVA`: Vegetação nativa % (MapBiomas, anual)
- `AMBIENT_TX_DESMATAMENTO`: Taxa desmatamento %/ano (MapBiomas, anual)
- `AMBIENT_BIOMA`: Bioma predominante (IBGE, fixo)

### Áreas Protegidas (3)
- `AMBIENT_UC_AREA`: Unidades de Conservação km² (ICMBio/SEMA, anual)
- `AMBIENT_TI_AREA`: Terras Indígenas km² (FUNAI, anual)
- `AMBIENT_APP`: APPs km² (CAR, anual)

### Governança (3)
- `AMBIENT_ORGAO_AMBIENTAL`: Possui órgão ambiental (IBGE MUNIC, anual)
- `AMBIENT_CONSELHO`: Possui conselho ambiental (IBGE MUNIC, anual)
- `AMBIENT_FUNDO`: Possui fundo ambiental (IBGE MUNIC, anual)

### Riscos (1)
- `AMBIENT_QUEIMADAS`: Focos de queimadas (INPE, anual)

## 🔌 Fontes Principais

### MapBiomas
**URL**: https://mapbiomas.org/
**API**: https://api.mapbiomas.org/

**Collection 7**: Dados 1985-2022
**Indicadores**: Cobertura vegetal, uso do solo, transições

**Exemplo**:
```bash
curl "https://api.mapbiomas.org/coverage?collection=7&territory=municipality&code=1721000"
```

### INPE - Queimadas
**URL**: https://queimadas.dgi.inpe.br/
**API**: https://queimadas.dgi.inpe.br/queimadas/sisam-api/

**Método**: API pública (JSON)
**Atualização**: Diária

### IBGE MUNIC
**Pesquisa anual** sobre gestão municipal
**Método**: Manual (download de planilhas)

## 📊 Índice Ambiental

```
Índice = (Vegetação × 0.50) + (Proteção × 0.25) + (Governança × 0.25)

Vegetação = % cobertura nativa
Proteção = min(% protegido × 2, 100)
Governança = (órgão?33 + conselho?33 + fundo?34)
```

## 🎯 Contexto TO

**Biomas**:
- 91% Cerrado
- 9% Amazônia Legal

**Código Florestal - Reserva Legal**:
- Cerrado (AL): 35%
- Cerrado (fora AL): 20%

**Desafios**: Expansão agro, queimadas sazonais

**Oportunidades**: PSA, Ecoturismo (Jalapão), Economia Verde

---
**Última atualização**: Janeiro 2026
