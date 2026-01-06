-- ==============================================
-- Seeds: Análises Pré-computadas de Exemplo
-- Tocantins Integrado - MVP v1.0
-- ==============================================

-- Análise de Palmas (capital)
INSERT INTO precomputed_analyses (
  id,
  municipality_id,
  title,
  slug,
  analysis_type,
  executive_summary,
  full_content,
  key_findings,
  recommendations,
  data_year,
  generated_by,
  status,
  published_at
) VALUES (
  'a1000001-0001-0001-0001-000000000001',
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  'Perfil Socioeconômico de Palmas 2024',
  'perfil-socioeconomico-palmas-2024',
  'municipal_profile',
  'Palmas, capital do Tocantins, apresenta os melhores indicadores socioeconômicos do estado, com PIB per capita de R$ 42.500, IDH de 0,788 (alto) e taxa de urbanização de 97,8%. A cidade concentra 32% do PIB estadual e possui a maior rede de serviços públicos. Principais desafios incluem a desigualdade intraurbana e a dependência do setor público.',
  '{
    "overview": "Palmas é a capital mais jovem do Brasil, planejada e fundada em 1989. Com população de 313.349 habitantes (2024), é o maior centro urbano do Tocantins.",
    "economy": {
      "pib_total": 13500000000,
      "pib_per_capita": 42500,
      "main_sectors": ["Administração Pública", "Comércio", "Serviços"],
      "employment_rate": 92.3,
      "formal_jobs": 145000
    },
    "social": {
      "idh": 0.788,
      "literacy_rate": 97.2,
      "ideb_fundamental": 6.1,
      "infant_mortality": 11.2,
      "life_expectancy": 76.4
    },
    "infrastructure": {
      "urbanization_rate": 97.8,
      "water_coverage": 99.1,
      "sewage_coverage": 78.5,
      "electricity_coverage": 99.9
    },
    "strengths": [
      "Capital planejada com boa infraestrutura urbana",
      "Centro administrativo e de serviços do estado",
      "Maior polo universitário do Tocantins",
      "Aeroporto internacional e boa conectividade"
    ],
    "weaknesses": [
      "Alta dependência do setor público",
      "Desigualdade entre regiões norte e sul",
      "Cobertura de esgoto ainda insuficiente",
      "Custo de vida elevado para a região"
    ]
  }',
  '[
    "PIB per capita 2,3x maior que a média estadual",
    "IDH classificado como alto desenvolvimento humano",
    "32% do PIB do Tocantins concentrado na capital",
    "Setor público representa 45% da economia local",
    "Taxa de urbanização de 97,8%, a maior do estado"
  ]',
  '[
    "Diversificar a base econômica para reduzir dependência do setor público",
    "Expandir cobertura de esgotamento sanitário para a região norte",
    "Fortalecer o polo tecnológico e de inovação",
    "Implementar programa de desenvolvimento das áreas periféricas",
    "Atrair investimentos industriais para o entorno"
  ]',
  2024,
  'sistema',
  'published',
  NOW()
),
-- Análise de Araguaína (segunda maior cidade)
(
  'a1000001-0001-0001-0001-000000000002',
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  'Perfil Socioeconômico de Araguaína 2024',
  'perfil-socioeconomico-araguaina-2024',
  'municipal_profile',
  'Araguaína é o segundo maior município do Tocantins e principal polo econômico do norte do estado. Com forte vocação para agronegócio e comércio, apresenta PIB de R$ 5,8 bilhões e IDH de 0,752. A cidade é referência regional em saúde e educação superior, atendendo municípios do sul do Pará e Maranhão.',
  '{
    "overview": "Araguaína possui 190.000 habitantes e é conhecida como a Capital Econômica do Norte do Tocantins. Fundada em 1958, tem economia diversificada.",
    "economy": {
      "pib_total": 5800000000,
      "pib_per_capita": 30500,
      "main_sectors": ["Agropecuária", "Comércio", "Serviços de Saúde"],
      "employment_rate": 89.5,
      "formal_jobs": 62000
    },
    "social": {
      "idh": 0.752,
      "literacy_rate": 94.8,
      "ideb_fundamental": 5.4,
      "infant_mortality": 14.8,
      "life_expectancy": 74.2
    },
    "infrastructure": {
      "urbanization_rate": 95.2,
      "water_coverage": 96.5,
      "sewage_coverage": 42.3,
      "electricity_coverage": 99.5
    },
    "strengths": [
      "Polo regional de saúde e educação",
      "Forte setor agropecuário",
      "Localização estratégica na BR-153",
      "Diversificação econômica em andamento"
    ],
    "weaknesses": [
      "Baixa cobertura de esgoto",
      "Mortalidade infantil acima da média estadual",
      "Dependência de commodities agrícolas",
      "Infraestrutura viária urbana deficiente"
    ]
  }',
  '[
    "Segundo maior PIB do estado (R$ 5,8 bilhões)",
    "Polo de saúde atende mais de 50 municípios da região",
    "Frigorífico entre os maiores da América Latina",
    "Cobertura de esgoto de apenas 42,3%",
    "3 universidades e 12 faculdades instaladas"
  ]',
  '[
    "Priorizar expansão do sistema de esgotamento sanitário",
    "Fortalecer corredor logístico BR-153 / Ferrovia Norte-Sul",
    "Desenvolver polo agroindustrial de processamento",
    "Ampliar leitos hospitalares para demanda regional",
    "Criar programa de qualificação profissional"
  ]',
  2024,
  'sistema',
  'published',
  NOW()
),
-- Análise Comparativa Regional
(
  'a1000001-0001-0001-0001-000000000003',
  NULL,
  'Análise Comparativa: Microrregiões do Tocantins 2024',
  'analise-comparativa-microrregioes-2024',
  'comparative',
  'Análise comparativa das 8 microrregiões do Tocantins revela disparidades significativas no desenvolvimento socioeconômico. A microrregião de Palmas concentra 45% do PIB estadual, enquanto Jalapão e Bico do Papagaio apresentam os menores indicadores. A agropecuária predomina em 6 das 8 microrregiões.',
  '{
    "methodology": "Comparação de 15 indicadores principais das 8 microrregiões do Tocantins, com dados de 2023-2024.",
    "rankings": {
      "pib_per_capita": ["Palmas", "Gurupi", "Araguaína", "Porto Nacional", "Paraíso", "Dianópolis", "Miracema", "Bico do Papagaio"],
      "idh": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso", "Miracema", "Dianópolis", "Bico do Papagaio"],
      "crescimento_populacional": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Miracema", "Paraíso", "Dianópolis", "Bico do Papagaio"]
    },
    "clusters": {
      "alto_desenvolvimento": ["Palmas"],
      "medio_alto": ["Araguaína", "Gurupi", "Porto Nacional"],
      "medio": ["Paraíso", "Miracema", "Dianópolis"],
      "baixo": ["Bico do Papagaio", "Jalapão"]
    },
    "disparidades": {
      "pib_per_capita_max_min_ratio": 3.2,
      "idh_diferenca": 0.15,
      "cobertura_esgoto_diferenca": 45
    }
  }',
  '[
    "Palmas concentra 45% do PIB e 23% da população estadual",
    "Disparidade de 3,2x entre maior e menor PIB per capita",
    "Bico do Papagaio tem o menor IDH (0,657) do estado",
    "Agropecuária é o setor principal em 6 de 8 microrregiões",
    "Cobertura de esgoto varia de 12% a 78% entre microrregiões"
  ]',
  '[
    "Criar política de descentralização de investimentos",
    "Fortalecer polos regionais secundários (Araguaína, Gurupi)",
    "Implementar programa específico para Bico do Papagaio",
    "Desenvolver turismo sustentável no Jalapão",
    "Melhorar conectividade das regiões mais isoladas"
  ]',
  2024,
  'sistema',
  'published',
  NOW()
),
-- Análise Temática: Educação
(
  'a1000001-0001-0001-0001-000000000004',
  NULL,
  'Panorama da Educação no Tocantins 2024',
  'panorama-educacao-tocantins-2024',
  'thematic',
  'O Tocantins apresenta IDEB de 5.1 no ensino fundamental (2023), acima da meta projetada de 4.9, mas ainda abaixo da média nacional de 5.6. A taxa de escolarização líquida no ensino médio é de 62%, com desafios na qualidade do ensino rural e na redução da evasão escolar.',
  '{
    "overview": "Análise do sistema educacional tocantinense com foco em indicadores de qualidade, acesso e infraestrutura.",
    "indicators": {
      "ideb_fundamental_1": 5.3,
      "ideb_fundamental_2": 4.9,
      "ideb_medio": 4.1,
      "taxa_escolarizacao_6_14": 98.2,
      "taxa_escolarizacao_15_17": 87.5,
      "taxa_escolarizacao_liquida_medio": 62.0,
      "taxa_abandono_fundamental": 1.8,
      "taxa_abandono_medio": 5.2
    },
    "infrastructure": {
      "escolas_banda_larga": 72,
      "escolas_biblioteca": 45,
      "escolas_lab_informatica": 38,
      "escolas_quadra_coberta": 28
    },
    "teachers": {
      "total_docentes": 18500,
      "formacao_superior": 89,
      "formacao_area": 75
    },
    "regional_disparities": {
      "ideb_capital_vs_interior": 1.2,
      "acesso_rural_vs_urbano": 15
    }
  }',
  '[
    "IDEB acima da meta, mas abaixo da média nacional",
    "Taxa de abandono no ensino médio de 5,2%",
    "72% das escolas com acesso à internet banda larga",
    "Diferença de 1,2 pontos no IDEB entre capital e interior",
    "25% dos professores sem formação na área de atuação"
  ]',
  '[
    "Implementar programa de redução da evasão no ensino médio",
    "Expandir infraestrutura tecnológica nas escolas rurais",
    "Criar programa de formação continuada para docentes",
    "Fortalecer o ensino técnico profissionalizante",
    "Ampliar programa de transporte escolar rural"
  ]',
  2024,
  'agente-social',
  'published',
  NOW()
);

