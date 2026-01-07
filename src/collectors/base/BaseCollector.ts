/**
 * Classe base para coletores de dados
 * Tocantins Integrado - Sistema de Coleta de Dados
 */

import { TOCANTINS_MUNICIPALITIES, Municipality } from '../config/municipalities';

export interface CollectionResult {
  indicator_code: string;
  municipality_ibge: string;
  year: number;
  month?: number;
  value: number | null;
  source: string;
  source_url: string;
  collection_date: string;
  data_quality: 'official' | 'estimated' | 'unavailable';
  notes?: string;
}

export interface CollectionSummary {
  source: string;
  indicator_code: string;
  total_municipalities: number;
  collected: number;
  failed: number;
  unavailable: number;
  years: number[];
  started_at: string;
  finished_at: string;
  errors: string[];
}

export interface CollectorConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  rateLimit?: number; // requests per second
}

export abstract class BaseCollector {
  protected config: CollectorConfig;
  protected results: CollectionResult[] = [];
  protected errors: string[] = [];
  protected lastRequestTime: number = 0;

  constructor(config: CollectorConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 2000,
      rateLimit: 2,
      ...config
    };
  }

  /**
   * Nome da fonte de dados
   */
  abstract get sourceName(): string;

  /**
   * URL base da fonte
   */
  abstract get sourceUrl(): string;

  /**
   * Indicadores coletados por esta fonte
   */
  abstract get indicatorCodes(): string[];

  /**
   * Método principal de coleta - deve ser implementado por cada coletor
   */
  abstract collect(years: number[]): Promise<CollectionResult[]>;

  /**
   * Fazer requisição HTTP com retry e rate limiting
   */
  protected async fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
    const { retries, retryDelay, rateLimit, timeout } = this.config;

    // Rate limiting
    if (rateLimit) {
      const now = Date.now();
      const minInterval = 1000 / rateLimit;
      const elapsed = now - this.lastRequestTime;

      if (elapsed < minInterval) {
        await this.sleep(minInterval - elapsed);
      }
      this.lastRequestTime = Date.now();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[${this.sourceName}] Attempt ${attempt}/${retries} failed for ${url}: ${lastError.message}`);

        if (attempt < retries!) {
          await this.sleep(retryDelay! * attempt); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Unknown error');
  }

  /**
   * Fazer requisição e retornar JSON
   */
  protected async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchWithRetry(url);
    return response.json();
  }

  /**
   * Helper para aguardar
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Adicionar resultado
   */
  protected addResult(result: CollectionResult): void {
    this.results.push(result);
  }

  /**
   * Adicionar erro
   */
  protected addError(message: string): void {
    this.errors.push(message);
    console.error(`[${this.sourceName}] ${message}`);
  }

  /**
   * Log de progresso
   */
  protected log(message: string): void {
    console.log(`[${this.sourceName}] ${message}`);
  }

  /**
   * Obter todos os municípios do Tocantins
   */
  protected getMunicipalities(): Municipality[] {
    return TOCANTINS_MUNICIPALITIES;
  }

  /**
   * Obter resumo da coleta
   */
  protected getSummary(indicator_code: string, years: number[]): CollectionSummary {
    const indicatorResults = this.results.filter(r => r.indicator_code === indicator_code);

    return {
      source: this.sourceName,
      indicator_code,
      total_municipalities: TOCANTINS_MUNICIPALITIES.length,
      collected: indicatorResults.filter(r => r.data_quality === 'official').length,
      failed: this.errors.length,
      unavailable: indicatorResults.filter(r => r.data_quality === 'unavailable').length,
      years,
      started_at: '',
      finished_at: new Date().toISOString(),
      errors: this.errors
    };
  }

  /**
   * Limpar resultados e erros para nova coleta
   */
  protected reset(): void {
    this.results = [];
    this.errors = [];
  }

  /**
   * Validar valor numérico
   */
  protected parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '' || value === '-' || value === '...') {
      return null;
    }

    // Remover formatação brasileira
    const cleaned = String(value)
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * Criar resultado para dado indisponível
   */
  protected createUnavailableResult(
    indicator_code: string,
    municipality_ibge: string,
    year: number,
    reason: string
  ): CollectionResult {
    return {
      indicator_code,
      municipality_ibge,
      year,
      value: null,
      source: this.sourceName,
      source_url: this.sourceUrl,
      collection_date: new Date().toISOString(),
      data_quality: 'unavailable',
      notes: reason
    };
  }
}
