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
