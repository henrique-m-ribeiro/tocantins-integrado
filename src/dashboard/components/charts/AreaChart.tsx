/**
 * Componente de gráfico de área (Area Chart)
 * Usado para visualização de evolução temporal com área preenchida
 */

'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  gradient?: boolean;
  stacked?: boolean;
  formatTooltip?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  className?: string;
}

/**
 * Gráfico de área para visualização de séries temporais com preenchimento
 *
 * @example
 * ```tsx
 * <AreaChart
 *   data={[{ ano: 2020, valor: 100 }, { ano: 2021, valor: 150 }]}
 *   xKey="ano"
 *   yKey="valor"
 *   title="Crescimento ao Longo do Tempo"
 *   gradient
 * />
 * ```
 */
export function AreaChart({
  data,
  xKey,
  yKey,
  color = '#3b82f6',
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = false,
  gradient = true,
  stacked = false,
  formatTooltip,
  formatYAxis,
  className,
}: AreaChartProps) {
  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs text-muted-foreground">{data.payload[xKey]}</span>
            </div>
            <div className="text-sm font-semibold">
              {formatTooltip ? formatTooltip(data.value) : data.value}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ID único para o gradiente
  const gradientId = `areaGradient-${Math.random().toString(36).substr(2, 9)}`;

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        )}
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis
          dataKey={xKey}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={gradient ? `url(#${gradientId})` : color}
          fillOpacity={gradient ? 1 : 0.3}
          stackId={stacked ? '1' : undefined}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );

  // Se tiver título, renderiza dentro de Card
  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{chartContent}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{chartContent}</div>;
}
