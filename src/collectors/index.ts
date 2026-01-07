/**
 * Script Principal de Coleta de Dados
 * Tocantins Integrado - Sistema de Coleta de Dados Oficiais
 *
 * Este script coordena a coleta de dados de múltiplas fontes oficiais
 * e gera SQL para popular o banco de dados.
 *
 * Uso:
 *   npx ts-node src/collectors/index.ts [--years=2020,2021,2022,2023,2024] [--output=sql|json]
 */

import { IBGESidraCollector } from './sources/IBGESidraCollector';
import { AtlasBrasilCollector } from './sources/AtlasBrasilCollector';
import { INEPCollector } from './sources/INEPCollector';
import { DataSUSCollector } from './sources/DataSUSCollector';
import { SNISCollector } from './sources/SNISCollector';
import { CollectionResult } from './base/BaseCollector';
import { TOCANTINS_MUNICIPALITIES } from './config/municipalities';
import * as fs from 'fs';
import * as path from 'path';

interface CollectionSummary {
  source: string;
  indicators: string[];
  total_records: number;
  official_records: number;
  estimated_records: number;
  unavailable_records: number;
  errors: string[];
}

class DataCollectionRunner {
  private results: CollectionResult[] = [];
  private summaries: CollectionSummary[] = [];
  private years: number[];

  constructor(years: number[] = [2020, 2021, 2022, 2023, 2024]) {
    this.years = years;
  }

