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
