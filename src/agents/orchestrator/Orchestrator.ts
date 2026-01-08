/**
 * Orchestrator - Orquestrador de Agentes
 * Tocantins Integrado - MVP v1.0
 *
 * Responsável por:
 * - Interpretar consultas em linguagem natural
 * - Rotear para os agentes dimensionais apropriados
 * - Consolidar respostas de múltiplos agentes
 * - Gerenciar contexto de conversação
 */

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { getServiceClient } from '../../database/client';
import { getEconAgent, getSocialAgent, getTerraAgent, getAmbientAgent } from '../dimensional';
import type {
  Dimension,
  QueryType,
  OrchestratorRequest,
  OrchestratorResponse,
  AgentRequest,
  AgentResponse,
  VisualizationData
} from '../../shared/types';

const ORCHESTRATOR_SYSTEM_PROMPT = `Você é o Orquestrador do sistema Tocantins Integrado, uma plataforma de superinteligência territorial.

Sua função é interpretar consultas em linguagem natural sobre municípios do Tocantins e determinar:
1. O tipo de consulta (indicadores, análise dimensional, comparação, etc.)
2. Quais dimensões são relevantes (ECON, SOCIAL, TERRA, AMBIENT)
3. Quais municípios ou microrregiões estão envolvidos
4. O contexto temporal (ano de referência)

DIMENSÕES DISPONÍVEIS:
- ECON: Economia, PIB, emprego, renda, finanças públicas, agropecuária
- SOCIAL: Educação, saúde, assistência social, segurança, demografia
- TERRA: Infraestrutura, saneamento, transporte, habitação, comunicações
- AMBIENT: Meio ambiente, vegetação, recursos hídricos, áreas protegidas

TIPOS DE CONSULTA:
- municipal_indicators: Consulta de indicadores específicos de um município
- dimensional_analysis: Análise completa de uma dimensão
- multidimensional_analysis: Análise de múltiplas dimensões
- comparison: Comparação entre dois ou mais municípios/microrregiões
- ranking: Ranking de municípios por indicador ou dimensão
- trend: Análise de tendência temporal
- free_query: Consulta livre que requer interpretação

RESPONDA SEMPRE EM JSON:
{
  "query_type": "tipo_da_consulta",
  "dimensions": ["DIMENSAO1", "DIMENSAO2"],
  "entities": {
    "municipalities": ["nome_municipio1", "nome_municipio2"],
    "microregions": ["nome_microrregiao"],
    "municipality_ids": []
  },
  "temporal": {
    "year": 2024,
    "comparison_year": null
  },
  "specific_indicators": ["indicador1", "indicador2"],
  "task_description": "Descrição clara da tarefa para os agentes",
  "response_format": "detailed" | "summary" | "comparative"
}`;

export interface OrchestratorConfig {
  model: string;
  temperature: number;
  maxConcurrentAgents: number;
}

export class Orchestrator {
  private _openai: OpenAI | null = null;
  private supabase: ReturnType<typeof getServiceClient>;
  private config: OrchestratorConfig;

  private get openai(): OpenAI {
    if (!this._openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada. A funcionalidade de IA não está disponível.');
      }
      this._openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    return this._openai;
  }

  constructor(config?: Partial<OrchestratorConfig>) {
    this.supabase = getServiceClient();
    this.config = {
      model: config?.model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: config?.temperature || 0.2,
      maxConcurrentAgents: config?.maxConcurrentAgents || 4
    };
  }

