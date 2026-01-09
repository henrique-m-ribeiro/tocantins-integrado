/**
 * Hook para buscar e gerenciar indicadores municipais
 * Implementa cache básico e estados de loading/error
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type { Indicator, Dimension, DataState } from '@/types';

interface UseIndicatorsParams {
  municipalityId?: string;
  dimension?: Dimension;
  year?: number;
  enabled?: boolean; // Se false, não busca automaticamente
}

interface IndicatorData {
  indicator: Indicator;
  value: number;
  year: number;
  rank_state?: number;
  percentile_state?: number;
  state_avg?: number;
  microregion_avg?: number;
}

interface UseIndicatorsReturn extends DataState<IndicatorData[]> {
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

// Cache simples em memória (compartilhado entre todas as instâncias do hook)
const cache = new Map<string, { data: IndicatorData[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Gera chave de cache baseada nos parâmetros
 */
function getCacheKey(params: UseIndicatorsParams): string {
  return `${params.municipalityId || 'all'}_${params.dimension || 'all'}_${params.year || 'latest'}`;
}

/**
 * Hook para buscar indicadores de um município/dimensão
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useIndicators({
 *   municipalityId: 'abc123',
 *   dimension: 'ECON',
 *   year: 2023
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return <IndicatorsList indicators={data || []} />;
 * ```
 */
export function useIndicators(params: UseIndicatorsParams): UseIndicatorsReturn {
  const {
    municipalityId,
    dimension,
    year,
    enabled = true,
  } = params;

  const [state, setState] = useState<DataState<IndicatorData[]>>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Busca indicadores da API
   */
  const fetchIndicators = useCallback(async () => {
    if (!enabled) return;

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = getCacheKey(params);

    // Verifica cache primeiro
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({
        data: cached.data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(cached.timestamp),
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    abortControllerRef.current = new AbortController();

    try {
      if (!municipalityId) {
        // Buscar todos os indicadores (sem valores)
        const response = await api.getIndicators({ dimension });
        const indicatorData: IndicatorData[] = response.indicators.map(indicator => ({
          indicator,
          value: 0,
          year: year || new Date().getFullYear(),
        }));

        // Atualiza cache
        cache.set(cacheKey, {
          data: indicatorData,
          timestamp: Date.now(),
        });

        setState({
          data: indicatorData,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        // Buscar indicadores com valores para o município
        const response = await api.getMunicipalityIndicators(municipalityId, {
          dimension,
          year,
        });

        // Transforma resposta em formato IndicatorData[]
        const indicatorData: IndicatorData[] = [];

        for (const [dim, indicators] of Object.entries(response.indicators_by_dimension)) {
          for (const ind of indicators) {
            indicatorData.push({
              indicator: ind.indicator,
              value: ind.value,
              year: ind.year,
              rank_state: ind.rank_state,
              percentile_state: ind.percentile_state,
              state_avg: ind.state_avg,
              microregion_avg: ind.microregion_avg,
            });
          }
        }

        // Atualiza cache
        cache.set(cacheKey, {
          data: indicatorData,
          timestamp: Date.now(),
        });

        setState({
          data: indicatorData,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignorar erros de abort
      }

      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Erro ao buscar indicadores'),
        lastUpdated: new Date(),
      });
    }
  }, [municipalityId, dimension, year, enabled, params]);

  /**
   * Invalida cache e força nova busca
   */
  const invalidateCache = useCallback(() => {
    const cacheKey = getCacheKey(params);
    cache.delete(cacheKey);
  }, [params]);

  /**
   * Força nova busca (sem cache)
   */
  const refetch = useCallback(async () => {
    invalidateCache();
    await fetchIndicators();
  }, [invalidateCache, fetchIndicators]);

  // Busca automática quando parâmetros mudam
  useEffect(() => {
    fetchIndicators();

    return () => {
      // Cleanup: cancela requisição em andamento
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchIndicators]);

  return {
    ...state,
    refetch,
    invalidateCache,
  };
}

/**
 * Hook para buscar lista de todos os indicadores (sem valores)
 * Útil para dropdowns e seleções
 */
export function useIndicatorsList(dimension?: Dimension): UseIndicatorsReturn {
  return useIndicators({ dimension, enabled: true });
}

/**
 * Hook para buscar histórico de um indicador específico
 */
export function useIndicatorHistory(
  indicatorCode: string | undefined,
  municipalityId: string | undefined,
  yearsBack: number = 5
) {
  const [state, setState] = useState<DataState<Array<{
    year: number;
    value: number;
    trend?: 'up' | 'down' | 'stable';
  }>>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!indicatorCode || !municipalityId) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;

    const fetchHistory = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const history = await api.getIndicatorHistory(
          indicatorCode,
          municipalityId,
          yearsBack
        );

        if (!cancelled) {
          setState({
            data: history,
            isLoading: false,
            error: null,
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error('Erro ao buscar histórico'),
          });
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [indicatorCode, municipalityId, yearsBack]);

  return {
    ...state,
    refetch: async () => {}, // Implementar se necessário
    invalidateCache: () => {}, // Implementar se necessário
  };
}
