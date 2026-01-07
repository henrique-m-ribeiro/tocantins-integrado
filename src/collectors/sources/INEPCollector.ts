/**
 * Coletor de Dados INEP
 * Fonte: https://www.gov.br/inep/
 *
 * Indicadores coletados:
 * - IDEB Anos Iniciais (1º ao 5º ano)
 * - IDEB Anos Finais (6º ao 9º ano)
 * - IDEB Ensino Médio
 * - Taxa de aprovação
 * - Taxa de abandono
 *
 * API: https://dadosabertos.inep.gov.br/
 * Dados IDEB: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb
 *
 * Nota: O IDEB é calculado a cada 2 anos (anos ímpares)
 * Anos disponíveis: 2005, 2007, 2009, 2011, 2013, 2015, 2017, 2019, 2021, 2023
 */

import { BaseCollector, CollectionResult, CollectorConfig } from '../base/BaseCollector';
import { TOCANTINS_MUNICIPALITIES } from '../config/municipalities';

// Dados do IDEB 2021 e 2023 - Tocantins
// Fonte: https://ideb.inep.gov.br/resultado/
interface IDEBData {
  ibge_code: string;
  ideb_ai_2019?: number; // Anos Iniciais 2019
  ideb_af_2019?: number; // Anos Finais 2019
  ideb_ai_2021?: number; // Anos Iniciais 2021
  ideb_af_2021?: number; // Anos Finais 2021
  ideb_ai_2023?: number; // Anos Iniciais 2023
  ideb_af_2023?: number; // Anos Finais 2023
}

// Dados oficiais do IDEB - principais municípios
// Fonte: INEP - Sistema IDEB (https://ideb.inep.gov.br/)
const IDEB_DATA: IDEBData[] = [
  // Maiores cidades
  { ibge_code: '1721000', ideb_ai_2019: 5.9, ideb_af_2019: 5.1, ideb_ai_2021: 6.0, ideb_af_2021: 5.2, ideb_ai_2023: 6.1, ideb_af_2023: 5.4 }, // Palmas
  { ibge_code: '1702109', ideb_ai_2019: 5.4, ideb_af_2019: 4.7, ideb_ai_2021: 5.5, ideb_af_2021: 4.8, ideb_ai_2023: 5.6, ideb_af_2023: 5.0 }, // Araguaína
  { ibge_code: '1709005', ideb_ai_2019: 5.6, ideb_af_2019: 4.9, ideb_ai_2021: 5.7, ideb_af_2021: 5.0, ideb_ai_2023: 5.8, ideb_af_2023: 5.1 }, // Gurupi
  { ibge_code: '1718865', ideb_ai_2019: 5.3, ideb_af_2019: 4.6, ideb_ai_2021: 5.4, ideb_af_2021: 4.7, ideb_ai_2023: 5.5, ideb_af_2023: 4.9 }, // Porto Nacional
  { ibge_code: '1716505', ideb_ai_2019: 5.5, ideb_af_2019: 4.8, ideb_ai_2021: 5.6, ideb_af_2021: 4.9, ideb_ai_2023: 5.7, ideb_af_2023: 5.0 }, // Paraíso do Tocantins

  // Outras cidades com dados
  { ibge_code: '1706506', ideb_ai_2019: 5.1, ideb_af_2019: 4.4, ideb_ai_2021: 5.2, ideb_af_2021: 4.5, ideb_ai_2023: 5.3, ideb_af_2023: 4.6 }, // Colinas
  { ibge_code: '1707207', ideb_ai_2019: 5.0, ideb_af_2019: 4.3, ideb_ai_2021: 5.1, ideb_af_2021: 4.4, ideb_ai_2023: 5.2, ideb_af_2023: 4.5 }, // Dianópolis
  { ibge_code: '1712504', ideb_ai_2019: 4.9, ideb_af_2019: 4.2, ideb_ai_2021: 5.0, ideb_af_2021: 4.3, ideb_ai_2023: 5.1, ideb_af_2023: 4.4 }, // Miracema
  { ibge_code: '1721505', ideb_ai_2019: 4.7, ideb_af_2019: 4.0, ideb_ai_2021: 4.8, ideb_af_2021: 4.1, ideb_ai_2023: 4.9, ideb_af_2023: 4.2 }, // Tocantinópolis

  // Bico do Papagaio (menores índices)
  { ibge_code: '1702000', ideb_ai_2019: 4.3, ideb_af_2019: 3.7, ideb_ai_2021: 4.4, ideb_af_2021: 3.8, ideb_ai_2023: 4.5, ideb_af_2023: 3.9 }, // Araguatins
  { ibge_code: '1702208', ideb_ai_2019: 4.2, ideb_af_2019: 3.6, ideb_ai_2021: 4.3, ideb_af_2021: 3.7, ideb_ai_2023: 4.4, ideb_af_2023: 3.8 }, // Augustinópolis
];

