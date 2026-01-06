/**
 * Tipos relacionados a Indicadores Socioeconômicos
 */

// Dimensões de análise
export type Dimension = 'ECON' | 'SOCIAL' | 'TERRA' | 'AMBIENT';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  ECON: 'Econômica',
  SOCIAL: 'Social',
  TERRA: 'Territorial',
  AMBIENT: 'Ambiental'
};

export const DIMENSION_DESCRIPTIONS: Record<Dimension, string> = {
  ECON: 'PIB, emprego, renda, atividades econômicas, finanças públicas',
  SOCIAL: 'Educação, saúde, assistência social, segurança, cultura',
  TERRA: 'Infraestrutura, saneamento, transporte, habitação, uso do solo',
  AMBIENT: 'Meio ambiente, recursos hídricos, desmatamento, áreas protegidas'
};

// Categoria de indicador
export interface IndicatorCategory {
  id: string;
  dimension: Dimension;
  name: string;
  description: string;
  order: number;
}

// Definição de um indicador
export interface IndicatorDefinition {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  source: string;
  source_url?: string;
  methodology?: string;
  periodicity: 'annual' | 'monthly' | 'quarterly' | 'census';
  higher_is_better: boolean;
  created_at: Date;
}

// Valor de um indicador para um município
export interface IndicatorValue {
  id: string;
  indicator_id: string;
  municipality_id: string;
  year: number;
  month?: number;
  value: number;
  rank_state?: number;
  rank_microregion?: number;
  percentile_state?: number;
  created_at: Date;
  updated_at: Date;
}

// Indicador com valor e definição
export interface IndicatorWithValue extends IndicatorValue {
  indicator: IndicatorDefinition;
}

// Resumo dimensional de um município
export interface DimensionalSummary {
  dimension: Dimension;
  score: number; // 0-100
  rank_state: number;
  total_municipalities: number;
  key_indicators: {
    indicator: IndicatorDefinition;
    value: IndicatorValue;
    interpretation: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  analysis: string;
}

// Análise multidimensional completa
export interface MultidimensionalAnalysis {
  municipality_id: string;
  municipality_name: string;
  generated_at: Date;
  dimensions: DimensionalSummary[];
  overall_score: number;
  overall_rank: number;
  executive_summary: string;
  recommendations: string[];
}

// Comparação entre municípios/microrregiões
export interface ComparisonAnalysis {
  type: 'municipality' | 'microregion';
  entities: {
    id: string;
    name: string;
  }[];
  dimensions: {
    dimension: Dimension;
    comparison: {
      entity_id: string;
      score: number;
      rank: number;
    }[];
    insights: string[];
  }[];
  summary: string;
  generated_at: Date;
}

// Categorias de indicadores por dimensão
export const INDICATOR_CATEGORIES: Record<Dimension, string[]> = {
  ECON: [
    'PIB e Valor Adicionado',
    'Emprego e Renda',
    'Atividades Econômicas',
    'Finanças Públicas',
    'Comércio e Serviços'
  ],
  SOCIAL: [
    'Educação Básica',
    'Educação Superior',
    'Saúde',
    'Assistência Social',
    'Segurança Pública',
    'Cultura e Lazer'
  ],
  TERRA: [
    'Infraestrutura Urbana',
    'Saneamento Básico',
    'Transporte',
    'Habitação',
    'Energia',
    'Comunicações'
  ],
  AMBIENT: [
    'Cobertura Vegetal',
    'Recursos Hídricos',
    'Áreas Protegidas',
    'Resíduos Sólidos',
    'Qualidade Ambiental'
  ]
};
