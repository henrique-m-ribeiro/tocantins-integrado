/**
 * Coletor de Dados SICONFI - Tesouro Nacional
 * Fonte: https://apidatalake.tesouro.gov.br/
 *
 * Indicadores coletados:
 * - Receita Corrente Líquida (RCL)
 * - Receita Própria (IPTU, ISS, ITBI)
 * - Despesas por função (educação, saúde, etc.)
 * - Índice de Dependência de Transferências
 *
 * Documentação API: https://apidatalake.tesouro.gov.br/docs/siconfi/
 */

import { BaseCollector, CollectionResult, CollectorConfig } from '../base/BaseCollector';
import { TOCANTINS_MUNICIPALITIES } from '../config/municipalities';

// Tipos de demonstrativos SICONFI
const SICONFI_REPORTS = {
  RREO: 'rreo',           // Relatório Resumido da Execução Orçamentária
  RGF: 'rgf',             // Relatório de Gestão Fiscal
  DCA: 'dca',             // Declaração de Contas Anuais
  MSC: 'msc',             // Matriz de Saldos Contábeis
  QDCC: 'qdcc',           // Quadro de Detalhamento da Classificação
};

// Anexos relevantes
const SICONFI_ANNEXES = {
  // RREO
  RREO_ANEXO1: 'RREO-Anexo 01',      // Balanço Orçamentário
  RREO_ANEXO2: 'RREO-Anexo 02',      // Demonstrativo Receita
  RREO_ANEXO3: 'RREO-Anexo 03',      // Demonstrativo Despesa por Função
  // RGF
  RGF_ANEXO1: 'RGF-Anexo 01',        // Demonstrativo Despesa com Pessoal
  RGF_ANEXO2: 'RGF-Anexo 02',        // Demonstrativo Dívida Consolidada
  // DCA
  DCA_ANEXO_I_AB: 'DCA-Anexo I-AB',  // Balanço Patrimonial
  DCA_ANEXO_I_C: 'DCA-Anexo I-C',    // Balanço Orçamentário Receitas
  DCA_ANEXO_I_D: 'DCA-Anexo I-D',    // Balanço Orçamentário Despesas
  DCA_ANEXO_I_E: 'DCA-Anexo I-E',    // Despesas por Função
};

interface SiconfiResponse {
  items: SiconfiItem[];
}

interface SiconfiItem {
  exercicio: number;
  cod_ibge: string;
  instituicao: string;
  anexo: string;
  coluna: string;
  cod_conta: string;
  conta: string;
  valor: number;
}

interface FiscalSummary {
  receita_corrente_liquida: number;
  receita_tributaria: number;
  iptu: number;
  iss: number;
  itbi: number;
  transferencias: number;
  despesa_pessoal: number;
  despesa_educacao: number;
  despesa_saude: number;
  divida_consolidada: number;
}

export class SICONFICollector extends BaseCollector {
  constructor(config?: Partial<CollectorConfig>) {
    super({
      baseUrl: 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt',
      rateLimit: 5, // API Tesouro é mais permissiva
      timeout: 60000,
      ...config
    });
  }

  get sourceName(): string {
    return 'SICONFI/Tesouro Nacional';
  }

  get sourceUrl(): string {
    return 'https://siconfi.tesouro.gov.br/';
  }

  get indicatorCodes(): string[] {
    return [
      'RECEITA_CORRENTE_LIQUIDA',
      'RECEITA_TRIBUTARIA',
      'RECEITA_IPTU',
      'RECEITA_ISS',
      'RECEITA_ITBI',
      'TRANSFERENCIAS_CORRENTES',
      'DESPESA_PESSOAL',
      'DESPESA_EDUCACAO',
      'DESPESA_SAUDE',
      'DIVIDA_CONSOLIDADA',
      'INDICE_DEPENDENCIA_TRANSFERENCIAS'
    ];
  }

  /**
   * Coletar todos os indicadores
   */
  async collect(years: number[]): Promise<CollectionResult[]> {
    this.reset();
    this.log(`Iniciando coleta para anos: ${years.join(', ')}`);

    // SICONFI geralmente tem dados a partir de 2015
    const availableYears = years.filter(y => y >= 2015);

    if (availableYears.length === 0) {
      this.log('Sem anos disponíveis (dados a partir de 2015)');
      return this.results;
    }

    for (const year of availableYears) {
      this.log(`Coletando dados fiscais de ${year}...`);
      await this.collectYear(year);
    }

    this.log(`Coleta finalizada. ${this.results.length} registros, ${this.errors.length} erros`);
    return this.results;
  }

