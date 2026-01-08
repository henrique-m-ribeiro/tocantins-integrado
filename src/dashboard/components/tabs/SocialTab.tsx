/**
 * Tab da Dimensão Social
 * Indicadores de educação, saúde e vulnerabilidade social
 */

'use client';

import { Users, GraduationCap, Heart, AlertTriangle, PieChart, Info } from 'lucide-react';
import { useIndicators } from '@/hooks/useIndicators';
import { KPIGrid } from '@/components/cards/KPICard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SocialTab({ municipality, isLoading, error }: TabProps) {
  const { data: indicators, isLoading: loadingIndicators } = useIndicators({
    municipalityId: municipality?.id,
    dimension: 'SOCIAL',
    enabled: !!municipality,
  });

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município para visualizar os indicadores sociais."
      />
    );
  }

  // Loading
  if (isLoading || loadingIndicators) {
    return <LoadingSkeleton type="full" />;
  }

  // Erro
  if (error) {
    return <ErrorState error={error} title="Erro ao carregar indicadores sociais" />;
  }

  // KPIs gerais
  const mainKPIs = [
    {
      title: 'IDHM',
      value: 0.695,
      unit: 'index' as const,
      trend: 'up' as const,
      trendValue: 2.1,
      comparison: {
        value: 0.699,
        label: 'média TO',
      },
      tooltipContent: 'Índice de Desenvolvimento Humano Municipal (0-1)',
    },
    {
      title: 'População',
      value: 44200,
      unit: 'number' as const,
      trend: 'up' as const,
      trendValue: 1.2,
      tooltipContent: 'População estimada (IBGE)',
    },
    {
      title: 'Taxa de Pobreza',
      value: 18.5,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -3.2,
      inverse: true,
      comparison: {
        value: 22.0,
        label: 'média TO',
      },
      tooltipContent: 'Percentual da população em situação de pobreza',
    },
  ];

  // KPIs de Educação
  const educationKPIs = [
    {
      title: 'IDEB - Anos Iniciais',
      value: 6.2,
      unit: 'index' as const,
      trend: 'stable' as const,
      trendValue: 0.3,
      comparison: {
        value: 5.8,
        label: 'meta nacional',
      },
      tooltipContent: 'Índice de Desenvolvimento da Educação Básica (0-10)',
    },
    {
      title: 'IDEB - Anos Finais',
      value: 5.1,
      unit: 'index' as const,
      trend: 'up' as const,
      trendValue: 1.8,
      comparison: {
        value: 4.7,
        label: 'meta nacional',
      },
      tooltipContent: 'IDEB para 6º ao 9º ano',
    },
    {
      title: 'Taxa de Alfabetização',
      value: 94.2,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 1.5,
      tooltipContent: 'População alfabetizada com 15 anos ou mais',
    },
    {
      title: 'Matrículas Ensino Fundamental',
      value: 7850,
      unit: 'number' as const,
      trend: 'stable' as const,
      trendValue: -0.5,
      tooltipContent: 'Total de matrículas no ensino fundamental',
    },
  ];

  // KPIs de Saúde
  const healthKPIs = [
    {
      title: 'Mortalidade Infantil',
      value: 12.5,
      unit: 'ratio' as const,
      trend: 'down' as const,
      trendValue: -8.2,
      inverse: true,
      comparison: {
        value: 14.0,
        label: 'média TO',
      },
      tooltipContent: 'Óbitos de menores de 1 ano por 1.000 nascidos vivos',
    },
    {
      title: 'Cobertura Vacinal',
      value: 87.5,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -4.5,
      comparison: {
        value: 95.0,
        label: 'meta MS',
      },
      tooltipContent: 'Percentual de crianças vacinadas conforme calendário',
    },
    {
      title: 'Leitos por 1.000 hab',
      value: 2.3,
      unit: 'ratio' as const,
      trend: 'stable' as const,
      trendValue: 0.0,
      comparison: {
        value: 2.5,
        label: 'OMS',
      },
      tooltipContent: 'Número de leitos hospitalares por 1.000 habitantes',
    },
    {
      title: 'Cobertura ESF',
      value: 92.0,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 3.2,
      tooltipContent: 'Cobertura da Estratégia Saúde da Família',
    },
  ];

  // KPIs de Vulnerabilidade
  const vulnerabilityKPIs = [
    {
      title: 'Famílias no Bolsa Família',
      value: 3200,
      unit: 'number' as const,
      trend: 'down' as const,
      trendValue: -5.1,
      inverse: true,
      tooltipContent: 'Famílias beneficiadas pelo Bolsa Família',
    },
    {
      title: 'Crianças em Vulnerabilidade',
      value: 15.2,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -2.8,
      inverse: true,
      tooltipContent: 'Crianças de 0-14 anos em domicílios vulneráveis',
    },
    {
      title: 'Desemprego',
      value: 8.5,
      unit: 'percent' as const,
      trend: 'down' as const,
      trendValue: -1.5,
      inverse: true,
      tooltipContent: 'Taxa de desemprego da população economicamente ativa',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dimension-social">Dimensão Social</h2>
          <p className="text-muted-foreground">
            Indicadores de educação, saúde e desenvolvimento social de {municipality.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-dimension-social" />
        </div>
      </div>

      <Separator />

      {/* KPIs Gerais */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Indicadores Gerais</h3>
        <KPIGrid kpis={mainKPIs} columns={3} />
      </section>

      {/* Subseções: Educação, Saúde, Vulnerabilidade */}
      <Tabs defaultValue="education" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Educação
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="vulnerability" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Vulnerabilidade
          </TabsTrigger>
        </TabsList>

        {/* Tab Educação */}
        <TabsContent value="education" className="space-y-6">
          <KPIGrid kpis={educationKPIs} columns={4} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do IDEB</CardTitle>
                <CardDescription>Anos Iniciais e Finais (2015-2023)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Gráfico de linha</p>
                    <p className="text-xs text-muted-foreground">IDEB 2015-2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matrículas por Nível</CardTitle>
                <CardDescription>Distribuição do ensino básico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Gráfico de barras</p>
                    <p className="text-xs text-muted-foreground">Infantil, Fundamental, Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Saúde */}
        <TabsContent value="health" className="space-y-6">
          <KPIGrid kpis={healthKPIs} columns={4} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mortalidade Infantil</CardTitle>
                <CardDescription>Evolução nos últimos 5 anos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Gráfico de linha</p>
                    <p className="text-xs text-muted-foreground">Tendência de redução</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cobertura Vacinal</CardTitle>
                <CardDescription>Por tipo de vacina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Gráfico de barras horizontais</p>
                    <p className="text-xs text-muted-foreground">BCG, Polio, Tríplice, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Vulnerabilidade */}
        <TabsContent value="vulnerability" className="space-y-6">
          <KPIGrid kpis={vulnerabilityKPIs} columns={3} />

          <Card>
            <CardHeader>
              <CardTitle>Evolução da Pobreza</CardTitle>
              <CardDescription>Percentual da população em situação de pobreza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Gráfico de área</p>
                  <p className="text-xs text-muted-foreground">Taxa de pobreza 2015-2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Análise IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análise Social Gerada por IA
          </CardTitle>
          <CardDescription>
            Insights automáticos sobre a situação social do município
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-dimension-social">
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              Análise será gerada automaticamente com base nos indicadores sociais.
              Aguardando integração com módulo de IA.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Destaques Positivos:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>IDEB anos finais acima da meta nacional</li>
                <li>Mortalidade infantil em queda consistente (-8,2%)</li>
                <li>Alta cobertura da Estratégia Saúde da Família (92%)</li>
                <li>Redução significativa de famílias no Bolsa Família</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pontos de Atenção:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Cobertura vacinal abaixo da meta do Ministério da Saúde (87,5% vs 95%)</li>
                <li>IDEB anos iniciais estagnado</li>
                <li>Déficit de leitos hospitalares (2,3 vs 2,5 por 1.000 hab)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Intensificar campanhas de vacinação para alcançar meta de 95%</li>
                <li>Investir em capacitação de professores para melhorar IDEB</li>
                <li>Expandir infraestrutura de saúde para reduzir déficit de leitos</li>
                <li>Manter programas de combate à pobreza e vulnerabilidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
