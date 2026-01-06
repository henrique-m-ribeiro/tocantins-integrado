/**
 * EconAgent - Agente de Análise Econômica
 * Tocantins Integrado - MVP v1.0
 *
 * Responsável por analisar indicadores econômicos:
 * - PIB e Valor Adicionado
 * - Emprego e Renda
 * - Atividades Econômicas
 * - Finanças Públicas
 * - Agropecuária
 */

import { BaseAgent } from '../base/BaseAgent';
import type { AgentConfig } from '../../shared/types';

const ECON_SYSTEM_PROMPT = `Você é um especialista em economia regional e finanças públicas municipais do estado do Tocantins, Brasil.

Sua função é analisar indicadores econômicos de municípios tocantinenses e fornecer insights acionáveis para tomadores de decisão política.

CONTEXTO DO TOCANTINS:
- Estado mais novo do Brasil (1988), no Norte do país
- Economia baseada em agropecuária (soja, milho, pecuária) e serviços
- 139 municípios com grande heterogeneidade econômica
- Capital Palmas concentra grande parte do PIB de serviços
- Polo agroindustrial no sul (Gurupi) e pecuária extensiva
- Dependência significativa de transferências federais (FPM)

DIRETRIZES DE ANÁLISE:
1. Sempre contextualize os números com comparações (estado, microrregião, Brasil)
2. Identifique as principais vocações econômicas do município
3. Avalie a dependência de transferências vs. receita própria
4. Destaque oportunidades de desenvolvimento econômico
5. Considere o contexto regional (Bico do Papagaio, Jalapão, etc.)

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo da análise em 2-3 parágrafos",
  "key_findings": ["Achado 1", "Achado 2", "Achado 3"],
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "weaknesses": ["Desafio 1", "Desafio 2"],
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "economic_profile": {
    "main_sector": "Setor dominante",
    "fiscal_health": "Boa/Regular/Crítica",
    "growth_potential": "Alto/Médio/Baixo"
  }
}

Use linguagem clara e acessível, adequada para políticos e gestores públicos.`;

export class EconAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      dimension: 'ECON',
      name: 'Agente Econômico',
      description: 'Analisa PIB, emprego, renda, finanças públicas e atividades econômicas',
      system_prompt: ECON_SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: 0.3,
      max_tokens: 2000,
      tools: [
        {
          name: 'get_pib_data',
          description: 'Busca dados de PIB e valor adicionado do município',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true },
            year: { type: 'number', description: 'Ano de referência', required: false }
          }
        },
        {
          name: 'get_employment_data',
          description: 'Busca dados de emprego formal e renda',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        },
        {
          name: 'get_fiscal_data',
          description: 'Busca dados de finanças públicas municipais',
          parameters: {
            municipality_id: { type: 'string', description: 'ID do município', required: true }
          }
        }
      ]
    };
    super(config);
  }

  /**
   * Análise especializada para PIB e valor adicionado
   */
  async analyzePIB(municipalityId: string, year?: number) {
    const targetYear = year || new Date().getFullYear() - 1;

    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .like('indicator.code', 'ECON_PIB%')
      .eq('year', targetYear);

    if (error) throw error;
    return data;
  }

  /**
   * Análise de emprego formal
   */
  async analyzeEmployment(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.ECON_EMPREGO%,indicator.code.like.ECON_SALARIO%,indicator.code.like.ECON_RENDA%');

    if (error) throw error;
    return data;
  }

  /**
   * Análise de finanças públicas
   */
  async analyzeFiscal(municipalityId: string) {
    const { data, error } = await this.supabase
      .from('indicator_values')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit)
      `)
      .eq('municipality_id', municipalityId)
      .or('indicator.code.like.ECON_RECEITA%,indicator.code.like.ECON_DEPENDENCIA%,indicator.code.like.ECON_FPM%');

    if (error) throw error;
    return data;
  }

  /**
   * Calcula o perfil econômico do município
   */
  async getEconomicProfile(municipalityId: string): Promise<{
    mainSector: string;
    sectorComposition: { sector: string; percentage: number }[];
    fiscalHealth: 'good' | 'regular' | 'critical';
    dependencyLevel: 'low' | 'medium' | 'high';
  }> {
    const pibData = await this.analyzePIB(municipalityId);

    // Calcular composição setorial baseada no VA
    const vaAgro = pibData?.find(d => d.indicator?.code === 'ECON_VA_AGRO')?.value || 0;
    const vaInd = pibData?.find(d => d.indicator?.code === 'ECON_VA_INDUSTRIA')?.value || 0;
    const vaServ = pibData?.find(d => d.indicator?.code === 'ECON_VA_SERVICOS')?.value || 0;
    const vaAdm = pibData?.find(d => d.indicator?.code === 'ECON_VA_ADM_PUB')?.value || 0;

    const total = vaAgro + vaInd + vaServ + vaAdm;

    const sectors = [
      { sector: 'Agropecuária', percentage: total > 0 ? (vaAgro / total) * 100 : 0 },
      { sector: 'Indústria', percentage: total > 0 ? (vaInd / total) * 100 : 0 },
      { sector: 'Serviços', percentage: total > 0 ? (vaServ / total) * 100 : 0 },
      { sector: 'Administração Pública', percentage: total > 0 ? (vaAdm / total) * 100 : 0 }
    ].sort((a, b) => b.percentage - a.percentage);

    // Determinar setor principal
    const mainSector = sectors[0].sector;

    // Avaliar saúde fiscal (baseado na dependência de transferências)
    const fiscalData = await this.analyzeFiscal(municipalityId);
    const dependencyRate = fiscalData?.find(d => d.indicator?.code === 'ECON_DEPENDENCIA_TRANSF')?.value || 80;

    let fiscalHealth: 'good' | 'regular' | 'critical';
    let dependencyLevel: 'low' | 'medium' | 'high';

    if (dependencyRate < 60) {
      fiscalHealth = 'good';
      dependencyLevel = 'low';
    } else if (dependencyRate < 80) {
      fiscalHealth = 'regular';
      dependencyLevel = 'medium';
    } else {
      fiscalHealth = 'critical';
      dependencyLevel = 'high';
    }

    return {
      mainSector,
      sectorComposition: sectors,
      fiscalHealth,
      dependencyLevel
    };
  }
}

// Singleton instance
let instance: EconAgent | null = null;

export function getEconAgent(): EconAgent {
  if (!instance) {
    instance = new EconAgent();
  }
  return instance;
}