  /**
   * Coletar dados de um ano específico
   */
  private async collectYear(year: number): Promise<void> {
    const municipalities = this.getMunicipalities();

    // Buscar dados do DCA (Declaração de Contas Anuais)
    // que contém o resumo anual mais completo
    try {
      // Receitas
      await this.collectReceitas(year);

      // Despesas por função
      await this.collectDespesas(year);

      // Calcular indicadores derivados
      this.calculateDerivedIndicators(year, municipalities);

    } catch (error) {
      this.addError(`Erro na coleta de ${year}: ${(error as Error).message}`);
    }
  }

  /**
   * Coletar receitas do DCA
   */
  private async collectReceitas(year: number): Promise<void> {
    this.log(`Coletando receitas ${year}...`);

    try {
      // Endpoint para receitas orçamentárias
      // /dca_orcamentaria?an_exercicio=2022&no_anexo=DCA-Anexo%20I-C&id_ente=...
      const baseUrl = `${this.config.baseUrl}/dca_orcamentaria`;

      for (const muni of this.getMunicipalities()) {
        try {
          const url = `${baseUrl}?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-C&id_ente=${muni.ibge_code}`;

          const response = await this.fetchJson<SiconfiResponse>(url);

          if (response.items && response.items.length > 0) {
            const fiscalData = this.parseReceitasResponse(response.items, muni.ibge_code, year);
            this.addFiscalResults(fiscalData, muni.ibge_code, year, 'official');
          } else {
            // Tentar buscar via RREO se DCA não disponível
            await this.collectReceitasRREO(year, muni.ibge_code);
          }
        } catch (error) {
          // Município pode não ter dados, registrar como indisponível
          this.addUnavailableResults(muni.ibge_code, year, 'receitas', (error as Error).message);
        }

        // Pequena pausa entre requisições
        await this.sleep(200);
      }
    } catch (error) {
      this.addError(`Erro ao coletar receitas ${year}: ${(error as Error).message}`);
    }
  }

  /**
   * Coletar receitas via RREO quando DCA não disponível
   */
  private async collectReceitasRREO(year: number, ibgeCode: string): Promise<void> {
    try {
      // RREO do último bimestre
      const url = `${this.config.baseUrl}/rreo?an_exercicio=${year}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2002&id_ente=${ibgeCode}`;

      const response = await this.fetchJson<SiconfiResponse>(url);

      if (response.items && response.items.length > 0) {
        const fiscalData = this.parseReceitasResponse(response.items, ibgeCode, year);
        this.addFiscalResults(fiscalData, ibgeCode, year, 'official');
      }
    } catch (error) {
      // Silencioso - já tratado no fluxo principal
    }
  }

  /**
   * Coletar despesas por função
   */
  private async collectDespesas(year: number): Promise<void> {
    this.log(`Coletando despesas ${year}...`);

    try {
      const baseUrl = `${this.config.baseUrl}/dca_orcamentaria`;

      for (const muni of this.getMunicipalities()) {
        try {
          // DCA-Anexo I-E contém despesas por função
          const url = `${baseUrl}?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-E&id_ente=${muni.ibge_code}`;

          const response = await this.fetchJson<SiconfiResponse>(url);

          if (response.items && response.items.length > 0) {
            this.parseDespesasResponse(response.items, muni.ibge_code, year);
          }
        } catch (error) {
          // Tentar via RREO
          await this.collectDespesasRREO(year, muni.ibge_code);
        }

        await this.sleep(200);
      }
    } catch (error) {
      this.addError(`Erro ao coletar despesas ${year}: ${(error as Error).message}`);
    }
  }

  /**
   * Coletar despesas via RREO
   */
  private async collectDespesasRREO(year: number, ibgeCode: string): Promise<void> {
    try {
      const url = `${this.config.baseUrl}/rreo?an_exercicio=${year}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2003&id_ente=${ibgeCode}`;

      const response = await this.fetchJson<SiconfiResponse>(url);

      if (response.items && response.items.length > 0) {
        this.parseDespesasResponse(response.items, ibgeCode, year);
      }
    } catch (error) {
      // Silencioso
    }
  }

