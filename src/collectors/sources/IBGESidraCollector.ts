/**
 * Coletor de Dados IBGE Sidra
 * Fonte: https://sidra.ibge.gov.br/
 *
 * Indicadores coletados:
 * - PIB Municipal (Tabela 5938)
 * - PIB per capita (calculado)
 * - População estimada (Tabela 6579)
 * - Valor Adicionado Bruto por setor
 */

import { BaseCollector, CollectionResult, CollectorConfig } from '../base/BaseCollector';
import { TOCANTINS_STATE_CODE } from '../config/municipalities';

interface SidraResponse {
  [key: string]: any;
}

// Tabelas SIDRA utilizadas
const SIDRA_TABLES = {
  PIB_MUNICIPAL: '5938',      // PIB dos Municípios
  POPULACAO_ESTIMADA: '6579', // Estimativas de População
  PIB_PER_CAPITA: '5938',     // PIB per capita (variável 37)
  VAB_AGROPECUARIA: '5938',   // VAB Agropecuária
  VAB_INDUSTRIA: '5938',      // VAB Indústria
  VAB_SERVICOS: '5938',       // VAB Serviços
};

// Variáveis das tabelas
const SIDRA_VARIABLES = {
  PIB_TOTAL: '37',           // PIB a preços correntes (R$ 1.000)
  PIB_PER_CAPITA: '513',     // PIB per capita (R$)
  POPULACAO: '93',           // População residente
  VAB_AGRO: '517',           // VAB Agropecuária
  VAB_INDUSTRIA: '518',      // VAB Indústria
  VAB_SERVICOS: '519',       // VAB Serviços
  VAB_ADM_PUBLICA: '6575',   // VAB Administração Pública
};

export class IBGESidraCollector extends BaseCollector {
  constructor(config?: Partial<CollectorConfig>) {
    super({
      baseUrl: 'https://apisidra.ibge.gov.br/values',
      rateLimit: 1, // API SIDRA tem rate limit rigoroso
      timeout: 60000, // Consultas podem demorar
      ...config
    });
  }

  get sourceName(): string {
    return 'IBGE Sidra';
  }

  get sourceUrl(): string {
    return 'https://sidra.ibge.gov.br/';
  }

  get indicatorCodes(): string[] {
    return ['PIB_TOTAL', 'PIB_PER_CAPITA', 'POPULACAO', 'VAB_AGROPECUARIA', 'VAB_INDUSTRIA', 'VAB_SERVICOS'];
  }

  /**
   * Construir URL da API SIDRA
   * Formato: /t/{tabela}/n6/{municipios}/v/{variaveis}/p/{periodos}
   */
  private buildSidraUrl(
    table: string,
    variables: string[],
    years: number[],
    municipalities?: string[]
  ): string {
    // n6 = nível municipal, usando código do estado para pegar todos os municípios
    const municipalityParam = municipalities
      ? municipalities.join(',')
      : `in n3 ${TOCANTINS_STATE_CODE}`; // Todos do Tocantins

    const url = `${this.config.baseUrl}/t/${table}/n6/${municipalityParam}/v/${variables.join(',')}/p/${years.join(',')}`;

    return url;
  }

  /**
   * Coletar todos os indicadores
   */
  async collect(years: number[]): Promise<CollectionResult[]> {
    this.reset();
    this.log(`Iniciando coleta para anos: ${years.join(', ')}`);

    // PIB e PIB per capita
    await this.collectPIB(years);

    // População
    await this.collectPopulacao(years);

    this.log(`Coleta finalizada. ${this.results.length} registros coletados, ${this.errors.length} erros`);
    return this.results;
  }

