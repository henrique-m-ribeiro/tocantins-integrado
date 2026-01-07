'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Calculator,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';

interface IndicatorMetadata {
  code: string;
  name: string;
  description: string;
  tooltip_text: string;
  interpretation_guide: string;
  unit: string;
  source: string;
  source_url?: string;
  methodology?: string;
  calculation_formula?: string;
  higher_is_better: boolean;
  dimension: string;
  category_name: string;
  reference_values?: {
    nacional?: number;
    regional_norte?: number;
    meta_ods?: number;
    meta_pne?: number;
  };
  tags?: string[];
}

interface IndicatorTooltipProps {
  indicatorCode: string;
  value?: number;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showTrend?: boolean;
  previousValue?: number;
}

export function IndicatorTooltip({
  indicatorCode,
  value,
  children,
  position = 'top',
  showTrend = false,
  previousValue
}: IndicatorTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const { data: metadata, isLoading } = useQuery({
    queryKey: ['indicator-metadata', indicatorCode],
    queryFn: () => api.getIndicatorMetadata(indicatorCode),
    enabled: isVisible,
    staleTime: 1000 * 60 * 30 // 30 minutos de cache
  });

  // Calcular tendência se temos valor anterior
  const trend = showTrend && previousValue !== undefined && value !== undefined
    ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable'
    : null;

  const trendPercent = previousValue && value && previousValue !== 0
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;

  // Posicionamento do tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => {
        setIsVisible(false);
        setShowDetails(false);
      }}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]} w-72`}
          role="tooltip"
        >
          <div className="bg-gray-800 text-white text-sm rounded-lg shadow-xl p-3">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Carregando...</span>
              </div>
            ) : metadata ? (
              <div className="space-y-2">
                {/* Nome e descrição */}
                <div>
                  <h4 className="font-semibold text-white">{metadata.name}</h4>
                  <p className="text-gray-300 text-xs mt-1">
                    {metadata.tooltip_text || metadata.description}
                  </p>
                </div>

                {/* Valor atual com tendência */}
                {value !== undefined && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-gray-400 text-xs">Valor atual:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
                        {' '}{metadata.unit}
                      </span>
                      {trend && (
                        <span className={`flex items-center gap-1 text-xs ${
                          trend === 'up'
                            ? metadata.higher_is_better ? 'text-green-400' : 'text-red-400'
                            : trend === 'down'
                            ? metadata.higher_is_better ? 'text-red-400' : 'text-green-400'
                            : 'text-gray-400'
                        }`}>
                          {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                          {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                          {trend === 'stable' && <Minus className="h-3 w-3" />}
                          {trendPercent && `${trendPercent}%`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Valores de referência */}
                {metadata.reference_values && Object.keys(metadata.reference_values).length > 0 && (
                  <div className="border-t border-gray-700 pt-2">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Referências:
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {metadata.reference_values.nacional && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Brasil:</span>
                          <span>{metadata.reference_values.nacional.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      {metadata.reference_values.regional_norte && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Norte:</span>
                          <span>{metadata.reference_values.regional_norte.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      {metadata.reference_values.meta_ods && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Meta ODS:</span>
                          <span>{metadata.reference_values.meta_ods.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Interpretação */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Info className="h-3 w-3" />
                  <span>
                    {metadata.higher_is_better
                      ? 'Valores maiores são melhores'
                      : 'Valores menores são melhores'}
                  </span>
                </div>

                {/* Botão para mais detalhes */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="w-full text-xs text-tocantins-blue hover:text-blue-300 flex items-center justify-center gap-1 pt-1 border-t border-gray-700"
                >
                  <HelpCircle className="h-3 w-3" />
                  {showDetails ? 'Menos detalhes' : 'Mais detalhes'}
                </button>

                {/* Detalhes expandidos */}
                {showDetails && (
                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    {metadata.methodology && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                          <BookOpen className="h-3 w-3" /> Metodologia:
                        </p>
                        <p className="text-xs text-gray-300">{metadata.methodology}</p>
                      </div>
                    )}
                    {metadata.calculation_formula && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                          <Calculator className="h-3 w-3" /> Fórmula:
                        </p>
                        <p className="text-xs text-gray-300 font-mono bg-gray-900 px-2 py-1 rounded">
                          {metadata.calculation_formula}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Fonte: {metadata.source}</span>
                      {metadata.source_url && (
                        <a
                          href={metadata.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tocantins-blue hover:text-blue-300 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-xs">Informações não disponíveis</p>
            )}

            {/* Arrow */}
            <div className={`absolute border-4 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente simplificado para uso inline
interface IndicatorInfoIconProps {
  indicatorCode: string;
  className?: string;
}

export function IndicatorInfoIcon({ indicatorCode, className = '' }: IndicatorInfoIconProps) {
  return (
    <IndicatorTooltip indicatorCode={indicatorCode}>
      <button
        className={`text-gray-400 hover:text-tocantins-blue transition-colors ${className}`}
        aria-label="Informações sobre o indicador"
      >
        <Info className="h-4 w-4" />
      </button>
    </IndicatorTooltip>
  );
}

// Componente de valor com tooltip integrado
interface IndicatorValueProps {
  indicatorCode: string;
  value: number;
  previousValue?: number;
  showUnit?: boolean;
  className?: string;
}

export function IndicatorValue({
  indicatorCode,
  value,
  previousValue,
  showUnit = true,
  className = ''
}: IndicatorValueProps) {
  const { data: metadata } = useQuery({
    queryKey: ['indicator-metadata', indicatorCode],
    queryFn: () => api.getIndicatorMetadata(indicatorCode),
    staleTime: 1000 * 60 * 30
  });

  return (
    <IndicatorTooltip
      indicatorCode={indicatorCode}
      value={value}
      previousValue={previousValue}
      showTrend={previousValue !== undefined}
    >
      <span className={`cursor-help border-b border-dotted border-gray-400 ${className}`}>
        {value.toLocaleString('pt-BR')}
        {showUnit && metadata?.unit && ` ${metadata.unit}`}
      </span>
    </IndicatorTooltip>
  );
}
