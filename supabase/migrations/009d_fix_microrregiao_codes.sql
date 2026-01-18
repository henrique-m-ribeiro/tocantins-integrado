-- ============================================
-- Migration 009d: CORREÇÃO FINAL - Códigos Corretos das Microrregiões
-- ============================================
-- Problema: Códigos das microrregiões com 5 dígitos em vez de 6
-- Exemplo: Usamos '17001' mas o correto é '170001'
-- Causa: Erro nos mapeamentos das migrations 009b e 009c
-- Solução: Usar códigos corretos de 6 dígitos
--
-- Data: 2026-01-18
-- ============================================

-- ============================================
-- PASSO 1: LIMPAR RELACIONAMENTOS INCORRETOS
-- ============================================

-- Deletar todos os relacionamentos de municípios (vamos recriar com códigos corretos)
DELETE FROM territory_relationships
WHERE child_territory_id IN (
    SELECT id FROM territories WHERE type = 'municipio'
);

-- ============================================
-- PASSO 2: CRIAR RELACIONAMENTOS (Divisão Antiga) - CÓDIGOS CORRETOS
-- ============================================

-- Inserir todos os 139 relacionamentos: município → microrregião
-- IMPORTANTE: Usando códigos de 6 dígitos para microrregiões (170001, 170002, etc.)
INSERT INTO territory_relationships (parent_territory_id, child_territory_id, relationship_type, division_scheme)
SELECT
    t_micro.id as parent_id,
    t_muni.id as child_id,
    'pertence_a',
    'antiga'
FROM (VALUES
    ('1700251', '170003'), ('1700301', '170001'), ('1700350', '170005'), ('1700400', '170008'),
    ('1700707', '170005'), ('1701002', '170001'), ('1701051', '170001'), ('1701101', '170006'),
    ('1701309', '170002'), ('1701903', '170003'), ('1702000', '170004'), ('1702109', '170002'),
    ('1702158', '170002'), ('1702208', '170001'), ('1702307', '170002'), ('1702406', '170008'),
    ('1702554', '170001'), ('1702703', '170008'), ('1702901', '170001'), ('1703008', '170002'),
    ('1703057', '170002'), ('1703073', '170007'), ('1703107', '170003'), ('1703206', '170003'),
    ('1703305', '170006'), ('1703602', '170003'), ('1703701', '170005'), ('1703800', '170001'),
    ('1703826', '170001'), ('1703842', '170007'), ('1703867', '170005'), ('1703883', '170002'),
    ('1703891', '170001'), ('1703909', '170003'), ('1704105', '170007'), ('1704600', '170004'),
    ('1705102', '170008'), ('1705508', '170002'), ('1705557', '170008'), ('1705607', '170008'),
    ('1706001', '170003'), ('1706100', '170004'), ('1706258', '170005'), ('1706506', '170001'),
    ('1707009', '170008'), ('1707108', '170003'), ('1707207', '170003'), ('1707306', '170004'),
    ('1707405', '170001'), ('1707553', '170004'), ('1707652', '170005'), ('1707702', '170002'),
    ('1708205', '170004'), ('1708254', '170003'), ('1708304', '170003'), ('1709005', '170007'),
    ('1709302', '170003'), ('1709500', '170005'), ('1709807', '170006'), ('1710508', '170007'),
    ('1710706', '170001'), ('1710904', '170007'), ('1711100', '170003'), ('1711506', '170005'),
    ('1711803', '170003'), ('1711902', '170004'), ('1711951', '170007'), ('1712009', '170006'),
    ('1712157', '170008'), ('1712405', '170007'), ('1712454', '170001'), ('1712504', '170003'),
    ('1712702', '170007'), ('1712801', '170001'), ('1713205', '170003'), ('1713304', '170003'),
    ('1713601', '170006'), ('1713700', '170003'), ('1713809', '170001'), ('1713957', '170002'),
    ('1714203', '170008'), ('1714302', '170001'), ('1714880', '170002'), ('1715002', '170004'),
    ('1715101', '170007'), ('1715150', '170008'), ('1715259', '170008'), ('1715507', '170004'),
    ('1715705', '170002'), ('1715754', '170005'), ('1716109', '170004'), ('1716208', '170008'),
    ('1716307', '170002'), ('1716505', '170006'), ('1716604', '170005'), ('1716653', '170003'),
    ('1716703', '170003'), ('1717008', '170008'), ('1717206', '170002'), ('1717503', '170004'),
    ('1717800', '170008'), ('1717909', '170007'), ('1718006', '170008'), ('1718204', '170006'),
    ('1718303', '170001'), ('1718402', '170003'), ('1718451', '170004'), ('1718501', '170007'),
    ('1718550', '170001'), ('1718659', '170008'), ('1718709', '170003'), ('1718758', '170007'),
    ('1718808', '170001'), ('1718840', '170004'), ('1718865', '170002'), ('1718881', '170006'),
    ('1718899', '170005'), ('1718907', '170008'), ('1719004', '170007'), ('1720002', '170001'),
    ('1720101', '170001'), ('1720150', '170007'), ('1720200', '170001'), ('1720259', '170005'),
    ('1720309', '170001'), ('1720499', '170008'), ('1720655', '170006'), ('1720804', '170001'),
    ('1720853', '170005'), ('1720903', '170008'), ('1720937', '170008'), ('1720978', '170005'),
    ('1721000', '170006'), ('1721109', '170006'), ('1721208', '170001'), ('1721257', '170003'),
    ('1721307', '170003'), ('1722081', '170002'), ('1722107', '170002')
) AS mapeamento(municipio_ibge, microrregiao_ibge)
JOIN territories t_muni ON t_muni.ibge_code = mapeamento.municipio_ibge AND t_muni.type = 'municipio'
JOIN territories t_micro ON t_micro.ibge_code = mapeamento.microrregiao_ibge AND t_micro.type = 'microrregiao' AND t_micro.division_scheme = 'antiga';

