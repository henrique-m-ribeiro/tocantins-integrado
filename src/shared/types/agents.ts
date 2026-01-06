/**
 * Tipos relacionados aos Agentes de IA
 */

import type { Dimension } from './indicators';

// Status de execução de um agente
export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

// Tipo de consulta
export type QueryType =
  | 'municipal_indicators'      // Indicadores de um município
  | 'dimensional_analysis'      // Análise de uma dimensão
  | 'multidimensional_analysis' // Análise de múltiplas dimensões
  | 'comparison'                // Comparação entre entidades
  | 'ranking'                   // Ranking de municípios
  | 'trend'                     // Análise de tendência temporal
  | 'free_query';               // Consulta livre

// Requisição para o orquestrador
export interface OrchestratorRequest {
  id: string;
  query: string;
  query_type?: QueryType;
  context?: {
    municipality_id?: string;
    municipality_ids?: string[];
    microregion_id?: string;
    dimension?: Dimension;
    dimensions?: Dimension[];
    year?: number;
    years?: number[];
  };
  user_id?: string;
  channel: 'dashboard' | 'whatsapp';
  created_at: Date;
}

// Resposta do orquestrador
export interface OrchestratorResponse {
  request_id: string;
  status: AgentStatus;
  query_type: QueryType;
  agents_used: Dimension[];
  response: {
    text: string;
    structured_data?: any;
    visualizations?: VisualizationData[];
  };
  metadata: {
    processing_time_ms: number;
    tokens_used?: number;
    model_used: string;
  };
  created_at: Date;
}

// Requisição para um agente dimensional
export interface AgentRequest {
  id: string;
  orchestrator_request_id: string;
  dimension: Dimension;
  task: string;
  context: {
    municipality_id?: string;
    municipality_ids?: string[];
    year?: number;
    indicators?: string[];
  };
  created_at: Date;
}

// Resposta de um agente dimensional
export interface AgentResponse {
  request_id: string;
  dimension: Dimension;
  status: AgentStatus;
  analysis: {
    summary: string;
    key_findings: string[];
    data_points: DataPoint[];
    recommendations?: string[];
  };
  metadata: {
    processing_time_ms: number;
    indicators_analyzed: number;
    data_sources: string[];
  };
  created_at: Date;
}

// Ponto de dados para visualização
export interface DataPoint {
  label: string;
  value: number;
  unit: string;
  year?: number;
  comparison?: {
    state_average: number;
    microregion_average: number;
    percentile: number;
  };
}

// Dados para visualização
export interface VisualizationData {
  type: 'bar' | 'line' | 'pie' | 'map' | 'radar' | 'table';
  title: string;
  data: any;
  config?: any;
}

// Configuração de um agente
export interface AgentConfig {
  dimension: Dimension;
  name: string;
  description: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  tools: AgentTool[];
}

// Ferramenta disponível para um agente
export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
}

// Log de execução de agente
export interface AgentExecutionLog {
  id: string;
  request_id: string;
  dimension: Dimension;
  started_at: Date;
  completed_at?: Date;
  status: AgentStatus;
  input_tokens?: number;
  output_tokens?: number;
  error_message?: string;
}
