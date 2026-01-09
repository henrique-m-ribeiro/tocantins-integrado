# Handoff: Dev Team → CTO (Próxima Sessão)

**Data:** 2026-01-08
**Sessão de origem:** Desenvolvimento MVP + Framework de Governança
**Próxima sessão:** Implementação em Produção (Replit + n8n)

---

## 1. Contexto

### O que foi feito

O MVP do Tocantins Integrado está completo e pronto para deploy:

1. **Sistema de Coleta de Dados** - 8 coletores implementados e corrigidos
2. **Agentes Dimensionais** - 4 agentes (ECON, SOCIAL, TERRA, AMBIENT)
3. **API REST** - Endpoints para consulta de indicadores
4. **Dashboard** - Interface Next.js para visualização
5. **Banco de Dados** - 8 migrations para Supabase
6. **Documentação** - Completa (~95% cobertura)
7. **Framework de Governança** - Metodologia de trabalho com IA distribuída

### Estado atual do código

- **Branch principal:** `main` (merge realizado)
- **Último commit:** `ecf319d docs: adiciona guias, documentação de agentes e glossário`
- **Testes:** APIs validadas via curl, piloto de Palmas executado
- **Pendência:** Deploy em ambiente de produção com rede

---

## 2. Objetivo da Próxima Sessão

### Objetivo principal

Implementar o sistema Tocantins Integrado em ambiente de produção (Replit + n8n), validando a coleta de dados reais e a persistência no Supabase.

### Escopo

- [ ] Configurar projeto no Replit
- [ ] Configurar Supabase (banco de dados)
- [ ] Executar migrations e seeds
- [ ] Validar coleta de dados com APIs reais
- [ ] Configurar workflows n8n (opcional nesta sessão)
- [ ] Executar coleta inicial para os 139 municípios

### Fora do escopo

- Novos coletores ou indicadores
- Alterações de arquitetura
- Dashboard em produção (pode ser próxima sessão)

---

## 3. Documentos de Referência Obrigatórios

### Para o CTO (Manus) ler primeiro

| Documento | Caminho | Propósito |
|-----------|---------|-----------|
| **Guia de Deploy** | `docs/DEPLOY_REPLIT.md` | Passo a passo completo de deploy |
| **Arquitetura** | `docs/03-technical/ARCHITECTURE.md` | Visão geral do sistema |
| **Fontes de Dados** | `docs/03-technical/DATA_SOURCES.md` | APIs e endpoints |
| **Relatório de APIs** | `docs/RELATORIO_VERIFICACAO_APIS.md` | Correções aplicadas |

### Para o Dev Team (Claude Code) ter à mão

| Documento | Caminho | Propósito |
|-----------|---------|-----------|
| **Script de Validação** | `scripts/validate-deploy.ts` | Testes pós-deploy |
| **Coletores** | `src/collectors/` | Código dos coletores |
| **Migrations** | `src/database/migrations/` | Schema do banco |
| **Metodologia** | `.governance/METHODOLOGY.md` | Framework de trabalho |

---

## 4. Variáveis de Ambiente Necessárias

Configurar no Replit (Secrets) antes de iniciar:

```bash
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres

# Ambiente
NODE_ENV=production
PORT=3000

# OpenAI (para agentes - opcional no MVP)
OPENAI_API_KEY=sk-...
```

---

## 5. Sequência de Passos Recomendada

### Fase 1: Configuração Inicial

```bash
# 1. Importar repositório no Replit
# 2. Configurar Secrets (variáveis de ambiente)
# 3. Instalar dependências
npm install

# 4. Compilar TypeScript
npm run build
```

### Fase 2: Banco de Dados

```bash
# 5. Executar migrations
npm run migrate

# 6. Popular dados iniciais (municípios, metadados)
npm run seed
```

### Fase 3: Validação

```bash
# 7. Executar script de validação
npm run validate

# 8. Verificar resultados:
#    - Conexão Supabase: ✅
#    - APIs externas: ✅
#    - Tabelas criadas: ✅
```

### Fase 4: Coleta de Dados

```bash
# 9. Teste piloto (apenas Palmas, sem persistir)
npm run test:pilot

# 10. Se OK, coleta com persistência
npm run collect:persist
```

### Fase 5: n8n (Opcional)

```bash
# 11. Importar workflows de n8n/workflows/
# 12. Configurar credenciais
# 13. Ativar coleta agendada
```

---

## 6. Critérios de Sucesso

| Critério | Como verificar |
|----------|----------------|
| Supabase conectado | `npm run validate` retorna ✅ |
| Migrations executadas | Tabelas existem no Supabase |
| APIs funcionando | Coleta retorna dados oficiais |
| Dados persistidos | Registros visíveis no Supabase |
| Sem estimativas | 0% de dados estimados |

---

## 7. Problemas Conhecidos e Soluções

### Problema: "fetch failed" nos coletores

**Causa:** Ambiente sandbox bloqueava Node.js fetch.
**Solução:** Em Replit com rede, deve funcionar. Se persistir, verificar:
- Firewall do Replit
- Timeout (aumentar para 30s)
- Retry com backoff

### Problema: APIs IBGE/SICONFI retornando erro

**Causa:** Parâmetros incorretos (já corrigidos).
**Verificar:** Commits `258a322` e `345e163` aplicados.

