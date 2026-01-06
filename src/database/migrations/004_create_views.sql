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
