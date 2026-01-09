/**
 * Componente para exibir análises geradas por IA
 * Preparado para integração futura com orquestrador n8n
 */

'use client';

import { Sparkles, RefreshCw, Info, AlertCircle } from 'lucide-react';
import type { AIAnalysis, Dimension } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/formatters';

interface AIAnalysisBoxProps {
  title: string;
  dimension?: Dimension;
  municipalityId: string;
  analysis?: AIAnalysis; // Pode ser null/undefined
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  placeholder?: boolean; // Se true, mostra placeholder ao invés de error
  className?: string;
}

/**
 * Card para exibir análises geradas por IA
 *
 * @example
 * ```tsx
 * <AIAnalysisBox
 *   title="Análise Econômica"
 *   dimension="ECON"
 *   municipalityId={municipality.id}
 *   analysis={aiAnalysis}
 *   isLoading={loading}
 *   onRefresh={() => refetch()}
 * />
 * ```
 */
export function AIAnalysisBox({
  title,
  dimension,
  municipalityId,
  analysis,
  isLoading = false,
  error = null,
  onRefresh,
  placeholder = false,
  className,
}: AIAnalysisBoxProps) {
  // Estado de loading
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>Gerando análise com IA...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="pt-3">
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de erro (ou placeholder)
  if (error && !placeholder) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription>Erro ao gerar análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-destructive">{error.message}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Estado vazio (placeholder ou sem análise)
  if (!analysis || placeholder) {
    const dimensionColors: Record<Dimension, string> = {
      ECON: 'border-dimension-econ',
      SOCIAL: 'border-dimension-social',
      TERRA: 'border-dimension-terra',
      AMBIENT: 'border-dimension-ambient',
    };

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>Insights automáticos gerados por IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`rounded-lg bg-muted/50 p-4 border-l-4 ${dimension ? dimensionColors[dimension] : 'border-muted'}`}>
            <p className="text-sm text-muted-foreground italic">
              <Info className="inline h-4 w-4 mr-1" />
              A análise com IA será gerada automaticamente quando o backend estiver disponível.
              Aguardando integração com o orquestrador n8n.
            </p>
          </div>

          {/* Mock de estrutura */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Destaques Positivos:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Análise será gerada aqui...</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pontos de Atenção:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Análise será gerada aqui...</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Análise será gerada aqui...</li>
              </ul>
            </div>
          </div>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Análise
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Estado de sucesso (com análise)
  const dimensionBadgeColors: Record<Dimension, string> = {
    ECON: 'bg-dimension-econ/10 text-dimension-econ border-dimension-econ/20',
    SOCIAL: 'bg-dimension-social/10 text-dimension-social border-dimension-social/20',
    TERRA: 'bg-dimension-terra/10 text-dimension-terra border-dimension-terra/20',
    AMBIENT: 'bg-dimension-ambient/10 text-dimension-ambient border-dimension-ambient/20',
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {analysis.title || title}
            </CardTitle>
            <CardDescription>
              {formatRelativeDate(analysis.created_at)} · {' '}
              {dimension && (
                <Badge variant="outline" className={dimensionBadgeColors[dimension]}>
                  {dimension}
                </Badge>
              )}
              {analysis.confidence_score && (
                <span className="text-xs text-muted-foreground ml-2">
                  Confiança: {(analysis.confidence_score * 100).toFixed(0)}%
                </span>
              )}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conteúdo principal */}
        {analysis.content && (
          <div className="prose prose-sm max-w-none text-foreground">
            {analysis.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Key Findings */}
        {analysis.key_findings && analysis.key_findings.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Principais Achados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {analysis.key_findings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recomendações:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
