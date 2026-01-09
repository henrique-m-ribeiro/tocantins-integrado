/**
 * Tab de Comparação entre Municípios
 * Permite comparar indicadores de dois municípios lado a lado
 */

'use client';

import { useState } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Minus, PieChart, Info } from 'lucide-react';
import { SimpleTerritorySelector } from '@/components/controls/TerritorySelector';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { TabProps, Municipality } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/formatters';

export function ComparisonTab({ municipality, isLoading, error }: TabProps) {
  const [comparisonMunicipality, setComparisonMunicipality] = useState<Municipality | undefined>();

  // Estado vazio
  if (!municipality) {
    return (
      <EmptyState
        icon="location"
        message="Selecione um município no seletor principal para iniciar a comparação."
      />
    );
  }

  // Loading
  if (isLoading) {
    return <LoadingSkeleton type="full" />;
  }

  // Aguardando seleção do segundo município
  if (!comparisonMunicipality) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Comparação de Municípios</h2>
          <p className="text-muted-foreground">
            Compare indicadores de {municipality.name} com outro município do Tocantins
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Selecione o Município para Comparação
            </CardTitle>
            <CardDescription>
              Escolha um segundo município para comparar os indicadores lado a lado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <SimpleTerritorySelector
                placeholder="Selecione o município para comparar"
                onSelect={setComparisonMunicipality}
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <GitCompare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">Comparação entre Municípios</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Selecione um município acima para visualizar a comparação de indicadores,
            rankings e análises comparativas.
          </p>
        </div>
      </div>
    );
  }

  // Dados mock para demonstração
  const comparisonData = [
    {
      categoria: 'Demográficos',
      indicadores: [
        {
          nome: 'População',
          mun1: 44200,
          mun2: 32500,
          formato: 'number' as const,
        },
        {
          nome: 'Densidade Demográfica',
          mun1: 42.3,
          mun2: 28.5,
          formato: 'density' as const,
        },
      ],
    },
    {
      categoria: 'Econômicos',
      indicadores: [
        {
          nome: 'PIB Per Capita',
          mun1: 28500,
          mun2: 22000,
          formato: 'currency' as const,
        },
        {
          nome: 'Receita Per Capita',
          mun1: 4200,
          mun2: 3800,
          formato: 'currency' as const,
        },
        {
          nome: 'Empresas Ativas',
          mun1: 2450,
          mun2: 1820,
          formato: 'number' as const,
        },
      ],
    },
    {
      categoria: 'Sociais',
      indicadores: [
        {
          nome: 'IDHM',
          mun1: 0.695,
          mun2: 0.672,
          formato: 'index' as const,
        },
        {
          nome: 'IDEB Anos Iniciais',
          mun1: 6.2,
          mun2: 5.8,
          formato: 'index' as const,
        },
        {
          nome: 'Taxa de Pobreza',
          mun1: 18.5,
          mun2: 24.2,
          formato: 'percent' as const,
          inverse: true,
        },
        {
          nome: 'Mortalidade Infantil',
          mun1: 12.5,
          mun2: 15.8,
          formato: 'number' as const,
          inverse: true,
        },
      ],
    },
    {
      categoria: 'Territoriais',
      indicadores: [
        {
          nome: 'Cobertura de Saneamento',
          mun1: 78.5,
          mun2: 62.3,
          formato: 'percent' as const,
        },
        {
          nome: 'Água Encanada',
          mun1: 92.3,
          mun2: 85.5,
          formato: 'percent' as const,
        },
        {
          nome: 'Conectividade (Internet)',
          mun1: 65.5,
          mun2: 52.0,
          formato: 'percent' as const,
        },
      ],
    },
    {
      categoria: 'Ambientais',
      indicadores: [
        {
          nome: 'Cobertura Vegetal',
          mun1: 68.5,
          mun2: 72.3,
          formato: 'percent' as const,
        },
        {
          nome: 'Áreas Protegidas',
          mun1: 15.3,
          mun2: 18.8,
          formato: 'percent' as const,
        },
        {
          nome: 'Desmatamento Anual',
          mun1: 0.85,
          mun2: 1.20,
          formato: 'percent' as const,
          inverse: true,
        },
      ],
    },
  ];

  const formatValue = (value: number, formato: string) => {
    switch (formato) {
      case 'currency':
        return formatCurrency(value, true);
      case 'percent':
        return formatPercent(value, 1);
      case 'index':
        return formatNumber(value, 2);
      case 'density':
        return `${formatNumber(value, 1)}/km²`;
      default:
        return formatNumber(value, 0);
    }
  };

  const getComparisonIcon = (val1: number, val2: number, inverse = false) => {
    const better = inverse ? val1 < val2 : val1 > val2;
    const worse = inverse ? val1 > val2 : val1 < val2;

    if (better) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (worse) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Comparação de Municípios</h2>
          <p className="text-muted-foreground">
            Análise comparativa entre {municipality.name} e {comparisonMunicipality.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GitCompare className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <Separator />

      {/* Seletor do município de comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Município para Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <SimpleTerritorySelector
              placeholder="Selecione outro município"
              onSelect={setComparisonMunicipality}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{municipality.name}</CardTitle>
            <CardDescription>Município Principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Código IBGE:</span>
              <span className="font-medium">{municipality.ibge_code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Microrregião:</span>
              <span className="font-medium">{municipality.microregion?.name || '—'}</span>
            </div>
            {municipality.population && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">População:</span>
                <span className="font-medium">{formatNumber(municipality.population, 0)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{comparisonMunicipality.name}</CardTitle>
            <CardDescription>Município Comparado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Código IBGE:</span>
              <span className="font-medium">{comparisonMunicipality.ibge_code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Microrregião:</span>
              <span className="font-medium">{comparisonMunicipality.microregion?.name || '—'}</span>
            </div>
            {comparisonMunicipality.population && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">População:</span>
                <span className="font-medium">{formatNumber(comparisonMunicipality.population, 0)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Radar (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Comparação Multidimensional
          </CardTitle>
          <CardDescription>
            Visão radar dos indicadores nas 5 dimensões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[2/1] rounded-lg bg-muted/50 flex items-center justify-center border">
            <div className="text-center space-y-2">
              <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Gráfico Radar (Chart.js)</p>
              <p className="text-xs text-muted-foreground">
                5 eixos: Demografia, Economia, Social, Territorial, Ambiental
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Detalhada de Indicadores</CardTitle>
          <CardDescription>
            Indicadores lado a lado com destaque para diferenças
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comparisonData.map((categoria) => (
              <div key={categoria.categoria}>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  {categoria.categoria}
                </h4>
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Indicador</th>
                        <th className="text-right p-3 font-medium">{municipality.name}</th>
                        <th className="text-center p-3 font-medium w-16"></th>
                        <th className="text-right p-3 font-medium">{comparisonMunicipality.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoria.indicadores.map((ind, idx) => {
                        const isLast = idx === categoria.indicadores.length - 1;
                        return (
                          <tr key={ind.nome} className={`hover:bg-muted/30 ${!isLast ? 'border-b' : ''}`}>
                            <td className="p-3">{ind.nome}</td>
                            <td className="text-right p-3 font-medium">
                              {formatValue(ind.mun1, ind.formato)}
                            </td>
                            <td className="text-center p-3">
                              {getComparisonIcon(ind.mun1, ind.mun2, ind.inverse)}
                            </td>
                            <td className="text-right p-3 font-medium">
                              {formatValue(ind.mun2, ind.formato)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análise Comparativa Gerada por IA
          </CardTitle>
          <CardDescription>
            Insights automáticos sobre as diferenças entre os municípios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-purple-600">
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              Análise comparativa será gerada automaticamente com base nos indicadores.
              Aguardando integração com módulo de IA.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Vantagens de {municipality.name}:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>PIB per capita 30% superior (R$ 28.500 vs R$ 22.000)</li>
                <li>Cobertura de saneamento significativamente maior (78,5% vs 62,3%)</li>
                <li>Melhor conectividade digital (65,5% vs 52%)</li>
                <li>IDEB anos iniciais acima (6,2 vs 5,8)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Vantagens de {comparisonMunicipality.name}:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Maior cobertura vegetal preservada (72,3% vs 68,5%)</li>
                <li>Maior percentual de áreas protegidas (18,8% vs 15,3%)</li>
                <li>Menor taxa de desmatamento (1,20% vs 0,85%)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>{comparisonMunicipality.name} pode aprender com a gestão de saneamento e conectividade</li>
                <li>{municipality.name} pode adotar práticas de preservação ambiental do município comparado</li>
                <li>Possibilidade de consórcio intermunicipal para compartilhar boas práticas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
