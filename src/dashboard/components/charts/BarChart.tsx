/**
 * Componente de gráfico de barras (Bar Chart)
 * Usado para comparações e distribuições
 */

'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
  colors?: string[]; // Array de cores para múltiplas barras
  title?: string;
  description?: string;
  height?: number;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  gradient?: boolean;
  formatTooltip?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  className?: string;
}

/**
 * Gráfico de barras para visualização de comparações
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[{ categoria: 'A', valor: 100 }, { categoria: 'B', valor: 200 }]}
 *   xKey="categoria"
 *   yKey="valor"
 *   title="Distribuição por Categoria"
 *   gradient
 * />
 * ```
 */
export function BarChart({
  data,
  xKey,
  yKey,
  color = '#10b981',
  colors,
  title,
  description,
  height = 300,
  horizontal = false,
  showGrid = true,
  showLegend = false,
  showLabels = false,
  gradient = false,
  formatTooltip,
  formatYAxis,
  className,
}: BarChartProps) {
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
              <span className="text-xs text-muted-foreground">
                {horizontal ? data.payload[yKey] : data.payload[xKey]}
              </span>
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

  // Label customizado para valores nas barras
  const renderLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (horizontal) {
      return (
        <text
          x={x + width + 5}
          y={y + height / 2}
          fill="hsl(var(--muted-foreground))"
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={12}
        >
          {formatTooltip ? formatTooltip(value) : value}
        </text>
      );
    }
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
        fontSize={12}
      >
        {formatTooltip ? formatTooltip(value) : value}
      </text>
    );
  };

  const ChartComponent = horizontal ? RechartsBarChart : RechartsBarChart;

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: horizontal ? 80 : 10, bottom: 5 }}
      >
        {gradient && (
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color} stopOpacity={0.3} />
            </linearGradient>
          </defs>
        )}
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <YAxis
              type="category"
              dataKey={yKey}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={70}
            />
          </>
        ) : (
          <>
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
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        <Bar
          dataKey={horizontal ? xKey : yKey}
          fill={gradient ? 'url(#barGradient)' : color}
          radius={[4, 4, 0, 0]}
          label={showLabels ? renderLabel : undefined}
        >
          {colors && data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </ChartComponent>
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
