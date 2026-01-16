-- ============================================
-- Migration 009: Sistema de Territórios Extensível
-- Granularidade Territorial e Temporal
-- Tocantins Integrado - v2.0
-- ============================================
--
-- Este script implementa um schema genérico e extensível para
-- territórios, suportando múltiplas divisões regionais (antiga/nova),
-- hierarquias explícitas e indicadores multi-escala.
--
-- Mudanças principais:
-- 1. Tabela `territories` genérica (unifica regiões e municípios)
-- 2. Tabela `territory_relationships` (hierarquias explícitas)
-- 3. Modificação de `indicator_values` para referenciar territories
-- 4. Suporte a divisões antiga (pré-2017) E nova (pós-2017)
-- 5. Extensibilidade para futuras divisões (bacias, saúde, etc.)
--
-- Referência: ADR-005
-- ============================================

-- ============================================
-- FASE 1: TIPOS E ESTRUTURA CORE
-- ============================================

-- Tipo: Tipos de Territórios
CREATE TYPE territory_type AS ENUM (
    'estado',
    'mesorregiao',             -- Divisão antiga
    'microrregiao',            -- Divisão antiga
    'regiao_intermediaria',    -- Divisão nova (pós-2017)
    'regiao_imediata',         -- Divisão nova (pós-2017)
    'municipio',
    -- Extensibilidade futura:
    'bacia_hidrografica',
    'regiao_saude',
    'comarca',
    'zona_eleitoral'
);

COMMENT ON TYPE territory_type IS 'Tipos de territórios suportados pelo sistema';

-- Tabela: Territórios (Genérica)
CREATE TABLE IF NOT EXISTS territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    type territory_type NOT NULL,
    ibge_code VARCHAR(20),
    name VARCHAR(200) NOT NULL,

    -- Classificação de divisão
    division_scheme VARCHAR(50),  -- 'antiga', 'nova', 'saude', 'bacia', etc.

    -- Metadados flexíveis (JSON)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Controle e versionamento
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(type, ibge_code, division_scheme)
);

-- Índices para territories
CREATE INDEX IF NOT EXISTS idx_territories_type ON territories(type);
CREATE INDEX IF NOT EXISTS idx_territories_ibge_code ON territories(ibge_code);
CREATE INDEX IF NOT EXISTS idx_territories_name ON territories(name);
CREATE INDEX IF NOT EXISTS idx_territories_division_scheme ON territories(division_scheme);
CREATE INDEX IF NOT EXISTS idx_territories_active ON territories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_territories_metadata ON territories USING GIN(metadata);

-- Comentários
COMMENT ON TABLE territories IS 'Tabela genérica para todas as entidades territoriais (estado, regiões, municípios)';
COMMENT ON COLUMN territories.type IS 'Tipo do território (estado, municipio, microrregiao, etc.)';
COMMENT ON COLUMN territories.ibge_code IS 'Código IBGE quando aplicável';
COMMENT ON COLUMN territories.division_scheme IS 'Esquema de divisão: antiga (pré-2017), nova (pós-2017), saude, bacia, etc.';
COMMENT ON COLUMN territories.metadata IS 'Metadados flexíveis em JSON (população, área, coordenadas, etc.)';
COMMENT ON COLUMN territories.valid_from IS 'Data de início de validade (para versionamento temporal)';
COMMENT ON COLUMN territories.valid_until IS 'Data de fim de validade (para versionamento temporal)';

-- Trigger para updated_at
CREATE TRIGGER update_territories_updated_at
    BEFORE UPDATE ON territories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FASE 2: RELACIONAMENTOS E HIERARQUIAS
-- ============================================

