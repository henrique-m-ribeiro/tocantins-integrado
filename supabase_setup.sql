-- ============================================
-- Migration 001: Criação das tabelas de regiões
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Mesorregiões do Tocantins
CREATE TABLE IF NOT EXISTS mesoregions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibge_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Microrregiões do Tocantins
CREATE TABLE IF NOT EXISTS microregions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibge_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mesoregion_id UUID NOT NULL REFERENCES mesoregions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municípios do Tocantins (139 municípios)
CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibge_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    microregion_id UUID NOT NULL REFERENCES microregions(id) ON DELETE CASCADE,
    population INTEGER,
    area_km2 DECIMAL(10, 2),
    density DECIMAL(10, 2),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    -- Campos para extensibilidade futura
    state_id VARCHAR(2) DEFAULT 'TO',
    country_id VARCHAR(3) DEFAULT 'BRA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_municipalities_microregion ON municipalities(microregion_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_name ON municipalities(name);
CREATE INDEX IF NOT EXISTS idx_municipalities_ibge_code ON municipalities(ibge_code);
CREATE INDEX IF NOT EXISTS idx_microregions_mesoregion ON microregions(mesoregion_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mesoregions_updated_at
    BEFORE UPDATE ON mesoregions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microregions_updated_at
    BEFORE UPDATE ON microregions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_municipalities_updated_at
    BEFORE UPDATE ON municipalities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE mesoregions IS 'Mesorregiões do Tocantins (2 mesorregiões)';
COMMENT ON TABLE microregions IS 'Microrregiões do Tocantins (8 microrregiões)';
COMMENT ON TABLE municipalities IS 'Municípios do Tocantins (139 municípios)';
-- ============================================
-- Migration 002: Criação das tabelas de indicadores
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Dimensões de análise (ECON, SOCIAL, TERRA, AMBIENT)
CREATE TYPE dimension_type AS ENUM ('ECON', 'SOCIAL', 'TERRA', 'AMBIENT');

-- Periodicidade dos indicadores
CREATE TYPE periodicity_type AS ENUM ('annual', 'monthly', 'quarterly', 'census');

-- Categorias de indicadores
CREATE TABLE IF NOT EXISTS indicator_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension dimension_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dimension, name)
);

-- Definições de indicadores
CREATE TABLE IF NOT EXISTS indicator_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES indicator_categories(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    methodology TEXT,
    periodicity periodicity_type DEFAULT 'annual',
    higher_is_better BOOLEAN DEFAULT true,
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores dos indicadores por município
CREATE TABLE IF NOT EXISTS indicator_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES indicator_definitions(id) ON DELETE CASCADE,
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER,
    value DECIMAL(15, 4) NOT NULL,
    -- Rankings calculados
    rank_state INTEGER,
    rank_microregion INTEGER,
    percentile_state DECIMAL(5, 2),
    -- Metadados
    data_quality VARCHAR(20) DEFAULT 'verified',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint para evitar duplicatas
    UNIQUE(indicator_id, municipality_id, year, month)
);

-- Médias por microrregião (pré-calculadas)
CREATE TABLE IF NOT EXISTS microregion_averages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES indicator_definitions(id) ON DELETE CASCADE,
    microregion_id UUID NOT NULL REFERENCES microregions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    avg_value DECIMAL(15, 4),
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    std_dev DECIMAL(15, 4),
    municipality_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_id, microregion_id, year)
);

-- Médias estaduais (pré-calculadas)
CREATE TABLE IF NOT EXISTS state_averages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES indicator_definitions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    avg_value DECIMAL(15, 4),
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    std_dev DECIMAL(15, 4),
    municipality_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_id, year)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_indicator_values_municipality ON indicator_values(municipality_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_year ON indicator_values(year);
CREATE INDEX IF NOT EXISTS idx_indicator_values_composite ON indicator_values(indicator_id, year);
CREATE INDEX IF NOT EXISTS idx_indicator_definitions_category ON indicator_definitions(category_id);
CREATE INDEX IF NOT EXISTS idx_indicator_definitions_code ON indicator_definitions(code);
CREATE INDEX IF NOT EXISTS idx_indicator_categories_dimension ON indicator_categories(dimension);

-- Triggers para updated_at
CREATE TRIGGER update_indicator_categories_updated_at
    BEFORE UPDATE ON indicator_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicator_definitions_updated_at
    BEFORE UPDATE ON indicator_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicator_values_updated_at
    BEFORE UPDATE ON indicator_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE indicator_categories IS 'Categorias de indicadores organizadas por dimensão';
COMMENT ON TABLE indicator_definitions IS 'Definições e metadados dos indicadores socioeconômicos';
COMMENT ON TABLE indicator_values IS 'Valores dos indicadores por município e período';
COMMENT ON TABLE microregion_averages IS 'Médias pré-calculadas por microrregião';
COMMENT ON TABLE state_averages IS 'Médias pré-calculadas para o estado';
-- ============================================
-- Migration 003: Criação das tabelas de chat e sessões
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Canal de comunicação
CREATE TYPE chat_channel AS ENUM ('dashboard', 'whatsapp');

-- Tipo de mensagem
CREATE TYPE message_type AS ENUM ('text', 'audio', 'image', 'document');

-- Role da mensagem
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- Status de processamento
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- Sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    channel chat_channel NOT NULL,
    whatsapp_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    -- Contexto da conversa
    context JSONB DEFAULT '{}'::jsonb,
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    -- Áudio (se aplicável)
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    was_transcribed BOOLEAN DEFAULT false,
    -- Anexos e visualizações
    attachments JSONB DEFAULT '[]'::jsonb,
    visualizations JSONB DEFAULT '[]'::jsonb,
    -- Metadados de processamento
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisições ao orquestrador
CREATE TABLE IF NOT EXISTS orchestrator_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    query_type VARCHAR(50),
    status processing_status DEFAULT 'pending',
    -- Contexto da requisição
    context JSONB DEFAULT '{}'::jsonb,
    -- Resultado
    response JSONB,
    agents_used TEXT[],
    -- Métricas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_used VARCHAR(50),
    -- Erros
    error_message TEXT
);