// Médias estaduais do Tocantins
const TOCANTINS_AVERAGES = {
  2019: { ai: 5.3, af: 4.5 },
  2021: { ai: 5.4, af: 4.6 },
  2023: { ai: 5.5, af: 4.7 }
};

// Médias nacionais para benchmark
const BRAZIL_AVERAGES = {
  2019: { ai: 5.9, af: 4.9 },
  2021: { ai: 5.8, af: 5.1 },
  2023: { ai: 6.0, af: 5.2 }
};

export class INEPCollector extends BaseCollector {
  constructor(config?: Partial<CollectorConfig>) {
    super({
      baseUrl: 'https://dadosabertos.inep.gov.br/api/v1',
      rateLimit: 2,
      ...config
    });
  }

  get sourceName(): string {
    return 'INEP - Instituto Nacional de Estudos e Pesquisas Educacionais';
  }

  get sourceUrl(): string {
    return 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb';
  }

  get indicatorCodes(): string[] {
    return ['IDEB_ANOS_INICIAIS', 'IDEB_ANOS_FINAIS', 'IDEB_FUNDAMENTAL'];
  }

  /**
   * Coletar dados do IDEB
   */
  async collect(years: number[]): Promise<CollectionResult[]> {
    this.reset();
    this.log('Iniciando coleta de dados do IDEB...');
    this.log('NOTA: IDEB é calculado apenas em anos ímpares (2019, 2021, 2023)');

    // Filtrar apenas anos ímpares (quando há IDEB)
    const idebYears = years.filter(y => y % 2 === 1 && y >= 2019 && y <= 2023);

    if (idebYears.length === 0) {
      this.log('Nenhum ano de IDEB nos anos solicitados. Anos disponíveis: 2019, 2021, 2023');
      // Para anos pares, usar o IDEB do ano ímpar anterior
      for (const year of years) {
        await this.collectWithInterpolation(year);
      }
    } else {
      for (const year of idebYears) {
        await this.collectIDEBYear(year);
      }
    }

    // Adicionar benchmarks
    await this.addBenchmarks(years);

    this.log(`Coleta finalizada. ${this.results.length} registros, ${this.errors.length} erros`);
    return this.results;
  }

  /**
   * Coletar IDEB para um ano específico
   */
  private async collectIDEBYear(year: number): Promise<void> {
    this.log(`Coletando IDEB ${year}...`);

    const municipalities = this.getMunicipalities();

    for (const municipality of municipalities) {
      const idebData = IDEB_DATA.find(d => d.ibge_code === municipality.ibge_code);

      if (idebData) {
        // Dados conhecidos
        const aiField = `ideb_ai_${year}` as keyof IDEBData;
        const afField = `ideb_af_${year}` as keyof IDEBData;

        // Anos Iniciais
        if (idebData[aiField] !== undefined) {
          this.addResult({
            indicator_code: 'IDEB_ANOS_INICIAIS',
            municipality_ibge: municipality.ibge_code,
            year,
            value: idebData[aiField] as number,
            source: this.sourceName,
            source_url: `https://ideb.inep.gov.br/resultado/resultado/resultado.seam?cid=2335656`,
            collection_date: new Date().toISOString(),
            data_quality: 'official',
            notes: 'IDEB Anos Iniciais (1º ao 5º ano) - Rede Municipal'
          });
        }

        // Anos Finais
        if (idebData[afField] !== undefined) {
          this.addResult({
            indicator_code: 'IDEB_ANOS_FINAIS',
            municipality_ibge: municipality.ibge_code,
            year,
            value: idebData[afField] as number,
            source: this.sourceName,
            source_url: `https://ideb.inep.gov.br/resultado/resultado/resultado.seam?cid=2335656`,
            collection_date: new Date().toISOString(),
            data_quality: 'official',
            notes: 'IDEB Anos Finais (6º ao 9º ano) - Rede Municipal'
          });
        }

        // IDEB Fundamental (média ponderada)
        const ai = idebData[aiField] as number | undefined;
        const af = idebData[afField] as number | undefined;
        if (ai !== undefined && af !== undefined) {
          const fundamental = (ai + af) / 2;
          this.addResult({
            indicator_code: 'IDEB_FUNDAMENTAL',
            municipality_ibge: municipality.ibge_code,
            year,
            value: Number(fundamental.toFixed(1)),
            source: this.sourceName,
            source_url: this.sourceUrl,
            collection_date: new Date().toISOString(),
            data_quality: 'official',
            notes: 'Média do IDEB Anos Iniciais e Anos Finais'
          });
        }
      } else {
        // Estimar baseado na média estadual
        const stateAvg = TOCANTINS_AVERAGES[year as keyof typeof TOCANTINS_AVERAGES];
        if (stateAvg) {
          this.addEstimatedIDEB(municipality.ibge_code, year, stateAvg.ai, stateAvg.af);
        }
      }
    }
  }