  /**
   * Executar coleta de todas as fontes
   */
  async runAll(): Promise<void> {
    console.log('='.repeat(60));
    console.log('TOCANTINS INTEGRADO - Sistema de Coleta de Dados');
    console.log('='.repeat(60));
    console.log(`Anos: ${this.years.join(', ')}`);
    console.log(`Municípios: ${TOCANTINS_MUNICIPALITIES.length}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    // 1. IBGE Sidra - PIB e População
    await this.runCollector(new IBGESidraCollector(), 'IBGE Sidra');

    // 2. Atlas Brasil - IDH
    await this.runCollector(new AtlasBrasilCollector(), 'Atlas Brasil');

    // 3. INEP - IDEB
    await this.runCollector(new INEPCollector(), 'INEP');

    // 4. DataSUS - Mortalidade Infantil
    await this.runCollector(new DataSUSCollector(), 'DataSUS');

    // 5. SNIS - Saneamento
    await this.runCollector(new SNISCollector(), 'SNIS');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('RESUMO DA COLETA');
    console.log('='.repeat(60));
    console.log(`Tempo total: ${elapsed}s`);
    console.log(`Total de registros: ${this.results.length}`);
    console.log(`  - Oficiais: ${this.results.filter(r => r.data_quality === 'official').length}`);
    console.log(`  - Estimados: ${this.results.filter(r => r.data_quality === 'estimated').length}`);
    console.log(`  - Indisponíveis: ${this.results.filter(r => r.data_quality === 'unavailable').length}`);

    // Resumo por fonte
    console.log('\nPor fonte:');
    for (const summary of this.summaries) {
      console.log(`  ${summary.source}: ${summary.total_records} registros (${summary.official_records} oficiais)`);
    }
  }

  /**
   * Executar um coletor específico
   */
  private async runCollector(collector: any, name: string): Promise<void> {
    console.log(`\n[${name}] Iniciando coleta...`);

    try {
      const results = await collector.collect(this.years);
      this.results.push(...results);

      const summary: CollectionSummary = {
        source: name,
        indicators: collector.indicatorCodes,
        total_records: results.length,
        official_records: results.filter((r: CollectionResult) => r.data_quality === 'official').length,
        estimated_records: results.filter((r: CollectionResult) => r.data_quality === 'estimated').length,
        unavailable_records: results.filter((r: CollectionResult) => r.data_quality === 'unavailable').length,
        errors: []
      };

      this.summaries.push(summary);
      console.log(`[${name}] Concluído: ${results.length} registros`);
    } catch (error) {
      console.error(`[${name}] ERRO: ${(error as Error).message}`);
      this.summaries.push({
        source: name,
        indicators: [],
        total_records: 0,
        official_records: 0,
        estimated_records: 0,
        unavailable_records: 0,
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Gerar SQL para inserção no banco
   */
  generateSQL(): string {
    const lines: string[] = [
      '-- ==============================================',
      '-- Dados Coletados - Tocantins Integrado',
      `-- Gerado em: ${new Date().toISOString()}`,
      `-- Total de registros: ${this.results.length}`,
      '-- ==============================================',
      '',
      '-- IMPORTANTE: Execute após as migrations e seeds de municípios',
      '',
      'BEGIN;',
      ''
    ];

    // Agrupar por indicador
    const byIndicator = new Map<string, CollectionResult[]>();
    for (const result of this.results) {
      const key = result.indicator_code;
      if (!byIndicator.has(key)) {
        byIndicator.set(key, []);
      }
      byIndicator.get(key)!.push(result);
    }

    // Gerar INSERTs por indicador
    for (const [indicator, records] of byIndicator) {
      lines.push(`-- ${indicator}: ${records.length} registros`);
      lines.push(`INSERT INTO indicator_values (indicator_id, municipality_id, year, value, data_quality, notes, created_at)`);
      lines.push('SELECT');
      lines.push('  id.id as indicator_id,');
      lines.push('  m.id as municipality_id,');
      lines.push('  v.year,');
      lines.push('  v.value,');
      lines.push("  v.data_quality::varchar(20),");
      lines.push('  v.notes,');
      lines.push('  NOW()');
      lines.push('FROM (VALUES');

      const values: string[] = [];
      for (const record of records) {
        if (record.value === null) continue;

        const valueStr = record.value.toString();
        const notes = record.notes ? record.notes.replace(/'/g, "''") : '';
        values.push(
          `  ('${record.municipality_ibge}', ${record.year}, ${valueStr}, '${record.data_quality}', '${notes}')`
        );
      }

      lines.push(values.join(',\n'));
      lines.push(') AS v(ibge_code, year, value, data_quality, notes)');
      lines.push(`JOIN indicator_definitions id ON id.code = '${indicator}'`);
      lines.push('JOIN municipalities m ON m.ibge_code = v.ibge_code');
      lines.push('ON CONFLICT (indicator_id, municipality_id, year, month) DO UPDATE SET');
      lines.push('  value = EXCLUDED.value,');
      lines.push('  data_quality = EXCLUDED.data_quality,');
      lines.push('  notes = EXCLUDED.notes,');
      lines.push('  updated_at = NOW();');
      lines.push('');
    }

    // Atualizar rankings
    lines.push('-- Atualizar rankings estaduais');
    lines.push('UPDATE indicator_values iv SET');
    lines.push('  rank_state = subq.rank_state,');
    lines.push('  percentile_state = subq.percentile_state');
    lines.push('FROM (');
    lines.push('  SELECT');
    lines.push('    id,');
    lines.push('    RANK() OVER (PARTITION BY indicator_id, year ORDER BY value DESC) as rank_state,');
    lines.push('    PERCENT_RANK() OVER (PARTITION BY indicator_id, year ORDER BY value) * 100 as percentile_state');
    lines.push('  FROM indicator_values');
    lines.push(') subq');
    lines.push('WHERE iv.id = subq.id;');
    lines.push('');

    // Atualizar médias estaduais
    lines.push('-- Calcular médias estaduais');
    lines.push('INSERT INTO state_averages (indicator_id, year, avg_value, min_value, max_value, std_dev, municipality_count)');
    lines.push('SELECT');
    lines.push('  indicator_id,');
    lines.push('  year,');
    lines.push('  AVG(value),');
    lines.push('  MIN(value),');
    lines.push('  MAX(value),');
    lines.push('  STDDEV(value),');
    lines.push('  COUNT(*)');
    lines.push('FROM indicator_values');
    lines.push('WHERE value IS NOT NULL');
    lines.push('GROUP BY indicator_id, year');
    lines.push('ON CONFLICT (indicator_id, year) DO UPDATE SET');
    lines.push('  avg_value = EXCLUDED.avg_value,');
    lines.push('  min_value = EXCLUDED.min_value,');
    lines.push('  max_value = EXCLUDED.max_value,');
    lines.push('  std_dev = EXCLUDED.std_dev,');
    lines.push('  municipality_count = EXCLUDED.municipality_count,');
    lines.push('  updated_at = NOW();');
    lines.push('');

    lines.push('COMMIT;');
    lines.push('');
    lines.push(`-- Coleta concluída: ${this.results.length} registros processados`);

    return lines.join('\n');
  }

  /**
   * Gerar JSON com os dados
   */
  generateJSON(): string {
    return JSON.stringify({
      metadata: {
        generated_at: new Date().toISOString(),
        years: this.years,
        total_records: this.results.length,
        summaries: this.summaries
      },
      results: this.results
    }, null, 2);
  }

  /**
   * Salvar resultados em arquivo
   */
  saveToFile(format: 'sql' | 'json' = 'sql'): void {
    const outputDir = path.join(__dirname, '../../database/seeds/collected');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'sql') {
      const filename = `data_collection_${timestamp}.sql`;
      fs.writeFileSync(path.join(outputDir, filename), this.generateSQL());
      console.log(`\nSQL salvo em: ${outputDir}/${filename}`);
    } else {
      const filename = `data_collection_${timestamp}.json`;
      fs.writeFileSync(path.join(outputDir, filename), this.generateJSON());
      console.log(`\nJSON salvo em: ${outputDir}/${filename}`);
    }
  }

  /**
   * Obter resultados
   */
  getResults(): CollectionResult[] {
    return this.results;
  }

  /**
   * Obter resumos
   */
  getSummaries(): CollectionSummary[] {
    return this.summaries;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse argumentos
  let years = [2020, 2021, 2022, 2023, 2024];
  let outputFormat: 'sql' | 'json' = 'sql';

  for (const arg of args) {
    if (arg.startsWith('--years=')) {
      years = arg.replace('--years=', '').split(',').map(Number);
    }
    if (arg.startsWith('--output=')) {
      outputFormat = arg.replace('--output=', '') as 'sql' | 'json';
    }
  }

  const runner = new DataCollectionRunner(years);

  runner.runAll()
    .then(() => {
      runner.saveToFile(outputFormat);
    })
    .catch(error => {
      console.error('Erro na execução:', error);
      process.exit(1);
    });
}

export { DataCollectionRunner, CollectionResult };