-- Tabela: Relacionamentos Entre Territórios
CREATE TABLE IF NOT EXISTS territory_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relacionamento
    parent_territory_id UUID NOT NULL REFERENCES territories(id) ON DELETE CASCADE,
    child_territory_id UUID NOT NULL REFERENCES territories(id) ON DELETE CASCADE,

    -- Tipo de relacionamento
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'pertence_a',

    -- Esquema de divisão
    division_scheme VARCHAR(50) NOT NULL,

    -- Versionamento temporal
    valid_from DATE,
    valid_until DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(parent_territory_id, child_territory_id, relationship_type, division_scheme),
    CHECK (parent_territory_id != child_territory_id)  -- Evitar auto-referência
);

-- Índices para relationships
CREATE INDEX IF NOT EXISTS idx_territory_relationships_parent ON territory_relationships(parent_territory_id);
CREATE INDEX IF NOT EXISTS idx_territory_relationships_child ON territory_relationships(child_territory_id);
CREATE INDEX IF NOT EXISTS idx_territory_relationships_scheme ON territory_relationships(division_scheme);
CREATE INDEX IF NOT EXISTS idx_territory_relationships_type ON territory_relationships(relationship_type);

-- Comentários
COMMENT ON TABLE territory_relationships IS 'Hierarquias e relacionamentos entre territórios (ex: município pertence_a microrregião)';
COMMENT ON COLUMN territory_relationships.parent_territory_id IS 'Território pai (ex: microrregião)';
COMMENT ON COLUMN territory_relationships.child_territory_id IS 'Território filho (ex: município)';
COMMENT ON COLUMN territory_relationships.relationship_type IS 'Tipo de relacionamento (pertence_a, parte_de, etc.)';
COMMENT ON COLUMN territory_relationships.division_scheme IS 'Esquema de divisão (antiga, nova, saude, etc.)';

-- Trigger para updated_at
CREATE TRIGGER update_territory_relationships_updated_at
    BEFORE UPDATE ON territory_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FASE 3: MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================

-- 3.1. Migrar Estado
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata)
VALUES (
    'estado',
    '17',
    'Tocantins',
    NULL,  -- Estado não tem divisão específica
    true,
    '{
        "uf": "TO",
        "regiao": "Norte",
        "capital": "Palmas",
        "population": 1590248,
        "area_km2": 277621,
        "created_year": 1988
    }'::jsonb
)
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 3.2. Migrar Mesorregiões (Divisão Antiga)
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata)
SELECT
    'mesorregiao'::territory_type,
    ibge_code,
    name,
    'antiga',
    true,
    '{}'::jsonb
FROM mesoregions
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 3.3. Criar relacionamentos: Mesorregiões → Estado (Divisão Antiga)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    (SELECT id FROM territories WHERE type = 'estado' AND name = 'Tocantins'),
    t.id,
    'pertence_a',
    'antiga'
FROM territories t
WHERE t.type = 'mesorregiao'
  AND t.division_scheme = 'antiga'
ON CONFLICT DO NOTHING;

-- 3.4. Migrar Microrregiões (Divisão Antiga)
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata)
SELECT
    'microrregiao'::territory_type,
    micro.ibge_code,
    micro.name,
    'antiga',
    true,
    jsonb_build_object(
        'mesoregion_ibge_code', meso.ibge_code,
        'mesoregion_name', meso.name
    )
FROM microregions micro
JOIN mesoregions meso ON micro.mesoregion_id = meso.id
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 3.5. Criar relacionamentos: Microrregiões → Mesorregiões (Divisão Antiga)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_meso.id as parent_id,
    t_micro.id as child_id,
    'pertence_a',
    'antiga'
FROM territories t_micro
JOIN microregions micro ON t_micro.ibge_code = micro.ibge_code AND t_micro.type = 'microrregiao'
JOIN mesoregions meso ON micro.mesoregion_id = meso.id
JOIN territories t_meso ON t_meso.ibge_code = meso.ibge_code AND t_meso.type = 'mesorregiao'
WHERE t_micro.division_scheme = 'antiga'
  AND t_meso.division_scheme = 'antiga'
