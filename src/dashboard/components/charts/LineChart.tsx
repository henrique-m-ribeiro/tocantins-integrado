/**
 * Componente de gráfico de linha (Line Chart)
 * Usado para séries temporais e evolução de indicadores
 */

'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  className?: string;
}

/**
 * Gráfico de linha para visualização de séries temporais
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={[{ ano: 2020, pib: 1000000 }, { ano: 2021, pib: 1100000 }]}
 *   xKey="ano"
 *   yKey="pib"
 *   title="Evolução do PIB"
 *   formatTooltip={(v) => formatCurrency(v)}
 * />
 * ```
 */
export function LineChart({
  data,
  xKey,
  yKey,
  color = '#3b82f6',
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = false,
  formatTooltip,
  formatYAxis,
  className,
}: LineChartProps) {
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

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
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
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
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

  // Caso contrário, renderiza só o gráfico
  return <div className={className}>{chartContent}</div>;
}
