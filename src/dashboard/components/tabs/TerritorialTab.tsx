/**
 * Tab da Dimensão Territorial
 * Indicadores de infraestrutura, saneamento e desenvolvimento territorial
 */

'use client';

import { Map, Home, Wifi, Droplet, Zap, PieChart, Info } from 'lucide-react';
import { useIndicators } from '@/hooks/useIndicators';
import { KPIGrid } from '@/components/cards/KPICard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function TerritorialTab({ municipality, isLoading, error }: TabProps) {
  const { data: indicators, isLoading: loadingIndicators } = useIndicators({
    municipalityId: municipality?.id,
    dimension: 'TERRA',
    enabled: !!municipality,
  });

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município para visualizar os indicadores territoriais."
      />
    );
  }

  // Loading
  if (isLoading || loadingIndicators) {
    return <LoadingSkeleton type="full" />;
  }

  // Erro
  if (error) {
    return <ErrorState error={error} title="Erro ao carregar indicadores territoriais" />;
  }

  // KPIs Territoriais
  const kpis = [
    {
      title: 'Cobertura de Saneamento',
      value: 78.5,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 5.3,
      comparison: {
        value: 65.0,
        label: 'média TO',
      },
      description: 'Domicílios com saneamento adequado',
      tooltipContent: 'Água encanada, esgoto e coleta de lixo',
    },
    {
      title: 'Água Encanada',
      value: 92.3,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 2.1,
      description: 'Domicílios com rede de água',
      tooltipContent: 'Acesso à rede geral de distribuição de água',
    },
    {
      title: 'Coleta de Esgoto',
      value: 68.5,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 8.2,
      comparison: {
        value: 55.0,
        label: 'média TO',
      },
      description: 'Domicílios com rede de esgoto',
      tooltipContent: 'Ligação à rede coletora de esgoto',
    },
    {
      title: 'Coleta de Lixo',
      value: 95.8,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 1.5,
      description: 'Domicílios com coleta regular',
      tooltipContent: 'Coleta de lixo realizada por serviço de limpeza',
    },
    {
      title: 'Energia Elétrica',
      value: 98.2,
      unit: 'percent' as const,
      trend: 'stable' as const,
      trendValue: 0.5,
      description: 'Domicílios com eletricidade',
      tooltipContent: 'Acesso à rede elétrica',
    },
    {
      title: 'Conectividade (Internet)',
      value: 65.5,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 12.5,
      comparison: {
        value: 58.0,
        label: 'média TO',
      },
      description: 'Domicílios com internet',
      tooltipContent: 'Acesso à internet (qualquer tipo)',
    },
    {
      title: 'Domicílios Adequados',
      value: 72.0,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 3.8,
      description: 'Habitações adequadas',
      tooltipContent: 'Domicílios com condições adequadas de moradia',
    },
    {
      title: 'Densidade Urbana',
      value: 42.3,
      unit: 'density' as const,
      trend: 'up' as const,
      trendValue: 1.2,
      description: 'Habitantes por km²',
      tooltipContent: 'Densidade demográfica na área urbana',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dimension-terra">Dimensão Territorial</h2>
          <p className="text-muted-foreground">
            Indicadores de infraestrutura e desenvolvimento territorial de {municipality.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Map className="h-8 w-8 text-dimension-terra" />
        </div>
      </div>

      <Separator />

      {/* KPIs Territoriais */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Indicadores Principais</h3>
        <KPIGrid kpis={kpis} columns={4} />
      </section>

      {/* Saneamento Básico */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Saneamento Básico</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-dimension-terra" />
                Evolução do Saneamento
              </CardTitle>
              <CardDescription>Água, esgoto e lixo (2015-2023)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Gráfico de linha múltipla</p>
                  <p className="text-xs text-muted-foreground">
                    Evolução dos 3 componentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-dimension-terra" />
                Cobertura por Serviço
              </CardTitle>
              <CardDescription>Distribuição atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Gráfico de barras</p>
                  <p className="text-xs text-muted-foreground">
                    Água, Esgoto, Lixo, Energia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conectividade e Infraestrutura Digital */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Conectividade e Infraestrutura Digital</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Internet Banda Larga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48.5%</div>
              <p className="text-xs text-muted-foreground mt-1">dos domicílios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Internet Móvel 4G
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground mt-1">de cobertura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Antenas 5G
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">torres instaladas</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Habitação */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Habitação</h3>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-dimension-terra" />
              Indicadores de Habitação
            </CardTitle>
            <CardDescription>Condições de moradia no município</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Indicador</th>
                    <th className="text-right p-3 font-medium">Valor</th>
                    <th className="text-right p-3 font-medium">Comparação TO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3">Domicílios Próprios</td>
                    <td className="text-right p-3 font-medium">68.5%</td>
                    <td className="text-right p-3 text-muted-foreground">média: 65%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3">Densidade por Domicílio</td>
                    <td className="text-right p-3 font-medium">3,2 pessoas</td>
                    <td className="text-right p-3 text-muted-foreground">média: 3,4</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3">Domicílios Adequados</td>
                    <td className="text-right p-3 font-medium">72.0%</td>
                    <td className="text-right p-3 text-muted-foreground">média: 68%</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-3">Déficit Habitacional</td>
                    <td className="text-right p-3 font-medium">8.5%</td>
                    <td className="text-right p-3 text-muted-foreground">média: 10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Análise IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análise Territorial Gerada por IA
          </CardTitle>
          <CardDescription>
            Insights automáticos sobre a infraestrutura territorial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-dimension-terra">
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              Análise será gerada automaticamente com base nos indicadores territoriais.
              Aguardando integração com módulo de IA.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Destaques Positivos:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Cobertura de saneamento 20% acima da média estadual</li>
                <li>Expansão acelerada de esgotamento sanitário (+8,2%)</li>
                <li>Conectividade em crescimento expressivo (+12,5%)</li>
                <li>Cobertura universal de energia elétrica (98,2%)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pontos de Atenção:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Esgotamento sanitário ainda abaixo de 70%</li>
                <li>Internet banda larga precisa expandir (48,5%)</li>
                <li>Déficit habitacional de 8,5%</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Priorizar expansão da rede de esgoto nas áreas periféricas</li>
                <li>Parcerias com provedores para ampliar banda larga</li>
                <li>Programas habitacionais para reduzir déficit</li>
                <li>Manter investimentos em saneamento básico</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
