# 🌎 Tocantins Integrado

**Sistema de Superinteligência Territorial para o Estado do Tocantins**

Uma plataforma de análise multidimensional de municípios e microrregiões, desenvolvida através de pesquisa-ação para subsidiar a gestão pública baseada em evidências.

---

## 📋 Visão Geral

O **Tocantins Integrado** é um sistema de inteligência artificial que fornece diagnósticos territoriais multidimensionais para apoiar a tomada de decisão em políticas públicas. O sistema analisa dados socioeconômicos dos 139 municípios do Tocantins através de agentes especializados em diferentes dimensões:

- **Dimensão Econômica** - PIB, emprego, renda, arrecadação
- **Dimensão Social** - Educação, saúde, assistência social
- **Dimensão Territorial** - Demografia, urbanização, infraestrutura
- **Dimensão Ambiental** - Recursos naturais, sustentabilidade

## 🎯 Funcionalidades do MVP

| Funcionalidade | Descrição |
| :--- | :--- |
| **Consulta de Indicadores** | Acesso a indicadores de qualquer município do Tocantins |
| **Análise Dimensional** | Interpretação automatizada dos indicadores por dimensão |
| **Análise Comparativa** | Comparação entre municípios e microrregiões |
| **Dashboard Interativo** | Interface web com mapa e chat integrado |
| **Integração WhatsApp** | Consultas via texto e voz |

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INTERFACE                       │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Dashboard     │  │    WhatsApp     │                   │
│  │   (Replit)      │  │ (Evolution API) │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE ORQUESTRAÇÃO                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agente Orquestrador (n8n)               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                CAMADA DE ESPECIALISTAS                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  ECON    │ │  SOCIAL  │ │  TERRA   │ │ AMBIENT  │       │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA DE DADOS                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           PostgreSQL (Supabase/Replit)               │    │
│  │  • 139 municípios • 4.000+ indicadores • Metadados   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura do Repositório

```
tocantins-integrado/
├── docs/                    # 📚 Documentação
│   ├── 00-project/          # PRD, Roadmap, Arquitetura
│   ├── 01-research/         # 🔬 Diários de Pesquisa-Ação
│   ├── 02-guides/           # Guias de uso
│   └── 03-technical/        # Documentação técnica
├── src/                     # 💻 Código-fonte
├── n8n/                     # 🤖 Workflows n8n
├── data/                    # 📊 Dados
├── tests/                   # 🧪 Testes
└── archive/                 # 📦 Histórico
```

## 🔬 Contexto de Pesquisa

Este projeto é objeto de uma tese de doutorado que utiliza a metodologia de **pesquisa-ação**. O objetivo é documentar e analisar o processo de desenvolvimento e eventual incorporação de tecnologia de IA na gestão pública do estado do Tocantins.

### Diários de Pesquisa-Ação

Os diários de pesquisa-ação estão disponíveis em [`docs/01-research/diaries/`](docs/01-research/diaries/) e documentam todo o processo de desenvolvimento desde novembro de 2025.

| Ciclo | Período | Foco |
| :--- | :--- | :--- |
| **Ciclo 1** | Nov 2025 | Concepção e arquitetura inicial |
| **Ciclo 2** | Nov-Dez 2025 | Desenvolvimento do MVP |
| **Ciclo 3** | Dez 2025 | Consolidação e orquestração |
| **Ciclo 4** | Jan 2026+ | Reinício estruturado (PSB) |

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Supabase (para banco de dados)
- Chave da API OpenAI

### Instalação

```bash
# Clone o repositório
git clone https://github.com/henrique-m-ribeiro/tocantins-integrado.git
cd tocantins-integrado

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migrations do banco de dados
npm run db:migrate

# Popule o banco com dados iniciais
npm run db:seed
```

### Executando o Projeto

```bash
# Inicie o servidor de desenvolvimento (API + Dashboard)
npm run dev

# Ou execute separadamente:
npm run dev:api       # API na porta 3001
npm run dev:dashboard # Dashboard na porta 3000
```

### Estrutura dos Comandos

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia API e Dashboard em paralelo |
| `npm run dev:api` | Inicia apenas a API (porta 3001) |
| `npm run dev:dashboard` | Inicia apenas o Dashboard (porta 3000) |
| `npm run db:migrate` | Executa migrations do banco |
| `npm run db:seed` | Popula banco com dados iniciais |
| `npm run test` | Executa testes |
| `npm run build` | Build de produção |

Para mais detalhes, consulte:
- [PRD (Product Requirements Document)](docs/00-project/PRD.md)

## 🛠️ Stack Tecnológica

| Componente | Tecnologia |
| :--- | :--- |
| **Frontend** | Replit (React + TypeScript) |
| **Backend de IA** | n8n Cloud |
| **Banco de Dados** | PostgreSQL (Supabase/Replit) |
| **WhatsApp** | Evolution API |
| **LLM** | OpenAI GPT-4 |

## 📊 Dados

O sistema utiliza dados públicos de fontes oficiais:
- IBGE (Censo, PNAD, PIB Municipal)
- INEP (Censo Escolar)
- DATASUS (Indicadores de Saúde)
- Tesouro Nacional (Finanças Públicas)

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🔗 Links

- **Repositório Anterior:** [framework-v6-mvp](https://github.com/henrique-m-ribeiro/framework-v6-mvp)
- **Dashboard (em desenvolvimento):** [inteligencia-territorial.replit.app](https://inteligencia-territorial--hrhenrique7.replit.app)

---

**Desenvolvido com 🤖 por Henrique M. Ribeiro | Pesquisa de Doutorado | 2025-2026**
