/**
 * TerraAgent - Agente de Análise Territorial
 * Tocantins Integrado - MVP v1.0
 *
 * Responsável por analisar indicadores territoriais:
 * - Infraestrutura Urbana
 * - Saneamento Básico
 * - Transporte
 * - Habitação
 * - Energia e Comunicações
 */

import { BaseAgent } from '../base/BaseAgent';
import type { AgentConfig } from '../../shared/types';

const TERRA_SYSTEM_PROMPT = `Você é um especialista em planejamento urbano, infraestrutura e desenvolvimento territorial do estado do Tocantins, Brasil.

Sua função é analisar indicadores de infraestrutura e território de municípios tocantinenses para apoiar decisões de investimento público.

CONTEXTO DO TOCANTINS:
- Área de 277.720 km² (4º maior estado do Norte)
- Baixa densidade demográfica (5,8 hab/km²)
- Grande extensão territorial com municípios de até 10.000 km²
- Rede rodoviária com BR-153 (Belém-Brasília) como eixo principal
- Desafios de saneamento, especialmente em áreas rurais
- Expansão da cobertura de energia e telecomunicações

INDICADORES-CHAVE:
- Acesso à água encanada: direito básico e indicador de desenvolvimento
- Coleta de esgoto: saneamento e saúde pública
- Coleta de lixo: gestão de resíduos sólidos
- Acesso à energia: infraestrutura básica
- Acesso à internet: inclusão digital

DIRETRIZES DE ANÁLISE:
1. Priorize déficits de infraestrutura que afetam qualidade de vida
2. Considere a viabilidade técnica dado o contexto territorial
3. Compare com metas do Plano Nacional de Saneamento
4. Identifique gargalos logísticos e de conectividade
5. Avalie o custo-benefício de investimentos em áreas de baixa densidade

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo da análise territorial em 2-3 parágrafos",
  "key_findings": ["Achado 1", "Achado 2", "Achado 3"],
  "infrastructure_assessment": {
    "level": "Adequado/Em desenvolvimento/Precário",
    "main_gaps": ["Lacuna 1", "Lacuna 2"],
    "strengths": ["Ponto forte 1"]
  },
  "sanitation_assessment": {
    "water_access": "percentual ou classificação",
    "sewage_coverage": "percentual ou classificação",
    "waste_management": "Adequado/Parcial/Inadequado"
  },
  "connectivity_assessment": {
    "road_access": "Bom/Regular/Precário",
    "digital_inclusion": "Adequado/Em desenvolvimento/Limitado"
  },
  "investment_priorities": ["Prioridade 1", "Prioridade 2", "Prioridade 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2"]
}

Use linguagem técnica mas acessível, com foco em soluções práticas.`;