### Problema: Dados indisponíveis (50%+)

**Causa esperada:** Algumas APIs requerem download manual.
**Ação:** Focar nas APIs que funcionam (IBGE, SICONFI, INEP, DataSUS).

---

## 8. Arquivos-Chave para Ajustes

Se necessário fazer ajustes durante o deploy:

| Arquivo | Quando modificar |
|---------|------------------|
| `src/collectors/sources/IBGESidraCollector.ts` | Problemas com PIB/População |
| `src/collectors/sources/SICONFICollector.ts` | Problemas com dados fiscais |
| `src/database/migrations/*.sql` | Ajustes de schema |
| `.env` ou Secrets | Credenciais incorretas |

---

## 9. Decisões Já Tomadas (Não Revisitar)

| Decisão | Referência |
|---------|------------|
| Apenas dados oficiais (sem estimativas) | ADR-002 |
| Stack: Node.js/TypeScript/Supabase | ADR implícito |
| Framework de governança | ADR-001 |
| Variável população IBGE: 9324 | Commit `258a322` |
| Endpoint SICONFI: /dca | Commit `258a322` |

---

## 10. Papéis na Próxima Sessão

### CEO (Você - Henrique)
- Aprovar cada fase antes de prosseguir
- Fornecer credenciais do Supabase
- Decidir se avançar para n8n nesta sessão

### CTO (Manus)
- Orientar passo a passo do deploy
- Validar resultados de cada fase
- Especificar ajustes necessários
- Criar handoffs para Dev Team

### Dev Team (Claude Code)
- Executar ajustes de código se necessário
- Debugar problemas identificados
- Documentar soluções aplicadas

---

## 11. Prompt Sugerido para Iniciar Sessão com CTO (Manus)

```markdown
# Contexto de Sessão: CTO - Deploy em Produção

Você é o CTO do projeto **Tocantins Integrado**.

## Situação Atual
O MVP está completo e pronto para deploy. O código está no repositório GitHub:
- Branch: main
- Último commit: ecf319d

## Seu Objetivo
Orientar o CEO (eu) e coordenar com o Dev Team (Claude Code) para:
1. Fazer deploy no Replit
2. Configurar Supabase
3. Executar migrations
4. Validar coleta de dados
5. (Opcional) Configurar n8n

## Documentos para Consultar
- Guia de Deploy: docs/DEPLOY_REPLIT.md
- Arquitetura: docs/03-technical/ARCHITECTURE.md
- Fontes de Dados: docs/03-technical/DATA_SOURCES.md
- Relatório de APIs: docs/RELATORIO_VERIFICACAO_APIS.md
- Metodologia: .governance/METHODOLOGY.md

## Decisões Já Tomadas (Não Revisitar)
- Apenas dados oficiais (ADR-002)
- Correções de API aplicadas (commits 258a322, 345e163)
- Framework de governança estabelecido (ADR-001)

## Formato de Trabalho
1. Apresente cada fase com passos claros
2. Aguarde minha confirmação antes de prosseguir
3. Se precisar de ajustes de código, crie handoff para Dev Team
4. Documente problemas encontrados e soluções

## Primeira Ação
Apresente o plano de deploy em fases, com checkpoints de validação.
```

---

## 12. Prompt Sugerido para Dev Team (Claude Code)

```markdown
# Contexto de Sessão: Dev Team - Suporte ao Deploy

Você é o time de desenvolvimento do projeto **Tocantins Integrado**.

## Situação
O sistema está sendo implantado em produção (Replit + Supabase).
O CTO (outra sessão) está orientando o processo.

## Seu Papel
- Executar ajustes de código quando solicitado
- Debugar problemas identificados no deploy
- Documentar soluções aplicadas
- Seguir especificações do handoff recebido

## Arquivos Principais
- Coletores: src/collectors/sources/
- Migrations: src/database/migrations/
- Validação: scripts/validate-deploy.ts
- Config: package.json, .env.example

## Regras
- NÃO tome decisões de arquitetura (escale para CTO)
- NÃO mude APIs públicas sem aprovação
- DOCUMENTE cada alteração feita
- SIGA exatamente as especificações do handoff

## Branch de Trabalho
claude/tocantins-integrated-mvp-Kb8JK

## Commits Devem Seguir
- fix: para correções
- feat: para novas funcionalidades
- docs: para documentação
```

---

## 13. Checklist de Preparação

Antes de iniciar a próxima sessão, confirme:

- [ ] Conta Supabase criada
- [ ] Projeto Supabase configurado
- [ ] Credenciais anotadas (URL, anon key, service key, database URL)
- [ ] Conta Replit disponível
- [ ] Acesso ao repositório GitHub
- [ ] (Opcional) Conta n8n cloud ou self-hosted

---

## 14. Resultado Esperado ao Final

Ao concluir a sessão de deploy:

1. ✅ Sistema rodando no Replit
2. ✅ Banco de dados populado no Supabase
3. ✅ Dados de indicadores coletados para 139 municípios
4. ✅ API acessível publicamente
5. ✅ (Opcional) Workflows n8n configurados

---

*Handoff criado em: 2026-01-08*
*Autor: Dev Team (Claude Code)*
*Destinatário: CTO (Manus) + CEO (Henrique)*
