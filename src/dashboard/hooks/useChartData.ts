/**
 * Hook para buscar e formatar dados para gráficos
 * Simplifica integração entre API e componentes de visualização
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Dimension, DataState } from '@/types';

type ChartType = 'history' | 'comparison' | 'distribution';

interface UseChartDataConfig {
  type: ChartType;
  indicatorCode?: string;
  municipalityId?: string;
  municipalityId2?: string; // Para comparações
  dimension?: Dimension;
  yearsBack?: number;
  enabled?: boolean;
}

interface ChartDataPoint {
  [key: string]: any;
}

/**
 * Hook para buscar dados formatados para gráficos
 *
 * @example
 * ```tsx
 * // Série histórica
 * const { data, isLoading } = useChartData({
 *   type: 'history',
 *   indicatorCode: 'PIB_PERCAPITA',
 *   municipalityId: 'abc123',
 *   yearsBack: 5,
 * });
 *
 * // Comparação entre municípios
 * const { data } = useChartData({
 *   type: 'comparison',
 *   municipalityId: 'id1',
 *   municipalityId2: 'id2',
 *   dimension: 'ECON',
 * });
 * ```
 */
export function useChartData(
  config: UseChartDataConfig
): DataState<ChartDataPoint[]> {
  const {
    type,
    indicatorCode,
    municipalityId,
    municipalityId2,
    dimension,
    yearsBack = 5,
    enabled = true,
  } = config;

  const [state, setState] = useState<DataState<ChartDataPoint[]>>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: undefined,
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let chartData: ChartDataPoint[] = [];

      switch (type) {
        case 'history':
          // Série histórica de um indicador
          if (!indicatorCode || !municipalityId) {
            throw new Error('indicatorCode and municipalityId required for history type');
          }

          const historyData = await api.getIndicatorHistory(
            indicatorCode,
            municipalityId,
            yearsBack
          );

          chartData = historyData.map(item => ({
            year: item.year,
            value: item.value,
            stateAvg: item.state_avg,
            microregionAvg: item.microregion_avg,
            trend: item.trend,
          }));
          break;

        case 'comparison':
          // Comparação entre municípios
          if (!municipalityId || !municipalityId2) {
            throw new Error('municipalityId and municipalityId2 required for comparison type');
          }

          const comparisonData = await api.compareMunicipalities(
            municipalityId,
            municipalityId2,
            dimension
          );

          chartData = comparisonData.comparison.map(item => ({
            indicator: item.indicator_name,
            mun1: item.value1,
            mun2: item.value2,
            difference: item.difference,
            differencePercent: item.difference_percent,
            dimension: item.dimension,
          }));
          break;

        case 'distribution':
          // Distribuição de indicadores por dimensão
          if (!municipalityId || !dimension) {
            throw new Error('municipalityId and dimension required for distribution type');
          }

          const distributionData = await api.getIndicatorsByDimension(
            municipalityId,
            dimension
          );

          chartData = distributionData.indicators.map(item => ({
            name: item.name,
            value: item.value,
            code: item.code,
            unit: item.unit,
            rank: item.rank_state,
            stateAvg: item.state_avg,
            trend: item.trend,
          }));
          break;

        default:
          throw new Error(`Unknown chart type: ${type}`);
      }

      setState({
        data: chartData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch chart data'),
        lastUpdated: new Date(),
      });
    }
  }, [type, indicatorCode, municipalityId, municipalityId2, dimension, yearsBack, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
}

/**
 * Hook especializado para séries históricas
 */
export function useHistoryChart(
  indicatorCode: string | undefined,
  municipalityId: string | undefined,
  yearsBack: number = 5
) {
  return useChartData({
    type: 'history',
    indicatorCode,
    municipalityId,
    yearsBack,
    enabled: !!(indicatorCode && municipalityId),
  });
}

/**
 * Hook especializado para comparação entre municípios
 */
export function useComparisonChart(
  municipalityId1: string | undefined,
  municipalityId2: string | undefined,
  dimension?: Dimension
) {
  return useChartData({
    type: 'comparison',
    municipalityId: municipalityId1,
    municipalityId2: municipalityId2,
    dimension,
    enabled: !!(municipalityId1 && municipalityId2),
  });
}

/**
 * Hook especializado para distribuição dimensional
 */
export function useDistributionChart(
  municipalityId: string | undefined,
  dimension: Dimension | undefined
) {
  return useChartData({
    type: 'distribution',
    municipalityId,
    dimension,
    enabled: !!(municipalityId && dimension),
  });
}