  /**
   * Parsear resposta de receitas
   */
  private parseReceitasResponse(items: SiconfiItem[], ibgeCode: string, year: number): Partial<FiscalSummary> {
    const summary: Partial<FiscalSummary> = {};

    for (const item of items) {
      const conta = item.conta?.toLowerCase() || '';
      const codConta = item.cod_conta || '';
      const valor = item.valor || 0;

      // Receita Corrente Líquida (pode estar em diferentes formatos)
      if (conta.includes('receita corrente líquida') || codConta === '1.0.0.0.00.00') {
        summary.receita_corrente_liquida = (summary.receita_corrente_liquida || 0) + valor;
      }

      // Receita Tributária
      if (conta.includes('receita tributária') || codConta.startsWith('1.1')) {
        summary.receita_tributaria = (summary.receita_tributaria || 0) + valor;
      }

      // IPTU
      if (conta.includes('iptu') || codConta === '1.1.1.2.02.00' || codConta.includes('imposto sobre a propriedade')) {
        summary.iptu = (summary.iptu || 0) + valor;
      }

      // ISS
      if (conta.includes('iss') || conta.includes('imposto sobre serviços') || codConta === '1.1.1.2.04.00') {
        summary.iss = (summary.iss || 0) + valor;
      }

      // ITBI
      if (conta.includes('itbi') || conta.includes('transmissão') || codConta === '1.1.1.2.03.00') {
        summary.itbi = (summary.itbi || 0) + valor;
      }

      // Transferências Correntes
      if (conta.includes('transferências correntes') || codConta.startsWith('1.7')) {
        summary.transferencias = (summary.transferencias || 0) + valor;
      }
    }

    return summary;
  }

  /**
   * Parsear resposta de despesas
   */
  private parseDespesasResponse(items: SiconfiItem[], ibgeCode: string, year: number): void {
    let despesaEducacao = 0;
    let despesaSaude = 0;
    let despesaPessoal = 0;

    for (const item of items) {
      const conta = item.conta?.toLowerCase() || '';
      const codConta = item.cod_conta || '';
      const valor = item.valor || 0;

      // Função 12 - Educação
      if (codConta === '12' || conta.includes('educação')) {
        despesaEducacao += valor;
      }

      // Função 10 - Saúde
      if (codConta === '10' || conta.includes('saúde')) {
        despesaSaude += valor;
      }

      // Despesa com Pessoal (pode vir do RGF)
      if (conta.includes('despesa total com pessoal')) {
        despesaPessoal += valor;
      }
    }

    // Adicionar resultados
    if (despesaEducacao > 0) {
      this.addResult({
        indicator_code: 'DESPESA_EDUCACAO',
        municipality_ibge: ibgeCode,
        year,
        value: despesaEducacao,
        source: this.sourceName,
        source_url: 'https://siconfi.tesouro.gov.br/',
        collection_date: new Date().toISOString(),
        data_quality: 'official',
        notes: 'Despesa função Educação (código 12)'
      });
    }

    if (despesaSaude > 0) {
      this.addResult({
        indicator_code: 'DESPESA_SAUDE',
        municipality_ibge: ibgeCode,
        year,
        value: despesaSaude,
        source: this.sourceName,
        source_url: 'https://siconfi.tesouro.gov.br/',
        collection_date: new Date().toISOString(),
        data_quality: 'official',
        notes: 'Despesa função Saúde (código 10)'
      });
    }

    if (despesaPessoal > 0) {
      this.addResult({
        indicator_code: 'DESPESA_PESSOAL',
        municipality_ibge: ibgeCode,
        year,
        value: despesaPessoal,
        source: this.sourceName,
        source_url: 'https://siconfi.tesouro.gov.br/',
        collection_date: new Date().toISOString(),
        data_quality: 'official'
      });
    }
  }

  /**
   * Adicionar resultados fiscais
   */
  private addFiscalResults(
    data: Partial<FiscalSummary>,
    ibgeCode: string,
    year: number,
    quality: 'official' | 'estimated' | 'unavailable'
  ): void {
    const addIfPresent = (code: string, value: number | undefined, notes?: string) => {
      if (value !== undefined && value > 0) {
        this.addResult({
          indicator_code: code,
          municipality_ibge: ibgeCode,
          year,
          value,
          source: this.sourceName,
          source_url: 'https://siconfi.tesouro.gov.br/',
          collection_date: new Date().toISOString(),
          data_quality: quality,
          notes
        });
      }
    };

    addIfPresent('RECEITA_CORRENTE_LIQUIDA', data.receita_corrente_liquida);
    addIfPresent('RECEITA_TRIBUTARIA', data.receita_tributaria);
    addIfPresent('RECEITA_IPTU', data.iptu, 'Imposto sobre Propriedade Predial e Territorial Urbana');
    addIfPresent('RECEITA_ISS', data.iss, 'Imposto sobre Serviços de Qualquer Natureza');
    addIfPresent('RECEITA_ITBI', data.itbi, 'Imposto sobre Transmissão de Bens Imóveis');
    addIfPresent('TRANSFERENCIAS_CORRENTES', data.transferencias);
  }

