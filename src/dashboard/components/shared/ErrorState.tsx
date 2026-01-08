/**
 * Estado de erro - Exibido quando ocorre um erro ao carregar dados
 */

'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
  error: Error;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Componente para exibir estado de erro
 *
 * @example
 * ```tsx
 * <ErrorState
 *   error={error}
 *   title="Erro ao carregar indicadores"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorState({
  error,
  title = 'Erro ao carregar dados',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className || ''}`}>
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </AlertDescription>
      </Alert>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
