/**
 * SocialAgent - Agente de Análise Social
 * Tocantins Integrado - MVP v1.0
 *
 * Responsável por analisar indicadores sociais:
 * - Educação (Básica e Superior)
 * - Saúde
 * - Assistência Social
 * - Segurança Pública
 * - Demografia
 */

import { BaseAgent } from '../base/BaseAgent';
import type { AgentConfig } from '../../shared/types';

const SOCIAL_SYSTEM_PROMPT = `Você é um especialista em políticas sociais e desenvolvimento humano do estado do Tocantins, Brasil.

Sua função é analisar indicadores sociais de municípios tocantinenses e fornecer insights para formulação de políticas públicas.

CONTEXTO DO TOCANTINS:
- População de aproximadamente 1,6 milhão de habitantes
- Grande diversidade: comunidades indígenas, quilombolas, ribeirinhos
- Desafios históricos em educação e saúde, mas com avanços recentes
- IDHM varia significativamente entre municípios (0.5 a 0.8)
- Cobertura de Estratégia Saúde da Família acima da média nacional
- Alta taxa de urbanização concentrada em poucos municípios

INDICADORES-CHAVE:
- IDEB (Anos Iniciais e Finais): mede qualidade da educação básica
- Taxa de Mortalidade Infantil: indicador crítico de saúde
- Cobertura da ESF: acesso à atenção primária
- Taxa de Analfabetismo: indicador educacional estrutural
- IDHM: síntese do desenvolvimento humano

DIRETRIZES DE ANÁLISE:
1. Priorize indicadores de resultado (mortalidade, aprendizagem) sobre indicadores de estrutura
2. Compare com metas do Plano Nacional de Educação e ODS
3. Identifique populações vulneráveis e suas necessidades específicas
4. Considere a intersetorialidade (educação-saúde-assistência)
5. Destaque boas práticas que podem ser replicadas

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo da análise social em 2-3 parágrafos",
  "key_findings": ["Achado 1", "Achado 2", "Achado 3"],
  "education_assessment": {
    "level": "Adequado/Em desenvolvimento/Crítico",
    "main_challenges": ["Desafio 1", "Desafio 2"],
    "highlights": ["Destaque 1"]
  },
  "health_assessment": {
    "level": "Adequado/Em desenvolvimento/Crítico",
    "main_challenges": ["Desafio 1"],
    "highlights": ["Destaque 1"]
  },
  "vulnerability_index": "Baixo/Médio/Alto",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "priority_actions": ["Ação prioritária 1", "Ação prioritária 2"]
}

Use linguagem empática e focada em soluções práticas.`;

