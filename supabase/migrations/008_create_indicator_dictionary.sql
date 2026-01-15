-- ============================================
-- Migration 008: Dicionário de Indicadores
-- Sistema de Coleta Orientado a Metadados
-- Tocantins Integrado - MVP v1.0
-- ============================================
--
-- Este script cria o Dicionário de Indicadores, que centraliza
-- metadados de todos os indicadores coletados, incluindo fontes,
-- APIs, periodicidade e regras de atualização.
--
-- Essa estrutura permite que os workflows de coleta sejam
-- orientados por metadados, facilitando manutenção e escalabilidade.
-- ============================================

-- Tabela: Dicionário de Indicadores
CREATE TABLE IF NOT EXISTS indicator_dictionary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,

    -- Classificação
    dimension dimension_type NOT NULL,
    category VARCHAR(200),

    -- Fonte de dados
    source_name VARCHAR(200) NOT NULL,
    source_url TEXT,
    api_endpoint TEXT,
    api_params JSONB DEFAULT '{}'::jsonb,

    -- Configuração de coleta
    periodicity VARCHAR(50) NOT NULL DEFAULT 'annual',
    collection_method VARCHAR(50) DEFAULT 'api',

    -- Status de coleta
    last_ref_date DATE,
    last_update_date TIMESTAMPTZ,
    next_collection_date DATE,

    -- Controle
    is_active BOOLEAN DEFAULT true,
    is_manual BOOLEAN DEFAULT false,

    -- Observações
    notes TEXT,
    collection_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_indicator_dictionary_dimension ON indicator_dictionary(dimension);
CREATE INDEX IF NOT EXISTS idx_indicator_dictionary_source ON indicator_dictionary(source_name);
CREATE INDEX IF NOT EXISTS idx_indicator_dictionary_active ON indicator_dictionary(is_active);
CREATE INDEX IF NOT EXISTS idx_indicator_dictionary_periodicity ON indicator_dictionary(periodicity);
CREATE INDEX IF NOT EXISTS idx_indicator_dictionary_next_collection ON indicator_dictionary(next_collection_date)
    WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_indicator_dictionary_updated_at
    BEFORE UPDATE ON indicator_dictionary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE indicator_dictionary IS 'Dicionário centralizado de metadados dos indicadores para coleta orientada a dados';
COMMENT ON COLUMN indicator_dictionary.code IS 'Código único do indicador (ex: ECON_PIB_TOTAL)';
COMMENT ON COLUMN indicator_dictionary.api_endpoint IS 'URL da API para coleta automática';
COMMENT ON COLUMN indicator_dictionary.api_params IS 'Parâmetros JSON da API (tabela, variáveis, filtros)';
COMMENT ON COLUMN indicator_dictionary.periodicity IS 'Frequência de atualização: annual, monthly, quarterly, census';
COMMENT ON COLUMN indicator_dictionary.collection_method IS 'Método de coleta: api, scraping, manual, ftp';
COMMENT ON COLUMN indicator_dictionary.is_manual IS 'Se true, requer coleta manual (sem API disponível)';

-- ============================================
-- POPULAR INDICADORES - DIMENSÃO ECONÔMICA
-- ============================================

INSERT INTO indicator_dictionary (code, name, description, dimension, category, source_name, source_url, api_endpoint, api_params, periodicity, collection_method, is_active) VALUES