-- Fragmentos de análise para exibição contextual
INSERT INTO analysis_fragments (
  analysis_id,
  municipality_id,
  dimension,
  indicator_code,
  fragment_type,
  title,
  content,
  highlight_value,
  highlight_unit,
  trend
) VALUES
-- Fragmentos de Palmas
(
  'a1000001-0001-0001-0001-000000000001',
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  'ECON',
  'PIB_PER_CAPITA',
  'highlight',
  'PIB per capita acima da média',
  'Palmas possui o maior PIB per capita do Tocantins (R$ 42.500), 2,3 vezes superior à média estadual, refletindo sua posição como capital e centro administrativo.',
  42500,
  'R$/hab',
  'stable'
),
(
  'a1000001-0001-0001-0001-000000000001',
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  'SOCIAL',
  'IDH',
  'highlight',
  'IDH de alto desenvolvimento',
  'Com IDH de 0,788, Palmas é classificada como município de alto desenvolvimento humano, única nesta categoria no estado.',
  0.788,
  'índice',
  'up'
),
(
  'a1000001-0001-0001-0001-000000000001',
  (SELECT id FROM municipalities WHERE ibge_code = '1721000'),
  'TERRA',
  'URBANIZACAO',
  'insight',
  'Planejamento urbano',
  'Capital planejada com taxa de urbanização de 97,8% e amplas áreas verdes, mas com desafios de ocupação desordenada nas regiões periféricas.',
  97.8,
  '%',
  'stable'
),
-- Fragmentos de Araguaína
(
  'a1000001-0001-0001-0001-000000000002',
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  'ECON',
  'PIB_TOTAL',
  'highlight',
  'Polo econômico regional',
  'Araguaína é o segundo maior PIB do estado (R$ 5,8 bilhões), impulsionado pelo agronegócio e pelo comércio regional.',
  5.8,
  'bilhões',
  'up'
),
(
  'a1000001-0001-0001-0001-000000000002',
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  'SOCIAL',
  'SAUDE',
  'insight',
  'Polo de saúde regional',
  'A cidade atende mais de 50 municípios da região norte do Tocantins e sul do Pará em serviços de saúde de média e alta complexidade.',
  50,
  'municípios',
  'up'
),
(
  'a1000001-0001-0001-0001-000000000002',
  (SELECT id FROM municipalities WHERE ibge_code = '1702109'),
  'AMBIENT',
  'SANEAMENTO',
  'alert',
  'Déficit de saneamento',
  'A cobertura de esgotamento sanitário de apenas 42,3% representa um risco à saúde pública e ao meio ambiente, especialmente nos córregos urbanos.',
  42.3,
  '%',
  'stable'
);

