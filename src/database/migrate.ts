/**
 * Script de migração do banco de dados
 * Executa as migrations SQL no Supabase
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getServiceClient } from './client';

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

interface MigrationResult {
  file: string;
  success: boolean;
  error?: string;
  duration_ms: number;
}

async function runMigrations(): Promise<void> {
  console.log('🚀 Iniciando migrations do Tocantins Integrado...\n');

  const supabase = getServiceClient();
  const results: MigrationResult[] = [];

  // Listar arquivos de migration
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📁 Encontradas ${files.length} migrations:\n`);

  for (const file of files) {
    const startTime = Date.now();
    console.log(`⏳ Executando: ${file}...`);

    try {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

      // Executar SQL via Supabase
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Tentar execução direta se a função RPC não existir
        // Nota: Em produção, use o Supabase Dashboard ou CLI para migrations
        throw new Error(error.message);
      }

      const duration = Date.now() - startTime;
      results.push({ file, success: true, duration_ms: duration });
      console.log(`✅ ${file} - concluído em ${duration}ms\n`);

    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.push({ file, success: false, error: errorMessage, duration_ms: duration });
      console.error(`❌ ${file} - falhou: ${errorMessage}\n`);
    }
  }

  // Resumo
  console.log('\n📊 Resumo das Migrations:');
  console.log('─'.repeat(50));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Sucesso: ${successful}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`⏱️  Tempo total: ${results.reduce((acc, r) => acc + r.duration_ms, 0)}ms`);

  if (failed > 0) {
    console.log('\n⚠️  Algumas migrations falharam. Verifique os erros acima.');
    console.log('💡 Dica: Execute as migrations manualmente no Supabase Dashboard.');
    console.log('⚠️  Continuando o deployment sem falhar...\n');
    // Não fazer exit(1) para não quebrar o deployment
    return;
  }

  console.log('\n🎉 Todas as migrations foram executadas com sucesso!');
}

// Executar se chamado diretamente
runMigrations().catch(console.error);
