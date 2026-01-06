/**
 * Cliente API para o Dashboard
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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
      municipalities: any[];
    }>(`/municipalities${query ? `?${query}` : ''}`);
  }

  async getMunicipality(id: string) {
    return this.request<any>(`/municipalities/${id}`);
  }

  async getMunicipalityProfile(id: string) {
    return this.request<{
      municipality: any;
      summary: any;
      rankings: any[];
      top_indicators: any[];
    }>(`/municipalities/${id}/profile`);
  }

  async getMunicipalityIndicators(id: string, params?: {
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
    }>(`/municipalities/${id}/indicators${query ? `?${query}` : ''}`);
  }

  async compareMunicipalities(ids: string[], dimension?: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('ids', ids.join(','));
    if (dimension) searchParams.set('dimension', dimension);

    return this.request<{
      municipalities: any[];
      total_indicators: number;
    }>(`/municipalities/compare?${searchParams.toString()}`);
  }

  async getMicroregions() {
    return this.request<{
      count: number;
      microregions: any[];
    }>('/municipalities/regions/microregions');
  }

  async getGeoJSON() {
    return this.request<{
      type: string;
      features: any[];
    }>('/municipalities/geo/geojson');
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
      indicators: any[];
    }>(`/indicators${query ? `?${query}` : ''}`);
  }

  async getIndicatorCategories(dimension?: string) {
    const query = dimension ? `?dimension=${dimension}` : '';
    return this.request<{
      count: number;
      categories_by_dimension: Record<string, any[]>;
    }>(`/indicators/categories${query}`);
  }

  async getIndicatorValues(code: string, params?: {
    year?: number;
    microregion?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set('year', String(params.year));
    if (params?.microregion) searchParams.set('microregion', params.microregion);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return this.request<{
      indicator_code: string;
      count: number;
      values: any[];
    }>(`/indicators/${code}/values${query ? `?${query}` : ''}`);
  }

  async getIndicatorRanking(code: string, params?: {
    year?: number;
    limit?: number;
    order?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set('year', String(params.year));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    return this.request<{
      indicator_code: string;
      order: string;
      ranking: any[];
    }>(`/indicators/${code}/ranking${query ? `?${query}` : ''}`);
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

  // ==================
  // Chat
  // ==================

  async sendChatMessage(data: {
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
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getChatSession(sessionId: string) {
    return this.request<{
      session_id: string;
      messages: any[];
    }>(`/chat/sessions/${sessionId}`);
  }

  async sendFeedback(sessionId: string, data: {
    message_id: string;
    rating?: number;
    feedback_text?: string;
    was_helpful?: boolean;
  }) {
    return this.request<{
      success: boolean;
      feedback_id: string;
    }>(`/chat/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================
  // Exportação
  // ==================

  async exportAnalysis(data: {
    municipality_id: string;
    dimensions?: string[];
    format?: 'pdf' | 'text';
  }) {
    const response = await fetch(`${this.baseUrl}/export/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar análise');
    }

    return response.blob();
  }

  async exportComparison(data: {
    municipality_ids: string[];
    format?: 'pdf' | 'text';
  }) {
    const response = await fetch(`${this.baseUrl}/export/comparison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar comparação');
    }

    return response.blob();
  }
}

export const api = new ApiClient(API_BASE_URL);
