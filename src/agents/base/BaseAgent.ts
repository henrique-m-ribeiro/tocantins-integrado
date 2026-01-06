/**
 * BaseAgent - Classe base para todos os agentes dimensionais
 * Tocantins Integrado - MVP v1.0
 */

import OpenAI from 'openai';
import { getServiceClient } from '../../database/client';
import type { Dimension, AgentConfig, AgentRequest, AgentResponse, DataPoint } from '../../shared/types';

export abstract class BaseAgent {
  protected dimension: Dimension;
  protected config: AgentConfig;
  protected openai: OpenAI;
  protected supabase: ReturnType<typeof getServiceClient>;

  constructor(config: AgentConfig) {
    this.dimension = config.dimension;
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.supabase = getServiceClient();
  }

  /**
   * Processa uma requisição e retorna a análise
   */
  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // 1. Buscar dados relevantes
      const data = await this.fetchData(request);

      // 2. Preparar contexto para o LLM
      const context = this.prepareContext(data, request);

      // 3. Gerar análise com LLM
      const analysis = await this.generateAnalysis(context, request.task);

      // 4. Formatar resposta
      return {
        request_id: request.id,
        dimension: this.dimension,
        status: 'completed',
        analysis: {
          summary: analysis.summary,
          key_findings: analysis.keyFindings,
          data_points: data.dataPoints,
          recommendations: analysis.recommendations
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
          indicators_analyzed: data.dataPoints.length,
          data_sources: data.sources
        },
        created_at: new Date()
      };
    } catch (error) {
      return {
        request_id: request.id,
        dimension: this.dimension,
        status: 'error',
        analysis: {
          summary: `Erro ao processar análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          key_findings: [],
          data_points: []
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
          indicators_analyzed: 0,
          data_sources: []
        },
        created_at: new Date()
      };
    }
  }

  /**
   * Busca dados do banco de dados para a análise
   */
  protected async fetchData(request: AgentRequest): Promise<{
    dataPoints: DataPoint[];
    sources: string[];
    rawData: any[];
  }> {
    const { municipality_id, municipality_ids, year } = request.context;
    const targetYear = year || new Date().getFullYear() - 1;

    // Query para buscar indicadores da dimensão
    let query = this.supabase
      .from('v_latest_indicators')
      .select('*')
      .eq('dimension', this.dimension);

    if (municipality_id) {
      query = query.eq('municipality_id', municipality_id);
    } else if (municipality_ids && municipality_ids.length > 0) {
      query = query.in('municipality_id', municipality_ids);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Erro ao buscar dados da dimensão ${this.dimension}:`, error);
      throw error;
    }

    // Transformar em DataPoints
    const dataPoints: DataPoint[] = (data || []).map(row => ({
      label: row.indicator_name,
      value: row.value,
      unit: row.unit,
      year: row.year,
      comparison: {
        state_average: 0, // Será preenchido em query separada
        microregion_average: 0,
        percentile: row.percentile_state || 50
      }
    }));

    // Coletar fontes únicas
    const sources = [...new Set((data || []).map(row => row.source || 'IBGE'))];

    return {
      dataPoints,
      sources,
      rawData: data || []
    };
  }

  /**
   * Prepara o contexto para o LLM
   */
  protected prepareContext(data: { dataPoints: DataPoint[]; sources: string[]; rawData: any[] }, request: AgentRequest): string {
    const indicatorsText = data.dataPoints.map(dp =>
      `- ${dp.label}: ${dp.value} ${dp.unit} (${dp.year})`
    ).join('\n');

    return `
CONTEXTO DA ANÁLISE - DIMENSÃO ${this.config.name.toUpperCase()}
===============================================

Tarefa: ${request.task}

Indicadores disponíveis:
${indicatorsText || 'Nenhum indicador disponível para esta consulta.'}

Fontes de dados: ${data.sources.join(', ')}
    `.trim();
  }

  /**
   * Gera análise usando o LLM
   */
  protected async generateAnalysis(context: string, task: string): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations?: string[];
  }> {
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
      messages: [
        {
          role: 'system',
          content: this.config.system_prompt
        },
        {
          role: 'user',
          content: `${context}\n\n${task}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('Resposta vazia do LLM');
    }

    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || parsed.resumo || 'Análise não disponível',
        keyFindings: parsed.key_findings || parsed.principais_achados || [],
        recommendations: parsed.recommendations || parsed.recomendacoes
      };
    } catch {
      // Se não for JSON válido, usar como texto
      return {
        summary: response,
        keyFindings: []
      };
    }
  }

  /**
   * Busca informações de um município específico
   */
  protected async getMunicipalityInfo(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('v_municipalities_full')
      .select('*')
      .eq('id', municipalityId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca médias estaduais para comparação
   */
  protected async getStateAverages(indicatorIds: string[], year: number) {
    const { data, error } = await this.supabase
      .from('state_averages')
      .select('*')
      .in('indicator_id', indicatorIds)
      .eq('year', year);

    if (error) throw error;
    return data;
  }

  /**
   * Getter para a dimensão do agente
   */
  getDimension(): Dimension {
    return this.dimension;
  }

  /**
   * Getter para o nome do agente
   */
  getName(): string {
    return this.config.name;
  }
}
