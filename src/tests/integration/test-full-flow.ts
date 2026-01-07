/**
 * Teste de Integração - Fluxo Completo
 * Tocantins Integrado
 *
 * Este script testa o fluxo completo do sistema:
 * 1. Coleta de dados (todos os coletores)
 * 2. Persistência no banco (Supabase)
 * 3. API de consulta
 * 4. Webhook do orquestrador n8n
 *
 * Uso:
 *   npx ts-node src/tests/integration/test-full-flow.ts
 *   npx ts-node src/tests/integration/test-full-flow.ts --municipality=1721000
 *   npx ts-node src/tests/integration/test-full-flow.ts --skip-db --skip-api
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

// Configuração
const CONFIG = {
  // Município de teste padrão: Palmas
  DEFAULT_MUNICIPALITY: '1721000',
  DEFAULT_YEARS: [2020, 2021, 2022],

  // URLs de serviços
  SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_KEY: process.env.SUPABASE_ANON_KEY || '',
  N8N_URL: process.env.N8N_URL || 'http://localhost:5678',
  ORCHESTRATOR_WEBHOOK: process.env.N8N_ORCHESTRATOR_PATH || '/webhook/orchestrator',

  // Timeouts
  API_TIMEOUT: 30000,
  WEBHOOK_TIMEOUT: 60000,
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  message: string;
  details?: any;
}

class IntegrationTester {
  private results: TestResult[] = [];
  private municipalityCode: string;
  private years: number[];
  private skipDb: boolean;
  private skipApi: boolean;
  private skipWebhook: boolean;
  private collectedData: CollectionResult[] = [];

  constructor(args: string[]) {
    // Parse argumentos
    this.municipalityCode = this.getArg(args, '--municipality') || CONFIG.DEFAULT_MUNICIPALITY;
    this.years = (this.getArg(args, '--years') || CONFIG.DEFAULT_YEARS.join(',')).split(',').map(Number);
    this.skipDb = args.includes('--skip-db');
    this.skipApi = args.includes('--skip-api');
    this.skipWebhook = args.includes('--skip-webhook');
  }

  private getArg(args: string[], name: string): string | null {
    const arg = args.find(a => a.startsWith(name + '='));
    return arg ? arg.split('=')[1] : null;
  }

  async run(): Promise<void> {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  TOCANTINS INTEGRADO - Teste de Integração Completo${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.blue}Configuração:${colors.reset}`);
    console.log(`  Município: ${this.municipalityCode}`);
    console.log(`  Anos: ${this.years.join(', ')}`);
    console.log(`  Skip DB: ${this.skipDb}`);
    console.log(`  Skip API: ${this.skipApi}`);
    console.log(`  Skip Webhook: ${this.skipWebhook}\n`);

    // 1. Testar Coletores
    console.log(`\n${colors.yellow}▶ FASE 1: Teste dos Coletores${colors.reset}\n`);
    await this.testCollectors();

    // 2. Testar Persistência (se não pulado)
    if (!this.skipDb) {
      console.log(`\n${colors.yellow}▶ FASE 2: Teste de Persistência${colors.reset}\n`);
      await this.testPersistence();
    }

    // 3. Testar API (se não pulado)
    if (!this.skipApi) {
      console.log(`\n${colors.yellow}▶ FASE 3: Teste da API${colors.reset}\n`);
      await this.testAPI();
    }

    // 4. Testar Webhook n8n (se não pulado)
    if (!this.skipWebhook) {
      console.log(`\n${colors.yellow}▶ FASE 4: Teste do Webhook n8n${colors.reset}\n`);
      await this.testWebhook();
    }

    // Resumo
    this.printSummary();
  }

  /**
   * Testar todos os coletores
   */
  private async testCollectors(): Promise<void> {
    const collectors = [
      { name: 'IBGE Sidra', collector: new IBGESidraCollector() },
      { name: 'Atlas Brasil', collector: new AtlasBrasilCollector() },
      { name: 'INEP', collector: new INEPCollector() },
      { name: 'DataSUS', collector: new DataSUSCollector() },
      { name: 'SNIS', collector: new SNISCollector() },
      { name: 'MapBiomas', collector: new MapBiomasCollector() },
      { name: 'SICONFI', collector: new SICONFICollector() },
      { name: 'Comex Stat', collector: new ComexStatCollector() },
    ];

    for (const { name, collector } of collectors) {
      await this.testCollector(name, collector);
    }
  }

  private async testCollector(name: string, collector: any): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`  ${colors.blue}▸${colors.reset} Testando ${name}...`);

      // Verificar se tem método para coletar município específico
      let results: CollectionResult[];

      if (typeof collector.collectForMunicipality === 'function') {
        results = await collector.collectForMunicipality(this.municipalityCode, this.years);
      } else {
        // Coletar todos e filtrar
        results = await collector.collect(this.years);
        results = results.filter(r => r.municipality_ibge === this.municipalityCode);
      }

      const duration = Date.now() - startTime;
      const officialCount = results.filter(r => r.data_quality === 'official').length;
      const estimatedCount = results.filter(r => r.data_quality === 'estimated').length;
      const unavailableCount = results.filter(r => r.data_quality === 'unavailable').length;

      // Armazenar para uso posterior
      this.collectedData.push(...results);

      const success = results.length > 0;
      const message = success
        ? `${results.length} registros (${officialCount} oficiais, ${estimatedCount} estimados, ${unavailableCount} indisponíveis)`
        : 'Nenhum dado coletado';

      this.addResult(name, success, duration, message, {
        total: results.length,
        official: officialCount,
        estimated: estimatedCount,
        unavailable: unavailableCount,
        indicators: [...new Set(results.map(r => r.indicator_code))]
      });

      console.log(`    ${success ? colors.green + '✓' : colors.red + '✗'} ${message} (${duration}ms)${colors.reset}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = `Erro: ${(error as Error).message}`;
      this.addResult(name, false, duration, message);
      console.log(`    ${colors.red}✗ ${message} (${duration}ms)${colors.reset}`);
    }
  }

  /**
   * Testar persistência no banco
   */
  private async testPersistence(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`  ${colors.blue}▸${colors.reset} Testando conexão com Supabase...`);

      if (!CONFIG.SUPABASE_KEY) {
        throw new Error('SUPABASE_ANON_KEY não configurada');
      }

      // Testar conexão
      const healthUrl = `${CONFIG.SUPABASE_URL}/rest/v1/`;
      const response = await fetch(healthUrl, {
        headers: {
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Testar inserção de dados
      console.log(`  ${colors.blue}▸${colors.reset} Testando inserção de dados...`);

      const testData = this.collectedData.slice(0, 5).map(d => ({
        indicator_code: d.indicator_code,
        municipality_ibge: d.municipality_ibge,
        year: d.year,
        month: d.month || null,
        value: d.value,
        source: d.source,
        source_url: d.source_url,
        collection_date: d.collection_date,
        data_quality: d.data_quality,
        notes: d.notes || null
      }));

      if (testData.length > 0) {
        const insertUrl = `${CONFIG.SUPABASE_URL}/rest/v1/indicator_values`;
        const insertResponse = await fetch(insertUrl, {
          method: 'POST',
          headers: {
            'apikey': CONFIG.SUPABASE_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(testData)
        });

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text();
          throw new Error(`Inserção falhou: ${errorText}`);
        }
      }

      const duration = Date.now() - startTime;
      this.addResult('Persistência Supabase', true, duration, `${testData.length} registros inseridos`);
      console.log(`    ${colors.green}✓ Conexão e inserção bem-sucedidas (${duration}ms)${colors.reset}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = `Erro: ${(error as Error).message}`;
      this.addResult('Persistência Supabase', false, duration, message);
      console.log(`    ${colors.red}✗ ${message} (${duration}ms)${colors.reset}`);
    }
  }

  /**
   * Testar API de consulta
   */
  private async testAPI(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`  ${colors.blue}▸${colors.reset} Testando API de indicadores...`);

      if (!CONFIG.SUPABASE_KEY) {
        throw new Error('SUPABASE_ANON_KEY não configurada');
      }

      // Buscar indicadores do município
      const url = `${CONFIG.SUPABASE_URL}/rest/v1/indicator_values?municipality_ibge=eq.${this.municipalityCode}&limit=10`;

      const response = await fetch(url, {
        headers: {
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      this.addResult('API de Indicadores', true, duration, `${data.length} registros retornados`);
      console.log(`    ${colors.green}✓ API respondeu com ${data.length} registros (${duration}ms)${colors.reset}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = `Erro: ${(error as Error).message}`;
      this.addResult('API de Indicadores', false, duration, message);
      console.log(`    ${colors.red}✗ ${message} (${duration}ms)${colors.reset}`);
    }
  }

  /**
   * Testar webhook do orquestrador n8n
   */
  private async testWebhook(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`  ${colors.blue}▸${colors.reset} Testando webhook n8n...`);

      const webhookUrl = `${CONFIG.N8N_URL}${CONFIG.ORCHESTRATOR_WEBHOOK}`;

      const testPayload = {
        action: 'test',
        municipality_ibge: this.municipalityCode,
        dimensions: ['ECON'],
        test_mode: true
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.WEBHOOK_TIMEOUT);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      this.addResult('Webhook n8n', true, duration, 'Webhook respondeu corretamente', data);
      console.log(`    ${colors.green}✓ Webhook funcionando (${duration}ms)${colors.reset}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      let message = `Erro: ${(error as Error).message}`;

      if ((error as Error).name === 'AbortError') {
        message = 'Timeout - webhook não respondeu';
      }

      // Webhook pode não estar rodando, não é erro crítico
      this.addResult('Webhook n8n', false, duration, message);
      console.log(`    ${colors.yellow}⚠ ${message} (${duration}ms)${colors.reset}`);
      console.log(`      ${colors.yellow}(n8n pode não estar rodando - isso é esperado em ambiente de dev)${colors.reset}`);
    }
  }

  private addResult(name: string, success: boolean, duration: number, message: string, details?: any): void {
    this.results.push({ name, success, duration, message, details });
  }

  private printSummary(): void {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  RESUMO DOS TESTES${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((acc, r) => acc + r.duration, 0);

    for (const result of this.results) {
      const icon = result.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(`  ${icon} ${result.name}: ${result.message}`);
    }

    console.log(`\n${colors.blue}────────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`  Total: ${this.results.length} testes`);
    console.log(`  ${colors.green}Passou: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}Falhou: ${failed}${colors.reset}`);
    console.log(`  Tempo total: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`  Dados coletados: ${this.collectedData.length} registros`);
    console.log(`${colors.blue}────────────────────────────────────────────────────────────────${colors.reset}\n`);

    // Exit code baseado nos resultados
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Executar
const tester = new IntegrationTester(process.argv.slice(2));
tester.run().catch(console.error);