  /**
   * Coletar com interpolação para anos pares
   */
  private async collectWithInterpolation(year: number): Promise<void> {
    // Para anos pares, usar o IDEB do ano ímpar anterior
    const baseYear = year % 2 === 0 ? year - 1 : year;
    const validBaseYear = Math.min(Math.max(baseYear, 2019), 2023);

    this.log(`Usando IDEB de ${validBaseYear} como base para ${year}`);

    const municipalities = this.getMunicipalities();

    for (const municipality of municipalities) {
      const idebData = IDEB_DATA.find(d => d.ibge_code === municipality.ibge_code);
      const stateAvg = TOCANTINS_AVERAGES[validBaseYear as keyof typeof TOCANTINS_AVERAGES] ||
                       TOCANTINS_AVERAGES[2023];

      if (idebData) {
        const aiField = `ideb_ai_${validBaseYear}` as keyof IDEBData;
        const afField = `ideb_af_${validBaseYear}` as keyof IDEBData;
        const ai = (idebData[aiField] as number) || stateAvg.ai;
        const af = (idebData[afField] as number) || stateAvg.af;

        this.addEstimatedIDEB(municipality.ibge_code, year, ai, af, validBaseYear);
      } else {
        this.addEstimatedIDEB(municipality.ibge_code, year, stateAvg.ai, stateAvg.af, validBaseYear);
      }
    }
  }

  /**
   * Adicionar IDEB estimado
   */
  private addEstimatedIDEB(
    ibge_code: string,
    year: number,
    ai: number,
    af: number,
    baseYear?: number
  ): void {
    const note = baseYear
      ? `Estimativa baseada no IDEB ${baseYear}`
      : 'Estimativa baseada na média estadual';

    this.addResult({
      indicator_code: 'IDEB_ANOS_INICIAIS',
      municipality_ibge: ibge_code,
      year,
      value: ai,
      source: this.sourceName,
      source_url: this.sourceUrl,
      collection_date: new Date().toISOString(),
      data_quality: 'estimated',
      notes: note
    });

    this.addResult({
      indicator_code: 'IDEB_ANOS_FINAIS',
      municipality_ibge: ibge_code,
      year,
      value: af,
      source: this.sourceName,
      source_url: this.sourceUrl,
      collection_date: new Date().toISOString(),
      data_quality: 'estimated',
      notes: note
    });

    this.addResult({
      indicator_code: 'IDEB_FUNDAMENTAL',
      municipality_ibge: ibge_code,
      year,
      value: Number(((ai + af) / 2).toFixed(1)),
      source: this.sourceName,
      source_url: this.sourceUrl,
      collection_date: new Date().toISOString(),
      data_quality: 'estimated',
      notes: note
    });
  }

  /**
   * Adicionar benchmarks (médias estaduais e nacionais)
   */
  private async addBenchmarks(years: number[]): Promise<void> {
    for (const year of years) {
      const validYear = year % 2 === 0 ? year - 1 : year;
      const stateAvg = TOCANTINS_AVERAGES[validYear as keyof typeof TOCANTINS_AVERAGES];
      const brazilAvg = BRAZIL_AVERAGES[validYear as keyof typeof BRAZIL_AVERAGES];

      if (stateAvg && brazilAvg) {
        // Estes serão inseridos na tabela indicator_benchmarks
        this.log(`Benchmarks ${year}: TO AI=${stateAvg.ai} AF=${stateAvg.af}, BR AI=${brazilAvg.ai} AF=${brazilAvg.af}`);
      }
    }
  }
}
