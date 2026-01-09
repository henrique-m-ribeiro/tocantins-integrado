/**
 * Componente de gráfico de pizza (Pie Chart)
 * Usado para visualização de proporções e distribuições
 */

'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartProps {
  data: Array<Record<string, any>>;
  nameKey: string;
  valueKey: string;
  colors?: string[];
  title?: string;
  description?: string;
  height?: number;
  innerRadius?: number; // Para donut chart
  showLegend?: boolean;
  showLabels?: boolean;
  formatTooltip?: (value: any) => string;
  className?: string;
}

// Cores padrão
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * Gráfico de pizza para visualização de proporções
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { categoria: 'Receitas Próprias', valor: 30 },
 *     { categoria: 'Transferências', valor: 70 }
 *   ]}
 *   nameKey="categoria"
 *   valueKey="valor"
 *   title="Composição das Receitas"
 * />
 * ```
 */
export function PieChart({
  data,
  nameKey,
  valueKey,
  colors = DEFAULT_COLORS,
  title,
  description,
  height = 300,
  innerRadius = 0,
  showLegend = true,
  showLabels = true,
  formatTooltip,
  className,
}: PieChartProps) {
  // Calcular total para percentuais
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.payload.fill }}
              />
              <span className="text-xs text-muted-foreground">{data.name}</span>
            </div>
            <div className="text-sm font-semibold">
              {formatTooltip ? formatTooltip(data.value) : data.value}
            </div>
            <div className="text-xs text-muted-foreground">{percentage}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Label customizado para fatias
  const renderLabel = (entry: any) => {
    const percentage = ((entry[valueKey] / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  // Legenda customizada
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={80}
          paddingAngle={2}
          label={showLabels ? renderLabel : undefined}
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={<CustomLegend />} />}
      </RechartsPieChart>
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
