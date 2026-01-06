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
