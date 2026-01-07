-- ==============================================
-- Seeds: Metadados expandidos e dados históricos
-- Tocantins Integrado - MVP v1.0
-- ==============================================

-- Atualizar definições de indicadores com tooltips e metadados
UPDATE indicator_definitions SET
  tooltip_text = 'Valor total de bens e serviços produzidos pelo município em um ano, dividido pela população. Indica a riqueza média por habitante.',
  interpretation_guide = 'Compare com a média estadual (R$ 18.500) e nacional (R$ 35.000). Valores acima indicam maior atividade econômica per capita.',
  calculation_formula = 'PIB Total / População estimada',
  reference_values = '{"nacional": 35000, "regional_norte": 22000, "estadual": 18500}'::jsonb,
  tags = ARRAY['economia', 'renda', 'produção']
WHERE code = 'PIB_PER_CAPITA';

UPDATE indicator_definitions SET
  tooltip_text = 'Índice que mede o desenvolvimento humano considerando renda, educação e longevidade. Varia de 0 a 1.',
  interpretation_guide = 'Classificação: Muito baixo (0-0.499), Baixo (0.5-0.599), Médio (0.6-0.699), Alto (0.7-0.799), Muito alto (0.8+)',
  calculation_formula = '³√(IVS × IE × IR) - Índices de vida saudável, educação e renda',
  reference_values = '{"nacional": 0.765, "regional_norte": 0.720, "meta_ods": 0.800}'::jsonb,
  tags = ARRAY['social', 'ods_1', 'desenvolvimento']
WHERE code = 'IDH';

UPDATE indicator_definitions SET
  tooltip_text = 'Índice de Desenvolvimento da Educação Básica, combinando fluxo escolar e desempenho em provas.',
  interpretation_guide = 'Meta nacional 2024: 6.0. Escala de 0 a 10. Acima de 6 é considerado satisfatório.',
  calculation_formula = 'N × P (N = média de proficiência, P = taxa de aprovação)',
  reference_values = '{"nacional": 5.6, "meta_pne": 6.0, "estadual": 5.1}'::jsonb,
  tags = ARRAY['educação', 'ods_4', 'qualidade']
WHERE code = 'IDEB_FUNDAMENTAL';

UPDATE indicator_definitions SET
  tooltip_text = 'Número de óbitos de crianças menores de 1 ano para cada 1.000 nascidos vivos.',
  interpretation_guide = 'Meta ODS 2030: reduzir para 12 por 1.000. Valores menores indicam melhor sistema de saúde.',
  calculation_formula = '(Óbitos < 1 ano / Nascidos vivos) × 1.000',
  reference_values = '{"nacional": 12.4, "meta_ods": 12.0, "regional_norte": 15.8}'::jsonb,
  tags = ARRAY['saúde', 'ods_3', 'mortalidade']
WHERE code = 'MORTALIDADE_INFANTIL';

UPDATE indicator_definitions SET
  tooltip_text = 'Percentual da população com acesso à rede de esgotamento sanitário.',
  interpretation_guide = 'Meta do Plano Nacional de Saneamento: 93% até 2033. Essencial para saúde pública.',
  calculation_formula = '(Pop. atendida por esgoto / Pop. total) × 100',
  reference_values = '{"nacional": 55.0, "meta_plansab": 93.0, "regional_norte": 27.5}'::jsonb,
  tags = ARRAY['saneamento', 'ods_6', 'infraestrutura']
WHERE code = 'COBERTURA_ESGOTO';

UPDATE indicator_definitions SET
  tooltip_text = 'Percentual do território municipal coberto por vegetação nativa.',
  interpretation_guide = 'Recomendado manter acima de 80% para bioma Cerrado. Monitore desmatamento.',
  calculation_formula = '(Área vegetação nativa / Área total) × 100',
  reference_values = '{"estadual": 72.0, "ideal_cerrado": 80.0}'::jsonb,
  tags = ARRAY['ambiental', 'cerrado', 'biodiversidade']
WHERE code = 'COBERTURA_VEGETAL';

