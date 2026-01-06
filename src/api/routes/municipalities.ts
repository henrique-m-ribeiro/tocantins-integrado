/**
 * Rotas de Municípios - API Tocantins Integrado
 */

import { Router, Request, Response } from 'express';
import { getServiceClient } from '../../database/client';

const router = Router();
const supabase = getServiceClient();

/**
 * GET /api/municipalities
 * Lista todos os municípios do Tocantins
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { microregion, search, limit = 139 } = req.query;

    let query = supabase
      .from('v_municipalities_full')
      .select('*')
      .order('name', { ascending: true })
      .limit(Number(limit));

    if (microregion) {
      query = query.eq('microregion_name', microregion);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      count: data?.length || 0,
      municipalities: data
    });

  } catch (error) {
    console.error('Erro ao listar municípios:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao listar municípios'
    });
  }
});

/**
 * GET /api/municipalities/:id
 * Retorna detalhes de um município
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('v_municipalities_full')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Município não encontrado'
        });
      }
      throw error;
    }

    res.json(data);

  } catch (error) {
    console.error('Erro ao buscar município:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar município'
    });
  }
});

/**
 * GET /api/municipalities/:id/indicators
 * Retorna indicadores de um município
 */
router.get('/:id/indicators', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dimension, year, category } = req.query;

    let query = supabase
      .from('v_latest_indicators')
      .select('*')
      .eq('municipality_id', id);

    if (dimension) {
      query = query.eq('dimension', dimension);
    }

    if (year) {
      query = query.eq('year', Number(year));
    }

    if (category) {
      query = query.eq('category_name', category);
    }

    const { data, error } = await query.order('dimension').order('indicator_name');

    if (error) throw error;

    // Agrupar por dimensão
    const grouped = (data || []).reduce((acc, item) => {
      if (!acc[item.dimension]) {
        acc[item.dimension] = [];
      }
      acc[item.dimension].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      municipality_id: id,
      total_indicators: data?.length || 0,
      indicators_by_dimension: grouped
    });

  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar indicadores'
    });
  }
});

/**
 * GET /api/municipalities/:id/profile
 * Retorna perfil completo do município
 */
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar informações básicas
    const { data: municipality, error: munError } = await supabase
      .from('v_municipalities_full')
      .select('*')
      .eq('id', id)
      .single();

    if (munError) {
      if (munError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Município não encontrado'
        });
      }
      throw munError;
    }

    // Buscar indicadores mais recentes
    const { data: indicators } = await supabase
      .from('v_latest_indicators')
      .select('*')
      .eq('municipality_id', id);

    // Buscar ranking por dimensão
    const { data: rankings } = await supabase
      .from('v_dimension_rankings')
      .select('*')
      .eq('municipality_id', id);

    // Calcular scores por dimensão
    const dimensionScores = rankings?.reduce((acc, r) => {
      acc[r.dimension] = {
        score: Math.round(r.avg_percentile),
        rank: r.rank_in_dimension,
        total: 139
      };
      return acc;
    }, {} as Record<string, { score: number; rank: number; total: number }>);

    res.json({
      municipality,
      summary: {
        total_indicators: indicators?.length || 0,
        dimension_scores: dimensionScores
      },
      rankings,
      top_indicators: indicators?.slice(0, 10)
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar perfil'
    });
  }
});

/**
 * GET /api/municipalities/compare
 * Compara dois ou mais municípios
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { ids, dimension } = req.query;

    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parâmetro "ids" é obrigatório (IDs separados por vírgula)'
      });
    }

    const municipalityIds = ids.split(',').map(id => id.trim());

    if (municipalityIds.length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Forneça pelo menos 2 IDs de municípios para comparação'
      });
    }

    // Buscar informações dos municípios
    const { data: municipalities, error: munError } = await supabase
      .from('v_municipalities_full')
      .select('*')
      .in('id', municipalityIds);

    if (munError) throw munError;

    // Buscar indicadores
    let indicatorsQuery = supabase
      .from('v_latest_indicators')
      .select('*')
      .in('municipality_id', municipalityIds);

    if (dimension) {
      indicatorsQuery = indicatorsQuery.eq('dimension', dimension);
    }

    const { data: indicators, error: indError } = await indicatorsQuery;

    if (indError) throw indError;

    // Organizar dados para comparação
    const comparison = municipalityIds.map(id => {
      const mun = municipalities?.find(m => m.id === id);
      const munIndicators = indicators?.filter(i => i.municipality_id === id);

      return {
        municipality: mun,
        indicators: munIndicators
      };
    });

    res.json({
      municipalities: comparison,
      total_indicators: indicators?.length || 0
    });

  } catch (error) {
    console.error('Erro na comparação:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro na comparação'
    });
  }
});

/**
 * GET /api/municipalities/microregions
 * Lista microrregiões com resumo
 */
router.get('/regions/microregions', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v_microregions_summary')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({
      count: data?.length || 0,
      microregions: data
    });

  } catch (error) {
    console.error('Erro ao listar microrregiões:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao listar microrregiões'
    });
  }
});

/**
 * GET /api/municipalities/geojson
 * Retorna dados geográficos para o mapa
 */
router.get('/geo/geojson', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v_municipalities_full')
      .select('id, name, latitude, longitude, population, microregion_name');

    if (error) throw error;

    // Converter para GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: (data || []).map(m => ({
        type: 'Feature',
        properties: {
          id: m.id,
          name: m.name,
          population: m.population,
          microregion: m.microregion_name
        },
        geometry: {
          type: 'Point',
          coordinates: [m.longitude, m.latitude]
        }
      }))
    };

    res.json(geojson);

  } catch (error) {
    console.error('Erro ao gerar GeoJSON:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao gerar GeoJSON'
    });
  }
});

export { router as municipalityRouter };
