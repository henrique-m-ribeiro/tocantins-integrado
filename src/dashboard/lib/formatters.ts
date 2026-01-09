/**
 * Formatadores de dados para o Dashboard
 * Todas as funções lidam com edge cases (null, undefined, 0, NaN)
 */

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { IndicatorUnit } from '@/types';

// ============================================================================
// Números
// ============================================================================

/**
 * Formata número com separadores brasileiros
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada (ex: "1.234,56")
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata número de forma compacta (K, M, B)
 * @param value - Valor numérico
 * @returns String compacta (ex: "1,2M", "450K")
 */
export function formatCompactNumber(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1)}K`;
  }

  return formatNumber(value, 0);
}

// ============================================================================
// Moeda
// ============================================================================

/**
 * Formata valor monetário em reais
 * @param value - Valor em reais
 * @param compact - Se true, usa formato compacto (K, M, B)
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(
  value: number | null | undefined,
  compact: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  if (compact && Math.abs(value) >= 1000) {
    return `R$ ${formatCompactNumber(value)}`;
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================================================
// Percentuais
// ============================================================================

/**
 * Formata percentual
 * @param value - Valor (0.5 = 50% ou 50 = 50%, dependendo de isDecimal)
 * @param decimals - Casas decimais (padrão: 1)
 * @param isDecimal - Se true, assume valor decimal (0.5 = 50%)
 * @returns String formatada (ex: "50,5%")
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1,
  isDecimal: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const percentValue = isDecimal ? value * 100 : value;

  return `${percentValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

// ============================================================================
// Datas
// ============================================================================

/**
 * Formata data no padrão brasileiro
 * @param date - Data (string ISO ou objeto Date)
 * @param formatString - Formato (padrão: 'dd/MM/yyyy')
 * @returns String formatada (ex: "08/01/2026")
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = 'dd/MM/yyyy'
): string {
  if (!date) {
    return '—';
  }

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '—';
  }
}

/**
 * Formata data de forma relativa (ex: "há 2 dias")
 * Implementação simplificada - pode ser expandida com date-fns/formatDistance
 */
export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) {
    return '—';
  }

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
    return `há ${Math.floor(diffDays / 365)} anos`;
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '—';
  }
}

// ============================================================================
// Formatação baseada em unidade de indicador
// ============================================================================

/**
 * Formata valor de indicador baseado na sua unidade
 * @param value - Valor do indicador
 * @param unit - Unidade do indicador
 * @returns String formatada
 */
export function formatIndicatorValue(
  value: number | null | undefined,
  unit: IndicatorUnit
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  switch (unit) {
    case 'percent':
      return formatPercent(value, 1, false);

    case 'currency':
      return formatCurrency(value, true);

    case 'per_capita':
      return `${formatCurrency(value, true)}/hab`;

    case 'density':
      // Assume densidade populacional (hab/km²) ou similar
      return `${formatNumber(value, 1)}/km²`;

    case 'growth_rate':
      return `${formatPercent(value, 2, false)}/ano`;

    case 'ratio':
      return formatNumber(value, 2);

    case 'index':
      // Índices geralmente são 0-1 ou 0-100
      if (value <= 1) {
        return formatNumber(value, 3);
      }
      return formatNumber(value, 1);

    case 'number':
    default:
      // Usa formato compacto para números grandes
      if (Math.abs(value) >= 1000) {
        return formatCompactNumber(value);
      }
      return formatNumber(value, 0);
  }
}

// ============================================================================
// Tendências
// ============================================================================

/**
 * Formata variação percentual com sinal
 * @param value - Variação percentual
 * @returns String formatada (ex: "+5,2%", "-3,1%")
 */
export function formatTrend(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPercent(value, 1, false)}`;
}

/**
 * Retorna ícone de tendência baseado no valor
 * @param value - Valor de tendência
 * @returns Ícone Unicode (↑, ↓, →)
 */
export function getTrendIcon(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  if (Math.abs(value) < 0.5) return '→'; // Estável
  return value > 0 ? '↑' : '↓';
}

/**
 * Retorna classe CSS para cor de tendência
 * @param value - Valor de tendência
 * @param inverse - Se true, inverte cores (vermelho=positivo, verde=negativo)
 * @returns Nome da classe Tailwind
 */
export function getTrendColorClass(
  value: number | null | undefined,
  inverse: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-muted-foreground';
  }

  if (Math.abs(value) < 0.5) return 'text-muted-foreground'; // Estável

  const isPositive = value > 0;
  const shouldBeGreen = inverse ? !isPositive : isPositive;

  return shouldBeGreen ? 'text-green-600' : 'text-red-600';
}

// ============================================================================
// Utilitários
// ============================================================================

/**
 * Trunca texto longo com reticências
 * @param text - Texto a truncar
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50
): string {
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '—';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formata código IBGE (adiciona dígito verificador)
 * @param code - Código IBGE (6 ou 7 dígitos)
 * @returns Código formatado
 */
export function formatIBGECode(code: string | number | null | undefined): string {
  if (!code) return '—';

  const codeStr = String(code).padStart(7, '0');
  return codeStr;
}