-- Inserir valores de referência (benchmarks) para comparação
INSERT INTO indicator_benchmarks (indicator_id, year, benchmark_type, benchmark_name, value, source)
SELECT id, 2024, 'nacional', 'Média Brasil', 35000, 'IBGE' FROM indicator_definitions WHERE code = 'PIB_PER_CAPITA'
UNION ALL
SELECT id, 2024, 'regional_norte', 'Média Norte', 22000, 'IBGE' FROM indicator_definitions WHERE code = 'PIB_PER_CAPITA'
UNION ALL
SELECT id, 2024, 'nacional', 'Média Brasil', 0.765, 'PNUD' FROM indicator_definitions WHERE code = 'IDH'
UNION ALL
SELECT id, 2024, 'meta_ods', 'Meta ODS 2030', 0.800, 'ONU' FROM indicator_definitions WHERE code = 'IDH'
UNION ALL
SELECT id, 2024, 'nacional', 'Média Brasil', 5.6, 'INEP' FROM indicator_definitions WHERE code = 'IDEB_FUNDAMENTAL'
UNION ALL
SELECT id, 2024, 'meta_pne', 'Meta PNE', 6.0, 'MEC' FROM indicator_definitions WHERE code = 'IDEB_FUNDAMENTAL'
UNION ALL
SELECT id, 2024, 'nacional', 'Média Brasil', 12.4, 'DataSUS' FROM indicator_definitions WHERE code = 'MORTALIDADE_INFANTIL'
UNION ALL
SELECT id, 2024, 'meta_ods', 'Meta ODS 2030', 12.0, 'ONU' FROM indicator_definitions WHERE code = 'MORTALIDADE_INFANTIL'
ON CONFLICT (indicator_id, year, benchmark_type) DO NOTHING;

-- Inserir dados históricos de exemplo (5 anos) para Palmas
-- PIB per capita
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, rank_state, percentile_state)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'PIB_PER_CAPITA'),
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  year,
  value,
  1,
  99.0
FROM (VALUES
  (2020, 38500.00),
  (2021, 39800.00),
  (2022, 41200.00),
  (2023, 42000.00),
  (2024, 42500.00)
) AS data(year, value)
ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET value = EXCLUDED.value;

-- IDH
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, rank_state, percentile_state)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'IDH'),
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  year,
  value,
  1,
  99.0
FROM (VALUES
  (2020, 0.772),
  (2021, 0.778),
  (2022, 0.782),
  (2023, 0.785),
  (2024, 0.788)
) AS data(year, value)
ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET value = EXCLUDED.value;

-- IDEB Fundamental
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, rank_state, percentile_state)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'IDEB_FUNDAMENTAL'),
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  year,
  value,
  1,
  95.0
FROM (VALUES
  (2019, 5.5),
  (2021, 5.7),
  (2023, 6.1)
) AS data(year, value)
ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET value = EXCLUDED.value;

-- Inserir dados históricos para Araguaína
-- PIB per capita
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, rank_state, percentile_state)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'PIB_PER_CAPITA'),
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  year,
  value,
  2,
  95.0
FROM (VALUES
  (2020, 27200.00),
  (2021, 28100.00),
  (2022, 29300.00),
  (2023, 30000.00),
  (2024, 30500.00)
) AS data(year, value)
ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET value = EXCLUDED.value;

-- IDH
INSERT INTO indicator_values (indicator_id, municipality_id, year, value, rank_state, percentile_state)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'IDH'),
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  year,
  value,
  2,
  92.0
FROM (VALUES
  (2020, 0.738),
  (2021, 0.742),
  (2022, 0.746),
  (2023, 0.749),
  (2024, 0.752)
) AS data(year, value)
ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET value = EXCLUDED.value;

-- Inserir médias estaduais para referência
INSERT INTO state_averages (indicator_id, year, avg_value, min_value, max_value, municipality_count)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'PIB_PER_CAPITA'),
  year,
  avg_value,
  min_value,
  max_value,
  139
FROM (VALUES
  (2020, 16500.00, 8200.00, 38500.00),
  (2021, 17100.00, 8500.00, 39800.00),
  (2022, 17800.00, 8900.00, 41200.00),
  (2023, 18200.00, 9100.00, 42000.00),
  (2024, 18500.00, 9300.00, 42500.00)
) AS data(year, avg_value, min_value, max_value)
ON CONFLICT (indicator_id, year) DO UPDATE SET avg_value = EXCLUDED.avg_value;

INSERT INTO state_averages (indicator_id, year, avg_value, min_value, max_value, municipality_count)
SELECT
  (SELECT id FROM indicator_definitions WHERE code = 'IDH'),
  year,
  avg_value,
  min_value,
  max_value,
  139
FROM (VALUES
  (2020, 0.680, 0.590, 0.772),
  (2021, 0.684, 0.594, 0.778),
  (2022, 0.688, 0.598, 0.782),
  (2023, 0.692, 0.602, 0.785),
  (2024, 0.695, 0.605, 0.788)
) AS data(year, avg_value, min_value, max_value)
ON CONFLICT (indicator_id, year) DO UPDATE SET avg_value = EXCLUDED.avg_value;

-- Verificação
SELECT
  'Indicadores com metadados atualizados:' as status,
  COUNT(*) FILTER (WHERE tooltip_text IS NOT NULL) as with_tooltip,
  COUNT(*) FILTER (WHERE reference_values IS NOT NULL) as with_references
FROM indicator_definitions;

SELECT
  'Dados históricos inseridos:' as status,
  COUNT(DISTINCT indicator_id) as indicators,
  COUNT(DISTINCT municipality_id) as municipalities,
  COUNT(DISTINCT year) as years,
  COUNT(*) as total_records
FROM indicator_values;
