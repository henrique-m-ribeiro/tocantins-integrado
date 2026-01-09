# 🚀 Instruções para Setup do Banco Supabase

## ✅ Pré-requisitos

- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard)
- Projeto Supabase: `uyjrltzujeyploconacx`
- Arquivo: `supabase_setup_consolidated.sql` (na raiz do projeto)

## 📋 Passo a Passo

### 1. Acessar o SQL Editor

1. Abra o navegador e acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **uyjrltzujeyploconacx**
4. No menu lateral esquerdo, clique em **SQL Editor**

### 2. Criar Nova Query

1. Clique no botão **"New Query"** (ou "+ New Query")
2. Você verá um editor SQL em branco

### 3. Copiar e Colar o Script

1. Abra o arquivo `supabase_setup_consolidated.sql` no seu editor de código
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)

### 4. Executar o Script

1. Clique no botão **"Run"** (ou use o atalho Ctrl+Enter)
2. Aguarde a execução (pode levar 10-30 segundos)
3. Verifique se apareceu a mensagem de sucesso no console:
   ```
   ✅ Setup do banco de dados concluído com sucesso!
   📊 Estrutura criada: 27 tabelas, 10 views, 3 funções
   🏙️  Dados iniciais: 2 mesorregiões, 8 microrregiões, Palmas (capital)
   📈 Indicadores: 14 definições principais + valores de exemplo
   ```

### 5. Verificar a Instalação

Execute estas queries de teste no SQL Editor:

```sql
-- Testar tabelas de geografia
SELECT * FROM v_municipalities_full;

-- Testar indicadores
SELECT * FROM v_latest_indicators;

-- Contar registros
SELECT
  (SELECT COUNT(*) FROM municipalities) as municipios,
  (SELECT COUNT(*) FROM indicator_definitions) as indicadores,
  (SELECT COUNT(*) FROM indicator_values) as valores;
```

## 🎯 O que o Script Cria

### Estrutura do Banco

1. **12 Tipos ENUM** para tipagem forte (dimension_type, periodicity_type, etc.)
2. **27 Tabelas** organizadas em:
   - Geografia (3): mesoregions, microregions, municipalities
   - Indicadores (5): categories, definitions, values, averages
   - Chat e Sessões (6): sessions, messages, requests, logs
   - Análises (3): precomputed, fragments, documents
   - Conhecimento RAG (3): documents, chunks, query_log
   - Metadados (7): feedback, saved_analyses, etc.

3. **10 Views** para consultas otimizadas:
   - v_municipalities_full
   - v_microregions_summary
   - v_latest_indicators
   - v_dimension_rankings
   - v_usage_stats
   - v_agent_performance
   - v_municipal_analyses
   - v_active_fragments
   - v_knowledge_stats

4. **3 Funções PostgreSQL**:
   - `get_municipality_indicators()` - Buscar indicadores de um município
   - `compare_municipalities()` - Comparar dois municípios
   - `search_knowledge_base()` - Busca textual na base de conhecimento

5. **30+ Índices** para performance otimizada

6. **10 Triggers** para automação (updated_at, activity tracking)

### Dados Iniciais (Seeds)

- ✅ 2 Mesorregiões do Tocantins
- ✅ 8 Microrregiões do Tocantins
- ✅ 1 Município (Palmas - capital)
- ✅ 10 Categorias de Indicadores (4 dimensões)
- ✅ 14 Definições de Indicadores principais
- ✅ 7 Valores de exemplo para Palmas (IDH, IDEB, Saúde, Saneamento, Vegetação)

## 🔧 Resolução de Problemas

### Erro: "type already exists"

Se você já executou o script antes, alguns tipos podem já existir. Opções:

**Opção 1: Limpar banco e reexecutar** (⚠️ CUIDADO: apaga todos os dados!)
```sql
-- Apagar tudo e começar do zero
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Depois execute o script completo novamente
```

**Opção 2: Ignorar erros de tipos existentes**
- O script usa `IF NOT EXISTS` em tabelas
- Erros de tipos já existentes podem ser ignorados
- Continue com as queries de teste para verificar se funciona

### Erro: "relation already exists"

Isso é normal se você já executou parte do script. O script usa `IF NOT EXISTS` e `ON CONFLICT DO NOTHING` para ser idempotente (pode executar múltiplas vezes).

### Erro: "permission denied"

Verifique se você tem permissões de administrador no projeto Supabase. Entre em contato com o proprietário do projeto se necessário.

## 📊 Próximos Passos

Após a instalação bem-sucedida:

### 1. Configurar API (Backend)

Atualizar variáveis de ambiente com credenciais do Supabase:

```env
SUPABASE_URL=https://uyjrltzujeyploconacx.supabase.co
SUPABASE_ANON_KEY=seu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
```

### 2. Popular com Dados Completos

Executar scripts de coleta de dados para todos os 139 municípios:

```bash
# Na raiz do projeto
npm run collect:all-municipalities
```

### 3. Testar API do Dashboard

```bash
# Testar endpoints
curl http://localhost:3000/api/municipalities
curl http://localhost:3000/api/municipalities/1721000/indicators
```

### 4. Verificar Dashboard

Abra o dashboard e selecione Palmas para ver os dados:

```bash
npm run dev
# Abra: http://localhost:3000
```

## 📝 Notas Importantes

1. **Backup**: O Supabase faz backups automáticos, mas é bom ter cuidado
2. **Performance**: Os índices foram otimizados para as queries do dashboard
3. **Escalabilidade**: Estrutura preparada para 139 municípios + dados históricos
4. **RAG**: Base de conhecimento pronta para integração futura com embeddings
5. **TypeScript**: Schema 100% alinhado com types em `src/dashboard/types/index.ts`

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o console do SQL Editor para mensagens de erro específicas
2. Execute as queries de teste acima para diagnosticar
3. Consulte a documentação do Supabase: https://supabase.com/docs
4. Revise os logs do projeto no Dashboard > Logs

---

**Última atualização**: 2026-01-09
**Versão do Schema**: 1.0
**Compatibilidade**: PostgreSQL 14+ / Supabase