-- Log de execução dos agentes
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orchestrator_request_id UUID NOT NULL REFERENCES orchestrator_requests(id) ON DELETE CASCADE,
    dimension dimension_type NOT NULL,
    status processing_status DEFAULT 'pending',
    -- Input/Output
    input_context JSONB,
    output_analysis JSONB,
    -- Métricas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    -- Erros
    error_message TEXT
);

-- Feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análises salvas/exportadas
CREATE TABLE IF NOT EXISTS saved_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    analysis_type VARCHAR(50),
    content JSONB NOT NULL,
    -- Exportação
    export_format VARCHAR(10),
    export_url TEXT,
    -- Metadados
    municipality_ids UUID[],
    microregion_ids UUID[],
    dimensions dimension_type[],
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_whatsapp ON chat_sessions(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_status ON orchestrator_requests(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_message ON orchestrator_requests(message_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_request ON agent_execution_logs(orchestrator_request_id);
CREATE INDEX IF NOT EXISTS idx_saved_analyses_session ON saved_analyses(session_id);

-- Trigger para atualizar last_activity_at na sessão
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET last_activity_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Comentários
COMMENT ON TABLE chat_sessions IS 'Sessões de chat (Dashboard ou WhatsApp)';
COMMENT ON TABLE chat_messages IS 'Mensagens de chat entre usuário e assistente';
COMMENT ON TABLE orchestrator_requests IS 'Requisições processadas pelo orquestrador';
COMMENT ON TABLE agent_execution_logs IS 'Log de execução de cada agente dimensional';
COMMENT ON TABLE user_feedback IS 'Feedback dos usuários sobre as respostas';
COMMENT ON TABLE saved_analyses IS 'Análises salvas e exportadas pelos usuários';
-- ============================================
-- Migration 004: Views úteis para consultas
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- View: Municípios com informações completas de região
CREATE OR REPLACE VIEW v_municipalities_full AS
SELECT
    m.id,
    m.ibge_code,
    m.name,
    m.population,
    m.area_km2,
    m.density,
    m.latitude,
    m.longitude,
    mi.id AS microregion_id,
    mi.name AS microregion_name,
    mi.ibge_code AS microregion_ibge_code,
    me.id AS mesoregion_id,
    me.name AS mesoregion_name,
    me.ibge_code AS mesoregion_ibge_code
FROM municipalities m
JOIN microregions mi ON m.microregion_id = mi.id
JOIN mesoregions me ON mi.mesoregion_id = me.id;

-- View: Resumo de microrregiões
CREATE OR REPLACE VIEW v_microregions_summary AS
SELECT
    mi.id,
    mi.ibge_code,
    mi.name,
    me.name AS mesoregion_name,
    COUNT(m.id) AS municipality_count,
    SUM(m.population) AS total_population,
    SUM(m.area_km2) AS total_area_km2,
    AVG(m.density) AS avg_density
FROM microregions mi
JOIN mesoregions me ON mi.mesoregion_id = me.id
LEFT JOIN municipalities m ON m.microregion_id = mi.id
GROUP BY mi.id, mi.ibge_code, mi.name, me.name;

-- View: Indicadores com valores mais recentes por município
CREATE OR REPLACE VIEW v_latest_indicators AS
SELECT DISTINCT ON (iv.indicator_id, iv.municipality_id)
    iv.id,
    iv.indicator_id,
    iv.municipality_id,
    iv.year,
    iv.month,
    iv.value,
    iv.rank_state,
    iv.rank_microregion,
    iv.percentile_state,
    id.code AS indicator_code,
    id.name AS indicator_name,
    id.unit,
    id.higher_is_better,
    ic.dimension,
    ic.name AS category_name,
    m.name AS municipality_name,
    mi.name AS microregion_name
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN indicator_categories ic ON id.category_id = ic.id
JOIN municipalities m ON iv.municipality_id = m.id
JOIN microregions mi ON m.microregion_id = mi.id
ORDER BY iv.indicator_id, iv.municipality_id, iv.year DESC, iv.month DESC NULLS LAST;

-- View: Ranking de municípios por dimensão
CREATE OR REPLACE VIEW v_dimension_rankings AS
SELECT
    m.id AS municipality_id,
    m.name AS municipality_name,
    mi.name AS microregion_name,
    ic.dimension,
    AVG(iv.percentile_state) AS avg_percentile,
    COUNT(DISTINCT iv.indicator_id) AS indicators_count,
    RANK() OVER (PARTITION BY ic.dimension ORDER BY AVG(iv.percentile_state) DESC) AS rank_in_dimension
FROM municipalities m
JOIN microregions mi ON m.microregion_id = mi.id
JOIN indicator_values iv ON iv.municipality_id = m.id
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN indicator_categories ic ON id.category_id = ic.id
WHERE iv.year = (SELECT MAX(year) FROM indicator_values)
GROUP BY m.id, m.name, mi.name, ic.dimension;

-- View: Estatísticas de uso do sistema
CREATE OR REPLACE VIEW v_usage_stats AS
SELECT
    DATE(created_at) AS date,
    channel,
    COUNT(*) AS total_messages,
    COUNT(DISTINCT session_id) AS unique_sessions,
    AVG(CASE WHEN metadata->>'processing_time_ms' IS NOT NULL
        THEN (metadata->>'processing_time_ms')::INTEGER END) AS avg_processing_time_ms
FROM chat_messages
WHERE role = 'user'
GROUP BY DATE(created_at), channel
ORDER BY date DESC;

-- View: Performance dos agentes
CREATE OR REPLACE VIEW v_agent_performance AS
SELECT
    dimension,
    COUNT(*) AS total_executions,
    COUNT(*) FILTER (WHERE status = 'completed') AS successful,
    COUNT(*) FILTER (WHERE status = 'error') AS failed,
    AVG(processing_time_ms) FILTER (WHERE status = 'completed') AS avg_processing_time_ms,
    AVG(input_tokens + output_tokens) FILTER (WHERE status = 'completed') AS avg_tokens_used
FROM agent_execution_logs
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY dimension;

-- Função: Buscar indicadores de um município
CREATE OR REPLACE FUNCTION get_municipality_indicators(
    p_municipality_id UUID,
    p_dimension dimension_type DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    indicator_code VARCHAR,
    indicator_name VARCHAR,
    category_name VARCHAR,
    dimension dimension_type,
    value DECIMAL,
    unit VARCHAR,
    year INTEGER,
    rank_state INTEGER,
    percentile_state DECIMAL,
    higher_is_better BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id.code,
        id.name,
        ic.name,
        ic.dimension,
        iv.value,
        id.unit,
        iv.year,
        iv.rank_state,
        iv.percentile_state,
        id.higher_is_better
    FROM indicator_values iv
    JOIN indicator_definitions id ON iv.indicator_id = id.id
    JOIN indicator_categories ic ON id.category_id = ic.id
    WHERE iv.municipality_id = p_municipality_id
      AND (p_dimension IS NULL OR ic.dimension = p_dimension)
      AND (p_year IS NULL OR iv.year = p_year)
    ORDER BY ic.dimension, ic.display_order, id.name;
END;
$$ LANGUAGE plpgsql;

-- Função: Comparar dois municípios
CREATE OR REPLACE FUNCTION compare_municipalities(
    p_municipality_id_1 UUID,
    p_municipality_id_2 UUID,
    p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    indicator_code VARCHAR,
    indicator_name VARCHAR,
    dimension dimension_type,
    municipality_1_value DECIMAL,
    municipality_2_value DECIMAL,
    difference DECIMAL,
    better_municipality INTEGER
) AS $$
DECLARE
    v_year INTEGER;
BEGIN
    -- Usar o ano mais recente se não especificado
    v_year := COALESCE(p_year, (SELECT MAX(year) FROM indicator_values));

    RETURN QUERY
    SELECT
        id.code,
        id.name,
        ic.dimension,
        iv1.value,
        iv2.value,
        iv1.value - iv2.value,
        CASE
            WHEN id.higher_is_better AND iv1.value > iv2.value THEN 1
            WHEN id.higher_is_better AND iv2.value > iv1.value THEN 2
            WHEN NOT id.higher_is_better AND iv1.value < iv2.value THEN 1
            WHEN NOT id.higher_is_better AND iv2.value < iv1.value THEN 2
            ELSE 0
        END
    FROM indicator_values iv1
    JOIN indicator_values iv2 ON iv1.indicator_id = iv2.indicator_id AND iv2.municipality_id = p_municipality_id_2 AND iv2.year = v_year
    JOIN indicator_definitions id ON iv1.indicator_id = id.id
    JOIN indicator_categories ic ON id.category_id = ic.id
    WHERE iv1.municipality_id = p_municipality_id_1
      AND iv1.year = v_year
    ORDER BY ic.dimension, id.name;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON VIEW v_municipalities_full IS 'Municípios com informações completas de região';
COMMENT ON VIEW v_microregions_summary IS 'Resumo estatístico das microrregiões';
COMMENT ON VIEW v_latest_indicators IS 'Indicadores com valores mais recentes';
COMMENT ON VIEW v_dimension_rankings IS 'Ranking de municípios por dimensão';
COMMENT ON VIEW v_usage_stats IS 'Estatísticas de uso do sistema';
COMMENT ON VIEW v_agent_performance IS 'Métricas de performance dos agentes';
COMMENT ON FUNCTION get_municipality_indicators IS 'Retorna indicadores de um município';
COMMENT ON FUNCTION compare_municipalities IS 'Compara indicadores entre dois municípios';
-- ============================================
-- Migration 005: Análises Pré-computadas
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Tipo de análise
CREATE TYPE analysis_type AS ENUM (
  'municipal_profile',      -- Perfil completo do município
  'dimensional_summary',    -- Resumo por dimensão
  'comparative',            -- Análise comparativa
  'microregional',          -- Análise de microrregião
  'thematic',               -- Análise temática específica
  'ranking'                 -- Ranking de indicadores
);

-- Status da análise
CREATE TYPE analysis_status AS ENUM (
  'draft',       -- Rascunho
  'generating',  -- Em geração
  'published',   -- Publicada
  'archived'     -- Arquivada
);

-- Análises pré-computadas (prontas para exibição no dashboard)
CREATE TABLE IF NOT EXISTS precomputed_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo e identificação
    analysis_type analysis_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(100) UNIQUE,

    -- Entidades relacionadas
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    microregion_id UUID REFERENCES microregions(id) ON DELETE CASCADE,
    dimension dimension_type,

    -- Conteúdo da análise
    executive_summary TEXT,           -- Resumo executivo (2-3 parágrafos)
    full_content JSONB NOT NULL,      -- Conteúdo estruturado completo
    key_findings TEXT[],              -- Principais achados
    recommendations TEXT[],           -- Recomendações

    -- Indicadores destacados
    highlighted_indicators JSONB,     -- Indicadores em destaque com valores

    -- Visualizações pré-geradas
    visualizations JSONB,             -- Dados para gráficos

    -- Metadados
    data_year INTEGER,                -- Ano de referência dos dados
    generated_at TIMESTAMPTZ,         -- Quando foi gerada
    generated_by VARCHAR(50),         -- Quem/o que gerou (n8n workflow, manual, etc)

    -- Status e publicação
    status analysis_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,

    -- Documento PDF
    pdf_url TEXT,                     -- URL do PDF gerado
    pdf_generated_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fragmentos de análise (para exibição contextual no dashboard)
CREATE TABLE IF NOT EXISTS analysis_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vínculo com análise completa (opcional)
    analysis_id UUID REFERENCES precomputed_analyses(id) ON DELETE CASCADE,

    -- Contexto do fragmento
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    microregion_id UUID REFERENCES microregions(id) ON DELETE CASCADE,
    dimension dimension_type,
    indicator_code VARCHAR(50),

    -- Conteúdo do fragmento
    fragment_type VARCHAR(50) NOT NULL,  -- 'insight', 'comparison', 'trend', 'alert', 'highlight'
    title VARCHAR(200),
    content TEXT NOT NULL,

    -- Prioridade e ordenação
    priority INTEGER DEFAULT 5,          -- 1 = alta, 10 = baixa
    display_order INTEGER DEFAULT 0,

    -- Validade
    valid_from DATE,
    valid_until DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos PDF gerados
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo e título
    document_type VARCHAR(50) NOT NULL,  -- 'analysis', 'report', 'comparison', 'ranking'
    title VARCHAR(300) NOT NULL,
    description TEXT,

    -- Entidades relacionadas
    municipality_ids UUID[],
    microregion_ids UUID[],

    -- Arquivo
    file_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    page_count INTEGER,

    -- Metadados
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by VARCHAR(50),
    data_year INTEGER,

    -- Contadores
    download_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_municipality ON precomputed_analyses(municipality_id);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_microregion ON precomputed_analyses(microregion_id);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_type ON precomputed_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_status ON precomputed_analyses(status);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_slug ON precomputed_analyses(slug);

CREATE INDEX IF NOT EXISTS idx_analysis_fragments_municipality ON analysis_fragments(municipality_id);
CREATE INDEX IF NOT EXISTS idx_analysis_fragments_dimension ON analysis_fragments(dimension);
CREATE INDEX IF NOT EXISTS idx_analysis_fragments_type ON analysis_fragments(fragment_type);

CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);

-- Triggers
CREATE TRIGGER update_precomputed_analyses_updated_at
    BEFORE UPDATE ON precomputed_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View: Análises publicadas por município
CREATE OR REPLACE VIEW v_municipal_analyses AS
SELECT
    pa.id,
    pa.analysis_type,
    pa.title,
    pa.slug,
    pa.executive_summary,
    pa.key_findings,
    pa.data_year,
    pa.pdf_url,
    pa.published_at,
    m.id AS municipality_id,
    m.name AS municipality_name,
    mi.name AS microregion_name
FROM precomputed_analyses pa
JOIN municipalities m ON pa.municipality_id = m.id
JOIN microregions mi ON m.microregion_id = mi.id
WHERE pa.status = 'published'
ORDER BY pa.published_at DESC;

-- View: Fragmentos ativos para exibição
CREATE OR REPLACE VIEW v_active_fragments AS
SELECT
    af.*,
    m.name AS municipality_name,
    mi.name AS microregion_name
FROM analysis_fragments af
LEFT JOIN municipalities m ON af.municipality_id = m.id
LEFT JOIN microregions mi ON af.microregion_id = mi.id
WHERE (af.valid_from IS NULL OR af.valid_from <= CURRENT_DATE)
  AND (af.valid_until IS NULL OR af.valid_until >= CURRENT_DATE)
ORDER BY af.priority, af.display_order;

-- Comentários
COMMENT ON TABLE precomputed_analyses IS 'Análises pré-computadas prontas para exibição no dashboard';
COMMENT ON TABLE analysis_fragments IS 'Fragmentos de análise para exibição contextual';
COMMENT ON TABLE generated_documents IS 'Documentos PDF gerados para download';
-- ============================================
-- Migration 006: Base de Conhecimento (RAG)
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Habilitar extensão pgvector para embeddings
-- Nota: No Supabase, execute: CREATE EXTENSION IF NOT EXISTS vector;
-- No Replit PostgreSQL, pode ser necessário configuração adicional

-- Tipo de documento da base de conhecimento
CREATE TYPE knowledge_doc_type AS ENUM (
  'study',          -- Estudo acadêmico/técnico
  'report',         -- Relatório oficial
  'legislation',    -- Legislação/normativas
  'news',           -- Notícia/matéria jornalística
  'statistic',      -- Publicação estatística
  'plan',           -- Plano de governo/desenvolvimento
  'manual',         -- Manual/guia técnico
  'other'           -- Outros
);

-- Fonte do documento
CREATE TYPE knowledge_source AS ENUM (
  'ibge',           -- IBGE
  'inep',           -- INEP
  'datasus',        -- DATASUS
  'tesouro',        -- Tesouro Nacional
  'governo_to',     -- Governo do Tocantins
  'municipio',      -- Prefeituras
  'academia',       -- Universidades/pesquisa
  'imprensa',       -- Mídia/imprensa
  'interno',        -- Gerado internamente
  'other'           -- Outras fontes
);

-- Documentos da base de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    doc_type knowledge_doc_type NOT NULL,
    source knowledge_source NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Conteúdo
    content TEXT,                -- Conteúdo textual completo
    file_url TEXT,               -- URL do arquivo original
    file_type VARCHAR(20),       -- pdf, docx, html, etc.

    -- Metadados
    author VARCHAR(200),
    publication_date DATE,
    reference_year INTEGER,

    -- Relacionamentos territoriais
    municipality_ids UUID[],     -- Municípios mencionados
    microregion_ids UUID[],      -- Microrregiões mencionadas
    is_statewide BOOLEAN DEFAULT false,

    -- Dimensões relacionadas
    dimensions dimension_type[],

    -- Tags para busca
    tags TEXT[],

    -- Status
    is_processed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks do documento (para RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,

    -- Conteúdo do chunk
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,

    -- Embedding (vetor 1536 dimensões para OpenAI ada-002)
    -- Nota: Se pgvector não estiver disponível, armazenar como JSONB
    embedding JSONB,  -- Alternativa: vector(1536) se pgvector disponível

    -- Metadados do chunk
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(document_id, chunk_index)
);

-- Histórico de consultas RAG (para melhoria contínua)
CREATE TABLE IF NOT EXISTS rag_query_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Consulta
    query_text TEXT NOT NULL,
    query_embedding JSONB,

    -- Resultados
    retrieved_chunk_ids UUID[],
    relevance_scores DECIMAL[],

    -- Contexto
    session_id UUID,
    dimension dimension_type,
    municipality_id UUID,

    -- Feedback
    was_helpful BOOLEAN,
    feedback_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type ON knowledge_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source ON knowledge_documents(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_active ON knowledge_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_dimensions ON knowledge_documents USING GIN(dimensions);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags ON knowledge_documents USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON knowledge_chunks(document_id);

-- Função para busca semântica (simulada sem pgvector)
-- Em produção com pgvector, usar: ORDER BY embedding <-> query_embedding
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_query TEXT,
    p_dimension dimension_type DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    document_title VARCHAR,
    chunk_content TEXT,
    relevance_score DECIMAL
) AS $$
BEGIN
    -- Busca textual simples (fallback sem pgvector)
    -- Em produção, substituir por busca vetorial
    RETURN QUERY
    SELECT
        kc.id,
        kd.id,
        kd.title,
        kc.content,
        ts_rank(to_tsvector('portuguese', kc.content), plainto_tsquery('portuguese', p_query)) as score
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE kd.is_active = true
      AND (p_dimension IS NULL OR p_dimension = ANY(kd.dimensions))
      AND to_tsvector('portuguese', kc.content) @@ plainto_tsquery('portuguese', p_query)
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_knowledge_documents_updated_at
    BEFORE UPDATE ON knowledge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views
CREATE OR REPLACE VIEW v_knowledge_stats AS
SELECT
    doc_type,
    source,
    COUNT(*) as document_count,
    SUM(CASE WHEN is_processed THEN 1 ELSE 0 END) as processed_count,
    MAX(created_at) as last_added
FROM knowledge_documents
WHERE is_active = true
GROUP BY doc_type, source;

-- Comentários
COMMENT ON TABLE knowledge_documents IS 'Documentos da base de conhecimento para RAG';
COMMENT ON TABLE knowledge_chunks IS 'Chunks de documentos com embeddings para busca semântica';
COMMENT ON TABLE rag_query_log IS 'Log de consultas RAG para análise e melhoria';
COMMENT ON FUNCTION search_knowledge_base IS 'Busca semântica na base de conhecimento';
-- ============================================
-- Migration 007: Sistema de Coleta de Dados
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Status do job de coleta
CREATE TYPE collection_status AS ENUM (
  'pending',      -- Aguardando execução
  'running',      -- Em execução
  'completed',    -- Concluído com sucesso
  'failed',       -- Falhou
  'paused'        -- Pausado
);

-- Fontes de dados para coleta
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuração de acesso
    base_url TEXT,
    api_type VARCHAR(50),        -- rest, graphql, scraping, ftp, etc.
    auth_type VARCHAR(50),       -- none, api_key, oauth, basic
    auth_config JSONB,           -- Configuração de autenticação (criptografada)

    -- Dimensões e indicadores
    dimensions dimension_type[],
    indicator_codes TEXT[],

    -- Agendamento
    collection_frequency VARCHAR(20),  -- daily, weekly, monthly, quarterly, yearly
    last_collection_at TIMESTAMPTZ,
    next_collection_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs de coleta de dados
CREATE TABLE IF NOT EXISTS collection_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Fonte
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,

    -- Configuração do job
    job_type VARCHAR(50) NOT NULL,      -- full, incremental, specific_indicator
    target_indicators TEXT[],           -- Indicadores específicos (se aplicável)
    target_year INTEGER,
    parameters JSONB,

    -- Execução
    status collection_status DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Resultados
    records_collected INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_errors INTEGER DEFAULT 0,
    error_details JSONB,

    -- Workflow n8n
    n8n_execution_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log detalhado de coleta
CREATE TABLE IF NOT EXISTS collection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID NOT NULL REFERENCES collection_jobs(id) ON DELETE CASCADE,

    -- Detalhes
    log_level VARCHAR(20),       -- info, warning, error
    message TEXT NOT NULL,
    details JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos de análises (para geração via n8n)
CREATE TABLE IF NOT EXISTS analysis_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Configuração
    name VARCHAR(200) NOT NULL,
    analysis_type analysis_type NOT NULL,
    description TEXT,

    -- Alvo
    target_type VARCHAR(50) NOT NULL,   -- all_municipalities, microregion, specific
    target_ids UUID[],                  -- IDs específicos se aplicável

    -- Agendamento
    cron_expression VARCHAR(100),       -- Expressão cron
    is_active BOOLEAN DEFAULT true,

    -- Última execução
    last_run_at TIMESTAMPTZ,
    last_run_status VARCHAR(50),
    next_run_at TIMESTAMPTZ,

    -- Workflow n8n
    n8n_workflow_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de execuções de análises agendadas
CREATE TABLE IF NOT EXISTS analysis_schedule_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    schedule_id UUID NOT NULL REFERENCES analysis_schedules(id) ON DELETE CASCADE,

    -- Execução
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50),

    -- Resultados
    analyses_generated INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    error_details JSONB,

    -- n8n
    n8n_execution_id VARCHAR(100)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_jobs_source ON collection_jobs(data_source_id);
CREATE INDEX IF NOT EXISTS idx_collection_jobs_status ON collection_jobs(status);
CREATE INDEX IF NOT EXISTS idx_collection_logs_job ON collection_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_analysis_schedules_active ON analysis_schedules(is_active);

-- Triggers
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_schedules_updated_at
    BEFORE UPDATE ON analysis_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seeds: Fontes de dados padrão
INSERT INTO data_sources (code, name, description, base_url, api_type, dimensions, collection_frequency) VALUES
  ('IBGE_SIDRA', 'IBGE SIDRA', 'Sistema IBGE de Recuperação Automática', 'https://apisidra.ibge.gov.br', 'rest', ARRAY['ECON', 'SOCIAL']::dimension_type[], 'yearly'),
  ('IBGE_CIDADES', 'IBGE Cidades', 'Portal IBGE Cidades', 'https://servicodados.ibge.gov.br/api/v1', 'rest', ARRAY['ECON', 'SOCIAL', 'TERRA']::dimension_type[], 'yearly'),
  ('INEP_DADOS', 'INEP Dados Abertos', 'Dados educacionais do INEP', 'https://dadosabertos.inep.gov.br', 'rest', ARRAY['SOCIAL']::dimension_type[], 'yearly'),
  ('DATASUS_TABNET', 'DATASUS TabNet', 'Tabulador de dados do SUS', 'http://tabnet.datasus.gov.br', 'scraping', ARRAY['SOCIAL']::dimension_type[], 'monthly'),
  ('TESOURO_SICONFI', 'Tesouro SICONFI', 'Sistema de Informações Contábeis e Fiscais', 'https://apidatalake.tesouro.gov.br', 'rest', ARRAY['ECON']::dimension_type[], 'yearly'),
  ('MAPBIOMAS', 'MapBiomas', 'Mapeamento de cobertura do solo', 'https://mapbiomas.org', 'rest', ARRAY['AMBIENT']::dimension_type[], 'yearly'),
  ('INPE_PRODES', 'INPE PRODES', 'Dados de desmatamento', 'http://terrabrasilis.dpi.inpe.br', 'rest', ARRAY['AMBIENT']::dimension_type[], 'yearly')
ON CONFLICT (code) DO NOTHING;

-- Views
CREATE OR REPLACE VIEW v_collection_status AS
SELECT
    ds.code AS source_code,
    ds.name AS source_name,
    ds.is_active,
    ds.last_collection_at,
    ds.next_collection_at,
    cj.status AS last_job_status,
    cj.records_collected AS last_records_collected,
    cj.completed_at AS last_job_completed
FROM data_sources ds
LEFT JOIN LATERAL (
    SELECT * FROM collection_jobs
    WHERE data_source_id = ds.id
    ORDER BY created_at DESC
    LIMIT 1
) cj ON true
ORDER BY ds.name;

-- Comentários
COMMENT ON TABLE data_sources IS 'Fontes de dados para coleta automatizada';
COMMENT ON TABLE collection_jobs IS 'Jobs de coleta de dados executados pelo n8n';
COMMENT ON TABLE collection_logs IS 'Log detalhado de execução de coletas';
COMMENT ON TABLE analysis_schedules IS 'Agendamentos para geração automática de análises';
-- ============================================
-- Migration 008: Metadados expandidos para indicadores
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Adicionar campos de metadados expandidos para indicadores
ALTER TABLE indicator_definitions
ADD COLUMN IF NOT EXISTS tooltip_text TEXT,
ADD COLUMN IF NOT EXISTS interpretation_guide TEXT,
ADD COLUMN IF NOT EXISTS calculation_formula TEXT,
ADD COLUMN IF NOT EXISTS reference_values JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Campo para contexto de comparação (médias nacionais, regionais, etc.)
COMMENT ON COLUMN indicator_definitions.tooltip_text IS 'Texto curto para exibir no tooltip ao passar o mouse';
COMMENT ON COLUMN indicator_definitions.interpretation_guide IS 'Guia detalhado de como interpretar os valores';
COMMENT ON COLUMN indicator_definitions.calculation_formula IS 'Fórmula de cálculo do indicador';
COMMENT ON COLUMN indicator_definitions.reference_values IS 'Valores de referência (ex: {"nacional": 0.75, "regional": 0.68, "meta_ods": 0.80})';
COMMENT ON COLUMN indicator_definitions.tags IS 'Tags para busca e categorização (ex: ["saúde", "ods_3", "mortalidade"])';

-- Tabela para armazenar valores de referência externos (médias Brasil, Nordeste, Norte)
CREATE TABLE IF NOT EXISTS indicator_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES indicator_definitions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    benchmark_type VARCHAR(50) NOT NULL, -- 'nacional', 'regional_norte', 'regional_nordeste', 'meta_pne', 'meta_ods'
    benchmark_name VARCHAR(100) NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    source VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_id, year, benchmark_type)
);

