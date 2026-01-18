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
-- 6. Campo `aggregation_method` em indicator_values
--
-- Referência: ADR-005
-- Data: 2026-01-16
-- Versão: FINAL (com mapeamento completo de 139 municípios)
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

-- ============================================
-- FASE 4: POPULAR NOVA DIVISÃO REGIONAL (Pós-2017)
-- ============================================

-- 4.1. Regiões Geográficas Intermediárias (3)
INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata) VALUES
('regiao_intermediaria', '1701', 'Palmas', 'nova', true, '{"polarizacao": "Palmas", "municipios_aproximados": 60}'::jsonb),
('regiao_intermediaria', '1702', 'Araguaína', 'nova', true, '{"polarizacao": "Araguaína", "municipios_aproximados": 45}'::jsonb),
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
-- Região Intermediária de Palmas
('regiao_imediata', '170001', 'Palmas', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Palmas"}'::jsonb),
('regiao_imediata', '170002', 'Porto Nacional', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Porto Nacional"}'::jsonb),
('regiao_imediata', '170003', 'Paraíso do Tocantins', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Paraíso do Tocantins"}'::jsonb),
('regiao_imediata', '170004', 'Miracema do Tocantins', 'nova', true, '{"regiao_intermediaria": "1701", "centro": "Miracema do Tocantins"}'::jsonb),

-- Região Intermediária de Araguaína
('regiao_imediata', '170005', 'Araguaína', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Araguaína"}'::jsonb),
('regiao_imediata', '170006', 'Guaraí', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Guaraí"}'::jsonb),
('regiao_imediata', '170007', 'Colinas do Tocantins', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Colinas do Tocantins"}'::jsonb),
('regiao_imediata', '170008', 'Tocantinópolis', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Tocantinópolis"}'::jsonb),
('regiao_imediata', '170009', 'Araguatins', 'nova', true, '{"regiao_intermediaria": "1702", "centro": "Araguatins"}'::jsonb),

-- Região Intermediária de Gurupi
('regiao_imediata', '170010', 'Gurupi', 'nova', true, '{"regiao_intermediaria": "1703", "centro": "Gurupi"}'::jsonb),
('regiao_imediata', '170011', 'Dianópolis', 'nova', true, '{"regiao_intermediaria": "1703", "centro": "Dianópolis"}'::jsonb)
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
-- FASE 5: MAPEAMENTO COMPLETO DE MUNICÍPIOS
-- ============================================
-- CORREÇÃO 1: Popular todos os 139 municípios com seus relacionamentos
-- Fonte: tocantins_municipios_completo.csv

-- 5.1. Relacionamentos: Municípios → Microrregiões (Divisão Antiga) - COMPLETO
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_micro.id as parent_id,
    t_muni.id as child_id,
    'pertence_a',
    'antiga'
FROM (VALUES
    ('1700251', '17003'), ('1700301', '17001'), ('1700350', '17005'), ('1700400', '17008'),
    ('1700707', '17005'), ('1701002', '17001'), ('1701051', '17001'), ('1701101', '17006'),
    ('1701309', '17002'), ('1701903', '17003'), ('1702000', '17004'), ('1702109', '17002'),
    ('1702158', '17002'), ('1702208', '17001'), ('1702307', '17002'), ('1702406', '17008'),
    ('1702554', '17001'), ('1702703', '17008'), ('1702901', '17001'), ('1703008', '17002'),
    ('1703057', '17002'), ('1703073', '17007'), ('1703107', '17003'), ('1703206', '17003'),
    ('1703305', '17006'), ('1703602', '17003'), ('1703701', '17005'), ('1703800', '17001'),
    ('1703826', '17001'), ('1703842', '17007'), ('1703867', '17005'), ('1703883', '17002'),
    ('1703891', '17001'), ('1703909', '17003'), ('1704105', '17007'), ('1704600', '17004'),
    ('1705102', '17008'), ('1705508', '17002'), ('1705557', '17008'), ('1705607', '17008'),
    ('1706001', '17003'), ('1706100', '17004'), ('1706258', '17005'), ('1706506', '17001'),
    ('1707009', '17008'), ('1707108', '17003'), ('1707207', '17003'), ('1707306', '17004'),
    ('1707405', '17001'), ('1707553', '17004'), ('1707652', '17005'), ('1707702', '17002'),
    ('1708205', '17004'), ('1708254', '17003'), ('1708304', '17003'), ('1709005', '17007'),
    ('1709302', '17003'), ('1709500', '17005'), ('1709807', '17006'), ('1710508', '17007'),
    ('1710706', '17001'), ('1710904', '17007'), ('1711100', '17003'), ('1711506', '17005'),
    ('1711803', '17003'), ('1711902', '17004'), ('1711951', '17007'), ('1712009', '17006'),
    ('1712157', '17008'), ('1712405', '17007'), ('1712454', '17001'), ('1712504', '17003'),
    ('1712702', '17007'), ('1712801', '17001'), ('1713205', '17003'), ('1713304', '17003'),
    ('1713601', '17006'), ('1713700', '17003'), ('1713809', '17001'), ('1713957', '17002'),
    ('1714203', '17008'), ('1714302', '17001'), ('1714880', '17002'), ('1715002', '17004'),
    ('1715101', '17007'), ('1715150', '17008'), ('1715259', '17008'), ('1715507', '17004'),
    ('1715705', '17002'), ('1715754', '17005'), ('1716109', '17004'), ('1716208', '17008'),
    ('1716307', '17002'), ('1716505', '17006'), ('1716604', '17005'), ('1716653', '17003'),
    ('1716703', '17003'), ('1717008', '17008'), ('1717206', '17002'), ('1717503', '17004'),
    ('1717800', '17008'), ('1717909', '17007'), ('1718006', '17008'), ('1718204', '17006'),
    ('1718303', '17001'), ('1718402', '17003'), ('1718451', '17004'), ('1718501', '17007'),
    ('1718550', '17001'), ('1718659', '17008'), ('1718709', '17003'), ('1718758', '17007'),
    ('1718808', '17001'), ('1718840', '17004'), ('1718865', '17002'), ('1718881', '17006'),
    ('1718899', '17005'), ('1718907', '17008'), ('1719004', '17007'), ('1720002', '17001'),
    ('1720101', '17001'), ('1720150', '17007'), ('1720200', '17001'), ('1720259', '17005'),
    ('1720309', '17001'), ('1720499', '17008'), ('1720655', '17006'), ('1720804', '17001'),
    ('1720853', '17005'), ('1720903', '17008'), ('1720937', '17008'), ('1720978', '17005'),
    ('1721000', '17006'), ('1721109', '17006'), ('1721208', '17001'), ('1721257', '17003'),
    ('1721307', '17003'), ('1722081', '17002'), ('1722107', '17002')
) AS mapeamento(municipio_ibge, microrregiao_ibge)
JOIN territories t_muni ON t_muni.ibge_code = mapeamento.municipio_ibge AND t_muni.type = 'municipio'
JOIN territories t_micro ON t_micro.ibge_code = mapeamento.microrregiao_ibge AND t_micro.type = 'microrregiao' AND t_micro.division_scheme = 'antiga'
ON CONFLICT DO NOTHING;

-- 5.2. Relacionamentos: Municípios → Regiões Imediatas (Divisão Nova) - COMPLETO
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_imediata.id as parent_id,
    t_muni.id as child_id,
    'pertence_a',
    'nova'
FROM (VALUES
    ('1700251', '170003'), ('1700301', '170008'), ('1700350', '170010'), ('1700400', '170011'),
    ('1700707', '170010'), ('1701002', '170005'), ('1701051', '170005'), ('1701101', '170001'),
    ('1701309', '170005'), ('1701903', '170003'), ('1702000', '170010'), ('1702109', '170005'),
    ('1702158', '170005'), ('1702208', '170009'), ('1702307', '170005'), ('1702406', '170011'),
    ('1702554', '170009'), ('1702703', '170011'), ('1702901', '170009'), ('1703008', '170005'),
    ('1703057', '170007'), ('1703073', '170005'), ('1703107', '170003'), ('1703206', '170007'),
    ('1703305', '170006'), ('1703602', '170007'), ('1703701', '170002'), ('1703800', '170009'),
    ('1703826', '170008'), ('1703842', '170005'), ('1703867', '170010'), ('1703883', '170005'),
    ('1703891', '170009'), ('1703909', '170003'), ('1704105', '170006'), ('1704600', '170003'),
    ('1705102', '170002'), ('1705508', '170007'), ('1705557', '170011'), ('1705607', '170011'),
    ('1706001', '170006'), ('1706100', '170003'), ('1706258', '170010'), ('1706506', '170005'),
    ('1707009', '170011'), ('1707108', '170003'), ('1707207', '170004'), ('1707306', '170010'),
    ('1707405', '170009'), ('1707553', '170002'), ('1707652', '170010'), ('1707702', '170005'),
    ('1708205', '170010'), ('1708254', '170006'), ('1708304', '170006'), ('1709005', '170005'),
    ('1709302', '170006'), ('1709500', '170010'), ('1709807', '170002'), ('1710508', '170007'),
    ('1710706', '170009'), ('1710904', '170007'), ('1711100', '170006'), ('1711506', '170010'),
    ('1711803', '170007'), ('1711902', '170003'), ('1711951', '170001'), ('1712009', '170001'),
    ('1712157', '170011'), ('1712405', '170001'), ('1712454', '170008'), ('1712504', '170003'),
    ('1712702', '170001'), ('1712801', '170008'), ('1713205', '170004'), ('1713304', '170004'),
    ('1713601', '170002'), ('1713700', '170003'), ('1713809', '170008'), ('1713957', '170005'),
    ('1714203', '170002'), ('1714302', '170008'), ('1714880', '170005'), ('1715002', '170003'),
    ('1715101', '170001'), ('1715150', '170011'), ('1715259', '170011'), ('1715507', '170002'),
    ('1715705', '170007'), ('1715754', '170010'), ('1716109', '170003'), ('1716208', '170010'),
    ('1716307', '170005'), ('1716505', '170006'), ('1716604', '170010'), ('1716653', '170006'),
    ('1716703', '170006'), ('1717008', '170002'), ('1717206', '170005'), ('1717503', '170003'),
    ('1717800', '170011'), ('1717909', '170002'), ('1718006', '170011'), ('1718204', '170002'),
    ('1718303', '170009'), ('1718402', '170006'), ('1718451', '170003'), ('1718501', '170006'),
    ('1718550', '170005'), ('1718659', '170011'), ('1718709', '170004'), ('1718758', '170001'),
    ('1718808', '170009'), ('1718840', '170010'), ('1718865', '170005'), ('1718881', '170006'),
    ('1718899', '170002'), ('1718907', '170002'), ('1719004', '170001'), ('1720002', '170008'),
    ('1720101', '170009'), ('1720150', '170001'), ('1720200', '170009'), ('1720259', '170010'),
    ('1720309', '170009'), ('1720499', '170010'), ('1720655', '170002'), ('1720804', '170009'),
    ('1720853', '170010'), ('1720903', '170011'), ('1720937', '170011'), ('1720978', '170010'),
    ('1721000', '170001'), ('1721109', '170004'), ('1721208', '170008'), ('1721257', '170006'),
    ('1721307', '170007'), ('1722081', '170005'), ('1722107', '170005')
) AS mapeamento(municipio_ibge, regiao_imediata_ibge)
JOIN territories t_muni ON t_muni.ibge_code = mapeamento.municipio_ibge AND t_muni.type = 'municipio'
JOIN territories t_imediata ON t_imediata.ibge_code = mapeamento.regiao_imediata_ibge AND t_imediata.type = 'regiao_imediata' AND t_imediata.division_scheme = 'nova'
ON CONFLICT DO NOTHING;

-- ============================================
-- FASE 6: MODIFICAÇÃO DE INDICATOR_VALUES
-- ============================================
-- CORREÇÃO 2: Adicionar campo aggregation_method

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

-- 6.3. Adicionar coluna is_aggregated
ALTER TABLE indicator_values
ADD COLUMN IF NOT EXISTS is_aggregated BOOLEAN DEFAULT false;

-- 6.4. Adicionar coluna aggregation_method com CHECK constraint
ALTER TABLE indicator_values
ADD COLUMN IF NOT EXISTS aggregation_method TEXT
CHECK (aggregation_method IN ('raw', 'sum', 'avg', 'weighted_avg', 'median', 'min', 'max'));

-- 6.5. Popular aggregation_method com valor padrão para dados existentes
UPDATE indicator_values
SET aggregation_method = 'raw'
WHERE aggregation_method IS NULL;

-- 6.6. Tornar aggregation_method NOT NULL
ALTER TABLE indicator_values
ALTER COLUMN aggregation_method SET NOT NULL;

-- 6.7. Definir valor padrão para novos registros
ALTER TABLE indicator_values
ALTER COLUMN aggregation_method SET DEFAULT 'raw';

COMMENT ON COLUMN indicator_values.territory_id IS 'Referência genérica a qualquer território (município, região, estado, etc.)';
COMMENT ON COLUMN indicator_values.aggregation_method IS 'Método de agregação: raw (dado bruto), sum, avg, weighted_avg, median, min, max';
COMMENT ON COLUMN indicator_values.is_aggregated IS 'Se true, valor foi agregado de territórios menores';

-- 6.8. Criar índice para territory_id
CREATE INDEX IF NOT EXISTS idx_indicator_values_territory ON indicator_values(territory_id);

-- 6.9. Índices otimizados para séries temporais
CREATE INDEX IF NOT EXISTS idx_indicator_values_timeseries
ON indicator_values (indicator_id, territory_id, year DESC, month DESC);

-- Índice parcial para dados recentes (mais consultados)
-- Nota: Usando valor fixo pois CURRENT_DATE não é IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_indicator_values_recent
ON indicator_values (indicator_id, territory_id, year DESC, month DESC)
WHERE year >= 2015;

-- 6.10. Adicionar constraint de unicidade (incluir territory_id)
-- NOTA: Manter municipality_id temporariamente para compatibilidade
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
    v_total_relationships_antiga INTEGER;
    v_total_relationships_nova INTEGER;
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

    -- Contar relationships
    SELECT COUNT(*) INTO v_total_relationships_antiga
    FROM territory_relationships WHERE division_scheme = 'antiga';

    SELECT COUNT(*) INTO v_total_relationships_nova
    FROM territory_relationships WHERE division_scheme = 'nova';

    -- Relatório de validação
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RELATÓRIO DE VALIDAÇÃO - Migration 009';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'TERRITÓRIOS:';
    RAISE NOTICE '  Municípios: % (esperado: 139)', v_total_municipios;
    RAISE NOTICE '  Microrregiões (antiga): % (esperado: 8)', v_total_microregioes;
    RAISE NOTICE '  Mesorregiões (antiga): % (esperado: 2)', v_total_mesorregioes;
    RAISE NOTICE '  Regiões Intermediárias (nova): % (esperado: 3)', v_total_intermediarias;
    RAISE NOTICE '  Regiões Imediatas (nova): % (esperado: 11)', v_total_imediatas;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'RELACIONAMENTOS:';
    RAISE NOTICE '  Divisão Antiga: % (esperado: ~149)', v_total_relationships_antiga;
    RAISE NOTICE '  Divisão Nova: % (esperado: ~150)', v_total_relationships_nova;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'INTEGRIDADE:';
    RAISE NOTICE '  Municípios sem microrregião (antiga): % (esperado: 0)', v_municipios_sem_micro;
    RAISE NOTICE '  Municípios sem região imediata (nova): % (esperado: 0)', v_municipios_sem_imediata;
    RAISE NOTICE '============================================';

    -- Verificações de sucesso
    IF v_total_municipios != 139 THEN
        RAISE WARNING '❌ Total de municípios diferente de 139!';
    END IF;

    IF v_total_microregioes != 8 THEN
        RAISE WARNING '❌ Total de microrregiões diferente de 8!';
    END IF;

    IF v_total_mesorregioes != 2 THEN
        RAISE WARNING '❌ Total de mesorregiões diferente de 2!';
    END IF;

    IF v_total_intermediarias != 3 THEN
        RAISE WARNING '❌ Total de regiões intermediárias diferente de 3!';
    END IF;

    IF v_total_imediatas != 11 THEN
        RAISE WARNING '❌ Total de regiões imediatas diferente de 11!';
    END IF;

    IF v_municipios_sem_micro > 0 THEN
        RAISE WARNING '❌ Há % municípios sem microrregião na divisão antiga!', v_municipios_sem_micro;
    END IF;

    IF v_municipios_sem_imediata > 0 THEN
        RAISE WARNING '❌ Há % municípios sem região imediata na divisão nova!', v_municipios_sem_imediata;
    END IF;

    -- Mensagem final
    IF v_total_municipios = 139 AND v_municipios_sem_micro = 0 AND v_municipios_sem_imediata = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ MIGRATION 009 CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE 'Próximos passos:';
        RAISE NOTICE '  1. Verificar views: SELECT * FROM v_hierarchy_antiga LIMIT 10;';
        RAISE NOTICE '  2. Verificar views: SELECT * FROM v_hierarchy_nova LIMIT 10;';
        RAISE NOTICE '  3. Testar queries de exemplo (ver migration-009-impact-analysis.md)';
        RAISE NOTICE '  4. Atualizar workflow IBGE (territory_id)';
    END IF;
END $$;

-- ============================================
-- FIM DA MIGRATION 009
-- ============================================

COMMENT ON SCHEMA public IS 'Migration 009: Sistema de Territórios Extensível - VERSÃO FINAL - Concluída';
