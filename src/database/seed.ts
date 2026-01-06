/**
 * Script de Seed - Popula o banco de dados com dados iniciais
 * Tocantins Integrado - MVP v1.0
 */

import { getServiceClient } from './client';
import { MESOREGIONS, MICROREGIONS, MUNICIPALITIES, calculateDensity } from './seeds/regions';
import { INDICATOR_CATEGORIES, INDICATOR_DEFINITIONS } from './seeds/indicators';

interface SeedResult {
  table: string;
  inserted: number;
  errors: number;
  duration_ms: number;
}

async function seedDatabase(): Promise<void> {
  console.log('🌱 Iniciando seed do banco de dados Tocantins Integrado...\n');

  const supabase = getServiceClient();
  const results: SeedResult[] = [];

  // 1. Seed Mesorregiões
  console.log('📍 Inserindo mesorregiões...');
  const mesoStart = Date.now();
  const { data: mesoData, error: mesoError } = await supabase
    .from('mesoregions')
    .upsert(MESOREGIONS.map(m => ({
      ibge_code: m.ibge_code,
      name: m.name
    })), { onConflict: 'ibge_code' })
    .select();

  results.push({
    table: 'mesoregions',
    inserted: mesoData?.length || 0,
    errors: mesoError ? 1 : 0,
    duration_ms: Date.now() - mesoStart
  });

  if (mesoError) {
    console.error('❌ Erro ao inserir mesorregiões:', mesoError.message);
  } else {
    console.log(`✅ ${mesoData?.length} mesorregiões inseridas`);
  }

  // Mapear IDs das mesorregiões
  const mesoMap = new Map<string, string>();
  mesoData?.forEach(m => mesoMap.set(m.name, m.id));

  // 2. Seed Microrregiões
  console.log('\n📍 Inserindo microrregiões...');
  const microStart = Date.now();
  const microToInsert = MICROREGIONS.map(m => ({
    ibge_code: m.ibge_code,
    name: m.name,
    mesoregion_id: mesoMap.get(m.mesoregion)
  }));

  const { data: microData, error: microError } = await supabase
    .from('microregions')
    .upsert(microToInsert, { onConflict: 'ibge_code' })
    .select();

  results.push({
    table: 'microregions',
    inserted: microData?.length || 0,
    errors: microError ? 1 : 0,
    duration_ms: Date.now() - microStart
  });

  if (microError) {
    console.error('❌ Erro ao inserir microrregiões:', microError.message);
  } else {
    console.log(`✅ ${microData?.length} microrregiões inseridas`);
  }

  // Mapear IDs das microrregiões
  const microMap = new Map<string, string>();
  microData?.forEach(m => microMap.set(m.name, m.id));

  // 3. Seed Municípios
  console.log('\n🏘️ Inserindo municípios...');
  const muniStart = Date.now();
  const muniToInsert = MUNICIPALITIES.map(m => ({
    ibge_code: m.ibge_code,
    name: m.name,
    microregion_id: microMap.get(m.microregion),
    population: m.population,
    area_km2: m.area,
    density: calculateDensity(m.population, m.area),
    latitude: m.lat,
    longitude: m.lon
  }));

  // Inserir em lotes de 50 para evitar timeout
  const batchSize = 50;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < muniToInsert.length; i += batchSize) {
    const batch = muniToInsert.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('municipalities')
      .upsert(batch, { onConflict: 'ibge_code' })
      .select();

    if (error) {
      console.error(`❌ Erro no lote ${i / batchSize + 1}:`, error.message);
      totalErrors++;
    } else {
      totalInserted += data?.length || 0;
    }
  }

  results.push({
    table: 'municipalities',
    inserted: totalInserted,
    errors: totalErrors,
    duration_ms: Date.now() - muniStart
  });

  console.log(`✅ ${totalInserted} municípios inseridos`);

  // 4. Seed Categorias de Indicadores
  console.log('\n📊 Inserindo categorias de indicadores...');
  const catStart = Date.now();
  const catToInsert = INDICATOR_CATEGORIES.map(c => ({
    dimension: c.dimension,
    name: c.name,
    description: c.description,
    display_order: c.order
  }));

  const { data: catData, error: catError } = await supabase
    .from('indicator_categories')
    .upsert(catToInsert, { onConflict: 'dimension,name' })
    .select();

  results.push({
    table: 'indicator_categories',
    inserted: catData?.length || 0,
    errors: catError ? 1 : 0,
    duration_ms: Date.now() - catStart
  });

  if (catError) {
    console.error('❌ Erro ao inserir categorias:', catError.message);
  } else {
    console.log(`✅ ${catData?.length} categorias inseridas`);
  }

  // Mapear IDs das categorias
  const catMap = new Map<string, string>();
  catData?.forEach(c => catMap.set(c.name, c.id));

  // 5. Seed Definições de Indicadores
  console.log('\n📈 Inserindo definições de indicadores...');
  const indStart = Date.now();
  const indToInsert = INDICATOR_DEFINITIONS.map(i => ({
    category_id: catMap.get(i.category_name),
    code: i.code,
    name: i.name,
    description: i.description,
    unit: i.unit,
    source: i.source,
    source_url: i.source_url,
    periodicity: i.periodicity,
    higher_is_better: i.higher_is_better
  })).filter(i => i.category_id); // Filtrar indicadores sem categoria

  const { data: indData, error: indError } = await supabase
    .from('indicator_definitions')
    .upsert(indToInsert, { onConflict: 'code' })
    .select();

  results.push({
    table: 'indicator_definitions',
    inserted: indData?.length || 0,
    errors: indError ? 1 : 0,
    duration_ms: Date.now() - indStart
  });

  if (indError) {
    console.error('❌ Erro ao inserir indicadores:', indError.message);
  } else {
    console.log(`✅ ${indData?.length} indicadores inseridos`);
  }

  // Resumo Final
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMO DO SEED');
  console.log('═'.repeat(50));

  let totalRecords = 0;
  let totalTime = 0;

  for (const result of results) {
    const status = result.errors > 0 ? '⚠️' : '✅';
    console.log(`${status} ${result.table}: ${result.inserted} registros (${result.duration_ms}ms)`);
    totalRecords += result.inserted;
    totalTime += result.duration_ms;
  }

  console.log('─'.repeat(50));
  console.log(`📦 Total: ${totalRecords} registros em ${totalTime}ms`);

  const hasErrors = results.some(r => r.errors > 0);
  if (hasErrors) {
    console.log('\n⚠️ Alguns seeds tiveram erros. Verifique os logs acima.');
    process.exit(1);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
}

// Executar se chamado diretamente
seedDatabase().catch(err => {
  console.error('💥 Erro fatal no seed:', err);
  process.exit(1);
});