-- Documentos gerados
INSERT INTO generated_documents (
  analysis_id,
  title,
  document_type,
  format,
  file_url,
  file_size_bytes
) VALUES
(
  'a1000001-0001-0001-0001-000000000001',
  'Perfil Socioeconômico de Palmas 2024',
  'analysis_pdf',
  'pdf',
  '/documents/perfil-palmas-2024.pdf',
  1250000
),
(
  'a1000001-0001-0001-0001-000000000002',
  'Perfil Socioeconômico de Araguaína 2024',
  'analysis_pdf',
  'pdf',
  '/documents/perfil-araguaina-2024.pdf',
  1180000
),
(
  'a1000001-0001-0001-0001-000000000003',
  'Análise Comparativa Microrregiões 2024',
  'analysis_pdf',
  'pdf',
  '/documents/comparativo-microrregioes-2024.pdf',
  2450000
),
(
  'a1000001-0001-0001-0001-000000000004',
  'Panorama da Educação no Tocantins 2024',
  'analysis_pdf',
  'pdf',
  '/documents/panorama-educacao-2024.pdf',
  1850000
);

-- Log de execução
SELECT
  'Seeds de análises inseridos:' as status,
  (SELECT COUNT(*) FROM precomputed_analyses) as total_analyses,
  (SELECT COUNT(*) FROM analysis_fragments) as total_fragments,
  (SELECT COUNT(*) FROM generated_documents) as total_documents;
