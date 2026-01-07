'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  LineChart,
  Table,
  ChevronDown,
  Download
} from 'lucide-react';
import { api } from '@/lib/api';
import { IndicatorInfoIcon } from './IndicatorTooltip';

interface HistoricalDataPoint {
  year: number;
  value: number;
  rank_state?: number;
  percentile_state?: number;
  state_avg?: number;
  microregion_avg?: number;
  year_change?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface IndicatorHistoryChartProps {
  indicatorCode: string;
  municipalityId: string;
  municipalityName?: string;
  yearsBack?: number;
  height?: number;
  showComparisons?: boolean;
  showTable?: boolean;
}

export function IndicatorHistoryChart({
  indicatorCode,
  municipalityId,
  municipalityName,
  yearsBack = 5,
  height = 200,
  showComparisons = true,
  showTable = false
}: IndicatorHistoryChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['indicator-history', indicatorCode, municipalityId, yearsBack],
    queryFn: () => api.getIndicatorHistory(indicatorCode, municipalityId, yearsBack)
  });

  const { data: metadata } = useQuery({
    queryKey: ['indicator-metadata', indicatorCode],
    queryFn: () => api.getIndicatorMetadata(indicatorCode),
    staleTime: 1000 * 60 * 30
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-4" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Carregando histórico...
          </div>
        </div>
      </div>
    );
  }

  if (error || !historyData || historyData.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4" style={{ height }}>
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Dados históricos não disponíveis</p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const values = historyData.map((d: HistoricalDataPoint) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Tendência geral (primeiro vs último)
  const firstValue = historyData[0]?.value;
  const lastValue = historyData[historyData.length - 1]?.value;
  const overallChange = firstValue && lastValue
    ? ((lastValue - firstValue) / firstValue * 100).toFixed(1)
    : null;
  const overallTrend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">
              {metadata?.name || indicatorCode}
            </h3>
            <IndicatorInfoIcon indicatorCode={indicatorCode} />
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle view */}
            {showTable && (
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`p-1.5 rounded ${viewMode === 'chart' ? 'bg-white shadow-sm' : ''}`}
                  title="Gráfico"
                >
                  <LineChart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                  title="Tabela"
                >
                  <Table className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumo da tendência */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-gray-500">
            {municipalityName || 'Município'} • {historyData[0]?.year} - {historyData[historyData.length - 1]?.year}
          </span>
          {overallChange && (
            <span className={`flex items-center gap-1 font-medium ${
              overallTrend === 'up'
                ? metadata?.higher_is_better ? 'text-green-600' : 'text-red-600'
                : overallTrend === 'down'
                ? metadata?.higher_is_better ? 'text-red-600' : 'text-green-600'
                : 'text-gray-600'
            }`}>
              {overallTrend === 'up' && <TrendingUp className="h-4 w-4" />}
              {overallTrend === 'down' && <TrendingDown className="h-4 w-4" />}
              {overallTrend === 'stable' && <Minus className="h-4 w-4" />}
              {overallChange}% no período
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'chart' ? (
          <div style={{ height }}>
            {/* SVG Chart */}
            <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`} preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={i}
                  x1="40"
                  y1={20 + (height - 40) * pct}
                  x2="390"
                  y2={20 + (height - 40) * pct}
                  stroke="#e5e7eb"
                  strokeDasharray="4,4"
                />
              ))}

              {/* State average line (if available) */}
              {showComparisons && historyData.some((d: HistoricalDataPoint) => d.state_avg) && (
                <polyline
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  points={historyData
                    .filter((d: HistoricalDataPoint) => d.state_avg !== undefined)
                    .map((d: HistoricalDataPoint, i: number, arr: HistoricalDataPoint[]) => {
                      const x = 40 + (350 / (arr.length - 1 || 1)) * i;
                      const y = 20 + (height - 40) * (1 - ((d.state_avg! - minValue) / range));
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Main data line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={historyData.map((d: HistoricalDataPoint, i: number) => {
                  const x = 40 + (350 / (historyData.length - 1 || 1)) * i;
                  const y = 20 + (height - 40) * (1 - ((d.value - minValue) / range));
                  return `${x},${y}`;
                }).join(' ')}
              />

              {/* Data points */}
              {historyData.map((d: HistoricalDataPoint, i: number) => {
                const x = 40 + (350 / (historyData.length - 1 || 1)) * i;
                const y = 20 + (height - 40) * (1 - ((d.value - minValue) / range));
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#2563eb"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* Year label */}
                    <text
                      x={x}
                      y={height - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {d.year}
                    </text>
                    {/* Value label */}
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 font-medium"
                    >
                      {d.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis labels */}
              <text x="35" y="25" textAnchor="end" className="text-xs fill-gray-500">
                {maxValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              </text>
              <text x="35" y={height - 25} textAnchor="end" className="text-xs fill-gray-500">
                {minValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              </text>
            </svg>

            {/* Legend */}
            {showComparisons && (
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-blue-600 rounded" />
                  {municipalityName || 'Município'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-gray-400 rounded" style={{ borderStyle: 'dashed' }} />
                  Média estadual
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Table view */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Ano</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Valor</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Variação</th>
                  {showComparisons && (
                    <>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Média TO</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Ranking</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {historyData.map((d: HistoricalDataPoint, i: number) => (
                  <tr key={d.year} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{d.year}</td>
                    <td className="text-right py-2 px-3">
                      {d.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      {' '}{metadata?.unit}
                    </td>
                    <td className="text-right py-2 px-3">
                      {d.year_change !== undefined && d.year_change !== null ? (
                        <span className={`flex items-center justify-end gap-1 ${
                          d.trend === 'up'
                            ? metadata?.higher_is_better ? 'text-green-600' : 'text-red-600'
                            : d.trend === 'down'
                            ? metadata?.higher_is_better ? 'text-red-600' : 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          {d.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                          {d.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                          {d.trend === 'stable' && <Minus className="h-3 w-3" />}
                          {d.year_change > 0 ? '+' : ''}{d.year_change}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {showComparisons && (
                      <>
                        <td className="text-right py-2 px-3 text-gray-600">
                          {d.state_avg?.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) || '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {d.rank_state ? `${d.rank_state}º` : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente compacto para exibir mini-gráfico de tendência (sparkline)
interface IndicatorSparklineProps {
  indicatorCode: string;
  municipalityId: string;
  width?: number;
  height?: number;
}

export function IndicatorSparkline({
  indicatorCode,
  municipalityId,
  width = 80,
  height = 24
}: IndicatorSparklineProps) {
  const { data: historyData } = useQuery({
    queryKey: ['indicator-history', indicatorCode, municipalityId, 5],
    queryFn: () => api.getIndicatorHistory(indicatorCode, municipalityId, 5)
  });

  if (!historyData || historyData.length < 2) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  const values = historyData.map((d: HistoricalDataPoint) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = historyData.map((d: HistoricalDataPoint, i: number) => {
    const x = (width / (historyData.length - 1)) * i;
    const y = height - ((d.value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Determinar cor baseada na tendência
  const firstValue = historyData[0]?.value;
  const lastValue = historyData[historyData.length - 1]?.value;
  const isUp = lastValue > firstValue;

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={isUp ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
