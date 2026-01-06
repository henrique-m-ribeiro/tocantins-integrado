/**
 * Rotas de Indicadores - API Tocantins Integrado
 */

import { Router, Request, Response } from 'express';
import { getServiceClient } from '../../database/client';

const router = Router();
const supabase = getServiceClient();

/**
 * GET /api/indicators
 * Lista definições de indicadores
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { dimension, category, search } = req.query;

    let query = supabase
      .from('indicator_definitions')
      .select(`
        *,
        category:indicator_categories(id, name, dimension, description)
      `)
      .eq('is_active', true)
      .order('name');

    if (dimension) {
      query = query.eq('category.dimension', dimension);
    }

    if (category) {
      query = query.eq('category.name', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      count: data?.length || 0,
      indicators: data
    });

  } catch (error) {
    console.error('Erro ao listar indicadores:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao listar indicadores'
    });
  }
});

/**
 * GET /api/indicators/categories
 * Lista categorias de indicadores
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { dimension } = req.query;

    let query = supabase
      .from('indicator_categories')
      .select('*')
      .order('dimension')
      .order('display_order');

    if (dimension) {
      query = query.eq('dimension', dimension);
    }

    const { data, error } = await query;

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
      count: data?.length || 0,
      categories_by_dimension: grouped
    });

  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao listar categorias'
    });
  }
});

/**
 * GET /api/indicators/:code
 * Retorna detalhes de um indicador pelo código
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('indicator_definitions')
      .select(`
        *,
        category:indicator_categories(id, name, dimension, description)
      `)
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Indicador não encontrado'
        });
      }
      throw error;
    }

    res.json(data);

  } catch (error) {
    console.error('Erro ao buscar indicador:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar indicador'
    });
  }
});

/**
 * GET /api/indicators/:code/values
 * Retorna valores de um indicador para todos os municípios
 */
router.get('/:code/values', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { year, microregion, limit = 139 } = req.query;

    // Primeiro buscar o ID do indicador
    const { data: indicator, error: indError } = await supabase
      .from('indicator_definitions')
      .select('id')
      .eq('code', code)
      .single();

    if (indError) {
      if (indError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Indicador não encontrado'
        });
      }
      throw indError;
    }

    // Buscar valores
    let query = supabase
      .from('v_latest_indicators')
      .select('*')
      .eq('indicator_code', code)
      .order('value', { ascending: false })
      .limit(Number(limit));

    if (year) {
      query = query.eq('year', Number(year));
    }

    if (microregion) {
      query = query.eq('microregion_name', microregion);
    }

    const { data: values, error } = await query;

    if (error) throw error;

    res.json({
      indicator_code: code,
      count: values?.length || 0,
      values
    });

  } catch (error) {
    console.error('Erro ao buscar valores:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar valores'
    });
  }
});

/**
 * GET /api/indicators/:code/ranking
 * Retorna ranking de municípios por indicador
 */
router.get('/:code/ranking', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { year, limit = 10, order = 'desc' } = req.query;

    const { data, error } = await supabase
      .from('v_latest_indicators')
      .select('*')
      .eq('indicator_code', code)
      .order('value', { ascending: order === 'asc' })
      .limit(Number(limit));

    if (error) throw error;

    res.json({
      indicator_code: code,
      order: order === 'asc' ? 'ascending' : 'descending',
      ranking: (data || []).map((item, index) => ({
        rank: index + 1,
        ...item
      }))
    });

  } catch (error) {
    console.error('Erro ao gerar ranking:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao gerar ranking'
    });
  }
});

/**
 * GET /api/indicators/stats/state
 * Retorna estatísticas estaduais dos indicadores
 */
router.get('/stats/state', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear() - 1;

    const { data, error } = await supabase
      .from('state_averages')
      .select(`
        *,
        indicator:indicator_definitions(code, name, unit, higher_is_better)
      `)
      .eq('year', targetYear);

    if (error) throw error;

    res.json({
      year: targetYear,
      count: data?.length || 0,
      statistics: data
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
    });
  }
});

/**
 * GET /api/indicators/dimensions
 * Lista dimensões disponíveis
 */
router.get('/meta/dimensions', async (req: Request, res: Response) => {
  res.json({
    dimensions: [
      {
        code: 'ECON',
        name: 'Econômica',
        description: 'PIB, emprego, renda, finanças públicas, agropecuária',
        color: '#10B981'
      },
      {
        code: 'SOCIAL',
        name: 'Social',
        description: 'Educação, saúde, assistência social, segurança, demografia',
        color: '#3B82F6'
      },
      {
        code: 'TERRA',
        name: 'Territorial',
        description: 'Infraestrutura, saneamento, transporte, habitação, comunicações',
        color: '#F59E0B'
      },
      {
        code: 'AMBIENT',
        name: 'Ambiental',
        description: 'Cobertura vegetal, recursos hídricos, áreas protegidas, gestão ambiental',
        color: '#22C55E'
      }
    ]
  });
});

export { router as indicatorRouter };