export class SocialAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      dimension: 'SOCIAL',
      name: 'Agente Social',
      description: 'Analisa educação, saúde, assistência social, segurança e demografia',
      system_prompt: SOCIAL_SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: 0.3,
      max_tokens: 2000,
      tools: [
        {
          name: 'get_education_data',
          description: 'Busca indicadores educacionais do município',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_health_data',
          description: 'Busca indicadores de saúde do município',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_social_assistance_data',
          description: 'Busca dados de assistência social e vulnerabilidade',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        }
      ]
    };
    super(config);
  }

  /**
   * Análise de indicadores educacionais
   */
  async analyzeEducation(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit, higher_is_better)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.SOCIAL_IDEB%,indicator.code.like.SOCIAL_TX_ABANDONO%,indicator.code.like.SOCIAL_MATRICULAS%,indicator.code.like.SOCIAL_TX_ANALFABETISMO%');

    if (error) throw error;

    // Classificar qualidade educacional
    const idebAI = data?.find(d => d.indicator?.code === 'SOCIAL_IDEB_AI')?.value;
    const idebAF = data?.find(d => d.indicator?.code === 'SOCIAL_IDEB_AF')?.value;
    const analfabetismo = data?.find(d => d.indicator?.code === 'SOCIAL_TX_ANALFABETISMO')?.value;

    let educationLevel: 'adequate' | 'developing' | 'critical' = 'developing';

    if (idebAI && idebAI >= 6.0 && idebAF && idebAF >= 5.5) {
      educationLevel = 'adequate';
    } else if ((idebAI && idebAI < 4.0) || (analfabetismo && analfabetismo > 20)) {
      educationLevel = 'critical';
    }

    return {
      indicators: data,
      level: educationLevel
    };
  }

  /**
   * Análise de indicadores de saúde
   */
  async analyzeHealth(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit, higher_is_better)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.SOCIAL_TX_MORTALIDADE%,indicator.code.like.SOCIAL_COBERTURA%,indicator.code.like.SOCIAL_LEITOS%,indicator.code.like.SOCIAL_MEDICOS%');

    if (error) throw error;

    // Classificar situação de saúde
    const mortalidadeInf = data?.find(d => d.indicator?.code === 'SOCIAL_TX_MORTALIDADE_INF')?.value;
    const coberturaESF = data?.find(d => d.indicator?.code === 'SOCIAL_COBERTURA_ESF')?.value;

    let healthLevel: 'adequate' | 'developing' | 'critical' = 'developing';

    if (mortalidadeInf && mortalidadeInf < 10 && coberturaESF && coberturaESF > 80) {
      healthLevel = 'adequate';
    } else if (mortalidadeInf && mortalidadeInf > 20) {
      healthLevel = 'critical';
    }

    return {
      indicators: data,
      level: healthLevel
    };
  }

  /**
   * Análise de vulnerabilidade social
   */
  async analyzeVulnerability(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.SOCIAL_FAMILIAS%,indicator.code.like.SOCIAL_BPC%,indicator.code.like.SOCIAL_CADUNICO%');

    if (error) throw error;

    // Buscar população para calcular proporções
    const municipality = await this.getMunicipalityInfo(municipalityId);
    const population = municipality?.population || 1;

    const familiasBF = data?.find(d => d.indicator?.code === 'SOCIAL_FAMILIAS_BF')?.value || 0;
    const familiasCadUnico = data?.find(d => d.indicator?.code === 'SOCIAL_CADUNICO')?.value || 0;

    // Estimar famílias (população / 3.5 membros médios)
    const estimatedFamilies = population / 3.5;
    const vulnerabilityRate = (familiasCadUnico / estimatedFamilies) * 100;

    let vulnerabilityIndex: 'low' | 'medium' | 'high' = 'medium';
    if (vulnerabilityRate < 20) {
      vulnerabilityIndex = 'low';
    } else if (vulnerabilityRate > 40) {
      vulnerabilityIndex = 'high';
    }

    return {
      indicators: data,
      vulnerabilityIndex,
      vulnerabilityRate
    };
  }

  /**
   * Calcula o perfil social completo do município
   */
  async getSocialProfile(municipalityId: string) {
    const [education, health, vulnerability] = await Promise.all([
      this.analyzeEducation(municipalityId),
      this.analyzeHealth(municipalityId),
      this.analyzeVulnerability(municipalityId)
    ]);

    // Buscar IDHM
    const { data: idhmData } = await this.supabase
      .from('indicator_values')
      .select('value')
      .eq('municipality_id', municipalityId)
      .eq('indicator.code', 'SOCIAL_IDHM')
      .single();

    const idhm = idhmData?.value;
    let idhmLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' = 'medium';

    if (idhm) {
      if (idhm >= 0.8) idhmLevel = 'very_high';
      else if (idhm >= 0.7) idhmLevel = 'high';
      else if (idhm >= 0.6) idhmLevel = 'medium';
      else if (idhm >= 0.5) idhmLevel = 'low';
      else idhmLevel = 'very_low';
    }

    return {
      education,
      health,
      vulnerability,
      idhm,
      idhmLevel,
      overallAssessment: this.calculateOverallAssessment(education.level, health.level, vulnerability.vulnerabilityIndex)
    };
  }

  /**
   * Calcula avaliação geral combinando as três dimensões
   */
  private calculateOverallAssessment(
    education: 'adequate' | 'developing' | 'critical',
    health: 'adequate' | 'developing' | 'critical',
    vulnerability: 'low' | 'medium' | 'high'
  ): 'good' | 'regular' | 'concerning' | 'critical' {
    const scores = {
      education: education === 'adequate' ? 3 : education === 'developing' ? 2 : 1,
      health: health === 'adequate' ? 3 : health === 'developing' ? 2 : 1,
      vulnerability: vulnerability === 'low' ? 3 : vulnerability === 'medium' ? 2 : 1
    };

    const average = (scores.education + scores.health + scores.vulnerability) / 3;

    if (average >= 2.5) return 'good';
    if (average >= 2) return 'regular';
    if (average >= 1.5) return 'concerning';
    return 'critical';
  }
}

// Singleton instance
let instance: SocialAgent | null = null;

export function getSocialAgent(): SocialAgent {
  if (!instance) {
    instance = new SocialAgent();
  }
  return instance;
}
