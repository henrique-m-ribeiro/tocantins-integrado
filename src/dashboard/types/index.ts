/**
 * Tipos do Dashboard - Tocantins Integrado
 * Sistema dimensional de indicadores municipais
 */

// ============================================================================
// Dimensões do Sistema
// ============================================================================

export type Dimension = 'ECON' | 'SOCIAL' | 'TERRA' | 'AMBIENT';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  ECON: 'Econômica',
  SOCIAL: 'Social',
  TERRA: 'Territorial',
  AMBIENT: 'Ambiental',
};

export const DIMENSION_COLORS: Record<Dimension, string> = {
  ECON: '#10B981',    // Verde esmeralda
  SOCIAL: '#3B82F6',  // Azul
  TERRA: '#F59E0B',   // Âmbar
  AMBIENT: '#22C55E', // Verde
};

// ============================================================================
// Geografia - Estrutura territorial do Tocantins
// ============================================================================

export interface Microregion {
  id: string;
  code: string;
  name: string;
  mesoregion_id: string;
}

export interface Mesoregion {
  id: string;
  code: string;
  name: string;
}

export interface Municipality {
  id: string;
  ibge_code: string;
  name: string;
  microregion_id: string;
  microregion?: Microregion;
  population?: number;
  area_km2?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Indicadores
// ============================================================================

export type IndicatorUnit =
  | 'percent'       // Percentual (%)
  | 'currency'      // Moeda (R$)
  | 'number'        // Número absoluto
  | 'ratio'         // Razão (X:Y)
  | 'index'         // Índice (0-1, 0-100)
  | 'per_capita'    // Per capita (R$/hab, unidade/hab)
  | 'density'       // Densidade (hab/km², unidade/km²)
  | 'growth_rate';  // Taxa de crescimento (%/ano)

export interface IndicatorCategory {
  id: string;
  code: string;
  name: string;
  dimension: Dimension;
  description?: string;
}

export interface Indicator {
  id: string;
  code: string;
  name: string;
  description?: string;
  dimension: Dimension;
  category_id: string;
  category?: IndicatorCategory;
  unit: IndicatorUnit;
  source: string;
  update_frequency?: string;
  calculation_method?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorValue {
  id: string;
  indicator_id: string;
  indicator?: Indicator;
  municipality_id: string;
  municipality?: Municipality;
  year: number;
  month?: number;
  value: number;
  confidence_level?: number;
  data_quality?: 'high' | 'medium' | 'low';
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Análises e Insights
// ============================================================================

export interface AIAnalysis {
  id: string;
  municipality_id: string;
  dimension?: Dimension;
  analysis_type: 'overview' | 'dimension' | 'indicator' | 'comparison';
  title: string;
  content: string;
  key_findings: string[];
  recommendations?: string[];
  confidence_score?: number;
  created_at: string;
}

export interface TrendAnalysis {
  indicator_id: string;
  trend: 'up' | 'down' | 'stable' | 'volatile';
  change_percent: number;
  period_years: number;
  statistical_significance?: number;
}

// ============================================================================
// Estado de UI
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  lastUpdated?: Date;
}

export interface DataState<T> extends LoadingState {
  data: T | null;
}

// ============================================================================
// Filtros e Seleções
// ============================================================================

export interface TerritorySelection {
  municipality?: Municipality;
  microregion?: Microregion;
  mesoregion?: Mesoregion;
}

export interface PeriodSelection {
  startYear: number;
  endYear: number;
  month?: number;
}

export interface DashboardFilters {
  territory: TerritorySelection;
  period: PeriodSelection;
  dimensions: Dimension[];
  indicators?: string[]; // indicator codes
}

// ============================================================================
// Respostas da API
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// KPI Card
// ============================================================================

export interface KPIData {
  value: number;
  unit: IndicatorUnit;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number; // Percentual de mudança
  comparison?: {
    value: number;
    label: string; // Ex: "média estadual", "ano anterior"
  };
  lastUpdate?: string;
}

// ============================================================================
// Chat e Exploração
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    municipality_id?: string;
    dimension?: Dimension;
    indicators?: string[];
  };
}

export interface ExplorationQuery {
  question: string;
  municipality_id?: string;
  dimension?: Dimension;
  context?: Record<string, unknown>;
}

// ============================================================================
// Comparação entre Municípios
// ============================================================================

export interface MunicipalityComparison {
  municipalities: Municipality[];
  indicators: Indicator[];
  values: Record<string, Record<string, IndicatorValue>>; // [municipality_id][indicator_code]
  rankings: Record<string, number>; // [municipality_id] -> ranking position
}
