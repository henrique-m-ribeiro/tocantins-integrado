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