  /**
   * Processa uma consulta do usuário
   */
  async process(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const startTime = Date.now();

    try {
      // 1. Interpretar a consulta
      const interpretation = await this.interpretQuery(request.query, request.context);

      // 2. Resolver entidades (municípios, microrregiões)
      const resolvedEntities = await this.resolveEntities(interpretation.entities);

      // 3. Preparar requisições para os agentes
      const agentRequests = this.prepareAgentRequests(
        request.id,
        interpretation,
        resolvedEntities
      );

      // 4. Executar agentes em paralelo
      const agentResponses = await this.executeAgents(agentRequests);

      // 5. Consolidar respostas
      const consolidatedResponse = await this.consolidateResponses(
        request.query,
        interpretation,
        agentResponses
      );

      // 6. Gerar visualizações se aplicável
      const visualizations = this.generateVisualizations(
        interpretation.query_type,
        agentResponses
      );

      // 7. Salvar log da requisição
      await this.logRequest(request, interpretation, agentResponses);

      return {
        request_id: request.id,
        status: 'completed',
        query_type: interpretation.query_type as QueryType,
        agents_used: interpretation.dimensions,
        response: {
          text: consolidatedResponse,
          structured_data: this.extractStructuredData(agentResponses),
          visualizations
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
          tokens_used: 0, // TODO: Implementar contagem de tokens
          model_used: this.config.model
        },
        created_at: new Date()
      };

    } catch (error) {
      console.error('Erro no Orchestrator:', error);

      return {
        request_id: request.id,
        status: 'error',
        query_type: 'free_query',
        agents_used: [],
        response: {
          text: `Desculpe, ocorreu um erro ao processar sua consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
          model_used: this.config.model
        },
        created_at: new Date()
      };
    }
  }

  /**
   * Interpreta a consulta do usuário usando LLM
   */
  private async interpretQuery(
    query: string,
    context?: OrchestratorRequest['context']
  ): Promise<{
    query_type: string;
    dimensions: Dimension[];
    entities: {
      municipalities: string[];
      microregions: string[];
    };
    temporal: {
      year: number;
      comparison_year?: number;
    };
    task_description: string;
    response_format: 'detailed' | 'summary' | 'comparative';
  }> {
    const contextInfo = context ? `
Contexto adicional:
- Município atual: ${context.municipality_id || 'não especificado'}
- Dimensão atual: ${context.dimension || 'não especificada'}
- Ano atual: ${context.year || new Date().getFullYear()}
` : '';

    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      messages: [
        { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
        { role: 'user', content: `${contextInfo}\nConsulta: ${query}` }
      ],
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia do LLM');
    }

    const parsed = JSON.parse(response);

    return {
      query_type: parsed.query_type || 'free_query',
      dimensions: parsed.dimensions || ['ECON', 'SOCIAL'],
      entities: {
        municipalities: parsed.entities?.municipalities || [],
        microregions: parsed.entities?.microregions || []
      },
      temporal: {
        year: parsed.temporal?.year || new Date().getFullYear() - 1,
        comparison_year: parsed.temporal?.comparison_year
      },
      task_description: parsed.task_description || query,
      response_format: parsed.response_format || 'detailed'
    };
  }

  /**
   * Resolve nomes de entidades para IDs do banco de dados
   */
  private async resolveEntities(entities: {
    municipalities: string[];
    microregions: string[];
  }): Promise<{
    municipality_ids: string[];
    microregion_ids: string[];
  }> {
    const result = {
      municipality_ids: [] as string[],
      microregion_ids: [] as string[]
    };

    // Resolver municípios
    if (entities.municipalities.length > 0) {
      for (const name of entities.municipalities) {
        const { data } = await this.supabase
          .from('municipalities')
          .select('id')
          .ilike('name', `%${name}%`)
          .limit(1)
          .single();

        if (data) {
          result.municipality_ids.push(data.id);
        }
      }
    }

    // Resolver microrregiões
    if (entities.microregions.length > 0) {
      for (const name of entities.microregions) {
        const { data } = await this.supabase
          .from('microregions')
          .select('id')
          .ilike('name', `%${name}%`)
          .limit(1)
          .single();

        if (data) {
          result.microregion_ids.push(data.id);
        }
      }
    }

    return result;
  }

  /**
   * Prepara requisições para cada agente dimensional
   */
  private prepareAgentRequests(
    orchestratorRequestId: string,
    interpretation: any,
    resolvedEntities: { municipality_ids: string[]; microregion_ids: string[] }
  ): AgentRequest[] {
    return interpretation.dimensions.map((dimension: Dimension) => ({
      id: uuidv4(),
      orchestrator_request_id: orchestratorRequestId,
      dimension,
      task: interpretation.task_description,
      context: {
        municipality_id: resolvedEntities.municipality_ids[0],
        municipality_ids: resolvedEntities.municipality_ids,
        year: interpretation.temporal.year,
        indicators: interpretation.specific_indicators
      },
      created_at: new Date()
    }));
  }

  /**
   * Executa os agentes em paralelo
   */
  private async executeAgents(requests: AgentRequest[]): Promise<AgentResponse[]> {
    const agents = {
      ECON: getEconAgent(),
      SOCIAL: getSocialAgent(),
      TERRA: getTerraAgent(),
      AMBIENT: getAmbientAgent()
    };

    const promises = requests.map(async request => {
      const agent = agents[request.dimension];
      if (!agent) {
        throw new Error(`Agente não encontrado para dimensão: ${request.dimension}`);
      }
      return agent.process(request);
    });

    // Limitar concorrência
    const results: AgentResponse[] = [];
    for (let i = 0; i < promises.length; i += this.config.maxConcurrentAgents) {
      const batch = promises.slice(i, i + this.config.maxConcurrentAgents);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Consolida respostas de múltiplos agentes
   */
  private async consolidateResponses(
    originalQuery: string,
    interpretation: any,
    responses: AgentResponse[]
  ): Promise<string> {
    // Se apenas um agente, retornar diretamente
    if (responses.length === 1) {
      return responses[0].analysis.summary;
    }

    // Preparar resumo de cada agente
    const agentSummaries = responses.map(r =>
      `## Dimensão ${r.dimension}\n${r.analysis.summary}\n\nPrincipais achados:\n${r.analysis.key_findings.map(f => `- ${f}`).join('\n')}`
    ).join('\n\n');

    // Usar LLM para consolidar
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise territorial. Sua tarefa é consolidar análises de múltiplas dimensões em uma resposta coesa e útil para um gestor público ou candidato político.

Diretrizes:
1. Comece com um resumo executivo de 2-3 parágrafos
2. Destaque as principais forças e desafios do município
3. Identifique conexões entre as dimensões analisadas
4. Conclua com recomendações práticas
5. Use linguagem clara e acessível`
        },
        {
          role: 'user',
          content: `Consulta original: "${originalQuery}"

Análises por dimensão:

${agentSummaries}

Por favor, consolide essas análises em uma resposta integrada e coesa.`
        }
      ]
    });

    return completion.choices[0]?.message?.content || agentSummaries;
  }

  /**
   * Gera visualizações baseadas no tipo de consulta
   */
  private generateVisualizations(
    queryType: string,
    responses: AgentResponse[]
  ): VisualizationData[] {
    const visualizations: VisualizationData[] = [];

    // Radar chart para análise multidimensional
    if (queryType === 'multidimensional_analysis' && responses.length > 1) {
      visualizations.push({
        type: 'radar',
        title: 'Perfil Multidimensional',
        data: responses.map(r => ({
          dimension: r.dimension,
          score: this.calculateDimensionScore(r)
        }))
      });
    }

    // Bar chart para rankings
    if (queryType === 'ranking') {
      const dataPoints = responses.flatMap(r => r.analysis.data_points);
      if (dataPoints.length > 0) {
        visualizations.push({
          type: 'bar',
          title: 'Ranking de Municípios',
          data: dataPoints.slice(0, 10)
        });
      }
    }

    // Table para comparações
    if (queryType === 'comparison') {
      visualizations.push({
        type: 'table',
        title: 'Comparação de Indicadores',
        data: responses.flatMap(r => r.analysis.data_points)
      });
    }

    return visualizations;
  }

  /**
   * Calcula score de uma dimensão (0-100)
   */
  private calculateDimensionScore(response: AgentResponse): number {
    const dataPoints = response.analysis.data_points;
    if (dataPoints.length === 0) return 50;

    const avgPercentile = dataPoints.reduce(
      (sum, dp) => sum + (dp.comparison?.percentile || 50),
      0
    ) / dataPoints.length;

    return Math.round(avgPercentile);
  }

  /**
   * Extrai dados estruturados das respostas
   */
  private extractStructuredData(responses: AgentResponse[]): any {
    return {
      dimensions: responses.map(r => ({
        dimension: r.dimension,
        status: r.status,
        summary: r.analysis.summary,
        keyFindings: r.analysis.key_findings,
        dataPoints: r.analysis.data_points,
        recommendations: r.analysis.recommendations
      })),
      metadata: {
        totalIndicatorsAnalyzed: responses.reduce(
          (sum, r) => sum + r.metadata.indicators_analyzed,
          0
        ),
        dataSources: [...new Set(responses.flatMap(r => r.metadata.data_sources))]
      }
    };
  }

  /**
   * Salva log da requisição no banco
   */
  private async logRequest(
    request: OrchestratorRequest,
    interpretation: any,
    responses: AgentResponse[]
  ): Promise<void> {
    try {
      await this.supabase.from('orchestrator_requests').insert({
        id: request.id,
        query: request.query,
        query_type: interpretation.query_type,
        status: 'completed',
        context: request.context,
        response: {
          interpretation,
          agent_responses: responses.map(r => ({
            dimension: r.dimension,
            status: r.status,
            summary: r.analysis.summary
          }))
        },
        agents_used: interpretation.dimensions,
        completed_at: new Date()
      });
    } catch (error) {
      console.error('Erro ao salvar log da requisição:', error);
    }
  }

  /**
   * Processa consulta simples (atalho)
   */
  async query(
    query: string,
    channel: 'dashboard' | 'whatsapp' = 'dashboard'
  ): Promise<OrchestratorResponse> {
    const request: OrchestratorRequest = {
      id: uuidv4(),
      query,
      channel,
      created_at: new Date()
    };
    return this.process(request);
  }
}

// Singleton instance
let instance: Orchestrator | null = null;

export function getOrchestrator(): Orchestrator {
  if (!instance) {
    instance = new Orchestrator();
  }
  return instance;
}
