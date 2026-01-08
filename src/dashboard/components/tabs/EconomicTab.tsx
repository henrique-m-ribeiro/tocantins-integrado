/**
 * Tab da Dimensão Econômica
 * Indicadores de desenvolvimento econômico e finanças municipais
 */

'use client';

import { TrendingUp, DollarSign, Building2, PieChart, Info } from 'lucide-react';
import { useIndicators } from '@/hooks/useIndicators';
import { KPIGrid } from '@/components/cards/KPICard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function EconomicTab({ municipality, isLoading, error }: TabProps) {
  const { data: indicators, isLoading: loadingIndicators } = useIndicators({
    municipalityId: municipality?.id,
    dimension: 'ECON',
    enabled: !!municipality,
  });

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município para visualizar os indicadores econômicos."
      />
    );
  }

  // Loading
  if (isLoading || loadingIndicators) {
    return <LoadingSkeleton type="full" />;
  }

  // Erro
  if (error) {
    return <ErrorState error={error} title="Erro ao carregar indicadores econômicos" />;
  }

  // Dados mock para demonstração
  const kpis = [
    {
      title: 'PIB Municipal',
      value: 1250000000,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 4.2,
      description: 'Produto Interno Bruto total',
      tooltipContent: 'Soma de todas as riquezas produzidas no município',
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
      description: 'PIB dividido pela população',
      tooltipContent: 'Indica a riqueza média produzida por habitante',
    },
    {
      title: 'Receitas Totais',
      value: 185000000,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 6.8,
      description: 'Receitas municipais anuais',
      tooltipContent: 'Total de receitas arrecadadas pelo município (SICONFI)',
    },
    {
      title: 'Receita Per Capita',
      value: 4200,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 5.5,
      description: 'Receita por habitante',
      tooltipContent: 'Receita total dividida pela população',
    },
    {
      title: 'Despesas Totais',
      value: 178000000,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 5.2,
      description: 'Despesas municipais anuais',
      tooltipContent: 'Total de despesas realizadas pelo município',
    },
    {
      title: 'Superávit/Déficit',
      value: 7000000,
      unit: 'currency' as const,
      trend: 'stable' as const,
      trendValue: 0.8,
      description: 'Resultado fiscal',
      tooltipContent: 'Diferença entre receitas e despesas',
    },
    {
      title: 'VAF Per Capita',
      value: 18500,
      unit: 'currency' as const,
      trend: 'up' as const,
      trendValue: 4.1,
      description: 'Valor Adicionado Fiscal',
      tooltipContent: 'Base de cálculo do ICMS municipal',
    },
    {
      title: 'Empresas Ativas',
      value: 2450,
      unit: 'number' as const,
      trend: 'up' as const,
      trendValue: 2.8,
      description: 'Total de empresas formais',
      tooltipContent: 'Número de empresas ativas (CNPJ)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dimension-econ">Dimensão Econômica</h2>
          <p className="text-muted-foreground">
            Indicadores de desenvolvimento econômico e finanças de {municipality.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-dimension-econ" />
        </div>
      </div>

      <Separator />

      {/* KPIs Econômicos */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Indicadores Principais</h3>
        <KPIGrid kpis={kpis} columns={4} />
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução do PIB */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-dimension-econ" />
              Evolução do PIB
            </CardTitle>
            <CardDescription>Série histórica dos últimos 5 anos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
              <div className="text-center space-y-2">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Gráfico de linha (Recharts/Chart.js)
                </p>
                <p className="text-xs text-muted-foreground">
                  Evolução do PIB 2019-2023
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Composição das Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-dimension-econ" />
              Composição das Receitas
            </CardTitle>
            <CardDescription>Distribuição por fonte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border">
              <div className="text-center space-y-2">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Gráfico de pizza (Recharts)
                </p>
                <p className="text-xs text-muted-foreground">
                  Receitas: Próprias, Transferências, etc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Indicadores Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Detalhados</CardTitle>
          <CardDescription>
            Lista completa de indicadores econômicos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Indicador</th>
                  <th className="text-right p-3 font-medium">Valor</th>
                  <th className="text-right p-3 font-medium">Variação</th>
                  <th className="text-right p-3 font-medium">Ranking TO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3">PIB Per Capita</td>
                  <td className="text-right p-3 font-medium">R$ 28.500</td>
                  <td className="text-right p-3 text-green-600">+3,5%</td>
                  <td className="text-right p-3">12º / 139</td>
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3">Receita Per Capita</td>
                  <td className="text-right p-3 font-medium">R$ 4.200</td>
                  <td className="text-right p-3 text-green-600">+5,5%</td>
                  <td className="text-right p-3">8º / 139</td>
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3">VAF Per Capita</td>
                  <td className="text-right p-3 font-medium">R$ 18.500</td>
                  <td className="text-right p-3 text-green-600">+4,1%</td>
                  <td className="text-right p-3">15º / 139</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="p-3">Empresas Ativas</td>
                  <td className="text-right p-3 font-medium">2.450</td>
                  <td className="text-right p-3 text-green-600">+2,8%</td>
                  <td className="text-right p-3">6º / 139</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Ranking entre os 139 municípios do Tocantins
          </p>
        </CardContent>
      </Card>

      {/* Análise IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análise Econômica Gerada por IA
          </CardTitle>
          <CardDescription>
            Insights automáticos sobre a situação econômica do município
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-dimension-econ">
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              Análise será gerada automaticamente com base nos indicadores econômicos.
              Aguardando integração com módulo de IA.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Pontos Fortes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>PIB per capita 14% acima da média estadual</li>
                <li>Crescimento consistente nas receitas municipais (+6,8%)</li>
                <li>Resultado fiscal superavitário pelo 3º ano consecutivo</li>
                <li>Ambiente de negócios em expansão (+2,8% de empresas)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Oportunidades de Melhoria:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Diversificar base de arrecadação de receitas próprias</li>
                <li>Fortalecer atração de investimentos industriais</li>
                <li>Expandir programas de apoio a micro e pequenas empresas</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Manter disciplina fiscal para preservar superávit</li>
                <li>Investir em infraestrutura para atração de empresas</li>
                <li>Desenvolver plano de desenvolvimento econômico de longo prazo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