-- PIB e Valor Adicionado
('ECON_PIB_TOTAL', 'PIB Municipal Total', 'Produto Interno Bruto do município a preços correntes', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/allxp/p/last/d/v37%202', '{"table": "5938", "variable": "allxp", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

('ECON_PIB_PER_CAPITA', 'PIB per Capita', 'PIB per capita do município (R$ por habitante)', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/37/p/last', '{"table": "5938", "variable": "37", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

('ECON_VA_AGRO', 'VA Agropecuária', 'Valor Adicionado Bruto da Agropecuária', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/513/p/last', '{"table": "5938", "variable": "513", "sector": "agro", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

('ECON_VA_INDUSTRIA', 'VA Indústria', 'Valor Adicionado Bruto da Indústria', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/514/p/last', '{"table": "5938", "variable": "514", "sector": "industry", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

('ECON_VA_SERVICOS', 'VA Serviços', 'Valor Adicionado Bruto dos Serviços', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/515/p/last', '{"table": "5938", "variable": "515", "sector": "services", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

('ECON_VA_ADM_PUB', 'VA Administração Pública', 'Valor Adicionado Bruto da Administração Pública', 'ECON', 'PIB e Renda', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/5938', 'https://apisidra.ibge.gov.br/values/t/5938/n6/{ibge_code}/v/516/p/last', '{"table": "5938", "variable": "516", "sector": "public_admin", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true),

-- Emprego e Renda
('ECON_EMPREGOS_FORMAIS', 'Empregos Formais', 'Número de empregos formais no município', 'ECON', 'Emprego e Renda', 'RAIS/CAGED', 'https://bi.mte.gov.br/bgcaged/', NULL, '{"source": "RAIS"}'::jsonb, 'annual', 'manual', true),

('ECON_SALARIO_MEDIO', 'Salário Médio', 'Salário médio mensal dos trabalhadores formais', 'ECON', 'Emprego e Renda', 'RAIS', 'https://bi.mte.gov.br/bgcaged/', NULL, '{"source": "RAIS"}'::jsonb, 'annual', 'manual', true),

('ECON_RENDA_MEDIA', 'Renda Média Domiciliar', 'Renda média domiciliar per capita', 'ECON', 'Emprego e Renda', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('ECON_TX_OCUPACAO', 'Taxa de Ocupação', 'Percentual da população ocupada', 'ECON', 'Emprego e Renda', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

-- Finanças Públicas
('ECON_RECEITA_TOTAL', 'Receita Total', 'Receita orçamentária total do município', 'ECON', 'Finanças Públicas', 'SICONFI', 'https://apidatalake.tesouro.gov.br/', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra', '{"source": "FINBRA", "account": "receita_orcamentaria"}'::jsonb, 'annual', 'api', true),

('ECON_RECEITA_PROPRIA', 'Receita Tributária Própria', 'Receita de tributos municipais (IPTU, ISS, etc)', 'ECON', 'Finanças Públicas', 'SICONFI', 'https://apidatalake.tesouro.gov.br/', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra', '{"source": "FINBRA", "account": "receita_tributaria"}'::jsonb, 'annual', 'api', true),

('ECON_DESPESA_TOTAL', 'Despesa Total', 'Despesa orçamentária total do município', 'ECON', 'Finanças Públicas', 'SICONFI', 'https://apidatalake.tesouro.gov.br/', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/finbra', '{"source": "FINBRA", "account": "despesa_orcamentaria"}'::jsonb, 'annual', 'api', true),

('ECON_FPM', 'FPM - Fundo de Participação dos Municípios', 'Transferências do FPM recebidas pelo município', 'ECON', 'Finanças Públicas', 'STN', 'https://www.tesourotransparente.gov.br/', 'https://apidatalake.tesouro.gov.br/ords/siconfi/rest/transferencias', '{"transfer_type": "FPM"}'::jsonb, 'annual', 'api', true),

('ECON_DEPENDENCIA_TRANSF', 'Dependência de Transferências', 'Percentual da receita proveniente de transferências', 'ECON', 'Finanças Públicas', 'Calculado', NULL, NULL, '{"formula": "(transferencias / receita_total) * 100"}'::jsonb, 'annual', 'calculated', true);

-- ============================================
-- POPULAR INDICADORES - DIMENSÃO SOCIAL
-- ============================================

INSERT INTO indicator_dictionary (code, name, description, dimension, category, source_name, source_url, api_endpoint, api_params, periodicity, collection_method, is_active) VALUES

-- Educação
('SOCIAL_IDEB_AI', 'IDEB Anos Iniciais', 'Índice de Desenvolvimento da Educação Básica - Anos Iniciais do Ensino Fundamental', 'SOCIAL', 'Educação', 'INEP', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb', 'https://inep.gov.br/ideb/api', '{"level": "anos_iniciais"}'::jsonb, 'annual', 'api', true),

('SOCIAL_IDEB_AF', 'IDEB Anos Finais', 'Índice de Desenvolvimento da Educação Básica - Anos Finais do Ensino Fundamental', 'SOCIAL', 'Educação', 'INEP', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb', 'https://inep.gov.br/ideb/api', '{"level": "anos_finais"}'::jsonb, 'annual', 'api', true),

('SOCIAL_TX_ANALFABETISMO', 'Taxa de Analfabetismo', 'Percentual da população de 15 anos ou mais analfabeta', 'SOCIAL', 'Educação', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('SOCIAL_TX_ABANDONO_EF', 'Taxa de Abandono Escolar EF', 'Percentual de alunos que abandonam o Ensino Fundamental', 'SOCIAL', 'Educação', 'INEP', 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais', NULL, '{"level": "fundamental"}'::jsonb, 'annual', 'manual', true),

('SOCIAL_MATRICULAS_EF', 'Matrículas Ensino Fundamental', 'Número total de matrículas no Ensino Fundamental', 'SOCIAL', 'Educação', 'INEP', 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar', NULL, '{"level": "fundamental"}'::jsonb, 'annual', 'manual', true),

-- Saúde
('SOCIAL_TX_MORTALIDADE_INF', 'Taxa de Mortalidade Infantil', 'Número de óbitos infantis por 1.000 nascidos vivos', 'SOCIAL', 'Saúde', 'DataSUS', 'http://tabnet.datasus.gov.br/', 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc', '{"indicator": "mortalidade_infantil"}'::jsonb, 'annual', 'scraping', true),

('SOCIAL_COBERTURA_ESF', 'Cobertura Estratégia Saúde da Família', 'Percentual da população coberta pela ESF', 'SOCIAL', 'Saúde', 'e-Gestor AB', 'https://egestorab.saude.gov.br/', 'https://egestorab.saude.gov.br/api', '{"indicator": "cobertura_esf"}'::jsonb, 'monthly', 'api', true),

('SOCIAL_LEITOS_SUS', 'Leitos SUS por 1.000 hab', 'Número de leitos SUS por 1.000 habitantes', 'SOCIAL', 'Saúde', 'DataSUS', 'http://cnes.datasus.gov.br/', NULL, '{}'::jsonb, 'annual', 'manual', true),

('SOCIAL_MEDICOS_SUS', 'Médicos SUS por 1.000 hab', 'Número de médicos SUS por 1.000 habitantes', 'SOCIAL', 'Saúde', 'DataSUS', 'http://cnes.datasus.gov.br/', NULL, '{}'::jsonb, 'annual', 'manual', true),

-- Assistência Social
('SOCIAL_FAMILIAS_BF', 'Famílias no Bolsa Família', 'Número de famílias beneficiárias do Bolsa Família', 'SOCIAL', 'Assistência Social', 'MDS', 'https://aplicacoes.mds.gov.br/sagi/', NULL, '{"program": "bolsa_familia"}'::jsonb, 'monthly', 'manual', true),

('SOCIAL_CADUNICO', 'Famílias no CadÚnico', 'Número de famílias cadastradas no Cadastro Único', 'SOCIAL', 'Assistência Social', 'MDS', 'https://aplicacoes.mds.gov.br/sagi/', NULL, '{"program": "cadunico"}'::jsonb, 'monthly', 'manual', true),

('SOCIAL_BPC', 'Beneficiários BPC', 'Número de beneficiários do Benefício de Prestação Continuada', 'SOCIAL', 'Assistência Social', 'MDS', 'https://aplicacoes.mds.gov.br/sagi/', NULL, '{"program": "bpc"}'::jsonb, 'monthly', 'manual', true),

-- IDHM (Censo)
('SOCIAL_IDHM', 'IDHM - Índice de Desenvolvimento Humano Municipal', 'Índice composto de educação, longevidade e renda', 'SOCIAL', 'Desenvolvimento Humano', 'Atlas Brasil', 'http://www.atlasbrasil.org.br/', NULL, '{"index": "idhm"}'::jsonb, 'census', 'manual', true),

('SOCIAL_IDHM_E', 'IDHM Educação', 'Componente Educação do IDHM', 'SOCIAL', 'Desenvolvimento Humano', 'Atlas Brasil', 'http://www.atlasbrasil.org.br/', NULL, '{"index": "idhm_e"}'::jsonb, 'census', 'manual', true),

('SOCIAL_IDHM_L', 'IDHM Longevidade', 'Componente Longevidade do IDHM', 'SOCIAL', 'Desenvolvimento Humano', 'Atlas Brasil', 'http://www.atlasbrasil.org.br/', NULL, '{"index": "idhm_l"}'::jsonb, 'census', 'manual', true),

('SOCIAL_IDHM_R', 'IDHM Renda', 'Componente Renda do IDHM', 'SOCIAL', 'Desenvolvimento Humano', 'Atlas Brasil', 'http://www.atlasbrasil.org.br/', NULL, '{"index": "idhm_r"}'::jsonb, 'census', 'manual', true),

-- População (já existe como SOCIAL_POPULACAO, mas vamos adicionar referência)
('SOCIAL_POPULACAO', 'População Total', 'População residente total do município', 'SOCIAL', 'Demografia', 'IBGE Sidra', 'https://sidra.ibge.gov.br/tabela/6579', 'https://apisidra.ibge.gov.br/values/t/6579/n6/{ibge_code}/v/allxp/p/last', '{"table": "6579", "variable": "allxp", "territorial_level": "n6"}'::jsonb, 'annual', 'api', true)

ON CONFLICT (code) DO NOTHING;

-- ============================================
-- POPULAR INDICADORES - DIMENSÃO TERRITORIAL
-- ============================================

INSERT INTO indicator_dictionary (code, name, description, dimension, category, source_name, source_url, api_endpoint, api_params, periodicity, collection_method, is_active) VALUES

-- Saneamento Básico
('TERRA_AGUA_ENCANADA', 'Acesso a Água Encanada', 'Percentual de domicílios com acesso a água encanada', 'TERRA', 'Saneamento Básico', 'SNIS', 'http://www.snis.gov.br/', 'http://appsnis.mdr.gov.br/api', '{"indicator": "IN055"}'::jsonb, 'annual', 'api', true),

('TERRA_ESGOTO', 'Coleta de Esgoto', 'Percentual de domicílios com coleta de esgoto', 'TERRA', 'Saneamento Básico', 'SNIS', 'http://www.snis.gov.br/', 'http://appsnis.mdr.gov.br/api', '{"indicator": "IN056"}'::jsonb, 'annual', 'api', true),

('TERRA_COLETA_LIXO', 'Coleta de Lixo', 'Percentual de domicílios com coleta de lixo', 'TERRA', 'Saneamento Básico', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('TERRA_ATERRO', 'Destinação a Aterro Sanitário', 'Percentual de resíduos destinados a aterro sanitário', 'TERRA', 'Saneamento Básico', 'SNIS', 'http://www.snis.gov.br/', 'http://appsnis.mdr.gov.br/api', '{"indicator": "IN031"}'::jsonb, 'annual', 'api', true),

-- Infraestrutura Urbana
('TERRA_PAVIMENTACAO', 'Vias Pavimentadas', 'Percentual de vias urbanas pavimentadas', 'TERRA', 'Infraestrutura Urbana', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('TERRA_ILUMINACAO', 'Iluminação Pública', 'Percentual de vias com iluminação pública', 'TERRA', 'Infraestrutura Urbana', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('TERRA_DOMICILIOS', 'Total de Domicílios', 'Número total de domicílios no município', 'TERRA', 'Habitação', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

-- Conectividade
('TERRA_INTERNET', 'Acesso à Internet', 'Percentual de domicílios com acesso à internet', 'TERRA', 'Conectividade', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('TERRA_ENERGIA', 'Acesso à Energia Elétrica', 'Percentual de domicílios com energia elétrica', 'TERRA', 'Conectividade', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true),

('TERRA_DISTANCIA_CAPITAL', 'Distância de Palmas', 'Distância rodoviária até Palmas (km)', 'TERRA', 'Conectividade', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{"type": "fixed"}'::jsonb, 'fixed', 'manual', false),

('TERRA_FROTA', 'Frota de Veículos', 'Número de veículos registrados no município', 'TERRA', 'Conectividade', 'DENATRAN', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-denatran/estatisticas-frota-de-veiculos', NULL, '{}'::jsonb, 'monthly', 'manual', true),

-- Habitação
('TERRA_DEFICIT_HAB', 'Déficit Habitacional', 'Número de domicílios em déficit habitacional', 'TERRA', 'Habitação', 'FJP', 'https://www.fjp.mg.gov.br/', NULL, '{}'::jsonb, 'annual', 'manual', true),

('TERRA_DOM_PROPRIO', 'Domicílios Próprios', 'Percentual de domicílios próprios (quitados)', 'TERRA', 'Habitação', 'IBGE', 'https://www.ibge.gov.br/', NULL, '{}'::jsonb, 'census', 'manual', true)

ON CONFLICT (code) DO NOTHING;

-- ============================================
-- POPULAR INDICADORES - DIMENSÃO AMBIENTAL
-- ============================================

INSERT INTO indicator_dictionary (code, name, description, dimension, category, source_name, source_url, api_endpoint, api_params, periodicity, collection_method, is_active) VALUES

-- Cobertura Vegetal
('AMBIENT_COBERTURA_NATIVA', 'Cobertura de Vegetação Nativa', 'Percentual do território com vegetação nativa', 'AMBIENT', 'Cobertura Vegetal', 'MapBiomas', 'https://mapbiomas.org/', 'https://api.mapbiomas.org/coverage', '{"collection": "7", "classes": "native_vegetation"}'::jsonb, 'annual', 'api', true),

('AMBIENT_TX_DESMATAMENTO', 'Taxa de Desmatamento', 'Taxa anual de desmatamento (%)', 'AMBIENT', 'Cobertura Vegetal', 'MapBiomas', 'https://mapbiomas.org/', 'https://api.mapbiomas.org/deforestation', '{"collection": "7"}'::jsonb, 'annual', 'api', true),

('AMBIENT_BIOMA', 'Bioma Predominante', 'Bioma predominante no território (Cerrado/Amazônia)', 'AMBIENT', 'Cobertura Vegetal', 'IBGE', 'https://www.ibge.gov.br/geociencias/cartas-e-mapas/informacoes-ambientais/15842-biomas.html', NULL, '{"type": "fixed"}'::jsonb, 'fixed', 'manual', false),

-- Áreas Protegidas
('AMBIENT_UC_AREA', 'Área em Unidades de Conservação', 'Área do município em Unidades de Conservação (km²)', 'AMBIENT', 'Áreas Protegidas', 'ICMBio/SEMA-TO', 'https://www.icmbio.gov.br/', NULL, '{}'::jsonb, 'annual', 'manual', true),

('AMBIENT_TI_AREA', 'Área em Terras Indígenas', 'Área do município em Terras Indígenas (km²)', 'AMBIENT', 'Áreas Protegidas', 'FUNAI', 'https://www.gov.br/funai/pt-br', NULL, '{}'::jsonb, 'annual', 'manual', true),

('AMBIENT_APP', 'Áreas de Preservação Permanente', 'Área de APPs cadastradas no CAR (km²)', 'AMBIENT', 'Áreas Protegidas', 'CAR', 'https://www.car.gov.br/', NULL, '{}'::jsonb, 'annual', 'manual', true),

-- Gestão Ambiental
('AMBIENT_ORGAO_AMBIENTAL', 'Possui Órgão Ambiental', 'Município possui órgão municipal de meio ambiente', 'AMBIENT', 'Governança Ambiental', 'IBGE MUNIC', 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html', NULL, '{"survey": "MUNIC"}'::jsonb, 'annual', 'manual', true),

('AMBIENT_CONSELHO', 'Possui Conselho Ambiental', 'Município possui conselho municipal de meio ambiente', 'AMBIENT', 'Governança Ambiental', 'IBGE MUNIC', 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html', NULL, '{"survey": "MUNIC"}'::jsonb, 'annual', 'manual', true),

('AMBIENT_FUNDO', 'Possui Fundo Ambiental', 'Município possui fundo municipal de meio ambiente', 'AMBIENT', 'Governança Ambiental', 'IBGE MUNIC', 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html', NULL, '{"survey": "MUNIC"}'::jsonb, 'annual', 'manual', true),

-- Riscos Ambientais
('AMBIENT_QUEIMADAS', 'Focos de Queimadas', 'Número de focos de queimadas detectados por satélite', 'AMBIENT', 'Riscos Ambientais', 'INPE', 'https://queimadas.dgi.inpe.br/', 'https://queimadas.dgi.inpe.br/queimadas/sisam-api/', '{"satellite": "aqua_m-t"}'::jsonb, 'annual', 'api', true)

ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Indicadores por Dimensão
CREATE OR REPLACE VIEW v_indicators_by_dimension AS
SELECT
    dimension,
    COUNT(*) as total_indicators,
    COUNT(*) FILTER (WHERE is_active = true) as active_indicators,
    COUNT(*) FILTER (WHERE collection_method = 'api') as api_indicators,
    COUNT(*) FILTER (WHERE collection_method = 'manual') as manual_indicators,
    string_agg(DISTINCT source_name, ', ' ORDER BY source_name) as data_sources
FROM indicator_dictionary
GROUP BY dimension
ORDER BY dimension;

COMMENT ON VIEW v_indicators_by_dimension IS 'Resumo de indicadores por dimensão';

-- View: Indicadores Pendentes de Coleta
CREATE OR REPLACE VIEW v_indicators_pending_collection AS
SELECT
    id,
    code,
    name,
    dimension,
    source_name,
    periodicity,
    last_ref_date,
    next_collection_date,
    CASE
        WHEN next_collection_date IS NULL THEN 'never_collected'
        WHEN next_collection_date < CURRENT_DATE THEN 'overdue'
        WHEN next_collection_date = CURRENT_DATE THEN 'due_today'
        WHEN next_collection_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'due_this_week'
        ELSE 'future'
    END as collection_status
FROM indicator_dictionary
WHERE is_active = true
  AND collection_method IN ('api', 'scraping')
ORDER BY
    CASE
        WHEN next_collection_date IS NULL THEN 1
        WHEN next_collection_date < CURRENT_DATE THEN 2
        WHEN next_collection_date = CURRENT_DATE THEN 3
        ELSE 4
    END,
    next_collection_date ASC NULLS FIRST;

COMMENT ON VIEW v_indicators_pending_collection IS 'Indicadores pendentes de coleta ordenados por prioridade';

-- View: Indicadores por Fonte
CREATE OR REPLACE VIEW v_indicators_by_source AS
SELECT
    source_name,
    COUNT(*) as total_indicators,
    COUNT(*) FILTER (WHERE is_active = true) as active_indicators,
    array_agg(DISTINCT dimension::text) as dimensions,
    string_agg(DISTINCT collection_method, ', ') as methods,
    COUNT(*) FILTER (WHERE api_endpoint IS NOT NULL) as with_api
FROM indicator_dictionary
GROUP BY source_name
ORDER BY total_indicators DESC;

COMMENT ON VIEW v_indicators_by_source IS 'Indicadores agrupados por fonte de dados';

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função: Atualizar data de próxima coleta
CREATE OR REPLACE FUNCTION update_next_collection_date()
RETURNS trigger AS $$
BEGIN
    -- Calcular próxima coleta baseado em periodicidade
    IF NEW.periodicity = 'monthly' THEN
        NEW.next_collection_date := CURRENT_DATE + INTERVAL '1 month';
    ELSIF NEW.periodicity = 'quarterly' THEN
        NEW.next_collection_date := CURRENT_DATE + INTERVAL '3 months';
    ELSIF NEW.periodicity = 'annual' THEN
        NEW.next_collection_date := CURRENT_DATE + INTERVAL '1 year';
    ELSIF NEW.periodicity = 'census' THEN
        NEW.next_collection_date := CURRENT_DATE + INTERVAL '10 years';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualizar next_collection_date quando last_ref_date é atualizado
CREATE TRIGGER update_next_collection_trigger
    BEFORE UPDATE OF last_ref_date ON indicator_dictionary
    FOR EACH ROW
    WHEN (OLD.last_ref_date IS DISTINCT FROM NEW.last_ref_date)
    EXECUTE FUNCTION update_next_collection_date();

-- ============================================
-- VERIFICAÇÃO E MENSAGEM FINAL
-- ============================================

DO $$
DECLARE
    v_total_indicators INTEGER;
    v_econ_count INTEGER;
    v_social_count INTEGER;
    v_terra_count INTEGER;
    v_ambient_count INTEGER;
    v_api_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_indicators FROM indicator_dictionary;
    SELECT COUNT(*) INTO v_econ_count FROM indicator_dictionary WHERE dimension = 'ECON';
    SELECT COUNT(*) INTO v_social_count FROM indicator_dictionary WHERE dimension = 'SOCIAL';
    SELECT COUNT(*) INTO v_terra_count FROM indicator_dictionary WHERE dimension = 'TERRA';
    SELECT COUNT(*) INTO v_ambient_count FROM indicator_dictionary WHERE dimension = 'AMBIENT';
    SELECT COUNT(*) INTO v_api_count FROM indicator_dictionary WHERE collection_method = 'api';

    RAISE NOTICE '✅ Migration 008 concluída com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Dicionário de Indicadores criado:';
    RAISE NOTICE '   Total de indicadores: %', v_total_indicators;
    RAISE NOTICE '   • ECON (Econômico): %', v_econ_count;
    RAISE NOTICE '   • SOCIAL (Social): %', v_social_count;
    RAISE NOTICE '   • TERRA (Territorial): %', v_terra_count;
    RAISE NOTICE '   • AMBIENT (Ambiental): %', v_ambient_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔌 Métodos de coleta:';
    RAISE NOTICE '   • API automática: %', v_api_count;
    RAISE NOTICE '   • Manual: %', v_total_indicators - v_api_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Próximos passos:';
    RAISE NOTICE '   1. Revisar os endpoints de API dos indicadores';
    RAISE NOTICE '   2. Criar workflows orientados pelo dicionário';
    RAISE NOTICE '   3. Testar coleta automática dos indicadores com API';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Para consultar:';
    RAISE NOTICE '   SELECT * FROM v_indicators_by_dimension;';
    RAISE NOTICE '   SELECT * FROM v_indicators_by_source;';
    RAISE NOTICE '   SELECT * FROM v_indicators_pending_collection;';
END $$;
