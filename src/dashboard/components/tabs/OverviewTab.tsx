/**
 * Tab de Visão Geral
 * Exibe resumo executivo, KPIs principais e localização do município
 */

'use client';

import { MapPin, Users, DollarSign, TrendingUp, Info } from 'lucide-react';
import { useIndicators } from '@/hooks/useIndicators';
import { KPIGrid, KPICard } from '@/components/cards/KPICard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function OverviewTab({ municipality, isLoading, error }: TabProps) {
  const { data: allIndicators, isLoading: loadingIndicators } = useIndicators({
    municipalityId: municipality?.id,
    enabled: !!municipality,
  });

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município no seletor acima para visualizar a visão geral dos indicadores."
        action={{
          label: 'Como funciona?',
          onClick: () => console.log('Abrir ajuda'),
        }}
      />
    );
  }

  // Loading
  if (isLoading || loadingIndicators) {
    return <LoadingSkeleton type="full" />;
  }

  // Erro
  if (error) {
    return <ErrorState error={error} title="Erro ao carregar visão geral" />;
  }

  // Dados mock para demonstração (serão substituídos por dados reais)
  const mockKPIs = [
    {
      title: 'População',
      value: municipality.population || 0,
      unit: 'number' as const,
      trend: 'up' as const,
      trendValue: 1.2,
      tooltipContent: 'População estimada pelo IBGE',
    },
    {
      title: 'PIB Per Capita',
      value: 28500,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 3.5,
      comparison: {
        value: 25000,
        label: 'média estadual',
      },
      tooltipContent: 'Produto Interno Bruto dividido pela população',
    },
    {
      title: 'IDHM',
      value: 0.695,
      unit: 'index' as const,
      trend: 'up' as const,
      trendValue: 2.1,
      tooltipContent: 'Índice de Desenvolvimento Humano Municipal',
    },
    {
      title: 'IDEB (Anos Iniciais)',
      value: 6.2,
      unit: 'index' as const,
      trend: 'stable' as const,
      trendValue: 0.3,
      comparison: {
        value: 5.8,
        label: 'meta nacional',
      },
      tooltipContent: 'Índice de Desenvolvimento da Educação Básica',
    },
    {
      title: 'Taxa de Mortalidade Infantil',
      value: 12.5,
      unit: 'ratio' as const,
      trend: 'down' as const,
      trendValue: -8.2,
      inverse: true,
      tooltipContent: 'Óbitos de menores de 1 ano por 1.000 nascidos vivos',
    },
    {
      title: 'Cobertura de Saneamento',
      value: 78.5,
      unit: 'percent' as const,
      trend: 'up' as const,
      trendValue: 5.3,
      comparison: {
        value: 65.0,
        label: 'média estadual',
      },
      tooltipContent: 'Percentual de domicílios com saneamento adequado',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header do município */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{municipality.name}</h1>
            <Badge variant="outline" className="text-xs">
              {municipality.ibge_code}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{municipality.microregion?.name || 'Microrregião não disponível'}</span>
            </div>
            {municipality.area_km2 && (
              <div className="flex items-center gap-1">
                <Map className="h-4 w-4" />
                <span>{municipality.area_km2.toLocaleString('pt-BR')} km²</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* KPIs Principais */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Indicadores Principais</h2>
        <KPIGrid kpis={mockKPIs} columns={3} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo Executivo (placeholder para IA) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo Executivo
            </CardTitle>
            <CardDescription>
              Análise gerada por IA dos principais indicadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-dimension-econ">
              <p className="text-sm text-muted-foreground italic">
                <Info className="inline h-4 w-4 mr-1" />
                Análise automática será gerada aqui com base nos indicadores do município.
                Aguardando integração com módulo de IA.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>Destaques positivos:</strong> PIB per capita acima da média estadual,
                cobertura de saneamento em crescimento.
              </p>
              <p className="text-muted-foreground">
                <strong>Pontos de atenção:</strong> Taxa de mortalidade infantil ainda superior
                à meta nacional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mapa de Localização (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
            <CardDescription>
              Município de {municipality.name} no estado do Tocantins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Mapa interativo será exibido aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  (Integração com Leaflet/Google Maps)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Destaques */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Destaques</CardTitle>
          <CardDescription>
            Informações relevantes sobre o município
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="mt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-green-900">Crescimento econômico sustentável</p>
                <p className="text-green-700 mt-1">
                  PIB cresceu 3,5% no último ano, acima da média estadual de 2,1%.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="mt-0.5">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-yellow-900">Atenção à educação</p>
                <p className="text-yellow-700 mt-1">
                  IDEB manteve-se estável. Recomenda-se investimentos adicionais para alcançar a meta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-blue-900">Dados atualizados</p>
                <p className="text-blue-700 mt-1">
                  Última atualização dos indicadores: Janeiro/2024
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
