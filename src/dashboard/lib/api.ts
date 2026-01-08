/**
 * Cliente API para o Dashboard Replit
 * Tocantins Integrado - MVP v1.0
 *
 * Arquitetura:
 * - Dashboard: Consultas rápidas + análises pré-computadas
 * - n8n: Análises complexas sob demanda
 */

import type {
  Municipality,
  Microregion,
  Indicator,
  IndicatorValue,
  AIAnalysis,
  ChatMessage,
  Dimension,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_URL || '';
// Permite configurar o path do webhook do orquestrador (pode ser /webhook/orchestrator ou UUID)
const N8N_ORCHESTRATOR_PATH = process.env.NEXT_PUBLIC_N8N_ORCHESTRATOR_PATH || '/webhook/orchestrator';

class ApiClient {
  private baseUrl: string;
  private n8nUrl: string;
  private orchestratorPath: string;

  constructor(baseUrl: string, n8nUrl: string, orchestratorPath: string = N8N_ORCHESTRATOR_PATH) {
    this.baseUrl = baseUrl;
    this.n8nUrl = n8nUrl;
    this.orchestratorPath = orchestratorPath;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================
  // Municípios
  // ==================

  async getMunicipalities(params?: {
    search?: string;
    microregion?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.microregion) searchParams.set('microregion', params.microregion);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return this.request<{
      count: number;
      municipalities: Municipality[];
    }>(`/municipalities${query ? `?${query}` : ''}`);
  }

  async getMunicipality(id: string) {
    return this.request<Municipality>(`/municipalities/${id}`);
  }

  async getMunicipalityProfile(id: string) {
    return this.request<{
      municipality: any;
      summary: any;
      rankings: any[];
      top_indicators: any[];
    }>(`/municipalities/${id}/profile`);
  }

  async getMicroregions() {
    return this.request<{
      count: number;
      microregions: Microregion[];
    }>('/municipalities/regions/microregions');
  }

  async getGeoJSON() {
    return this.request<{
      type: string;
      features: any[];
    }>('/municipalities/geo/geojson');
  }

  // ==================
  // Análises Pré-computadas
  // ==================

  /**
   * Buscar análises publicadas de um município
   */
  async getMunicipalityAnalyses(municipalityId: string) {
    const response = await this.request<{
      analyses: any[];
      fragments: any[];
    }>(`/analyses/municipality/${municipalityId}`);

    return response.analyses || [];
  }

  /**
   * Buscar análise específica por slug
   */
  async getAnalysisBySlug(slug: string) {
    return this.request<any>(`/analyses/${slug}`);
  }

  /**
   * Buscar fragmentos de análise para exibição contextual
   * Aceita municipalityId diretamente ou objeto de params
   */
  async getAnalysisFragments(
    municipalityIdOrParams?: string | {
      municipality_id?: string;
      dimension?: string;
      indicator_code?: string;
      fragment_type?: string;
    }
  ) {
    const searchParams = new URLSearchParams();

    if (typeof municipalityIdOrParams === 'string') {
      searchParams.set('municipality_id', municipalityIdOrParams);
    } else if (municipalityIdOrParams) {
      if (municipalityIdOrParams.municipality_id) searchParams.set('municipality_id', municipalityIdOrParams.municipality_id);
      if (municipalityIdOrParams.dimension) searchParams.set('dimension', municipalityIdOrParams.dimension);
      if (municipalityIdOrParams.indicator_code) searchParams.set('indicator_code', municipalityIdOrParams.indicator_code);
      if (municipalityIdOrParams.fragment_type) searchParams.set('fragment_type', municipalityIdOrParams.fragment_type);
    }

    const query = searchParams.toString();
    const response = await this.request<{
      fragments: any[];
    }>(`/analyses/fragments${query ? `?${query}` : ''}`);

    return response.fragments || [];
  }

  /**
   * Buscar análises recentes (para listagem e filtros)
   */
  async getRecentAnalyses(params?: {
    type?: string;
    year?: number;
    municipality_id?: string;
    limit?: number;
  } | number) {
    const searchParams = new URLSearchParams();

    if (typeof params === 'number') {
      searchParams.set('limit', String(params));
    } else if (params) {
      if (params.type) searchParams.set('type', params.type);
      if (params.year) searchParams.set('year', String(params.year));
      if (params.municipality_id) searchParams.set('municipality_id', params.municipality_id);
      if (params.limit) searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const response = await this.request<{
      analyses: any[];
    }>(`/analyses/recent${query ? `?${query}` : ''}`);

    return response.analyses || [];
  }

  /**
   * Registrar download de análise
   */
  async registerDownload(analysisId: string) {
    return this.request<{ success: boolean }>(`/analyses/${analysisId}/download`, {
      method: 'POST'
    });
  }

  // ==================
  // Documentos PDF
  // ==================

  /**
   * Listar documentos disponíveis para download
   */
  async getDocuments(params?: {
    municipality_id?: string;
    type?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.municipality_id) searchParams.set('municipality_id', params.municipality_id);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const response = await this.request<{
      documents: any[];
    }>(`/documents${query ? `?${query}` : ''}`);

    return response.documents || [];
  }

  /**
   * Registrar download de documento
   */
  async registerDocumentDownload(documentId: string) {
    return this.request<{ success: boolean }>(`/documents/${documentId}/download`, {
      method: 'POST'
    });
  }

  // ==================
  // Indicadores
  // ==================

  async getIndicators(params?: {
    dimension?: string;
    category?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.dimension) searchParams.set('dimension', params.dimension);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request<{
      count: number;
      indicators: Indicator[];
    }>(`/indicators${query ? `?${query}` : ''}`);
  }

  async getMunicipalityIndicators(municipalityId: string, params?: {
    dimension?: string;
    year?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.dimension) searchParams.set('dimension', params.dimension);
    if (params?.year) searchParams.set('year', String(params.year));

    const query = searchParams.toString();
    return this.request<{
      municipality_id: string;
      total_indicators: number;
      indicators_by_dimension: Record<string, any[]>;
    }>(`/municipalities/${municipalityId}/indicators${query ? `?${query}` : ''}`);
  }

  async getDimensions() {
    return this.request<{
      dimensions: {
        code: string;
        name: string;
        description: string;
        color: string;
      }[];
    }>('/indicators/meta/dimensions');
  }

  /**
   * Obter metadados completos de um indicador (para tooltips)
   */
  async getIndicatorMetadata(indicatorCode: string) {
    return this.request<{
      code: string;
      name: string;
      description: string;
      tooltip_text: string;
      interpretation_guide: string;
      unit: string;
      source: string;
      source_url?: string;
      methodology?: string;
      calculation_formula?: string;
      higher_is_better: boolean;
      dimension: string;
      category_name: string;
      reference_values?: {
        nacional?: number;
        regional_norte?: number;
        meta_ods?: number;
        meta_pne?: number;
      };
      tags?: string[];
    }>(`/indicators/${indicatorCode}/metadata`);
  }

  /**
   * Obter série histórica de um indicador para um município
   */
  async getIndicatorHistory(
    indicatorCode: string,
    municipalityId: string,
    yearsBack: number = 5
  ) {
    return this.request<Array<{
      year: number;
      value: number;
      rank_state?: number;
      percentile_state?: number;
      state_avg?: number;
      microregion_avg?: number;
      year_change?: number;
      trend?: 'up' | 'down' | 'stable';
    }>>(`/indicators/${indicatorCode}/history/${municipalityId}?years=${yearsBack}`);
  }

  // ==================
  // Chat Local (Exploração Rápida)
  // ==================

  /**
   * Chat simples para exploração de dados
   * Usa análises pré-computadas e busca contextual
   */
  async sendExplorationChat(data: {
    session_id?: string;
    message: string;
    context?: {
      municipality_id?: string;
      microregion_id?: string;
    };
  }) {
    return this.request<{
      session_id: string;
      message: any;
      suggestions: string[];
      source: 'precomputed' | 'realtime';
    }>('/chat/explore', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================
  // n8n - Análises Complexas
  // ==================

  /**
   * Solicitar análise complexa via n8n
   * Retorna um ID de execução para acompanhamento
   *
   * O endpoint pode ser configurado via NEXT_PUBLIC_N8N_ORCHESTRATOR_PATH
   * Exemplos:
   *   - /webhook/orchestrator (padrão, requer configuração no n8n)
   *   - /webhook/0268b424-b3a3-41ea-9448-c99a1340a0c2 (UUID gerado pelo n8n)
   */
  async requestComplexAnalysis(data: {
    query: string;
    context?: {
      municipality_id?: string;
      municipality_ids?: string[];
      dimensions?: string[];
    };
  }) {
    if (!this.n8nUrl) {
      throw new Error('n8n não configurado. Configure NEXT_PUBLIC_N8N_URL no .env');
    }

    // Constrói a URL completa, normalizando barras
    const baseUrl = this.n8nUrl.replace(/\/$/, '');
    const path = this.orchestratorPath.startsWith('/') ? this.orchestratorPath : `/${this.orchestratorPath}`;

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao solicitar análise complexa');
    }

    return response.json();
  }

  /**
   * Verificar status de análise em andamento
   */
  async checkAnalysisStatus(executionId: string) {
    return this.request<{
      status: 'pending' | 'running' | 'completed' | 'error';
      result?: any;
      error?: string;
    }>(`/analyses/status/${executionId}`);
  }

  // ==================
  // Sessão e Feedback
  // ==================

  async getChatSession(sessionId: string) {
    return this.request<{
      session_id: string;
      messages: any[];
    }>(`/chat/sessions/${sessionId}`);
  }

  async sendFeedback(data: {
    analysis_id?: string;
    message_id?: string;
    rating?: number;
    feedback_text?: string;
    was_helpful?: boolean;
  }) {
    return this.request<{
      success: boolean;
    }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient(API_BASE_URL, N8N_WEBHOOK_URL);
