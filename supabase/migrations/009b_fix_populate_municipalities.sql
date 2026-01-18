-- ============================================
-- Migration 009b: CORREÇÃO - Popular 139 Municípios
-- ============================================
-- Este script corrige o problema onde apenas 1 município foi migrado
-- da tabela municipalities. Insere todos os 139 municípios diretamente.
--
-- Problema: A FASE 3.6 da migration 009 depende da tabela municipalities
--           ter dados pré-existentes, mas ela estava vazia ou incompleta.
--
-- Solução: Inserir todos os 139 municípios diretamente na tabela territories
--          e recriar os relacionamentos com as regiões.
--
-- Referência: tocantins_municipios_completo.csv
-- Data: 2026-01-18
-- ============================================

-- ============================================
-- PASSO 1: Inserir todos os 139 municípios
-- ============================================

INSERT INTO territories (type, ibge_code, name, division_scheme, is_active, metadata)
VALUES
    ('municipio'::territory_type, '1700251', 'Abreulândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1700301', 'Aguiarnópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1700350', 'Aliança do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1700400', 'Almas', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1700707', 'Alvorada', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1701002', 'Ananás', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1701051', 'Angico', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1701101', 'Aparecida do Rio Negro', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1701309', 'Aragominas', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1701903', 'Araguacema', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702000', 'Araguaçu', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702109', 'Araguaína', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702158', 'Araguanã', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702208', 'Araguatins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702307', 'Arapoema', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702406', 'Arraias', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702554', 'Augustinópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702703', 'Aurora do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1702901', 'Axixá do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703008', 'Babaçulândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703057', 'Bandeirantes do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703073', 'Barra do Ouro', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703107', 'Barrolândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703206', 'Bernardo Sayão', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703305', 'Bom Jesus do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703602', 'Brasilândia do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703701', 'Brejinho de Nazaré', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703800', 'Buriti do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703826', 'Cachoeirinha', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703842', 'Campos Lindos', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703867', 'Cariri do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703883', 'Carmolândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703891', 'Carrasco Bonito', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1703909', 'Caseara', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1704105', 'Centenário', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1704600', 'Chapada de Areia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1705102', 'Chapada da Natividade', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1705508', 'Colinas do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1705557', 'Combinado', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1705607', 'Conceição do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1706001', 'Couto Magalhães', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1706100', 'Cristalândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1706258', 'Crixás do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1706506', 'Darcinópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707009', 'Dianópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707108', 'Divinópolis do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707207', 'Dois Irmãos do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707306', 'Dueré', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707405', 'Esperantina', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707553', 'Fátima', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707652', 'Figueirópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1707702', 'Filadélfia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1708205', 'Formoso do Araguaia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1708254', 'Tabocão', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1708304', 'Goianorte', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1709005', 'Goiatins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1709302', 'Guaraí', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1709500', 'Gurupi', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1709807', 'Ipueiras', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1710508', 'Itacajá', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1710706', 'Itaguatins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1710904', 'Itapiratins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1711100', 'Itaporã do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1711506', 'Jaú do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1711803', 'Juarina', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1711902', 'Lagoa da Confusão', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1711951', 'Lagoa do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712009', 'Lajeado', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712157', 'Lavandeira', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712405', 'Lizarda', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712454', 'Luzinópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712504', 'Marianópolis do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712702', 'Mateiros', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1712801', 'Maurilândia do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713205', 'Miracema do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713304', 'Miranorte', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713601', 'Monte do Carmo', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713700', 'Monte Santo do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713809', 'Palmeiras do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1713957', 'Muricilândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1714203', 'Natividade', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1714302', 'Nazaré', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1714880', 'Nova Olinda', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715002', 'Nova Rosalândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715101', 'Novo Acordo', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715150', 'Novo Alegre', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715259', 'Novo Jardim', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715507', 'Oliveira de Fátima', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715705', 'Palmeirante', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1715754', 'Palmeirópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716109', 'Paraíso do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716208', 'Paranã', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716307', 'Pau D''Arco', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716505', 'Pedro Afonso', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716604', 'Peixe', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716653', 'Pequizeiro', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1716703', 'Colméia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1717008', 'Pindorama do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1717206', 'Piraquê', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1717503', 'Pium', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1717800', 'Ponte Alta do Bom Jesus', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1717909', 'Ponte Alta do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718006', 'Porto Alegre do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718204', 'Porto Nacional', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718303', 'Praia Norte', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718402', 'Presidente Kennedy', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718451', 'Pugmil', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718501', 'Recursolândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718550', 'Riachinho', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718659', 'Rio da Conceição', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718709', 'Rio dos Bois', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718758', 'Rio Sono', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718808', 'Sampaio', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718840', 'Sandolândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718865', 'Santa Fé do Araguaia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718881', 'Santa Maria do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718899', 'Santa Rita do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1718907', 'Santa Rosa do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1719004', 'Santa Tereza do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720002', 'Santa Terezinha do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720101', 'São Bento do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720150', 'São Félix do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720200', 'São Miguel do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720259', 'São Salvador do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720309', 'São Sebastião do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720499', 'São Valério', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720655', 'Silvanópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720804', 'Sítio Novo do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720853', 'Sucupira', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720903', 'Taguatinga', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720937', 'Taipas do Tocantins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1720978', 'Talismã', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1721000', 'Palmas', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1721109', 'Tocantínia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1721208', 'Tocantinópolis', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1721257', 'Tupirama', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1721307', 'Tupiratins', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1722081', 'Wanderlândia', NULL, true, '{}'::jsonb),
    ('municipio'::territory_type, '1722107', 'Xambioá', NULL, true, '{}'::jsonb)
ON CONFLICT (type, ibge_code, division_scheme) DO NOTHING;

-- ============================================
-- PASSO 2: Recriar Relacionamentos (Divisão Antiga)
-- ============================================

-- Deletar relacionamentos existentes para evitar duplicatas
DELETE FROM territory_relationships
WHERE child_territory_id IN (
    SELECT id FROM territories WHERE type = 'municipio'
)
AND division_scheme = 'antiga';

-- Inserir mapeamento completo: 139 municípios → microrregiões
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
JOIN territories t_micro ON t_micro.ibge_code = mapeamento.microrregiao_ibge AND t_micro.type = 'microrregiao' AND t_micro.division_scheme = 'antiga';

-- ============================================
-- PASSO 3: Recriar Relacionamentos (Divisão Nova)
-- ============================================

-- Deletar relacionamentos existentes para evitar duplicatas
DELETE FROM territory_relationships
WHERE child_territory_id IN (
    SELECT id FROM territories WHERE type = 'municipio'
)
AND division_scheme = 'nova';

-- Inserir mapeamento completo: 139 municípios → regiões imediatas
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
JOIN territories t_imediata ON t_imediata.ibge_code = mapeamento.regiao_imediata_ibge AND t_imediata.type = 'regiao_imediata' AND t_imediata.division_scheme = 'nova';

-- ============================================
-- PASSO 4: VALIDAÇÃO
-- ============================================

DO $$
DECLARE
    v_total_municipios INTEGER;
    v_municipios_sem_micro INTEGER;
    v_municipios_sem_imediata INTEGER;
BEGIN
    -- Contar municípios
    SELECT COUNT(*) INTO v_total_municipios FROM territories WHERE type = 'municipio';

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

    -- Relatório
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RELATÓRIO DE CORREÇÃO - Migration 009b';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de municípios: % (esperado: 139)', v_total_municipios;
    RAISE NOTICE 'Municípios sem microrregião (antiga): % (esperado: 0)', v_municipios_sem_micro;
    RAISE NOTICE 'Municípios sem região imediata (nova): % (esperado: 0)', v_municipios_sem_imediata;
    RAISE NOTICE '============================================';

    IF v_total_municipios = 139 AND v_municipios_sem_micro = 0 AND v_municipios_sem_imediata = 0 THEN
        RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE 'Verificar resultados:';
        RAISE NOTICE '  SELECT * FROM v_territories_summary;';
        RAISE NOTICE '  SELECT * FROM v_hierarchy_antiga LIMIT 10;';
        RAISE NOTICE '  SELECT * FROM v_hierarchy_nova LIMIT 10;';
    ELSE
        RAISE WARNING '❌ Há problemas na correção. Verifique os dados acima.';
    END IF;
END $$;

-- ============================================
-- FIM DA MIGRATION 009b
-- ============================================