  /**
   * Coletar PIB Municipal e PIB per capita
   */
  private async collectPIB(years: number[]): Promise<void> {
    this.log('Coletando PIB Municipal...');

    try {
      // PIB disponível até 2021 (último ano disponível na API)
      const availableYears = years.filter(y => y <= 2021);

      if (availableYears.length === 0) {
        this.log('PIB: Sem anos disponíveis para coleta (dados disponíveis até 2021)');
        return;
      }

      const url = this.buildSidraUrl(
        SIDRA_TABLES.PIB_MUNICIPAL,
        [SIDRA_VARIABLES.PIB_TOTAL, SIDRA_VARIABLES.PIB_PER_CAPITA],
        availableYears
      );

      this.log(`URL: ${url}`);

      const data = await this.fetchJson<SidraResponse[]>(url);

      // Pular o primeiro item que é o cabeçalho
      const records = data.slice(1);

      this.log(`Recebidos ${records.length} registros de PIB`);

      for (const record of records) {
        const municipalityCode = record['D1C']; // Código do município
        const year = parseInt(record['D2C']); // Ano
        const variableCode = record['D3C']; // Código da variável
        const value = this.parseNumber(record['V']); // Valor

        if (!municipalityCode || !year) continue;

        let indicator_code = '';
        let processedValue = value;

        if (variableCode === SIDRA_VARIABLES.PIB_TOTAL) {
          indicator_code = 'PIB_TOTAL';
          // Valor está em R$ 1.000, converter para R$
          if (processedValue !== null) {
            processedValue = processedValue * 1000;
          }
        } else if (variableCode === SIDRA_VARIABLES.PIB_PER_CAPITA) {
          indicator_code = 'PIB_PER_CAPITA';
        }

        if (indicator_code) {
          this.addResult({
            indicator_code,
            municipality_ibge: municipalityCode,
            year,
            value: processedValue,
            source: this.sourceName,
            source_url: `https://sidra.ibge.gov.br/tabela/${SIDRA_TABLES.PIB_MUNICIPAL}`,
            collection_date: new Date().toISOString(),
            data_quality: processedValue !== null ? 'official' : 'unavailable',
            notes: processedValue === null ? 'Dado não disponível na fonte' : undefined
          });
        }
      }
    } catch (error) {
      this.addError(`Erro ao coletar PIB: ${(error as Error).message}`);
    }
  }

  /**
   * Coletar População Estimada
   */
  private async collectPopulacao(years: number[]): Promise<void> {
    this.log('Coletando População Estimada...');

    try {
      const url = this.buildSidraUrl(
        SIDRA_TABLES.POPULACAO_ESTIMADA,
        [SIDRA_VARIABLES.POPULACAO],
        years
      );

      this.log(`URL: ${url}`);

      const data = await this.fetchJson<SidraResponse[]>(url);
      const records = data.slice(1);

      this.log(`Recebidos ${records.length} registros de População`);

      for (const record of records) {
        const municipalityCode = record['D1C'];
        const year = parseInt(record['D2C']);
        const value = this.parseNumber(record['V']);

        if (!municipalityCode || !year) continue;

        this.addResult({
          indicator_code: 'POPULACAO',
          municipality_ibge: municipalityCode,
          year,
          value,
          source: this.sourceName,
          source_url: `https://sidra.ibge.gov.br/tabela/${SIDRA_TABLES.POPULACAO_ESTIMADA}`,
          collection_date: new Date().toISOString(),
          data_quality: value !== null ? 'official' : 'unavailable',
          notes: value === null ? 'Dado não disponível na fonte' : undefined
        });
      }
    } catch (error) {
      this.addError(`Erro ao coletar População: ${(error as Error).message}`);
    }
  }

  /**
   * Coletar VAB por Setor
   */
  async collectVAB(years: number[]): Promise<CollectionResult[]> {
    this.log('Coletando Valor Adicionado Bruto por setor...');

    const availableYears = years.filter(y => y <= 2021);

    if (availableYears.length === 0) {
      this.log('VAB: Sem anos disponíveis para coleta');
      return [];
    }

    try {
      const url = this.buildSidraUrl(
        SIDRA_TABLES.PIB_MUNICIPAL,
        [SIDRA_VARIABLES.VAB_AGRO, SIDRA_VARIABLES.VAB_INDUSTRIA, SIDRA_VARIABLES.VAB_SERVICOS],
        availableYears
      );

      const data = await this.fetchJson<SidraResponse[]>(url);
      const records = data.slice(1);

      for (const record of records) {
        const municipalityCode = record['D1C'];
        const year = parseInt(record['D2C']);
        const variableCode = record['D3C'];
        let value = this.parseNumber(record['V']);

        if (!municipalityCode || !year) continue;

        // Converter de R$ 1.000 para R$
        if (value !== null) {
          value = value * 1000;
        }

        let indicator_code = '';
        if (variableCode === SIDRA_VARIABLES.VAB_AGRO) {
          indicator_code = 'VAB_AGROPECUARIA';
        } else if (variableCode === SIDRA_VARIABLES.VAB_INDUSTRIA) {
          indicator_code = 'VAB_INDUSTRIA';
        } else if (variableCode === SIDRA_VARIABLES.VAB_SERVICOS) {
          indicator_code = 'VAB_SERVICOS';
        }

        if (indicator_code) {
          this.addResult({
            indicator_code,
            municipality_ibge: municipalityCode,
            year,
            value,
            source: this.sourceName,
            source_url: `https://sidra.ibge.gov.br/tabela/${SIDRA_TABLES.PIB_MUNICIPAL}`,
            collection_date: new Date().toISOString(),
            data_quality: value !== null ? 'official' : 'unavailable'
          });
        }
      }
    } catch (error) {
      this.addError(`Erro ao coletar VAB: ${(error as Error).message}`);
    }

    return this.results;
  }
}