  /**
   * Adicionar resultados indisponíveis
   */
  private addUnavailableResults(ibgeCode: string, year: number, type: string, reason: string): void {
    // Registrar apenas para indicadores principais
    const mainIndicators = ['RECEITA_CORRENTE_LIQUIDA', 'RECEITA_TRIBUTARIA'];

    for (const code of mainIndicators) {
      this.addResult({
        indicator_code: code,
        municipality_ibge: ibgeCode,
        year,
        value: null,
        source: this.sourceName,
        source_url: 'https://siconfi.tesouro.gov.br/',
        collection_date: new Date().toISOString(),
        data_quality: 'unavailable',
        notes: `${type}: ${reason}`
      });
    }
  }

  /**
   * Calcular indicadores derivados
   */
  private calculateDerivedIndicators(year: number, municipalities: typeof TOCANTINS_MUNICIPALITIES): void {
    this.log(`Calculando indicadores derivados ${year}...`);

    for (const muni of municipalities) {
      // Índice de Dependência de Transferências
      // = Transferências / Receita Corrente Líquida
      const rcl = this.results.find(
        r => r.indicator_code === 'RECEITA_CORRENTE_LIQUIDA' &&
             r.municipality_ibge === muni.ibge_code &&
             r.year === year
      );

      const transferencias = this.results.find(
        r => r.indicator_code === 'TRANSFERENCIAS_CORRENTES' &&
             r.municipality_ibge === muni.ibge_code &&
             r.year === year
      );

      if (rcl?.value && transferencias?.value && rcl.value > 0) {
        const indiceDependencia = (transferencias.value / rcl.value) * 100;

        this.addResult({
          indicator_code: 'INDICE_DEPENDENCIA_TRANSFERENCIAS',
          municipality_ibge: muni.ibge_code,
          year,
          value: Math.round(indiceDependencia * 100) / 100,
          source: this.sourceName,
          source_url: 'https://siconfi.tesouro.gov.br/',
          collection_date: new Date().toISOString(),
          data_quality: 'official',
          notes: 'Calculado: (Transferências Correntes / RCL) × 100'
        });
      }
    }
  }

  /**
   * Coletar dados para um único município
   */
  async collectForMunicipality(ibgeCode: string, years: number[]): Promise<CollectionResult[]> {
    this.reset();

    const muni = TOCANTINS_MUNICIPALITIES.find(m => m.ibge_code === ibgeCode);
    if (!muni) {
      this.addError(`Município não encontrado: ${ibgeCode}`);
      return this.results;
    }

    this.log(`Coletando dados fiscais para ${muni.name} (${ibgeCode})`);

    const availableYears = years.filter(y => y >= 2015);

    for (const year of availableYears) {
      try {
        // Receitas via DCA
        const receitasUrl = `${this.config.baseUrl}/dca_orcamentaria?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-C&id_ente=${ibgeCode}`;

        try {
          const response = await this.fetchJson<SiconfiResponse>(receitasUrl);
          if (response.items && response.items.length > 0) {
            const fiscalData = this.parseReceitasResponse(response.items, ibgeCode, year);
            this.addFiscalResults(fiscalData, ibgeCode, year, 'official');
          }
        } catch {
          // Tentar RREO
          await this.collectReceitasRREO(year, ibgeCode);
        }

        // Despesas via DCA
        const despesasUrl = `${this.config.baseUrl}/dca_orcamentaria?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-E&id_ente=${ibgeCode}`;

        try {
          const response = await this.fetchJson<SiconfiResponse>(despesasUrl);
          if (response.items && response.items.length > 0) {
            this.parseDespesasResponse(response.items, ibgeCode, year);
          }
        } catch {
          await this.collectDespesasRREO(year, ibgeCode);
        }

        // Calcular índice de dependência
        this.calculateDerivedIndicators(year, [muni]);

      } catch (error) {
        this.addError(`Erro ${year}: ${(error as Error).message}`);
      }
    }

    return this.results;
  }

  /**
   * Listar entes disponíveis no Tocantins
   */
  async listEntes(): Promise<{ ibge: string; nome: string }[]> {
    try {
      const url = `${this.config.baseUrl}/entes?co_esfera=M&sg_uf=TO`;
      const response = await this.fetchJson<{ items: { cod_ibge: string; ente: string }[] }>(url);

      return response.items.map(item => ({
        ibge: item.cod_ibge,
        nome: item.ente
      }));
    } catch (error) {
      this.addError(`Erro ao listar entes: ${(error as Error).message}`);
      return [];
    }
  }
}
