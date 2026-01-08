/**
 * Estado vazio - Exibido quando não há dados para mostrar
 */

'use client';

import { FileQuestion, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: 'search' | 'location' | 'data';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Componente para exibir estado vazio
 *
 * @example
 * ```tsx
 * <EmptyState
 *   message="Selecione um município para visualizar os indicadores"
 *   icon="location"
 * />
 * ```
 */
export function EmptyState({
  title,
  message,
  icon = 'data',
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : icon === 'location' ? MapPin : FileQuestion;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      {title && (
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      )}

      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message}
      </p>

      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
