/**
 * Componente de gráfico radar (Radar Chart)
 * Usado para comparação multidimensional
 */

'use client';

import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RadarSeries {
  key: string;
  name: string;
  color: string;
}

interface RadarChartProps {
  data: Array<Record<string, any>>;
  subjects: string; // Key do nome da dimensão (ex: "dimension")
  series: RadarSeries[]; // Array de séries para comparar
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  formatTooltip?: (value: any) => string;
  className?: string;
}

/**
 * Gráfico radar para comparação multidimensional
 *
 * @example
 * ```tsx
 * <RadarChart
 *   data={[
 *     { dimension: 'Economia', mun1: 80, mun2: 65 },
 *     { dimension: 'Social', mun1: 70, mun2: 75 },
 *   ]}
 *   subjects="dimension"
 *   series={[
 *     { key: 'mun1', name: 'Palmas', color: '#3b82f6' },
 *     { key: 'mun2', name: 'Araguaína', color: '#10b981' }
 *   ]}
 *   title="Comparação Multidimensional"
 * />
 * ```
 */
export function RadarChart({
  data,
  subjects,
  series,
  title,
  description,
  height = 400,
  showLegend = true,
  formatTooltip,
  className,
}: RadarChartProps) {
  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
          <div className="grid gap-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}:</span>
                <span className="text-sm font-semibold">
                  {formatTooltip ? formatTooltip(entry.value) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
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
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data}>
        <PolarGrid className="stroke-muted" />
        <PolarAngleAxis
          dataKey={subjects}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={<CustomLegend />} />}
        {series.map((serie, index) => (
          <Radar
            key={`radar-${index}`}
            name={serie.name}
            dataKey={serie.key}
            stroke={serie.color}
            fill={serie.color}
            fillOpacity={0.2}
          />
        ))}
      </RechartsRadarChart>
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