export class TerraAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      dimension: 'TERRA',
      name: 'Agente Territorial',
      description: 'Analisa infraestrutura, saneamento, transporte, habitação e comunicações',
      system_prompt: TERRA_SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: 0.3,
      max_tokens: 2000,
      tools: [
        {
          name: 'get_sanitation_data',
          description: 'Busca indicadores de saneamento básico',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_infrastructure_data',
          description: 'Busca indicadores de infraestrutura urbana',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_connectivity_data',
          description: 'Busca indicadores de transporte e comunicações',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        }
      ]
    };
    super(config);
  }

  /**
   * Análise de saneamento básico
   */
  async analyzeSanitation(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit, higher_is_better)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.TERRA_AGUA%,indicator.code.like.TERRA_ESGOTO%,indicator.code.like.TERRA_COLETA%,indicator.code.like.TERRA_ATERRO%');

    if (error) throw error;

    const waterAccess = data?.find(d => d.indicator?.code === 'TERRA_AGUA_ENCANADA')?.value || 0;
    const sewageCoverage = data?.find(d => d.indicator?.code === 'TERRA_ESGOTO')?.value || 0;
    const wasteCollection = data?.find(d => d.indicator?.code === 'TERRA_COLETA_LIXO')?.value || 0;

    // Classificar situação de saneamento
    let sanitationLevel: 'adequate' | 'partial' | 'precarious' = 'partial';

    const avgCoverage = (waterAccess + sewageCoverage + wasteCollection) / 3;
    if (avgCoverage >= 80) {
      sanitationLevel = 'adequate';
    } else if (avgCoverage < 50) {
      sanitationLevel = 'precarious';
    }

    return {
      indicators: data,
      waterAccess,
      sewageCoverage,
      wasteCollection,
      level: sanitationLevel
    };
  }

  /**
   * Análise de infraestrutura urbana
   */
  async analyzeInfrastructure(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.TERRA_PAVIMENTACAO%,indicator.code.like.TERRA_ILUMINACAO%,indicator.code.like.TERRA_DOMICILIOS%');

    if (error) throw error;

    const paving = data?.find(d => d.indicator?.code === 'TERRA_PAVIMENTACAO')?.value || 0;
    const lighting = data?.find(d => d.indicator?.code === 'TERRA_ILUMINACAO')?.value || 0;

    let infrastructureLevel: 'adequate' | 'developing' | 'precarious' = 'developing';

    if (paving >= 70 && lighting >= 80) {
      infrastructureLevel = 'adequate';
    } else if (paving < 30 || lighting < 50) {
      infrastructureLevel = 'precarious';
    }

    return {
      indicators: data,
      paving,
      lighting,
      level: infrastructureLevel
    };
  }

  /**
   * Análise de conectividade (transporte e comunicações)
   */
  async analyzeConnectivity(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.TERRA_INTERNET%,indicator.code.like.TERRA_ENERGIA%,indicator.code.like.TERRA_DISTANCIA%,indicator.code.like.TERRA_FROTA%');

    if (error) throw error;

    const internet = data?.find(d => d.indicator?.code === 'TERRA_INTERNET')?.value || 0;
    const energy = data?.find(d => d.indicator?.code === 'TERRA_ENERGIA')?.value || 0;
    const distanceCapital = data?.find(d => d.indicator?.code === 'TERRA_DISTANCIA_CAPITAL')?.value;

    let digitalInclusion: 'adequate' | 'developing' | 'limited' = 'developing';
    if (internet >= 70) {
      digitalInclusion = 'adequate';
    } else if (internet < 30) {
      digitalInclusion = 'limited';
    }

    let accessibility: 'good' | 'regular' | 'difficult' = 'regular';
    if (distanceCapital && distanceCapital < 100) {
      accessibility = 'good';
    } else if (distanceCapital && distanceCapital > 400) {
      accessibility = 'difficult';
    }

    return {
      indicators: data,
      internet,
      energy,
      distanceCapital,
      digitalInclusion,
      accessibility
    };
  }

  /**
   * Análise de habitação
   */
  async analyzeHousing(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.TERRA_DEFICIT%,indicator.code.like.TERRA_DOM%');

    if (error) throw error;

    const housingDeficit = data?.find(d => d.indicator?.code === 'TERRA_DEFICIT_HAB')?.value || 0;
    const ownedHomes = data?.find(d => d.indicator?.code === 'TERRA_DOM_PROPRIO')?.value || 0;

    return {
      indicators: data,
      housingDeficit,
      ownedHomes
    };
  }

  /**
   * Calcula o perfil territorial completo do município
   */
  async getTerritorialProfile(municipalityId: string) {
    const [sanitation, infrastructure, connectivity, housing] = await Promise.all([
      this.analyzeSanitation(municipalityId),
      this.analyzeInfrastructure(municipalityId),
      this.analyzeConnectivity(municipalityId),
      this.analyzeHousing(municipalityId)
    ]);

    // Calcular índice composto de infraestrutura
    const infrastructureIndex = this.calculateInfrastructureIndex(
      sanitation,
      infrastructure,
      connectivity
    );

    // Identificar prioridades de investimento
    const investmentPriorities = this.identifyInvestmentPriorities(
      sanitation,
      infrastructure,
      connectivity,
      housing
    );

    return {
      sanitation,
      infrastructure,
      connectivity,
      housing,
      infrastructureIndex,
      investmentPriorities
    };
  }

  /**
   * Calcula índice composto de infraestrutura (0-100)
   */
  private calculateInfrastructureIndex(
    sanitation: any,
    infrastructure: any,
    connectivity: any
  ): number {
    const sanitationScore = (sanitation.waterAccess + sanitation.sewageCoverage + sanitation.wasteCollection) / 3;
    const infraScore = (infrastructure.paving + infrastructure.lighting) / 2;
    const connectivityScore = (connectivity.internet + connectivity.energy) / 2;

    // Pesos: saneamento 40%, infraestrutura 30%, conectividade 30%
    return Math.round(sanitationScore * 0.4 + infraScore * 0.3 + connectivityScore * 0.3);
  }

  /**
   * Identifica prioridades de investimento baseado nas lacunas
   */
  private identifyInvestmentPriorities(
    sanitation: any,
    infrastructure: any,
    connectivity: any,
    housing: any
  ): string[] {
    const priorities: { area: string; deficit: number }[] = [];

    // Saneamento
    if (sanitation.waterAccess < 90) {
      priorities.push({ area: 'Abastecimento de água', deficit: 90 - sanitation.waterAccess });
    }
    if (sanitation.sewageCoverage < 60) {
      priorities.push({ area: 'Esgotamento sanitário', deficit: 60 - sanitation.sewageCoverage });
    }
    if (sanitation.wasteCollection < 80) {
      priorities.push({ area: 'Coleta de resíduos', deficit: 80 - sanitation.wasteCollection });
    }

    // Infraestrutura
    if (infrastructure.paving < 50) {
      priorities.push({ area: 'Pavimentação urbana', deficit: 50 - infrastructure.paving });
    }

    // Conectividade
    if (connectivity.internet < 50) {
      priorities.push({ area: 'Inclusão digital', deficit: 50 - connectivity.internet });
    }

    // Habitação
    if (housing.housingDeficit > 0) {
      priorities.push({ area: 'Habitação popular', deficit: housing.housingDeficit / 10 });
    }

    // Ordenar por déficit e retornar top 5
    return priorities
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, 5)
      .map(p => p.area);
  }
}

// Singleton instance
let instance: TerraAgent | null = null;

export function getTerraAgent(): TerraAgent {
  if (!instance) {
    instance = new TerraAgent();
  }
  return instance;
}
