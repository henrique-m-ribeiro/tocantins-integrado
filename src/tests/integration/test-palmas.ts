/**
 * Teste de Coleta - Palmas (Município Piloto)
 * Tocantins Integrado
 *
 * Executa coleta de dados apenas para Palmas (1721000)
 * como teste piloto antes da execução completa para os 139 municípios.
 *
 * Uso:
 *   npx ts-node src/tests/integration/test-palmas.ts
 *   npx ts-node src/tests/integration/test-palmas.ts --output=json
 *   npx ts-node src/tests/integration/test-palmas.ts --output=sql
 */

import { IBGESidraCollector } from '../../collectors/sources/IBGESidraCollector';
import { AtlasBrasilCollector } from '../../collectors/sources/AtlasBrasilCollector';
import { INEPCollector } from '../../collectors/sources/INEPCollector';
import { DataSUSCollector } from '../../collectors/sources/DataSUSCollector';
import { SNISCollector } from '../../collectors/sources/SNISCollector';
import { MapBiomasCollector } from '../../collectors/sources/MapBiomasCollector';
import { SICONFICollector } from '../../collectors/sources/SICONFICollector';
import { ComexStatCollector } from '../../collectors/sources/ComexStatCollector';
import { CollectionResult } from '../../collectors/base/BaseCollector';
import * as fs from 'fs';
import * as path from 'path';

// Configuração
const PALMAS_IBGE = '1721000';
const YEARS = [2019, 2020, 2021, 2022, 2023];

interface CollectorInfo {
  name: string;
  collector: any;
  priority: 'high' | 'medium' | 'low';
  timeout: number;
}

// Cores para output
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

class PalmasPilotTest {
  private results: CollectionResult[] = [];
  private outputFormat: 'console' | 'json' | 'sql';
  private startTime: number = 0;

  constructor(args: string[]) {
    const outputArg = args.find(a => a.startsWith('--output='));
    this.outputFormat = (outputArg?.split('=')[1] as any) || 'console';
  }

  async run(): Promise<void> {
    this.startTime = Date.now();

    console.log(`\n${c.cyan}╔═══════════════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}║     TESTE PILOTO - COLETA DE DADOS PARA PALMAS (TO)          ║${c.reset}`);
    console.log(`${c.cyan}╚═══════════════════════════════════════════════════════════════╝${c.reset}\n`);

    console.log(`${c.blue}Configuração:${c.reset}`);
    console.log(`  Município: Palmas (${PALMAS_IBGE})`);
    console.log(`  Anos: ${YEARS.join(', ')}`);
    console.log(`  Output: ${this.outputFormat}\n`);

    const collectors: CollectorInfo[] = [
      // Alta prioridade - APIs mais estáveis
      { name: 'IBGE Sidra', collector: new IBGESidraCollector(), priority: 'high', timeout: 60000 },
      { name: 'MapBiomas', collector: new MapBiomasCollector(), priority: 'high', timeout: 30000 },
      { name: 'SICONFI', collector: new SICONFICollector(), priority: 'high', timeout: 60000 },

      // Média prioridade
      { name: 'Atlas Brasil', collector: new AtlasBrasilCollector(), priority: 'medium', timeout: 30000 },
      { name: 'INEP', collector: new INEPCollector(), priority: 'medium', timeout: 30000 },
      { name: 'Comex Stat', collector: new ComexStatCollector(), priority: 'medium', timeout: 30000 },

      // Baixa prioridade - APIs podem ter problemas
      { name: 'DataSUS', collector: new DataSUSCollector(), priority: 'low', timeout: 60000 },
      { name: 'SNIS', collector: new SNISCollector(), priority: 'low', timeout: 60000 },
    ];

    // Executar coletores
    for (const info of collectors) {
      await this.runCollector(info);
    }

    // Gerar output
    await this.generateOutput();

    // Resumo final
    this.printSummary();
  }