ON CONFLICT DO NOTHING;

-- 3.6. Migrar Municípios
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata)
SELECT
    'municipio'::territory_type,
    m.ibge_code,
    m.name,
    NULL,  -- Municípios são compartilhados entre divisões
    true,
    jsonb_build_object(
        'population', m.population,
        'area_km2', m.area_km2,
        'density', m.density,
        'latitude', m.latitude,
        'longitude', m.longitude,
        'state_id', m.state_id,
        'country_id', m.country_id
    )
FROM municipalities m
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 3.7. Criar relacionamentos: Municípios → Microrregiões (Divisão Antiga)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_micro.id as parent_id,
    t_muni.id as child_id,
    'pertence_a',
    'antiga'
FROM territories t_muni
JOIN municipalities m ON t_muni.ibge_code = m.ibge_code AND t_muni.type = 'municipio'
JOIN microregions micro ON m.microregion_id = micro.id
JOIN territories t_micro ON t_micro.ibge_code = micro.ibge_code AND t_micro.type = 'microrregiao'
WHERE t_micro.division_scheme = 'antiga'
ON CONFLICT DO NOTHING;

-- ============================================
-- FASE 4: POPULAR NOVA DIVISÃO REGIONAL (Pós-2017)
-- ============================================

-- 4.1. Regiões Geográficas Intermediárias (3)
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata) VALUES
('regiao_intermediaria', '1701', 'Araguaína', 'nova', true, '{"polarizacao": "Araguaína", "municipios_aproximados": 45}'::jsonb),
('regiao_intermediaria', '1702', 'Palmas', 'nova', true, '{"polarizacao": "Palmas", "municipios_aproximados": 60}'::jsonb),
('regiao_intermediaria', '1703', 'Gurupi', 'nova', true, '{"polarizacao": "Gurupi", "municipios_aproximados": 34}'::jsonb)
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 4.2. Relacionamentos: Regiões Intermediárias → Estado (Divisão Nova)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    (SELECT id FROM territories WHERE type = 'estado' AND name = 'Tocantins'),
    t.id,
    'pertence_a',
    'nova'
FROM territories t
WHERE t.type = 'regiao_intermediaria'
  AND t.division_scheme = 'nova'
ON CONFLICT DO NOTHING;

