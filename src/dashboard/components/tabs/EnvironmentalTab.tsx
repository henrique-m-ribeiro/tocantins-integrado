/**
 * Tab da Dimensão Ambiental
 * Indicadores de meio ambiente, preservação e sustentabilidade
 */

'use client';

import { Leaf, TreePine, AlertTriangle, Droplets, PieChart, Info } from 'lucide-react';
import { useIndicators } from '@/hooks/useIndicators';
import { KPIGrid } from '@/components/cards/KPICard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function EnvironmentalTab({ municipality, isLoading, error }: TabProps) {
  const { data: indicators, isLoading: loadingIndicators } = useIndicators({
    municipalityId: municipality?.id,
    dimension: 'AMBIENT',
    enabled: !!municipality,
  });

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município para visualizar os indicadores ambientais."
      />
    );
  }

  // Loading
  if (isLoading || loadingIndicators) {
    return <LoadingSkeleton type="full" />;
  }

  // Erro
  if (error) {
    return <ErrorState error={error} title="Erro ao carregar indicadores ambientais" />;
  }

  // KPIs Ambientais
  const kpis = [
    {
      title: 'Cobertura Vegetal',
      value: 68.5,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -1.2,
      inverse: true,
      description: 'Área com vegetação nativa',
      tooltipContent: 'Percentual do território com cobertura vegetal preservada',
    },
    {
      title: 'Áreas Protegidas',
      value: 15.3,
      unit: 'percent' as const,
      trend: 'stable' as const,
      trendValue: 0.0,
      description: 'Unidades de conservação',
      tooltipContent: 'Área territorial sob proteção ambiental',
    },
    {
      title: 'Desmatamento Anual',
      value: 0.85,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -18.5,
      inverse: true,
      comparison: {
        value: 1.2,
        label: 'média TO',
      },
      description: 'Taxa de desmatamento',
      tooltipContent: 'Percentual de área desmatada no último ano',
    },
    {
      title: 'Área Desmatada (ha)',
      value: 1250,
      unit: 'number' as const,
      trend: 'down' as const,
      trendValue: -15.2,
      inverse: true,
      description: 'Hectares desmatados',
      tooltipContent: 'Área total desmatada no último ano',
    },
    {
      title: 'Focos de Queimada',
      value: 42,
      unit: 'number' as const,
      trend: 'up' as const,
      trendValue: 12.5,
      inverse: true,
      description: 'Focos detectados no ano',
      tooltipContent: 'Número de focos de queimada detectados por satélite',
    },
    {
      title: 'Qualidade da Água',
      value: 7.8,
      unit: 'index' as const,
      trend: 'up' as const,
      trendValue: 2.5,
      comparison: {
        value: 7.0,
        label: 'adequado',
      },
      description: 'IQA (0-10)',
      tooltipContent: 'Índice de Qualidade da Água dos mananciais',
    },
    {
      title: 'Coleta Seletiva',
      value: 35.2,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 8.5,
      description: 'Cobertura da coleta seletiva',
      tooltipContent: 'Percentual de domicílios atendidos por coleta seletiva',
    },
    {
      title: 'Aterro Sanitário',
      value: 100,
      unit: 'percent' as const,
      trend: 'stable' as const,
      trendValue: 0.0,
      description: 'Destinação adequada',
      tooltipContent: 'Percentual de resíduos com destinação adequada',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dimension-ambient">Dimensão Ambiental</h2>
          <p className="text-muted-foreground">
            Indicadores de meio ambiente e sustentabilidade de {municipality.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-dimension-ambient" />
        </div>
      </div>

      <Separator />

      {/* KPIs Ambientais */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Indicadores Principais</h3>
        <KPIGrid kpis={kpis} columns={4} />
      </section>

      {/* Preservação e Desmatamento */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Preservação e Desmatamento</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-dimension-ambient" />
                Evolução do Desmatamento
              </CardTitle>
              <CardDescription>Área desmatada (ha) 2018-2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Gráfico de linha + área</p>
                  <p className="text-xs text-muted-foreground">
                    Tendência de redução
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-dimension-ambient" />
                Uso do Solo
              </CardTitle>
              <CardDescription>Distribuição atual do território</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Gráfico de rosca</p>
                  <p className="text-xs text-muted-foreground">
                    Vegetação, Agropecuária, Urbano, Água
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Áreas Protegidas */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Unidades de Conservação</h3>
        <Card>
          <CardHeader>
            <CardTitle>Áreas Protegidas no Município</CardTitle>
            <CardDescription>Unidades de conservação e proteção ambiental</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Integral
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Parque Municipal Serra Verde</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Área: 2.450 ha · Criação: 2015
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Uso Sustentável
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">APA do Rio Tocantins</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Área: 8.200 ha · Criação: 2008
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    Reserva Legal
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Reserva Legal de Propriedades Rurais</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Área: 15.500 ha · CAR regularizado
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Riscos Climáticos */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Riscos Climáticos e Eventos Extremos</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Risco de Seca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
                Médio
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Período crítico: Jun-Set
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Risco de Inundação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                Baixo
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Período chuvoso: Nov-Mar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Risco de Queimadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                Alto
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Período crítico: Jul-Out
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Análise IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análise Ambiental Gerada por IA
          </CardTitle>
          <CardDescription>
            Insights automáticos sobre a situação ambiental do município
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-dimension-ambient">
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              Análise será gerada automaticamente com base nos indicadores ambientais.
              Aguardando integração com módulo de IA.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Destaques Positivos:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Redução expressiva no desmatamento (-18,5%)</li>
                <li>100% dos resíduos com destinação adequada</li>
                <li>Qualidade da água acima do padrão adequado (IQA: 7,8)</li>
                <li>Expansão da coleta seletiva (+8,5%)</li>
                <li>15,3% do território sob proteção ambiental</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pontos de Atenção:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Aumento de focos de queimada (+12,5%)</li>
                <li>Perda gradual de cobertura vegetal (-1,2%)</li>
                <li>Risco alto de queimadas no período seco</li>
                <li>Coleta seletiva ainda atende apenas 35,2%</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Intensificar brigadas de combate a incêndios florestais</li>
                <li>Expandir programa de coleta seletiva para 100%</li>
                <li>Criar novas unidades de conservação</li>
                <li>Fiscalizar desmatamento irregular</li>
                <li>Programa de educação ambiental nas escolas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
