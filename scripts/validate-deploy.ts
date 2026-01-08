/**
 * Script de Validação Pós-Deploy
 * Tocantins Integrado MVP
 *
 * Executa verificações de:
 * 1. Conexão com Supabase
 * 2. APIs externas (IBGE, SICONFI, DataSUS, INEP)
 * 3. Teste piloto de Palmas
 * 4. Geração de relatório de status
 *
 * Uso: npx ts-node scripts/validate-deploy.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: Record<string, unknown>;
  duration_ms?: number;
}

interface APITestConfig {
  name: string;
  url: string;
  expectedFields?: string[];
}

const PALMAS_IBGE_CODE = '1721000';

const API_TESTS: APITestConfig[] = [
  {
    name: 'IBGE Sidra - População',
    url: `https://apisidra.ibge.gov.br/values/t/6579/n6/${PALMAS_IBGE_CODE}/v/9324/p/2021`,
    expectedFields: ['V', 'D1C', 'D3C'],
  },
  {
    name: 'IBGE Sidra - PIB',
    url: `https://apisidra.ibge.gov.br/values/t/5938/n6/${PALMAS_IBGE_CODE}/v/37/p/2021`,
    expectedFields: ['V', 'D1C', 'D3C'],
  },
  {
    name: 'SICONFI - DCA',
    url: `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?an_exercicio=2022&id_ente=${PALMAS_IBGE_CODE}`,
    expectedFields: ['items'],
  },
  {
    name: 'DataSUS - e-Gestor',
    url: 'https://egestorab.saude.gov.br/gestaoaps/relCobertura.xhtml',
    expectedFields: [],
  },
  {
    name: 'INEP - IDEB',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb/resultados',
    expectedFields: [],
  },
];

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

async function validateSupabaseConnection(): Promise<ValidationResult> {
  const start = Date.now();
  const name = 'Conexão Supabase';

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Variáveis de ambiente SUPABASE_URL ou SUPABASE_KEY não definidas',
        duration_ms: Date.now() - start,
      };
    }

    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

    // Testa conexão com query simples
    const { data, error } = await supabase.from('municipalities').select('count').limit(1);

    if (error) {
      // Tabela pode não existir ainda
      if (error.message.includes('does not exist')) {
        return {
          name,
          status: 'warn',
          message: 'Conexão OK, mas tabela municipalities não existe. Execute migrations.',
          duration_ms: Date.now() - start,
        };
      }
      throw error;
    }

    return {
      name,
      status: 'pass',
      message: 'Conexão com Supabase estabelecida com sucesso',
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      name,
      status: 'fail',
      message: `Erro ao conectar: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms: Date.now() - start,
    };
  }
}

async function validateExternalAPI(config: APITestConfig): Promise<ValidationResult> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(config.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TocantinsIntegrado/1.0',
        Accept: 'application/json, text/html',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        name: config.name,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - start,
      };
    }

    // Para APIs JSON, verifica campos esperados
    if (config.expectedFields && config.expectedFields.length > 0) {
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        const dataToCheck = Array.isArray(data) ? data[1] || data[0] : data;

        const missingFields = config.expectedFields.filter(
          (field) => !(field in dataToCheck)
        );

        if (missingFields.length > 0) {
          return {
            name: config.name,
            status: 'warn',
            message: `Campos ausentes: ${missingFields.join(', ')}`,
            details: { sample: dataToCheck },
            duration_ms: Date.now() - start,
          };
        }
      }
    }

    return {
      name: config.name,
      status: 'pass',
      message: `API acessível (HTTP ${response.status})`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Timeout após 30s'
          : error.message
        : String(error);

    return {
      name: config.name,
      status: 'fail',
      message: `Erro: ${message}`,
      duration_ms: Date.now() - start,
    };
  }
}

async function runPilotTest(): Promise<ValidationResult> {
  const start = Date.now();
  const name = 'Teste Piloto Palmas';

  try {
    // Importa o CollectorManager dinamicamente
    const { CollectorManager } = await import('../src/collectors');

    const manager = new CollectorManager({
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '',
      dryRun: true, // Não persiste
    });

    // Executa coleta apenas para Palmas
    const results = await manager.collectForMunicipality(PALMAS_IBGE_CODE, {
      years: [2021, 2022, 2023],
    });

    const stats = {
      total: results.length,
      official: results.filter((r) => r.data_quality === 'official').length,
      estimated: results.filter((r) => r.data_quality === 'estimated').length,
      unavailable: results.filter((r) => r.data_quality === 'unavailable').length,
    };

    const officialPercent = ((stats.official / stats.total) * 100).toFixed(1);

    return {
      name,
      status: stats.official > 0 ? 'pass' : 'warn',
      message: `${stats.total} registros coletados (${officialPercent}% oficiais)`,
      details: stats,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      name,
      status: 'fail',
      message: `Erro no piloto: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms: Date.now() - start,
    };
  }
}

async function validateDatabaseTables(): Promise<ValidationResult> {
  const start = Date.now();
  const name = 'Tabelas do Banco';

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Variáveis de ambiente não configuradas',
        duration_ms: Date.now() - start,
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const requiredTables = [
      'municipalities',
      'indicators',
      'indicator_values',
      'data_sources',
      'collection_logs',
    ];

    const tableStatus: Record<string, boolean> = {};

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        tableStatus[table] = !error;
      } catch {
        tableStatus[table] = false;
      }
    }

    const existingTables = Object.entries(tableStatus)
      .filter(([, exists]) => exists)
      .map(([name]) => name);
    const missingTables = Object.entries(tableStatus)
      .filter(([, exists]) => !exists)
      .map(([name]) => name);

    if (missingTables.length === 0) {
      return {
        name,
        status: 'pass',
        message: `Todas as ${requiredTables.length} tabelas existem`,
        duration_ms: Date.now() - start,
      };
    } else if (existingTables.length > 0) {
      return {
        name,
        status: 'warn',
        message: `${existingTables.length}/${requiredTables.length} tabelas. Faltam: ${missingTables.join(', ')}`,
        details: { existing: existingTables, missing: missingTables },
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        name,
        status: 'fail',
        message: 'Nenhuma tabela encontrada. Execute npm run migrate',
        duration_ms: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      name,
      status: 'fail',
      message: `Erro: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms: Date.now() - start,
    };
  }
}

// ============================================================================
// GERAÇÃO DE RELATÓRIO
// ============================================================================

function generateReport(results: ValidationResult[]): string {
  const now = new Date().toISOString();
  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'warn':
        return '⚠️';
      case 'fail':
        return '❌';
      default:
        return '❓';
    }
  };

  let report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║           RELATÓRIO DE VALIDAÇÃO PÓS-DEPLOY - TOCANTINS INTEGRADO            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Data: ${now.padEnd(68)}║
║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(64)}║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ RESUMO                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│  Total de verificações: ${results.length.toString().padEnd(52)}│
│  ✅ Passou:  ${passed.toString().padEnd(63)}│
│  ⚠️  Avisos:  ${warned.toString().padEnd(63)}│
│  ❌ Falhou:  ${failed.toString().padEnd(63)}│
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DETALHES                                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
`;

  for (const result of results) {
    report += `
${statusIcon(result.status)} ${result.name}
   Status: ${result.status.toUpperCase()}
   Mensagem: ${result.message}
   Duração: ${result.duration_ms}ms
`;
    if (result.details) {
      report += `   Detalhes: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}\n`;
    }
  }

  // Status geral
  const overallStatus = failed > 0 ? 'FALHOU' : warned > 0 ? 'AVISOS' : 'SUCESSO';
  const overallIcon = failed > 0 ? '❌' : warned > 0 ? '⚠️' : '✅';

  report += `
┌──────────────────────────────────────────────────────────────────────────────┐
│ STATUS GERAL: ${overallIcon} ${overallStatus.padEnd(59)}│
└──────────────────────────────────────────────────────────────────────────────┘
`;

  if (failed > 0) {
    report += `
⚠️  AÇÕES RECOMENDADAS:
`;
    for (const result of results.filter((r) => r.status === 'fail')) {
      if (result.name === 'Conexão Supabase') {
        report += '   • Configure SUPABASE_URL e SUPABASE_KEY nos Secrets do Replit\n';
      } else if (result.name === 'Tabelas do Banco') {
        report += '   • Execute: npm run migrate\n';
      } else if (result.name.includes('API')) {
        report += `   • Verifique conectividade com ${result.name}\n`;
      }
    }
  }

  return report;
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

async function main() {
  console.log('\n🚀 Iniciando validação pós-deploy...\n');

  const results: ValidationResult[] = [];

  // 1. Validar conexão Supabase
  console.log('📡 Testando conexão Supabase...');
  results.push(await validateSupabaseConnection());

  // 2. Validar tabelas do banco
  console.log('📋 Verificando tabelas do banco...');
  results.push(await validateDatabaseTables());

  // 3. Validar APIs externas
  console.log('🌐 Testando APIs externas...');
  for (const apiConfig of API_TESTS) {
    console.log(`   - ${apiConfig.name}...`);
    results.push(await validateExternalAPI(apiConfig));
  }

  // 4. Executar teste piloto
  console.log('🧪 Executando teste piloto Palmas...');
  results.push(await runPilotTest());

  // 5. Gerar relatório
  const report = generateReport(results);
  console.log(report);

  // 6. Salvar relatório em arquivo
  const fs = await import('fs');
  const reportPath = './output/validation-report.txt';

  try {
    fs.mkdirSync('./output', { recursive: true });
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Relatório salvo em: ${reportPath}\n`);
  } catch {
    console.log('⚠️  Não foi possível salvar relatório em arquivo\n');
  }

  // 7. Retornar código de saída apropriado
  const failed = results.filter((r) => r.status === 'fail').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Executar
main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
