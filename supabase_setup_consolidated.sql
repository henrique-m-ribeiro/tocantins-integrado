-- ============================================
-- SETUP CONSOLIDADO - TOCANTINS INTEGRADO
-- Banco de Dados Supabase - Schema Completo
-- Gerado em: 2026-01-09
-- ============================================
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto: uyjrltzujeyploconacx
-- 3. SQL Editor > New Query
-- 4. Cole este script completo
-- 5. Execute com "Run"
--
-- Este script consolida todas as migrações e está
-- alinhado com os types TypeScript do dashboard.
-- ============================================

-- ============================================
-- PARTE 1: TIPOS ENUM
-- ============================================

-- Dimensões de análise
CREATE TYPE dimension_type AS ENUM ('ECON', 'SOCIAL', 'TERRA', 'AMBIENT');

-- Periodicidade dos indicadores
CREATE TYPE periodicity_type AS ENUM ('annual', 'monthly', 'quarterly', 'census');

-- Canal de comunicação
CREATE TYPE chat_channel AS ENUM ('dashboard', 'whatsapp');

-- Tipo de mensagem
CREATE TYPE message_type AS ENUM ('text', 'audio', 'image', 'document');

-- Role da mensagem
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- Status de processamento
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- Tipo de análise pré-computada
CREATE TYPE analysis_type AS ENUM (
  'municipal_profile',
  'dimensional_summary',
  'comparative',
  'microregional',
  'thematic',
  'ranking'
);

-- Status da análise
CREATE TYPE analysis_status AS ENUM ('draft', 'generating', 'published', 'archived');

-- Tipo de documento da base de conhecimento
CREATE TYPE knowledge_doc_type AS ENUM (
  'study', 'report', 'legislation', 'news', 'statistic',
  'plan', 'manual', 'other'
);

-- Fonte do documento
CREATE TYPE knowledge_source AS ENUM (
  'ibge', 'inep', 'datasus', 'tesouro', 'governo_to',
  'municipio', 'academia', 'imprensa', 'interno', 'other'
);

-- ============================================
-- PARTE 2: FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- PARTE 3: TABELAS DE GEOGRAFIA
-- ============================================

-- Mesorregiões do Tocantins (2 mesorregiões)
CREATE TABLE IF NOT EXISTS mesoregions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibge_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE mesoregions IS 'Mesorregiões do Tocantins (2 mesorregiões)';

-- Microrregiões do Tocantins (8 microrregiões)
CREATE TABLE IF NOT EXISTS microregions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibge_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mesoregion_id UUID NOT NULL REFERENCES mesoregions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE microregions IS 'Microrregiões do Tocantins (8 microrregiões)';

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
    state_id VARCHAR(2) DEFAULT 'TO',
    country_id VARCHAR(3) DEFAULT 'BRA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE municipalities IS 'Municípios do Tocantins (139 municípios)';

-- ============================================
-- PARTE 4: TABELAS DE INDICADORES
-- ============================================

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

COMMENT ON TABLE indicator_categories IS 'Categorias de indicadores organizadas por dimensão';

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

COMMENT ON TABLE indicator_definitions IS 'Definições e metadados dos indicadores socioeconômicos';

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

COMMENT ON TABLE indicator_values IS 'Valores dos indicadores por município e período';

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

COMMENT ON TABLE microregion_averages IS 'Médias pré-calculadas por microrregião';

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

COMMENT ON TABLE state_averages IS 'Médias pré-calculadas para o estado';

-- ============================================
-- PARTE 5: TABELAS DE CHAT E SESSÕES
-- ============================================

-- Sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    channel chat_channel NOT NULL,
    whatsapp_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    context JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

COMMENT ON TABLE chat_sessions IS 'Sessões de chat (Dashboard ou WhatsApp)';

-- Mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    was_transcribed BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    visualizations JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE chat_messages IS 'Mensagens de chat entre usuário e assistente';

-- Requisições ao orquestrador
CREATE TABLE IF NOT EXISTS orchestrator_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    query_type VARCHAR(50),
    status processing_status DEFAULT 'pending',
    context JSONB DEFAULT '{}'::jsonb,
    response JSONB,
    agents_used TEXT[],
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_used VARCHAR(50),
    error_message TEXT
);

