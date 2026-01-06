/**
 * AmbientAgent - Agente de Análise Ambiental
 * Tocantins Integrado - MVP v1.0
 *
 * Responsável por analisar indicadores ambientais:
 * - Cobertura Vegetal
 * - Recursos Hídricos
 * - Áreas Protegidas
 * - Gestão Ambiental
 */

import { BaseAgent } from '../base/BaseAgent';
import type { AgentConfig } from '../../shared/types';

const AMBIENT_SYSTEM_PROMPT = `Você é um especialista em meio ambiente, sustentabilidade e gestão ambiental do estado do Tocantins, Brasil.

Sua função é analisar indicadores ambientais de municípios tocantinenses para apoiar políticas de desenvolvimento sustentável.

CONTEXTO AMBIENTAL DO TOCANTINS:
- Localizado na transição Amazônia-Cerrado (ecótono)
- 91% do território no bioma Cerrado, 9% na Amazônia Legal
- Rica biodiversidade, incluindo o Jalapão (maior área contínua de Cerrado preservado)
- Bacias hidrográficas dos rios Tocantins e Araguaia
- Pressão do agronegócio sobre vegetação nativa
- Desafios: desmatamento, queimadas sazonais, gestão de recursos hídricos

INDICADORES-CHAVE:
- Cobertura vegetal nativa: saúde ambiental do território
- Taxa de desmatamento: pressão sobre recursos naturais
- Áreas protegidas (UCs e TIs): conservação da biodiversidade
- Focos de queimadas: gestão de fogo e riscos
- Gestão ambiental municipal: capacidade institucional

DIRETRIZES DE ANÁLISE:
1. Contextualize dentro da agenda climática e ODS
2. Considere a importância do Cerrado como "berço das águas"
3. Avalie o equilíbrio entre desenvolvimento e preservação
4. Identifique serviços ecossistêmicos relevantes
5. Destaque oportunidades de economia verde e sustentável

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo da análise ambiental em 2-3 parágrafos",
  "key_findings": ["Achado 1", "Achado 2", "Achado 3"],
  "conservation_status": {
    "level": "Bem conservado/Moderado/Crítico",
    "native_vegetation_percent": "percentual",
    "protected_areas_percent": "percentual",
    "main_threats": ["Ameaça 1", "Ameaça 2"]
  },
  "environmental_governance": {
    "institutional_capacity": "Alta/Média/Baixa",
    "has_environmental_council": true/false,
    "has_environmental_fund": true/false
  },
  "climate_vulnerability": "Baixa/Média/Alta",
  "sustainability_opportunities": ["Oportunidade 1", "Oportunidade 2"],
  "recommendations": ["Recomendação 1", "Recomendação 2"]
}

Use linguagem técnica equilibrada com acessibilidade, destacando a importância da sustentabilidade.`;