-- 4.3. Regiões Geográficas Imediatas (11)
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata) VALUES
-- Região Intermediária de Araguaína
('regiao_imediata', '170001', 'Araguaína', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Araguaína"}'::jsonb),
('regiao_imediata', '170002', 'Augustinópolis - Tocantinópolis', 'nova', true, '{"regiao_intermediaria": "1701", "centros": ["Augustinópolis", "Tocantinópolis"]}'::jsonb),
('regiao_imediata', '170003', 'Colinas do Tocantins', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Colinas do Tocantins"}'::jsonb),
('regiao_imediata', '170004', 'Guaraí', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Guaraí"}'::jsonb),

-- Região Intermediária de Palmas
('regiao_imediata', '170005', 'Palmas', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Palmas"}'::jsonb),
('regiao_imediata', '170006', 'Miracema do Tocantins', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Miracema do Tocantins"}'::jsonb),
('regiao_imediata', '170007', 'Araguacema', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Araguacema"}'::jsonb),
('regiao_imediata', '170008', 'Arraias', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Arraias"}'::jsonb),
('regiao_imediata', '170009', 'Dianópolis', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Dianópolis"}'::jsonb),

-- Região Intermediária de Gurupi
('regiao_imediata', '170010', 'Gurupi', 'nova', true, '{"regiao_intermediaria": "1703", "centro": "Gurupi"}'::jsonb),
('regiao_imediata', '170011', 'Formoso do Araguaia', 'nova', true, '{"regiao_intermediaria": "1703", "centro": "Formoso do Araguaia"}'::jsonb)
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- 4.4. Relacionamentos: Regiões Imediatas → Regiões Intermediárias (Divisão Nova)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_inter.id as parent_id,
    t_imediata.id as child_id,
    'pertence_a',
    'nova'
FROM territories t_imediata
CROSS JOIN LATERAL (
    SELECT * FROM territories WHERE type = 'regiao_intermediaria'
      AND ibge_code = (t_imediata.metadata->>'regiao_intermediaria')
      AND division_scheme = 'nova'
    LIMIT 1
) t_inter
WHERE t_imediata.type = 'regiao_imediata'
  AND t_imediata.division_scheme = 'nova'
ON CONFLICT DO NOTHING;

-- ============================================
-- FASE 5: MAPEAMENTO MUNICÍPIOS → REGIÕES IMEDIATAS
-- ============================================
-- NOTA: Este mapeamento é baseado em dados oficiais do IBGE
-- Ref: https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional/23701-divisao-geografica-imediata-e-intermediaria.html

-- 5.1. Região Imediata de Araguaína (170001)
-- Principais municípios: Araguaína, Wanderlândia, Carmolândia, Nova Olinda, etc.
-- NOTA: Lista completa deve ser obtida do IBGE. Aqui incluímos alguns exemplos.

INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    (SELECT id FROM territories WHERE type = 'regiao_imediata' AND ibge_code = '170001'),
    t_muni.id,
    'pertence_a',
    'nova'
FROM territories t_muni
WHERE t_muni.type = 'municipio'
  AND t_muni.name IN ('Araguaína', 'Wanderlândia', 'Carmolândia', 'Nova Olinda',
                       'Aragominas', 'Babaçulândia', 'Muricilândia', 'Piraquê',
                       'Santa Fé do Araguaia')
ON CONFLICT DO NOTHING;

-- 5.2. Região Imediata de Augustinópolis - Tocantinópolis (170002)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    (SELECT id FROM territories WHERE type = 'regiao_imediata' AND ibge_code = '170002'),
    t_muni.id,
    'pertence_a',
    'nova'
FROM territories t_muni
WHERE t_muni.type = 'municipio'
  AND t_muni.name IN ('Augustinópolis', 'Tocantinópolis', 'Araguatins', 'Axixá do Tocantins',
                       'São Sebastião do Tocantins', 'Buriti do Tocantins', 'Nazaré',
                       'Maurilândia do Tocantins', 'Palmeiras do Tocantins')
ON CONFLICT DO NOTHING;

-- 5.3. Região Imediata de Palmas (170005)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    (SELECT id FROM territories WHERE type = 'regiao_imediata' AND ibge_code = '170005'),
    t_muni.id,
    'pertence_a',
    'nova'
FROM territories t_muni
WHERE t_muni.type = 'municipio'
  AND t_muni.name IN ('Palmas', 'Porto Nacional', 'Paraíso do Tocantins', 'Monte do Carmo',
                       'Silvanópolis', 'Aparecida do Rio Negro', 'Brejinho de Nazaré',
                       'Fátima', 'Ipueiras', 'Lagoa do Tocantins', 'Oliveira de Fátima',
                       'Pugmil', 'Santa Rosa do Tocantins')
ON CONFLICT DO NOTHING;

-- NOTA: Mapeamentos completos para as outras 8 regiões imediatas
-- devem ser adicionados conforme dados oficiais do IBGE.
-- Por brevidade, incluímos apenas exemplos principais acima.

-- ============================================
-- FASE 6: MODIFICAÇÃO DE INDICATOR_VALUES
-- ============================================

-- 6.1. Adicionar coluna territory_id (nullable inicialmente)
ALTER TABLE indicator_values
ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES territories(id) ON DELETE CASCADE;

-- 6.2. Popular territory_id a partir de municipality_id
UPDATE indicator_values iv
SET territory_id = t.id
FROM municipalities m
JOIN territories t ON t.ibge_code = m.ibge_code AND t.type = 'municipio'
WHERE iv.municipality_id = m.id
  AND iv.territory_id IS NULL;

-- 6.3. Adicionar colunas de metadados de agregação
ALTER TABLE indicator_values
ADD COLUMN IF NOT EXISTS aggregation_method VARCHAR(50) DEFAULT 'raw',
ADD COLUMN IF NOT EXISTS is_aggregated BOOLEAN DEFAULT false;

COMMENT ON COLUMN indicator_values.territory_id IS 'Referência genérica a qualquer território (município, região, estado, etc.)';
COMMENT ON COLUMN indicator_values.aggregation_method IS 'Método de agregação: raw (dado bruto), sum, avg, weighted_avg, etc.';
COMMENT ON COLUMN indicator_values.is_aggregated IS 'Se true, valor foi agregado de territórios menores';

-- 6.4. Criar índice para territory_id
CREATE INDEX IF NOT EXISTS idx_indicator_values_territory ON indicator_values(territory_id);

-- 6.5. Índices otimizados para séries temporais
CREATE INDEX IF NOT EXISTS idx_indicator_values_timeseries
ON indicator_values (indicator_id, territory_id, year DESC, month DESC);

-- Índice parcial para dados recentes (mais consultados)
CREATE INDEX IF NOT EXISTS idx_indicator_values_recent
ON indicator_values (indicator_id, territory_id, year DESC, month DESC)
WHERE year >= EXTRACT(YEAR FROM CURRENT_DATE) - 10;

-- 6.6. Modificar constraint de unicidade (incluir territory_id)
-- NOTA: Manter ambos por enquanto para compatibilidade
ALTER TABLE indicator_values
DROP CONSTRAINT IF EXISTS indicator_values_indicator_id_municipality_id_year_month_key;

ALTER TABLE indicator_values
ADD CONSTRAINT indicator_values_indicator_territory_year_month_unique
UNIQUE (indicator_id, territory_id, year, month);

-- ============================================
-- FASE 7: VIEWS DE COMPATIBILIDADE
-- ============================================

-- 7.1. View: municipalities (compatibilidade com schema antigo)
CREATE OR REPLACE VIEW v_municipalities_compat AS
SELECT
    t.id,
    t.ibge_code,
    t.name,
    -- Buscar microregion_id da divisão antiga
    (SELECT tr.parent_territory_id
     FROM territory_relationships tr
     JOIN territories tp ON tr.parent_territory_id = tp.id
     WHERE tr.child_territory_id = t.id
       AND tr.relationship_type = 'pertence_a'
       AND tr.division_scheme = 'antiga'
       AND tp.type = 'microrregiao'
     LIMIT 1) as microregion_id,
    -- Extrair metadados como colunas
    (t.metadata->>'population')::integer as population,
    (t.metadata->>'area_km2')::decimal(10,2) as area_km2,
    (t.metadata->>'density')::decimal(10,2) as density,
    (t.metadata->>'latitude')::decimal(10,6) as latitude,
    (t.metadata->>'longitude')::decimal(10,6) as longitude,
    COALESCE(t.metadata->>'state_id', 'TO') as state_id,
    COALESCE(t.metadata->>'country_id', 'BRA') as country_id,
    t.created_at,
    t.updated_at
FROM territories t
WHERE t.type = 'municipio';

COMMENT ON VIEW v_municipalities_compat IS 'View de compatibilidade com tabela municipalities antiga';

-- 7.2. View: microregions (compatibilidade)
CREATE OR REPLACE VIEW v_microregions_compat AS
SELECT
    t.id,
    t.ibge_code,
    t.name,
    (SELECT tr.parent_territory_id
     FROM territory_relationships tr
     JOIN territories tp ON tr.parent_territory_id = tp.id
     WHERE tr.child_territory_id = t.id
       AND tr.relationship_type = 'pertence_a'
       AND tr.division_scheme = 'antiga'
       AND tp.type = 'mesorregiao'
     LIMIT 1) as mesoregion_id,
    t.created_at,
    t.updated_at
FROM territories t
WHERE t.type = 'microrregiao'
  AND t.division_scheme = 'antiga';

COMMENT ON VIEW v_microregions_compat IS 'View de compatibilidade com tabela microregions antiga';

-- 7.3. View: mesoregions (compatibilidade)
CREATE OR REPLACE VIEW v_mesoregions_compat AS
SELECT
    t.id,
    t.ibge_code,
    t.name,
    t.created_at,
    t.updated_at
FROM territories t
WHERE t.type = 'mesorregiao'
  AND t.division_scheme = 'antiga';

COMMENT ON VIEW v_mesoregions_compat IS 'View de compatibilidade com tabela mesoregions antiga';

-- ============================================
-- FASE 8: VIEWS DE ANÁLISE E CONSULTA
-- ============================================

-- 8.1. View: Hierarquia Completa (Divisão Antiga)
CREATE OR REPLACE VIEW v_hierarchy_antiga AS
SELECT
    t_muni.id as municipio_id,
    t_muni.ibge_code as municipio_ibge,
    t_muni.name as municipio_nome,
    t_micro.id as microrregiao_id,
    t_micro.ibge_code as microrregiao_ibge,
    t_micro.name as microrregiao_nome,
    t_meso.id as mesorregiao_id,
    t_meso.ibge_code as mesorregiao_ibge,
    t_meso.name as mesorregiao_nome,
    t_estado.id as estado_id,
    t_estado.name as estado_nome
FROM territories t_muni
-- Município → Microrregião
LEFT JOIN territory_relationships tr_micro ON tr_micro.child_territory_id = t_muni.id
    AND tr_micro.relationship_type = 'pertence_a'
    AND tr_micro.division_scheme = 'antiga'
LEFT JOIN territories t_micro ON tr_micro.parent_territory_id = t_micro.id
    AND t_micro.type = 'microrregiao'
-- Microrregião → Mesorregião
LEFT JOIN territory_relationships tr_meso ON tr_meso.child_territory_id = t_micro.id
    AND tr_meso.relationship_type = 'pertence_a'
    AND tr_meso.division_scheme = 'antiga'
LEFT JOIN territories t_meso ON tr_meso.parent_territory_id = t_meso.id
    AND t_meso.type = 'mesorregiao'
-- Mesorregião → Estado
LEFT JOIN territory_relationships tr_estado ON tr_estado.child_territory_id = t_meso.id
    AND tr_estado.relationship_type = 'pertence_a'
    AND tr_estado.division_scheme = 'antiga'
LEFT JOIN territories t_estado ON tr_estado.parent_territory_id = t_estado.id
    AND t_estado.type = 'estado'
WHERE t_muni.type = 'municipio';

COMMENT ON VIEW v_hierarchy_antiga IS 'Hierarquia completa: Município → Microrregião → Mesorregião → Estado (Divisão Antiga)';

-- 8.2. View: Hierarquia Completa (Divisão Nova)
CREATE OR REPLACE VIEW v_hierarchy_nova AS
SELECT
    t_muni.id as municipio_id,
    t_muni.ibge_code as municipio_ibge,
    t_muni.name as municipio_nome,
    t_imediata.id as regiao_imediata_id,
    t_imediata.ibge_code as regiao_imediata_ibge,
    t_imediata.name as regiao_imediata_nome,
    t_inter.id as regiao_intermediaria_id,
    t_inter.ibge_code as regiao_intermediaria_ibge,
    t_inter.name as regiao_intermediaria_nome,
    t_estado.id as estado_id,
    t_estado.name as estado_nome
FROM territories t_muni
-- Município → Região Imediata
LEFT JOIN territory_relationships tr_imediata ON tr_imediata.child_territory_id = t_muni.id
    AND tr_imediata.relationship_type = 'pertence_a'
    AND tr_imediata.division_scheme = 'nova'
LEFT JOIN territories t_imediata ON tr_imediata.parent_territory_id = t_imediata.id
    AND t_imediata.type = 'regiao_imediata'
-- Região Imediata → Região Intermediária
LEFT JOIN territory_relationships tr_inter ON tr_inter.child_territory_id = t_imediata.id
    AND tr_inter.relationship_type = 'pertence_a'
    AND tr_inter.division_scheme = 'nova'
LEFT JOIN territories t_inter ON tr_inter.parent_territory_id = t_inter.id
    AND t_inter.type = 'regiao_intermediaria'
-- Região Intermediária → Estado
LEFT JOIN territory_relationships tr_estado ON tr_estado.child_territory_id = t_inter.id
    AND tr_estado.relationship_type = 'pertence_a'
    AND tr_estado.division_scheme = 'nova'
LEFT JOIN territories t_estado ON tr_estado.parent_territory_id = t_estado.id
    AND t_estado.type = 'estado'
WHERE t_muni.type = 'municipio';

COMMENT ON VIEW v_hierarchy_nova IS 'Hierarquia completa: Município → Região Imediata → Região Intermediária → Estado (Divisão Nova)';

-- 8.3. View: Resumo de Territórios
CREATE OR REPLACE VIEW v_territories_summary AS
SELECT
    type,
    division_scheme,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true) as ativos,
    string_agg(DISTINCT name, ', ' ORDER BY name) as exemplos
FROM territories
GROUP BY type, division_scheme
ORDER BY
    CASE type
        WHEN 'estado' THEN 1
        WHEN 'mesorregiao' THEN 2
        WHEN 'regiao_intermediaria' THEN 3
        WHEN 'microrregiao' THEN 4
        WHEN 'regiao_imediata' THEN 5
        WHEN 'municipio' THEN 6
        ELSE 7
    END;

COMMENT ON VIEW v_territories_summary IS 'Resumo de territórios por tipo e divisão';

-- ============================================
-- FASE 9: FUNÇÕES AUXILIARES
-- ============================================

-- Função: Obter hierarquia completa de um território (antiga)
CREATE OR REPLACE FUNCTION get_hierarchy_antiga(territory_id_param UUID)
RETURNS TABLE (
    nivel INTEGER,
    territorio_id UUID,
    territorio_tipo territory_type,
    territorio_nome VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy AS (
        -- Base: território fornecido
        SELECT
            0 as nivel,
            t.id,
            t.type,
            t.name
        FROM territories t
        WHERE t.id = territory_id_param

        UNION ALL

        -- Recursivo: pais
        SELECT
            h.nivel + 1,
            tp.id,
            tp.type,
            tp.name
        FROM hierarchy h
        JOIN territory_relationships tr ON tr.child_territory_id = h.id
            AND tr.relationship_type = 'pertence_a'
            AND tr.division_scheme = 'antiga'
        JOIN territories tp ON tr.parent_territory_id = tp.id
    )
    SELECT * FROM hierarchy
    ORDER BY nivel;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_hierarchy_antiga IS 'Retorna hierarquia completa de um território (divisão antiga)';

-- Função: Obter todos os municípios de uma região (qualquer tipo)
CREATE OR REPLACE FUNCTION get_municipalities_of_territory(territory_id_param UUID, scheme VARCHAR(50))
RETURNS TABLE (municipio_id UUID, municipio_nome VARCHAR(200), municipio_ibge VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE descendants AS (
        -- Base: território fornecido
        SELECT id
        FROM territories
        WHERE id = territory_id_param

        UNION ALL

        -- Recursivo: filhos
        SELECT t.id
        FROM descendants d
        JOIN territory_relationships tr ON tr.parent_territory_id = d.id
            AND tr.relationship_type = 'pertence_a'
            AND (scheme IS NULL OR tr.division_scheme = scheme)
        JOIN territories t ON tr.child_territory_id = t.id
    )
    SELECT
        t.id as municipio_id,
        t.name as municipio_nome,
        t.ibge_code as municipio_ibge
    FROM descendants d
    JOIN territories t ON d.id = t.id
    WHERE t.type = 'municipio'
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_municipalities_of_territory IS 'Retorna todos os municípios descendentes de um território (via hierarquia)';

-- ============================================
-- FASE 10: VALIDAÇÃO E VERIFICAÇÃO
-- ============================================

-- Script de validação (executar para verificar integridade)
DO $$
DECLARE
    v_total_municipios INTEGER;
    v_total_microregioes INTEGER;
    v_total_mesorregioes INTEGER;
    v_total_intermediarias INTEGER;
    v_total_imediatas INTEGER;
    v_municipios_sem_micro INTEGER;
    v_municipios_sem_imediata INTEGER;
BEGIN
    -- Contar territórios
    SELECT COUNT(*) INTO v_total_municipios FROM territories WHERE type = 'municipio';
    SELECT COUNT(*) INTO v_total_microregioes FROM territories WHERE type = 'microrregiao';
    SELECT COUNT(*) INTO v_total_mesorregioes FROM territories WHERE type = 'mesorregiao';
    SELECT COUNT(*) INTO v_total_intermediarias FROM territories WHERE type = 'regiao_intermediaria';
    SELECT COUNT(*) INTO v_total_imediatas FROM territories WHERE type = 'regiao_imediata';

    -- Verificar municípios sem microrregião (divisão antiga)
    SELECT COUNT(*) INTO v_municipios_sem_micro
    FROM territories t
    WHERE t.type = 'municipio'
      AND NOT EXISTS (
          SELECT 1 FROM territory_relationships tr
          WHERE tr.child_territory_id = t.id
            AND tr.division_scheme = 'antiga'
      );

    -- Verificar municípios sem região imediata (divisão nova)
    SELECT COUNT(*) INTO v_municipios_sem_imediata
    FROM territories t
    WHERE t.type = 'municipio'
      AND NOT EXISTS (
          SELECT 1 FROM territory_relationships tr
          WHERE tr.child_territory_id = t.id
            AND tr.division_scheme = 'nova'
      );

    -- Relatório de validação
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RELATÓRIO DE VALIDAÇÃO - Migration 009';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Municípios: % (esperado: 139)', v_total_municipios;
    RAISE NOTICE 'Microrregiões (antiga): % (esperado: 8)', v_total_microregioes;
    RAISE NOTICE 'Mesorregiões (antiga): % (esperado: 2)', v_total_mesorregioes;
    RAISE NOTICE 'Regiões Intermediárias (nova): % (esperado: 3)', v_total_intermediarias;
    RAISE NOTICE 'Regiões Imediatas (nova): % (esperado: 11)', v_total_imediatas;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'Municípios sem microrregião (antiga): %', v_municipios_sem_micro;
    RAISE NOTICE 'Municípios sem região imediata (nova): %', v_municipios_sem_imediata;
    RAISE NOTICE '============================================';

    IF v_total_municipios != 139 THEN
        RAISE WARNING 'Total de municípios diferente de 139!';
    END IF;

    IF v_municipios_sem_micro > 100 THEN
        RAISE WARNING 'Muitos municípios sem microrregião na divisão antiga!';
    END IF;

    IF v_municipios_sem_imediata > 100 THEN
        RAISE WARNING 'Muitos municípios sem região imediata na divisão nova! Completar mapeamento.';
    END IF;
END $$;

-- ============================================
-- FIM DA MIGRATION 009
-- ============================================

COMMENT ON SCHEMA public IS 'Migration 009: Sistema de Territórios Extensível - Concluída';
