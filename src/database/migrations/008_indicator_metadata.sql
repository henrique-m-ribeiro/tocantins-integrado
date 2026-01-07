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