  private async runCollector(info: CollectorInfo): Promise<void> {
    const { name, collector, priority, timeout } = info;
    const priorityIcon = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';

    console.log(`\n${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`${priorityIcon} ${c.cyan}${name}${c.reset} ${c.dim}(${priority} priority)${c.reset}`);
    console.log(`${c.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);

    const collectorStart = Date.now();

    try {
      let results: CollectionResult[];

      // Usar método específico para município se disponível
      if (typeof collector.collectForMunicipality === 'function') {
        results = await collector.collectForMunicipality(PALMAS_IBGE, YEARS);
      } else {
        // Coletar todos e filtrar (menos eficiente)
        const allResults = await collector.collect(YEARS);
        results = allResults.filter(r => r.municipality_ibge === PALMAS_IBGE);
      }

      const duration = Date.now() - collectorStart;

      // Agrupar por indicador
      const byIndicator = new Map<string, CollectionResult[]>();
      for (const r of results) {
        const existing = byIndicator.get(r.indicator_code) || [];
        existing.push(r);
        byIndicator.set(r.indicator_code, existing);
      }

      console.log(`\n  ${c.green}✓${c.reset} Coleta concluída em ${(duration / 1000).toFixed(2)}s`);
      console.log(`  ${c.dim}${results.length} registros coletados${c.reset}\n`);

      // Mostrar indicadores
      console.log(`  ${c.yellow}Indicadores:${c.reset}`);
      for (const [indicator, records] of byIndicator) {
        const official = records.filter(r => r.data_quality === 'official').length;
        const estimated = records.filter(r => r.data_quality === 'estimated').length;
        const unavailable = records.filter(r => r.data_quality === 'unavailable').length;

        const qualityStr = [];
        if (official > 0) qualityStr.push(`${c.green}${official} oficial${c.reset}`);
        if (estimated > 0) qualityStr.push(`${c.yellow}${estimated} estimado${c.reset}`);
        if (unavailable > 0) qualityStr.push(`${c.dim}${unavailable} indisponível${c.reset}`);

        console.log(`    • ${indicator}: ${qualityStr.join(', ')}`);

        // Mostrar valores
        const validRecords = records.filter(r => r.value !== null).sort((a, b) => a.year - b.year);
        if (validRecords.length > 0) {
          const values = validRecords.map(r => `${r.year}: ${this.formatValue(r.value)}`);
          console.log(`      ${c.dim}${values.join(' | ')}${c.reset}`);
        }
      }

      this.results.push(...results);

    } catch (error) {
      const duration = Date.now() - collectorStart;
      console.log(`\n  ${c.red}✗${c.reset} Erro após ${(duration / 1000).toFixed(2)}s`);
      console.log(`    ${c.red}${(error as Error).message}${c.reset}`);
    }
  }

  private formatValue(value: number | null): string {
    if (value === null) return '-';
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    if (value < 1 && value > 0) return value.toFixed(2);
    return value.toLocaleString('pt-BR');
  }

  private async generateOutput(): Promise<void> {
    if (this.outputFormat === 'console') return;

    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (this.outputFormat === 'json') {
      const filePath = path.join(outputDir, `palmas-${timestamp}.json`);
      const output = {
        municipality: {
          ibge_code: PALMAS_IBGE,
          name: 'Palmas'
        },
        collected_at: new Date().toISOString(),
        years: YEARS,
        total_records: this.results.length,
        by_quality: {
          official: this.results.filter(r => r.data_quality === 'official').length,
          estimated: this.results.filter(r => r.data_quality === 'estimated').length,
          unavailable: this.results.filter(r => r.data_quality === 'unavailable').length,
        },
        data: this.results
      };

      fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
      console.log(`\n${c.green}✓${c.reset} JSON salvo em: ${filePath}`);
    }

    if (this.outputFormat === 'sql') {
      const filePath = path.join(outputDir, `palmas-${timestamp}.sql`);
      const lines: string[] = [
        '-- Dados coletados para Palmas (TO)',
        `-- Gerado em: ${new Date().toISOString()}`,
        `-- Total de registros: ${this.results.length}`,
        '',
        '-- Limpar dados anteriores (opcional)',
        `-- DELETE FROM indicator_values WHERE municipality_ibge = '${PALMAS_IBGE}';`,
        '',
        'INSERT INTO indicator_values (indicator_code, municipality_ibge, year, month, value, source, source_url, collection_date, data_quality, notes)',
        'VALUES'
      ];

      const values = this.results.map((r, i) => {
        const value = r.value !== null ? r.value : 'NULL';
        const month = r.month !== undefined ? r.month : 'NULL';
        const notes = r.notes ? `'${r.notes.replace(/'/g, "''")}'` : 'NULL';
        const comma = i < this.results.length - 1 ? ',' : ';';

        return `  ('${r.indicator_code}', '${r.municipality_ibge}', ${r.year}, ${month}, ${value}, '${r.source}', '${r.source_url}', '${r.collection_date}', '${r.data_quality}', ${notes})${comma}`;
      });

      lines.push(...values);
      lines.push('');
      lines.push('-- ON CONFLICT (indicator_code, municipality_ibge, year, month)');
      lines.push('-- DO UPDATE SET value = EXCLUDED.value, data_quality = EXCLUDED.data_quality, collection_date = EXCLUDED.collection_date;');

      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`\n${c.green}✓${c.reset} SQL salvo em: ${filePath}`);
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;

    console.log(`\n${c.cyan}╔═══════════════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}║                        RESUMO FINAL                           ║${c.reset}`);
    console.log(`${c.cyan}╚═══════════════════════════════════════════════════════════════╝${c.reset}\n`);

    const official = this.results.filter(r => r.data_quality === 'official').length;
    const estimated = this.results.filter(r => r.data_quality === 'estimated').length;
    const unavailable = this.results.filter(r => r.data_quality === 'unavailable').length;

    const indicators = [...new Set(this.results.map(r => r.indicator_code))];
    const sources = [...new Set(this.results.map(r => r.source))];

    console.log(`  ${c.blue}Município:${c.reset} Palmas (${PALMAS_IBGE})`);
    console.log(`  ${c.blue}Período:${c.reset} ${Math.min(...YEARS)} - ${Math.max(...YEARS)}`);
    console.log(`  ${c.blue}Tempo total:${c.reset} ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('');
    console.log(`  ${c.blue}Registros coletados:${c.reset}`);
    console.log(`    • Total: ${this.results.length}`);
    console.log(`    • ${c.green}Oficiais: ${official}${c.reset}`);
    console.log(`    • ${c.yellow}Estimados: ${estimated}${c.reset}`);
    console.log(`    • ${c.dim}Indisponíveis: ${unavailable}${c.reset}`);
    console.log('');
    console.log(`  ${c.blue}Cobertura:${c.reset}`);
    console.log(`    • Indicadores: ${indicators.length}`);
    console.log(`    • Fontes: ${sources.length} (${sources.join(', ')})`);
    console.log('');

    // Indicadores por dimensão
    const byDimension = {
      ECON: indicators.filter(i => ['PIB', 'VAB', 'POPULACAO', 'RECEITA', 'DESPESA', 'EXPORTA', 'IMPORTA', 'BALANCA', 'INDICE_DEPENDENCIA'].some(k => i.includes(k))),
      SOCIAL: indicators.filter(i => ['IDEB', 'IDH', 'MORTALIDADE', 'ESF', 'AGUA', 'ESGOTO'].some(k => i.includes(k))),
      TERRA: indicators.filter(i => ['AREA_URBANA'].some(k => i.includes(k))),
      AMBIENT: indicators.filter(i => ['VEGETACAO', 'DESMATAMENTO', 'AGRICULTURA', 'PASTAGEM'].some(k => i.includes(k))),
    };

    console.log(`  ${c.blue}Indicadores por dimensão:${c.reset}`);
    for (const [dim, inds] of Object.entries(byDimension)) {
      if (inds.length > 0) {
        console.log(`    • ${dim}: ${inds.length} (${inds.slice(0, 3).join(', ')}${inds.length > 3 ? '...' : ''})`);
      }
    }

    console.log('\n');

    if (this.results.length > 0) {
      console.log(`${c.green}✓ Teste piloto concluído com sucesso!${c.reset}`);
      console.log(`${c.dim}  Execute para todos os municípios: npx ts-node src/collectors/index.ts${c.reset}\n`);
    } else {
      console.log(`${c.red}✗ Nenhum dado coletado. Verifique a conectividade com as APIs.${c.reset}\n`);
    }
  }
}

// Executar
const test = new PalmasPilotTest(process.argv.slice(2));
test.run().catch(console.error);
