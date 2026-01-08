# Guia de Deploy - Tocantins Integrado (Replit)

**Versão:** 1.0.0
**Data:** Janeiro 2026

---

## 1. Visão Geral

Este guia descreve o processo de deploy do MVP Tocantins Integrado no Replit, incluindo configuração do banco de dados Supabase, variáveis de ambiente e validação pós-deploy.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         REPLIT                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   API       │  │  Coletores  │  │     Dashboard       │  │
│  │  (Express)  │  │  (Node.js)  │  │     (Next.js)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │          SUPABASE             │
           │  ┌─────────┐  ┌─────────────┐ │
           │  │Postgres │  │    Auth     │ │
           │  └─────────┘  └─────────────┘ │
           └───────────────────────────────┘
```

---

## 2. Pré-requisitos

### 2.1 Conta Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJhbGci...` (pública)
   - **Service Role Key**: `eyJhbGci...` (secreta)
   - **Database Password**: senha do PostgreSQL

### 2.2 Conta Replit
1. Acesse [replit.com](https://replit.com)
2. Crie um novo Repl do tipo **Node.js**
3. Importe o repositório GitHub

---

## 3. Variáveis de Ambiente

### 3.1 Configurar no Replit

No painel **Secrets** do Replit, adicione as seguintes variáveis:

#### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do projeto Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_KEY` | Chave de serviço (secreta) | `eyJhbGciOiJIUzI1...` |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres` |

#### Opcionais (para funcionalidades extras)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OPENAI_API_KEY` | Chave da API OpenAI (para chat) | - |
| `NODE_ENV` | Ambiente de execução | `production` |
| `PORT` | Porta do servidor | `3000` |
| `LOG_LEVEL` | Nível de log | `info` |

### 3.2 Arquivo .env (desenvolvimento local)

```bash
# Copie .env.example para .env e preencha os valores
cp .env.example .env
```

Conteúdo do `.env`:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key
DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres

# Ambiente
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# OpenAI (opcional)
OPENAI_API_KEY=sk-...
```

---

## 4. Instalação

### 4.1 Clonar e Instalar Dependências

```bash
# No terminal do Replit
npm install
```

### 4.2 Compilar TypeScript

```bash
npm run build
```

---

## 5. Migrations do Banco de Dados

### 5.1 Executar Todas as Migrations

```bash
npm run migrate
```

Este comando executa as seguintes migrations em ordem:

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `001_create_regions.sql` | Tabelas de regiões e municípios |
| 2 | `002_create_indicators.sql` | Tabelas de indicadores |
| 3 | `003_create_chat.sql` | Sistema de chat |
| 4 | `004_create_views.sql` | Views materializadas |
| 5 | `005_precomputed_analyses.sql` | Análises pré-computadas |
| 6 | `006_knowledge_base.sql` | Base de conhecimento |
| 7 | `007_data_collection.sql` | Controle de coleta |
| 8 | `008_indicator_metadata.sql` | Metadados de indicadores |

### 5.2 Executar Migration Específica (se necessário)

```bash
# Via Supabase SQL Editor ou psql
psql $DATABASE_URL -f src/database/migrations/001_create_regions.sql
```

### 5.3 Seed de Dados Iniciais

```bash
npm run seed
```

Este comando popula:
- Lista de 139 municípios do Tocantins
- Metadados dos indicadores
- Regiões administrativas

---

## 6. Coleta Inicial de Dados

### 6.1 Executar Coleta Completa

```bash
npm run collect
```

### 6.2 Executar Coleta por Fonte

```bash
# Apenas IBGE (PIB, População)
npm run collect:ibge

# Apenas INEP (IDEB)
npm run collect:inep

# Apenas DataSUS (Saúde)
npm run collect:datasus

# Apenas SICONFI (Fiscal)
npm run collect:siconfi

# Apenas SNIS (Saneamento)
npm run collect:snis
```

### 6.3 Teste Piloto (Palmas)

```bash
npm run test:pilot
```

Este comando:
1. Coleta dados apenas de Palmas (código IBGE: 1721000)
2. Valida qualidade dos dados
3. Gera relatório de status
4. NÃO persiste no banco (modo dry-run)

### 6.4 Coleta com Persistência

```bash
npm run collect:persist
```

---

## 7. Iniciar Aplicação

### 7.1 Modo Produção

```bash
npm start
```

### 7.2 Modo Desenvolvimento

```bash
npm run dev
```

### 7.3 Dashboard (Next.js)

```bash
cd src/dashboard
npm install
npm run build
npm start
```

---

## 8. Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instalar dependências |
| `npm run build` | Compilar TypeScript |
| `npm run migrate` | Executar migrations |
| `npm run seed` | Popular dados iniciais |
| `npm run collect` | Coletar todos os indicadores |
| `npm run collect:ibge` | Coletar dados IBGE |
| `npm run collect:inep` | Coletar dados INEP |
| `npm run collect:datasus` | Coletar dados DataSUS |
| `npm run collect:siconfi` | Coletar dados SICONFI |
| `npm run collect:snis` | Coletar dados SNIS |
| `npm run test:pilot` | Teste piloto Palmas |
| `npm run validate` | Validação pós-deploy |
| `npm start` | Iniciar servidor |
| `npm run dev` | Modo desenvolvimento |

---

## 9. Estrutura de Diretórios

```
tocantins-integrado/
├── src/
│   ├── api/              # API REST (Express)
│   ├── agents/           # Agentes dimensionais
│   ├── collectors/       # Coletores de dados
│   │   ├── base/         # BaseCollector
│   │   ├── sources/      # Coletores específicos
│   │   └── config/       # Configuração municípios
│   ├── dashboard/        # Frontend Next.js
│   ├── database/         # Migrations e seeds
│   ├── shared/           # Tipos compartilhados
│   └── tests/            # Testes de integração
├── docs/                 # Documentação
├── n8n/                  # Workflows n8n
├── data/                 # Dados de teste
└── output/               # Saída dos coletores
```

---

## 10. Verificação do Deploy

Após completar o deploy, execute o script de validação:

```bash
npm run validate
```

O script verifica:
1. ✅ Conexão com Supabase
2. ✅ APIs externas (IBGE, SICONFI, DataSUS)
3. ✅ Teste piloto de Palmas
4. ✅ Persistência no banco

Veja detalhes em: `scripts/validate-deploy.ts`

---

## 11. Troubleshooting

### Erro: "fetch failed"

**Causa:** Bloqueio de rede ou timeout.

**Solução:**
1. Verifique conexão de rede
2. Aumente timeout nos coletores
3. Verifique se APIs estão acessíveis

### Erro: "SUPABASE_URL not defined"

**Causa:** Variável de ambiente não configurada.

**Solução:**
1. No Replit, vá em **Secrets**
2. Adicione `SUPABASE_URL` com valor correto

### Erro: "relation does not exist"

**Causa:** Migrations não executadas.

**Solução:**
```bash
npm run migrate
```

### Erro: "permission denied"

**Causa:** Usando chave anon em vez de service key.

**Solução:**
1. Verifique se `SUPABASE_SERVICE_KEY` está configurada
2. Use service key para operações de escrita

---

## 12. Monitoramento

### Logs

```bash
# Ver logs em tempo real
npm run logs

# Filtrar por nível
LOG_LEVEL=debug npm start
```

### Métricas

Acessar dashboard do Supabase para:
- Uso de banco de dados
- Requisições por segundo
- Erros de API

---

## 13. Próximos Passos

Após deploy bem-sucedido:

1. **Agendar coletas**: Configurar cron para coleta periódica
2. **Monitorar APIs**: Verificar disponibilidade das fontes
3. **Backups**: Configurar backup automático do Supabase
4. **Alertas**: Configurar notificações de erro

---

## 14. Suporte

- **Documentação**: `/docs`
- **Issues**: GitHub Issues
- **Logs**: Painel do Replit

---

*Documento gerado em: Janeiro 2026*
