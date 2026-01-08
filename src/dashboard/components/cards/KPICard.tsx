/**
 * Card de KPI (Key Performance Indicator)
 * Exibe indicador com valor, tendência, comparação e tooltip
 */

'use client';

import { TrendingUp, TrendingDown, Minus, Info, AlertCircle } from 'lucide-react';
import {
  formatIndicatorValue,
  formatTrend,
  getTrendIcon,
  getTrendColorClass,
} from '@/lib/formatters';
import type { KPIData, IndicatorUnit } from '@/types';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KPICardProps {
  title: string;
  value: number | null | undefined;
  unit: IndicatorUnit;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number; // Percentual de mudança
  comparison?: {
    value: number;
    label: string; // Ex: "média estadual", "ano anterior"
  };
  lastUpdate?: string;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  tooltipContent?: string;
  inverse?: boolean; // Se true, inverte cores de tendência (vermelho=positivo)
}

/**
 * Card para exibir KPI com contexto e visualização de tendências
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="PIB Per Capita"
 *   value={45000}
 *   unit="currency"
 *   trend="up"
 *   trendValue={5.2}
 *   comparison={{ value: 42000, label: "média estadual" }}
 *   tooltipContent="Produto Interno Bruto dividido pela população"
 * />
 * ```
 */
export function KPICard({
  title,
  value,
  unit,
  description,
  trend,
  trendValue,
  comparison,
  lastUpdate,
  isLoading = false,
  error = null,
  className,
  tooltipContent,
  inverse = false,
}: KPICardProps) {
  // Estado de loading
  if (isLoading) {
    return (
      <Card className={cn('card-hover', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Card className={cn('card-hover border-destructive', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Valor formatado
  const formattedValue = formatIndicatorValue(value, unit);

  // Ícone de tendência
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // Cor da tendência
  const trendColorClass = trendValue !== undefined
    ? getTrendColorClass(trendValue, inverse)
    : 'text-muted-foreground';

  return (
    <Card className={cn('card-hover', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>

        {/* Badge de tendência */}
        {trend && trendValue !== undefined && (
          <Badge variant="outline" className={cn('ml-2', trendColorClass)}>
            <TrendIcon className="mr-1 h-3 w-3" />
            {formatTrend(trendValue)}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Valor principal */}
          <div className="text-2xl font-bold">
            {formattedValue}
          </div>

          {/* Comparação */}
          {comparison && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{comparison.label}:</span>
              <span className="font-medium">
                {formatIndicatorValue(comparison.value, unit)}
              </span>
              {value !== null && value !== undefined && (
                <span className={cn(
                  'font-medium',
                  value > comparison.value
                    ? (inverse ? 'text-red-600' : 'text-green-600')
                    : value < comparison.value
                    ? (inverse ? 'text-green-600' : 'text-red-600')
                    : 'text-muted-foreground'
                )}>
                  {value > comparison.value ? '↑' : value < comparison.value ? '↓' : '='}
                </span>
              )}
            </div>
          )}

          {/* Data da última atualização */}
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Atualizado em {lastUpdate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Versão compacta do KPICard para uso em listas ou grids densos
 */
export function CompactKPICard({
  title,
  value,
  unit,
  trend,
  trendValue,
  className,
}: Pick<KPICardProps, 'title' | 'value' | 'unit' | 'trend' | 'trendValue' | 'className'>) {
  const formattedValue = formatIndicatorValue(value, unit);
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg border bg-card', className)}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-lg font-bold">{formattedValue}</p>
      </div>
      {trend && trendValue !== undefined && (
        <div className={cn('flex items-center gap-1', getTrendColorClass(trendValue))}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{formatTrend(trendValue)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Grid de KPI Cards
 * Layout responsivo para múltiplos KPIs
 */
interface KPIGridProps {
  kpis: Array<Omit<KPICardProps, 'className'>>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ kpis, columns = 3, className }: KPIGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