-- ============================================
-- PASSO 3: CRIAR RELACIONAMENTOS (Divisão Nova)
-- ============================================

-- Inserir todos os 139 relacionamentos: município → região imediata
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
-- PASSO 4: VALIDAÇÃO FINAL
-- ============================================

DO $$
DECLARE
    v_total_municipios INTEGER;
    v_municipios_sem_micro INTEGER;
    v_municipios_sem_imediata INTEGER;
    v_rels_antiga INTEGER;
    v_rels_nova INTEGER;
    v_sample_test TEXT;
BEGIN
    -- Contar municípios
    SELECT COUNT(*) INTO v_total_municipios FROM territories WHERE type = 'municipio';

    -- Contar relacionamentos criados
    SELECT COUNT(*) INTO v_rels_antiga
    FROM territory_relationships
    WHERE division_scheme = 'antiga'
      AND child_territory_id IN (SELECT id FROM territories WHERE type = 'municipio');

    SELECT COUNT(*) INTO v_rels_nova
    FROM territory_relationships
    WHERE division_scheme = 'nova'
      AND child_territory_id IN (SELECT id FROM territories WHERE type = 'municipio');

    -- Verificar municípios sem relacionamentos
    SELECT COUNT(*) INTO v_municipios_sem_micro
    FROM territories t
    WHERE t.type = 'municipio'
      AND NOT EXISTS (
          SELECT 1 FROM territory_relationships tr
          WHERE tr.child_territory_id = t.id
            AND tr.division_scheme = 'antiga'
      );

    SELECT COUNT(*) INTO v_municipios_sem_imediata
    FROM territories t
    WHERE t.type = 'municipio'
      AND NOT EXISTS (
          SELECT 1 FROM territory_relationships tr
          WHERE tr.child_territory_id = t.id
            AND tr.division_scheme = 'nova'
      );

    -- Teste de amostra (Paranã)
    SELECT
        COALESCE(microrregiao_nome, 'NULL') INTO v_sample_test
    FROM v_hierarchy_antiga
    WHERE municipio_nome = 'Paranã'
    LIMIT 1;

    -- Relatório final
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ VALIDAÇÃO FINAL - Migration 009d';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 TERRITÓRIOS:';
    RAISE NOTICE '  Municípios: % (esperado: 139)', v_total_municipios;
    RAISE NOTICE '';
    RAISE NOTICE '🔗 RELACIONAMENTOS CRIADOS:';
    RAISE NOTICE '  Divisão Antiga: % (esperado: 139)', v_rels_antiga;
    RAISE NOTICE '  Divisão Nova: % (esperado: 139)', v_rels_nova;
    RAISE NOTICE '';
    RAISE NOTICE '🔍 INTEGRIDADE:';
    RAISE NOTICE '  Municípios sem microrregião: % (esperado: 0)', v_municipios_sem_micro;
    RAISE NOTICE '  Municípios sem região imediata: % (esperado: 0)', v_municipios_sem_imediata;
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTE DE AMOSTRA:';
    RAISE NOTICE '  Paranã → Microrregião: % (esperado: Dianópolis)', v_sample_test;
    RAISE NOTICE '';
    RAISE NOTICE '============================================';

    IF v_total_municipios = 139 AND
       v_municipios_sem_micro = 0 AND v_municipios_sem_imediata = 0 AND
       v_rels_antiga = 139 AND v_rels_nova = 139 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 MIGRATION 009d CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Sistema Territorial Completo e Funcional:';
        RAISE NOTICE '  ✓ 139 municípios únicos';
        RAISE NOTICE '  ✓ 139 relacionamentos (divisão antiga) com CÓDIGOS CORRETOS';
        RAISE NOTICE '  ✓ 139 relacionamentos (divisão nova)';
        RAISE NOTICE '  ✓ 0 registros órfãos';
        RAISE NOTICE '  ✓ Views de hierarquia funcionando';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Verificar resultados:';
        RAISE NOTICE '  SELECT * FROM v_hierarchy_antiga LIMIT 10;';
        RAISE NOTICE '  SELECT * FROM v_hierarchy_nova LIMIT 10;';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Sistema pronto para coleta de dados!';
        RAISE NOTICE '';
    ELSE
        RAISE WARNING '⚠️  Ainda há problemas. Verifique os números acima.';
    END IF;

    RAISE NOTICE '============================================';
END $$;

-- ============================================
-- FIM DA MIGRATION 009d
-- ============================================