COMMENT ON TABLE orchestrator_requests IS 'Requisições processadas pelo orquestrador';

-- Log de execução dos agentes
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orchestrator_request_id UUID NOT NULL REFERENCES orchestrator_requests(id) ON DELETE CASCADE,
    dimension dimension_type NOT NULL,
    status processing_status DEFAULT 'pending',
    input_context JSONB,
    output_analysis JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    error_message TEXT
);

COMMENT ON TABLE agent_execution_logs IS 'Log de execução de cada agente dimensional';

-- Feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_feedback IS 'Feedback dos usuários sobre as respostas';

-- Análises salvas/exportadas
CREATE TABLE IF NOT EXISTS saved_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    analysis_type VARCHAR(50),
    content JSONB NOT NULL,
    export_format VARCHAR(10),
    export_url TEXT,
    municipality_ids UUID[],
    microregion_ids UUID[],
    dimensions dimension_type[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE saved_analyses IS 'Análises salvas e exportadas pelos usuários';

-- ============================================
-- PARTE 6: TABELAS DE ANÁLISES PRÉ-COMPUTADAS
-- ============================================

-- Análises pré-computadas
CREATE TABLE IF NOT EXISTS precomputed_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type analysis_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    microregion_id UUID REFERENCES microregions(id) ON DELETE CASCADE,
    dimension dimension_type,
    executive_summary TEXT,
    full_content JSONB NOT NULL,
    key_findings TEXT[],
    recommendations TEXT[],
    highlighted_indicators JSONB,
    visualizations JSONB,
    data_year INTEGER,
    generated_at TIMESTAMPTZ,
    generated_by VARCHAR(50),
    status analysis_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE precomputed_analyses IS 'Análises pré-computadas prontas para exibição no dashboard';

-- Fragmentos de análise
CREATE TABLE IF NOT EXISTS analysis_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES precomputed_analyses(id) ON DELETE CASCADE,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    microregion_id UUID REFERENCES microregions(id) ON DELETE CASCADE,
    dimension dimension_type,
    indicator_code VARCHAR(50),
    fragment_type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    display_order INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE analysis_fragments IS 'Fragmentos de análise para exibição contextual';

-- Documentos PDF gerados
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    municipality_ids UUID[],
    microregion_ids UUID[],
    file_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    page_count INTEGER,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by VARCHAR(50),
    data_year INTEGER,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE generated_documents IS 'Documentos PDF gerados para download';

-- ============================================
-- PARTE 7: TABELAS DE BASE DE CONHECIMENTO (RAG)
-- ============================================

-- Documentos da base de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type knowledge_doc_type NOT NULL,
    source knowledge_source NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    file_url TEXT,
    file_type VARCHAR(20),
    author VARCHAR(200),
    publication_date DATE,
    reference_year INTEGER,
    municipality_ids UUID[],
    microregion_ids UUID[],
    is_statewide BOOLEAN DEFAULT false,
    dimensions dimension_type[],
    tags TEXT[],
    is_processed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE knowledge_documents IS 'Documentos da base de conhecimento para RAG';

-- Chunks do documento (para RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    embedding JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

COMMENT ON TABLE knowledge_chunks IS 'Chunks de documentos com embeddings para busca semântica';

-- Histórico de consultas RAG
CREATE TABLE IF NOT EXISTS rag_query_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_embedding JSONB,
    retrieved_chunk_ids UUID[],
    relevance_scores DECIMAL[],
    session_id UUID,
    dimension dimension_type,
    municipality_id UUID,
    was_helpful BOOLEAN,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE rag_query_log IS 'Log de consultas RAG para análise e melhoria';

-- ============================================
-- PARTE 8: ÍNDICES PARA OTIMIZAÇÃO
-- ============================================

-- Índices de Geografia
CREATE INDEX IF NOT EXISTS idx_municipalities_microregion ON municipalities(microregion_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_name ON municipalities(name);
CREATE INDEX IF NOT EXISTS idx_municipalities_ibge_code ON municipalities(ibge_code);
CREATE INDEX IF NOT EXISTS idx_microregions_mesoregion ON microregions(mesoregion_id);

-- Índices de Indicadores
CREATE INDEX IF NOT EXISTS idx_indicator_values_municipality ON indicator_values(municipality_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_year ON indicator_values(year);
CREATE INDEX IF NOT EXISTS idx_indicator_values_composite ON indicator_values(indicator_id, year);
CREATE INDEX IF NOT EXISTS idx_indicator_definitions_category ON indicator_definitions(category_id);
CREATE INDEX IF NOT EXISTS idx_indicator_definitions_code ON indicator_definitions(code);
CREATE INDEX IF NOT EXISTS idx_indicator_categories_dimension ON indicator_categories(dimension);

-- Índices de Chat
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_whatsapp ON chat_sessions(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_status ON orchestrator_requests(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_message ON orchestrator_requests(message_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_request ON agent_execution_logs(orchestrator_request_id);
CREATE INDEX IF NOT EXISTS idx_saved_analyses_session ON saved_analyses(session_id);

-- Índices de Análises Pré-computadas
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_municipality ON precomputed_analyses(municipality_id);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_microregion ON precomputed_analyses(microregion_id);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_type ON precomputed_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_status ON precomputed_analyses(status);
CREATE INDEX IF NOT EXISTS idx_precomputed_analyses_slug ON precomputed_analyses(slug);
CREATE INDEX IF NOT EXISTS idx_analysis_fragments_municipality ON analysis_fragments(municipality_id);
CREATE INDEX IF NOT EXISTS idx_analysis_fragments_dimension ON analysis_fragments(dimension);
CREATE INDEX IF NOT EXISTS idx_analysis_fragments_type ON analysis_fragments(fragment_type);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);

-- Índices de Base de Conhecimento
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type ON knowledge_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source ON knowledge_documents(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_active ON knowledge_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_dimensions ON knowledge_documents USING GIN(dimensions);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags ON knowledge_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON knowledge_chunks(document_id);

-- ============================================
-- PARTE 9: TRIGGERS
-- ============================================

-- Triggers para updated_at
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

CREATE TRIGGER update_precomputed_analyses_updated_at
    BEFORE UPDATE ON precomputed_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at
    BEFORE UPDATE ON knowledge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================
-- PARTE 10: VIEWS ÚTEIS
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

COMMENT ON VIEW v_municipalities_full IS 'Municípios com informações completas de região';

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

COMMENT ON VIEW v_microregions_summary IS 'Resumo estatístico das microrregiões';

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

COMMENT ON VIEW v_latest_indicators IS 'Indicadores com valores mais recentes';

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

COMMENT ON VIEW v_dimension_rankings IS 'Ranking de municípios por dimensão';

-- View: Estatísticas de uso do sistema
CREATE OR REPLACE VIEW v_usage_stats AS
SELECT
    DATE(cm.created_at) AS date,
    cs.channel,
    COUNT(*) AS total_messages,
    COUNT(DISTINCT cm.session_id) AS unique_sessions,
    AVG(CASE WHEN cm.metadata->>'processing_time_ms' IS NOT NULL
        THEN (cm.metadata->>'processing_time_ms')::INTEGER END) AS avg_processing_time_ms
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.id
WHERE cm.role = 'user'
GROUP BY DATE(cm.created_at), cs.channel
ORDER BY date DESC;

COMMENT ON VIEW v_usage_stats IS 'Estatísticas de uso do sistema';

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

COMMENT ON VIEW v_agent_performance IS 'Métricas de performance dos agentes';

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

COMMENT ON VIEW v_municipal_analyses IS 'Análises publicadas por município';

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

COMMENT ON VIEW v_active_fragments IS 'Fragmentos ativos para exibição';

-- View: Estatísticas da base de conhecimento
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

COMMENT ON VIEW v_knowledge_stats IS 'Estatísticas da base de conhecimento';

-- ============================================
-- PARTE 11: FUNÇÕES ÚTEIS
-- ============================================

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

COMMENT ON FUNCTION get_municipality_indicators IS 'Retorna indicadores de um município';

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

COMMENT ON FUNCTION compare_municipalities IS 'Compara indicadores entre dois municípios';

-- Função: Busca semântica na base de conhecimento (fallback textual)
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

COMMENT ON FUNCTION search_knowledge_base IS 'Busca semântica na base de conhecimento';

-- ============================================
-- PARTE 12: DADOS INICIAIS (SEEDS)
-- ============================================

-- Inserir Mesorregiões do Tocantins
INSERT INTO mesoregions (ibge_code, name) VALUES
('1701', 'Ocidental do Tocantins'),
('1702', 'Oriental do Tocantins')
ON CONFLICT (ibge_code) DO NOTHING;

-- Inserir Microrregiões do Tocantins
INSERT INTO microregions (ibge_code, name, mesoregion_id) VALUES
('170001', 'Araguaína', (SELECT id FROM mesoregions WHERE ibge_code = '1701')),
('170002', 'Miracema do Tocantins', (SELECT id FROM mesoregions WHERE ibge_code = '1701')),
('170003', 'Rio Formoso', (SELECT id FROM mesoregions WHERE ibge_code = '1701')),
('170004', 'Gurupi', (SELECT id FROM mesoregions WHERE ibge_code = '1701')),
('170005', 'Porto Nacional', (SELECT id FROM mesoregions WHERE ibge_code = '1702')),
('170006', 'Jalapão', (SELECT id FROM mesoregions WHERE ibge_code = '1702')),
('170007', 'Dianópolis', (SELECT id FROM mesoregions WHERE ibge_code = '1702')),
('170008', 'Bico do Papagaio', (SELECT id FROM mesoregions WHERE ibge_code = '1701'))
ON CONFLICT (ibge_code) DO NOTHING;

-- Inserir município de Palmas (capital)
INSERT INTO municipalities (ibge_code, name, microregion_id, population, area_km2, latitude, longitude) VALUES
('1721000', 'Palmas',
 (SELECT id FROM microregions WHERE ibge_code = '170005'),
 306296, 2218.94, -10.184, -48.334)
ON CONFLICT (ibge_code) DO NOTHING;

-- Inserir categorias de indicadores principais
INSERT INTO indicator_categories (dimension, name, description, display_order) VALUES
('ECON', 'PIB e Renda', 'Indicadores de produto interno bruto e renda per capita', 1),
('ECON', 'Finanças Públicas', 'Receitas e despesas municipais', 2),
('ECON', 'Comércio Exterior', 'Exportações e importações', 3),
('SOCIAL', 'Educação', 'Indicadores educacionais (IDEB, matrículas, etc)', 1),
('SOCIAL', 'Saúde', 'Indicadores de saúde pública', 2),
('SOCIAL', 'Desenvolvimento Humano', 'IDH e indicadores socioeconômicos', 3),
('TERRA', 'Saneamento', 'Água, esgoto e coleta de lixo', 1),
('TERRA', 'Infraestrutura', 'Energia, telecomunicações e transporte', 2),
('AMBIENT', 'Cobertura Vegetal', 'Vegetação nativa e uso do solo', 1),
('AMBIENT', 'Recursos Hídricos', 'Qualidade e disponibilidade de água', 2)
ON CONFLICT (dimension, name) DO NOTHING;

-- Inserir definições de indicadores principais
INSERT INTO indicator_definitions (category_id, code, name, unit, source, periodicity, higher_is_better) VALUES
-- Econômicos
((SELECT id FROM indicator_categories WHERE dimension = 'ECON' AND name = 'Comércio Exterior'), 'EXPORTACOES_FOB_USD', 'Exportações FOB (US$)', 'currency', 'MDIC', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'ECON' AND name = 'Comércio Exterior'), 'IMPORTACOES_FOB_USD', 'Importações FOB (US$)', 'currency', 'MDIC', 'annual', false),
((SELECT id FROM indicator_categories WHERE dimension = 'ECON' AND name = 'Comércio Exterior'), 'BALANCA_COMERCIAL_USD', 'Balança Comercial (US$)', 'currency', 'MDIC', 'annual', true),
-- Sociais
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Desenvolvimento Humano'), 'IDH', 'Índice de Desenvolvimento Humano Municipal', 'index', 'PNUD/IPEA/FJP', 'census', true),
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Educação'), 'IDEB_ANOS_INICIAIS', 'IDEB Anos Iniciais', 'index', 'INEP', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Educação'), 'IDEB_ANOS_FINAIS', 'IDEB Anos Finais', 'index', 'INEP', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Educação'), 'IDEB_FUNDAMENTAL', 'IDEB Ensino Fundamental', 'index', 'INEP', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Saúde'), 'MORTALIDADE_INFANTIL', 'Taxa de Mortalidade Infantil', 'ratio', 'DataSUS', 'annual', false),
((SELECT id FROM indicator_categories WHERE dimension = 'SOCIAL' AND name = 'Saúde'), 'COBERTURA_ESF', 'Cobertura Estratégia Saúde da Família', 'percent', 'DataSUS', 'annual', true),
-- Territoriais
((SELECT id FROM indicator_categories WHERE dimension = 'TERRA' AND name = 'Saneamento'), 'COBERTURA_AGUA', 'Cobertura de Abastecimento de Água', 'percent', 'SNIS', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'TERRA' AND name = 'Saneamento'), 'COBERTURA_ESGOTO', 'Cobertura de Esgotamento Sanitário', 'percent', 'SNIS', 'annual', true),
-- Ambientais
((SELECT id FROM indicator_categories WHERE dimension = 'AMBIENT' AND name = 'Cobertura Vegetal'), 'VEGETACAO_NATIVA_PCT', 'Percentual de Vegetação Nativa', 'percent', 'MapBiomas', 'annual', true),
((SELECT id FROM indicator_categories WHERE dimension = 'AMBIENT' AND name = 'Cobertura Vegetal'), 'AGRICULTURA_HA', 'Área de Agricultura (ha)', 'number', 'MapBiomas', 'annual', false),
((SELECT id FROM indicator_categories WHERE dimension = 'AMBIENT' AND name = 'Cobertura Vegetal'), 'PASTAGEM_HA', 'Área de Pastagem (ha)', 'number', 'MapBiomas', 'annual', false)
ON CONFLICT (code) DO NOTHING;

-- Inserir valores de indicadores para Palmas (exemplo)
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'IDH'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2010,
    0.788,
    'official',
    'Último dado oficial do Censo 2010'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'IDEB_ANOS_INICIAIS'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2023,
    6.1,
    'official',
    'IDEB Anos Iniciais - Rede Municipal'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'IDEB_ANOS_FINAIS'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2023,
    5.4,
    'official',
    'IDEB Anos Finais - Rede Municipal'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'MORTALIDADE_INFANTIL'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2023,
    10.7,
    'official',
    'Taxa por 1.000 nascidos vivos'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'COBERTURA_AGUA'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2022,
    99.1,
    'official',
    'SNIS - Índice de atendimento total de água'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'COBERTURA_ESGOTO'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2022,
    78.5,
    'official',
    'SNIS - Índice de atendimento total de esgoto'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes)
SELECT
    (SELECT id FROM indicator_definitions WHERE code = 'VEGETACAO_NATIVA_PCT'),
    (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
    2022,
    65.0,
    'estimated',
    'MapBiomas - Cobertura vegetal nativa'
ON CONFLICT (indicator_id, municipality_id, year, month) DO NOTHING;

-- ============================================
-- FINALIZAÇÃO
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Setup do banco de dados concluído com sucesso!';
    RAISE NOTICE '📊 Estrutura criada: 27 tabelas, 10 views, 3 funções';
    RAISE NOTICE '🏙️  Dados iniciais: 2 mesorregiões, 8 microrregiões, Palmas (capital)';
    RAISE NOTICE '📈 Indicadores: 14 definições principais + valores de exemplo';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Próximos passos:';
    RAISE NOTICE '   1. Executar scripts de seeds adicionais (se houver)';
    RAISE NOTICE '   2. Configurar API para conectar ao Supabase';
    RAISE NOTICE '   3. Popular com dados dos 139 municípios';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Para testar:';
    RAISE NOTICE '   SELECT * FROM v_municipalities_full;';
    RAISE NOTICE '   SELECT * FROM v_latest_indicators;';
END $$;