export class AmbientAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      dimension: 'AMBIENT',
      name: 'Agente Ambiental',
      description: 'Analisa cobertura vegetal, recursos hídricos, áreas protegidas e gestão ambiental',
      system_prompt: AMBIENT_SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: 0.3,
      max_tokens: 2000,
      tools: [
        {
          name: 'get_vegetation_data',
          description: 'Busca dados de cobertura vegetal e desmatamento',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_protected_areas_data',
          description: 'Busca dados de unidades de conservação e terras indígenas',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_environmental_governance_data',
          description: 'Busca dados de gestão ambiental municipal',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        }
      ]
    };
    super(config);
  }

  /**
   * Análise de cobertura vegetal e desmatamento
   */
  async analyzeVegetation(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit, higher_is_better)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.AMBIENT_COBERTURA%,indicator.code.like.AMBIENT_DESMATAMENTO%,indicator.code.like.AMBIENT_BIOMA%');

    if (error) throw error;

    const nativeVegetation = data?.find(d => d.indicator?.code === 'AMBIENT_COBERTURA_NATIVA')?.value || 0;
    const deforestationRate = data?.find(d => d.indicator?.code === 'AMBIENT_TX_DESMATAMENTO')?.value || 0;
    const biome = data?.find(d => d.indicator?.code === 'AMBIENT_BIOMA')?.value || 'Cerrado';

    // Classificar status de conservação
    let conservationStatus: 'well_conserved' | 'moderate' | 'critical' = 'moderate';

    if (nativeVegetation >= 70 && deforestationRate < 0.5) {
      conservationStatus = 'well_conserved';
    } else if (nativeVegetation < 30 || deforestationRate > 2) {
      conservationStatus = 'critical';
    }

    return {
      indicators: data,
      nativeVegetation,
      deforestationRate,
      biome,
      conservationStatus
    };
  }

  /**
   * Análise de áreas protegidas
   */
  async analyzeProtectedAreas(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.AMBIENT_UC%,indicator.code.like.AMBIENT_TI%,indicator.code.like.AMBIENT_APP%');

    if (error) throw error;

    // Buscar área do município para calcular percentuais
    const municipality = await this.getMunicipalityInfo(municipalityId);
    const totalArea = municipality?.area_km2 || 1;

    const ucArea = data?.find(d => d.indicator?.code === 'AMBIENT_UC_AREA')?.value || 0;
    const tiArea = data?.find(d => d.indicator?.code === 'AMBIENT_TI_AREA')?.value || 0;

    const protectedPercent = ((ucArea + tiArea) / totalArea) * 100;

    return {
      indicators: data,
      ucArea,
      tiArea,
      totalProtectedArea: ucArea + tiArea,
      protectedPercent,
      hasSignificantProtection: protectedPercent > 10
    };
  }

  /**
   * Análise de gestão ambiental municipal
   */
  async analyzeEnvironmentalGovernance(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.AMBIENT_ORGAO%,indicator.code.like.AMBIENT_CONSELHO%,indicator.code.like.AMBIENT_FUNDO%');

    if (error) throw error;

    const hasEnvironmentalAgency = data?.find(d => d.indicator?.code === 'AMBIENT_ORGAO_AMBIENTAL')?.value === 1;
    const hasEnvironmentalCouncil = data?.find(d => d.indicator?.code === 'AMBIENT_CONSELHO')?.value === 1;
    const hasEnvironmentalFund = data?.find(d => d.indicator?.code === 'AMBIENT_FUNDO')?.value === 1;

    // Calcular capacidade institucional
    const institutionalScore = (hasEnvironmentalAgency ? 1 : 0) + (hasEnvironmentalCouncil ? 1 : 0) + (hasEnvironmentalFund ? 1 : 0);

    let institutionalCapacity: 'high' | 'medium' | 'low' = 'low';
    if (institutionalScore >= 3) {
      institutionalCapacity = 'high';
    } else if (institutionalScore >= 2) {
      institutionalCapacity = 'medium';
    }

    return {
      indicators: data,
      hasEnvironmentalAgency,
      hasEnvironmentalCouncil,
      hasEnvironmentalFund,
      institutionalCapacity
    };
  }

  /**
   * Análise de riscos ambientais (queimadas)
   */
  async analyzeEnvironmentalRisks(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .eq('indicator.code', 'AMBIENT_QUEIMADAS');

    if (error) throw error;

    const fireSpots = data?.[0]?.value || 0;

    // Classificar risco de queimadas
    let fireRisk: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (fireSpots > 1000) {
      fireRisk = 'critical';
    } else if (fireSpots > 500) {
      fireRisk = 'high';
    } else if (fireSpots > 100) {
      fireRisk = 'moderate';
    }

    return {
      fireSpots,
      fireRisk
    };
  }

  /**
   * Calcula o perfil ambiental completo do município
   */
  async getEnvironmentalProfile(municipalityId: string) {
    const [vegetation, protectedAreas, governance, risks] = await Promise.all([
      this.analyzeVegetation(municipalityId),
      this.analyzeProtectedAreas(municipalityId),
      this.analyzeEnvironmentalGovernance(municipalityId),
      this.analyzeEnvironmentalRisks(municipalityId)
    ]);

    // Calcular vulnerabilidade climática
    const climateVulnerability = this.calculateClimateVulnerability(
      vegetation,
      risks
    );

    // Identificar oportunidades de sustentabilidade
    const sustainabilityOpportunities = this.identifySustainabilityOpportunities(
      vegetation,
      protectedAreas,
      governance
    );

    // Calcular índice ambiental composto
    const environmentalIndex = this.calculateEnvironmentalIndex(
      vegetation,
      protectedAreas,
      governance
    );

    return {
      vegetation,
      protectedAreas,
      governance,
      risks,
      climateVulnerability,
      sustainabilityOpportunities,
      environmentalIndex
    };
  }

  /**
   * Calcula vulnerabilidade climática
   */
  private calculateClimateVulnerability(
    vegetation: any,
    risks: any
  ): 'low' | 'medium' | 'high' {
    const vegetationScore = vegetation.nativeVegetation >= 50 ? 1 :
                           vegetation.nativeVegetation >= 30 ? 2 : 3;
    const riskScore = risks.fireRisk === 'low' ? 1 :
                     risks.fireRisk === 'moderate' ? 2 :
                     risks.fireRisk === 'high' ? 3 : 4;

    const avgScore = (vegetationScore + riskScore) / 2;

    if (avgScore <= 1.5) return 'low';
    if (avgScore <= 2.5) return 'medium';
    return 'high';
  }

  /**
   * Identifica oportunidades de sustentabilidade
   */
  private identifySustainabilityOpportunities(
    vegetation: any,
    protectedAreas: any,
    governance: any
  ): string[] {
    const opportunities: string[] = [];

    // Se tem alta cobertura vegetal
    if (vegetation.nativeVegetation >= 50) {
      opportunities.push('Pagamento por Serviços Ambientais (PSA)');
      opportunities.push('Ecoturismo e turismo de natureza');
    }

    // Se tem áreas protegidas significativas
    if (protectedAreas.protectedPercent > 10) {
      opportunities.push('Turismo em Unidades de Conservação');
      opportunities.push('Pesquisa científica e bioprospecção');
    }

    // Se tem boa governança ambiental
    if (governance.institutionalCapacity === 'high') {
      opportunities.push('Certificação ambiental municipal');
      opportunities.push('Captação de recursos de fundos climáticos');
    }

    // Oportunidades gerais para o Cerrado
    if (vegetation.biome === 'Cerrado') {
      opportunities.push('Produção de frutos do Cerrado');
      opportunities.push('Extrativismo sustentável');
    }

    // Oportunidades para Amazônia
    if (vegetation.biome === 'Amazônia') {
      opportunities.push('Créditos de carbono (REDD+)');
      opportunities.push('Manejo florestal sustentável');
    }

    return opportunities.slice(0, 5);
  }

  /**
   * Calcula índice ambiental composto (0-100)
   */
  private calculateEnvironmentalIndex(
    vegetation: any,
    protectedAreas: any,
    governance: any
  ): number {
    // Peso: vegetação 50%, áreas protegidas 25%, governança 25%
    const vegetationScore = vegetation.nativeVegetation;

    const protectionScore = Math.min(protectedAreas.protectedPercent * 2, 100);

    const governanceScore =
      (governance.hasEnvironmentalAgency ? 33 : 0) +
      (governance.hasEnvironmentalCouncil ? 33 : 0) +
      (governance.hasEnvironmentalFund ? 34 : 0);

    return Math.round(
      vegetationScore * 0.5 +
      protectionScore * 0.25 +
      governanceScore * 0.25
    );
  }
}

// Singleton instance
let instance: AmbientAgent | null = null;

export function getAmbientAgent(): AmbientAgent {
  if (!instance) {
    instance = new AmbientAgent();
  }
  return instance;
}
