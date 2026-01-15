-- ============================================
-- Setup de Indicadores para Coleta IBGE
-- Tocantins Integrado - MVP
-- ============================================
--
-- Este script garante que os indicadores necessários
-- para a coleta IBGE estão criados no banco de dados.
--
-- Execute no SQL Editor do Supabase ANTES de usar
-- o workflow data-collection-ibge-simplified
-- ============================================

-- 1. Garantir que as categorias existem
INSERT INTO indicator_categories (dimension, name, description, display_order)
VALUES
  ('ECON', 'PIB e Renda', 'Indicadores de produto interno bruto e renda per capita', 1),
  ('SOCIAL', 'Demografia', 'Indicadores populacionais e demográficos', 4)
ON CONFLICT (dimension, name) DO NOTHING;

-- 2. Criar indicador de PIB Municipal
INSERT INTO indicator_definitions (
  category_id,
  code,
  name,
  description,
  unit,
  source,
  source_url,
  methodology,
  periodicity,
  higher_is_better,
  is_active
)
SELECT
  ic.id,
  'ECON_PIB_TOTAL',
  'PIB Municipal',
  'Produto Interno Bruto do município a preços correntes',
  'mil_reais',
  'IBGE SIDRA',
  'https://apisidra.ibge.gov.br/values/t/5938',
  'Tabela 5938 - Produto interno bruto a preços correntes. Valor do PIB total do município.',
  'annual',
  true,
  true
FROM indicator_categories ic
WHERE ic.dimension = 'ECON' AND ic.name = 'PIB e Renda'
ON CONFLICT (code)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  methodology = EXCLUDED.methodology,
  updated_at = NOW();

-- 3. Criar indicador de População
INSERT INTO indicator_definitions (
  category_id,
  code,
  name,
  description,
  unit,
  source,
  source_url,
  methodology,
  periodicity,
  higher_is_better,
  is_active
)
SELECT
  ic.id,
  'SOCIAL_POPULACAO',
  'População Total',
  'População residente total do município',
  'habitantes',
  'IBGE SIDRA',
  'https://apisidra.ibge.gov.br/values/t/6579',
  'Tabela 6579 - População residente estimada. Estimativa populacional anual.',
  'annual',
  false,
  true
FROM indicator_categories ic
WHERE ic.dimension = 'SOCIAL' AND ic.name = 'Demografia'
ON CONFLICT (code)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  methodology = EXCLUDED.methodology,
  updated_at = NOW();

-- 4. Verificar se os indicadores foram criados
DO $$
DECLARE
  v_pib_exists BOOLEAN;
  v_pop_exists BOOLEAN;
  v_pib_id UUID;
  v_pop_id UUID;
BEGIN
  -- Verificar PIB
  SELECT EXISTS(SELECT 1 FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL') INTO v_pib_exists;
  SELECT id INTO v_pib_id FROM indicator_definitions WHERE code = 'ECON_PIB_TOTAL';

  -- Verificar População
  SELECT EXISTS(SELECT 1 FROM indicator_definitions WHERE code = 'SOCIAL_POPULACAO') INTO v_pop_exists;
  SELECT id INTO v_pop_id FROM indicator_definitions WHERE code = 'SOCIAL_POPULACAO';

  -- Resultados
  IF v_pib_exists AND v_pop_exists THEN
    RAISE NOTICE '✅ Setup concluído com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Indicadores criados:';
    RAISE NOTICE '   • ECON_PIB_TOTAL (ID: %)', v_pib_id;
    RAISE NOTICE '   • SOCIAL_POPULACAO (ID: %)', v_pop_id;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Próximo passo:';
    RAISE NOTICE '   Importe o workflow data-collection-ibge-simplified.json no n8n';
  ELSE
    RAISE EXCEPTION '❌ Erro ao criar indicadores. Verifique as categorias.';
  END IF;
END $$;

-- 5. Query de verificação (opcional)
-- Descomente para ver os indicadores criados:
/*
SELECT
  id.code,
  id.name,
  id.unit,
  id.source,
  ic.dimension,
  ic.name AS category_name
FROM indicator_definitions id
JOIN indicator_categories ic ON id.category_id = ic.id
WHERE id.code IN ('ECON_PIB_TOTAL', 'SOCIAL_POPULACAO');
*/
