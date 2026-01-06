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