CREATE INDEX IF NOT EXISTS idx_indicator_benchmarks_indicator ON indicator_benchmarks(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_benchmarks_year ON indicator_benchmarks(year);

COMMENT ON TABLE indicator_benchmarks IS 'Valores de referência externos para comparação (médias Brasil, metas ODS, etc.)';

-- View para indicadores com série histórica completa
CREATE OR REPLACE VIEW indicator_historical_series AS
SELECT
    iv.indicator_id,
    id.code as indicator_code,
    id.name as indicator_name,
    id.unit,
    id.tooltip_text,
    id.higher_is_better,
    ic.dimension,
    iv.municipality_id,
    m.name as municipality_name,
    m.ibge_code,
    mr.name as microregion_name,
    iv.year,
    iv.value,
    iv.rank_state,
    iv.percentile_state,
    -- Variação ano anterior
    LAG(iv.value) OVER (
        PARTITION BY iv.indicator_id, iv.municipality_id
        ORDER BY iv.year
    ) as previous_year_value,
    -- Calcular variação percentual
    CASE
        WHEN LAG(iv.value) OVER (
            PARTITION BY iv.indicator_id, iv.municipality_id
            ORDER BY iv.year
        ) IS NOT NULL AND LAG(iv.value) OVER (
            PARTITION BY iv.indicator_id, iv.municipality_id
            ORDER BY iv.year
        ) != 0
        THEN ROUND(
            ((iv.value - LAG(iv.value) OVER (
                PARTITION BY iv.indicator_id, iv.municipality_id
                ORDER BY iv.year
            )) / LAG(iv.value) OVER (
                PARTITION BY iv.indicator_id, iv.municipality_id
                ORDER BY iv.year
            ) * 100)::numeric, 2
        )
        ELSE NULL
    END as year_over_year_change
FROM indicator_values iv
JOIN indicator_definitions id ON iv.indicator_id = id.id
JOIN indicator_categories ic ON id.category_id = ic.id
JOIN municipalities m ON iv.municipality_id = m.id
JOIN microregions mr ON m.microregion_id = mr.id
WHERE id.is_active = true
ORDER BY iv.indicator_id, iv.municipality_id, iv.year;

-- View para estatísticas de série temporal por indicador/município
CREATE OR REPLACE VIEW indicator_trend_stats AS
SELECT
    iv.indicator_id,
    iv.municipality_id,
    COUNT(*) as data_points,
    MIN(iv.year) as first_year,
    MAX(iv.year) as last_year,
    MIN(iv.value) as min_value,
    MAX(iv.value) as max_value,
    AVG(iv.value) as avg_value,
    -- Primeiro e último valor para calcular tendência
    FIRST_VALUE(iv.value) OVER (
        PARTITION BY iv.indicator_id, iv.municipality_id
        ORDER BY iv.year
    ) as first_value,
    LAST_VALUE(iv.value) OVER (
        PARTITION BY iv.indicator_id, iv.municipality_id
        ORDER BY iv.year
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_value
FROM indicator_values iv
GROUP BY iv.indicator_id, iv.municipality_id, iv.value, iv.year;

-- Função para obter série histórica de um indicador
CREATE OR REPLACE FUNCTION get_indicator_history(
    p_indicator_code VARCHAR(50),
    p_municipality_id UUID,
    p_years_back INTEGER DEFAULT 5
)
RETURNS TABLE (
    year INTEGER,
    value DECIMAL(15, 4),
    rank_state INTEGER,
    percentile_state DECIMAL(5, 2),
    state_avg DECIMAL(15, 4),
    microregion_avg DECIMAL(15, 4),
    year_change DECIMAL(10, 2),
    trend VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    WITH historical_data AS (
        SELECT
            iv.year,
            iv.value,
            iv.rank_state,
            iv.percentile_state,
            sa.avg_value as state_avg,
            ma.avg_value as microregion_avg,
            LAG(iv.value) OVER (ORDER BY iv.year) as prev_value
        FROM indicator_values iv
        JOIN indicator_definitions id ON iv.indicator_id = id.id
        JOIN municipalities m ON iv.municipality_id = m.id
        LEFT JOIN state_averages sa ON sa.indicator_id = id.id AND sa.year = iv.year
        LEFT JOIN microregion_averages ma ON ma.indicator_id = id.id
            AND ma.microregion_id = m.microregion_id AND ma.year = iv.year
        WHERE id.code = p_indicator_code
          AND iv.municipality_id = p_municipality_id
          AND iv.year >= EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - p_years_back
        ORDER BY iv.year
    )
    SELECT
        hd.year,
        hd.value,
        hd.rank_state,
        hd.percentile_state,
        hd.state_avg,
        hd.microregion_avg,
        CASE
            WHEN hd.prev_value IS NOT NULL AND hd.prev_value != 0
            THEN ROUND(((hd.value - hd.prev_value) / hd.prev_value * 100)::numeric, 2)
            ELSE NULL
        END as year_change,
        CASE
            WHEN hd.value > hd.prev_value THEN 'up'
            WHEN hd.value < hd.prev_value THEN 'down'
            ELSE 'stable'
        END as trend
    FROM historical_data hd;
END;
$$ LANGUAGE plpgsql;

-- Função para obter metadados completos de um indicador (para tooltip)
CREATE OR REPLACE FUNCTION get_indicator_metadata(p_indicator_code VARCHAR(50))
RETURNS TABLE (
    code VARCHAR(50),
    name VARCHAR(200),
    description TEXT,
    tooltip_text TEXT,
    interpretation_guide TEXT,
    unit VARCHAR(50),
    source VARCHAR(100),
    source_url TEXT,
    methodology TEXT,
    calculation_formula TEXT,
    higher_is_better BOOLEAN,
    dimension dimension_type,
    category_name VARCHAR(100),
    reference_values JSONB,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id.code,
        id.name,
        id.description,
        COALESCE(id.tooltip_text, id.description) as tooltip_text,
        id.interpretation_guide,
        id.unit,
        id.source,
        id.source_url,
        id.methodology,
        id.calculation_formula,
        id.higher_is_better,
        ic.dimension,
        ic.name as category_name,
        id.reference_values,
        id.tags
    FROM indicator_definitions id
    JOIN indicator_categories ic ON id.category_id = ic.id
    WHERE id.code = p_indicator_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_indicator_history IS 'Retorna série histórica de um indicador para um município';
COMMENT ON FUNCTION get_indicator_metadata IS 'Retorna metadados completos de um indicador para tooltips';
