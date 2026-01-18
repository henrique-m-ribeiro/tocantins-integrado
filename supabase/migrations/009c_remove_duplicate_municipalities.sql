-- ============================================
-- Migration 009c: CORREÇÃO - Remover Município Duplicado
-- ============================================
-- Problema: 140 municípios criados em vez de 139
-- Causa: Palmas foi criado pela Migration 009 e novamente pela 009b
-- Solução: Identificar e remover duplicatas
--
-- Data: 2026-01-18
-- ============================================

-- ============================================
-- PASSO 1: IDENTIFICAR DUPLICATAS
-- ============================================

-- Listar municípios duplicados (mesmo ibge_code)
DO $$
DECLARE
    rec RECORD;
    v_total_duplicatas INTEGER;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ANÁLISE DE DUPLICATAS';
    RAISE NOTICE '============================================';

    -- Contar duplicatas
    SELECT COUNT(*) INTO v_total_duplicatas
    FROM (
        SELECT ibge_code, COUNT(*) as qtd
        FROM territories
        WHERE type = 'municipio'
        GROUP BY ibge_code
        HAVING COUNT(*) > 1
    ) duplicatas;

    RAISE NOTICE 'Total de códigos IBGE duplicados: %', v_total_duplicatas;
    RAISE NOTICE '';

    -- Listar cada duplicata com detalhes
    FOR rec IN
        SELECT
            t.ibge_code,
            t.name,
            COUNT(*) as quantidade,
            string_agg(t.id::text, ', ') as ids
        FROM territories t
        WHERE t.type = 'municipio'
        GROUP BY t.ibge_code, t.name
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'DUPLICATA ENCONTRADA:';
        RAISE NOTICE '  IBGE Code: %', rec.ibge_code;
        RAISE NOTICE '  Nome: %', rec.name;
        RAISE NOTICE '  Quantidade: %', rec.quantidade;
        RAISE NOTICE '  IDs: %', rec.ids;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- ============================================
-- PASSO 2: REMOVER DUPLICATAS
-- ============================================

-- Estratégia: Manter o registro mais antigo (menor created_at) e deletar os demais
-- Isso preserva relacionamentos que possam existir no registro original

WITH duplicados AS (
    SELECT
        ibge_code,
        type,
        name,
        ARRAY_AGG(id ORDER BY created_at ASC) as ids_ordenados,
        COUNT(*) as quantidade
    FROM territories
    WHERE type = 'municipio'
    GROUP BY ibge_code, type, name
    HAVING COUNT(*) > 1
),
ids_para_deletar AS (
    -- Pegar todos os IDs exceto o primeiro (mais antigo)
    SELECT
        UNNEST(ids_ordenados[2:]) as id_deletar,
        ibge_code,
        name
    FROM duplicados
)
DELETE FROM territories
WHERE id IN (SELECT id_deletar FROM ids_para_deletar);

-- ============================================
-- PASSO 3: GARANTIR RELACIONAMENTOS CORRETOS
-- ============================================

-- Como deletamos municípios duplicados, precisamos garantir que
-- TODOS os 139 municípios tenham relacionamentos nas duas divisões

-- 3.1. Verificar e criar relacionamentos faltantes (divisão antiga)
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
WHERE NOT EXISTS (
    SELECT 1 FROM territory_relationships tr
    WHERE tr.child_territory_id = t_muni.id
      AND tr.parent_territory_id = t_micro.id
      AND tr.division_scheme = 'antiga'
);

-- 3.2. Verificar e criar relacionamentos faltantes (divisão nova)
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
WHERE NOT EXISTS (
    SELECT 1 FROM territory_relationships tr
    WHERE tr.child_territory_id = t_muni.id
      AND tr.parent_territory_id = t_imediata.id
      AND tr.division_scheme = 'nova'
);

-- ============================================
-- PASSO 4: VALIDAÇÃO FINAL
-- ============================================

DO $$
DECLARE
    v_total_municipios INTEGER;
    v_municipios_sem_micro INTEGER;
    v_municipios_sem_imediata INTEGER;
    v_total_duplicatas INTEGER;
BEGIN
    -- Contar municípios
    SELECT COUNT(*) INTO v_total_municipios FROM territories WHERE type = 'municipio';

    -- Contar duplicatas restantes
    SELECT COUNT(*) INTO v_total_duplicatas
    FROM (
        SELECT ibge_code
        FROM territories
        WHERE type = 'municipio'
        GROUP BY ibge_code
        HAVING COUNT(*) > 1
    ) dup;

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
    RAISE NOTICE 'VALIDAÇÃO FINAL - Migration 009c';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de municípios: % (esperado: 139)', v_total_municipios;
    RAISE NOTICE 'Duplicatas restantes: % (esperado: 0)', v_total_duplicatas;
    RAISE NOTICE 'Municípios sem microrregião (antiga): % (esperado: 0)', v_municipios_sem_micro;
    RAISE NOTICE 'Municípios sem região imediata (nova): % (esperado: 0)', v_municipios_sem_imediata;
    RAISE NOTICE '============================================';

    IF v_total_municipios = 139 AND v_total_duplicatas = 0 AND v_municipios_sem_micro = 0 AND v_municipios_sem_imediata = 0 THEN
        RAISE NOTICE '✅ CORREÇÃO 009c CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE 'Sistema pronto para uso:';
        RAISE NOTICE '  - 139 municípios únicos';
        RAISE NOTICE '  - Todos com relacionamentos nas 2 divisões';
        RAISE NOTICE '  - Nenhuma duplicata';
    ELSE
        RAISE WARNING '⚠️  Ainda há problemas. Verifique os números acima.';
    END IF;
END $$;

-- ============================================
-- FIM DA MIGRATION 009c
-- ============================================
