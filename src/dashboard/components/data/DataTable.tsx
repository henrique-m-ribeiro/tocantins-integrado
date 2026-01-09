/**
 * Tabela de dados avançada com ordenação, filtro e paginação
 * Componente reutilizável para exibição de dados tabulares
 */

'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string; // Key do dado
  header: string; // Título da coluna
  sortable?: boolean; // Se pode ordenar
  format?: (value: any, row: T) => React.ReactNode; // Formatador customizado
  align?: 'left' | 'center' | 'right'; // Alinhamento
  width?: string; // Largura (ex: '200px', '20%')
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  exportable?: boolean;
  className?: string;
}

/**
 * Tabela de dados com recursos avançados
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={indicators}
 *   columns={[
 *     { key: 'name', header: 'Indicador', sortable: true },
 *     {
 *       key: 'value',
 *       header: 'Valor',
 *       sortable: true,
 *       format: (v) => formatNumber(v),
 *       align: 'right'
 *     }
 *   ]}
 *   searchable
 *   paginated
 * />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  sortable = true,
  paginated = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onRowClick,
  exportable = false,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtrar dados pela busca
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchable, columns]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Null/undefined handling
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginar dados
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handler de ordenação
  const handleSort = (key: string) => {
    if (!sortable) return;

    if (sortKey === key) {
      // Ciclar: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Ícone de ordenação
  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-3 w-3 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-3 w-3 ml-1" />;
    return null;
  };

  // Export CSV
  const handleExport = () => {
    const csv = [
      columns.map(col => col.header).join(','),
      ...sortedData.map(row =>
        columns.map(col => {
          const value = row[col.key];
          // Escape commas and quotes
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${Date.now()}.csv`;
    link.click();
  };

  const content = (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-3 font-medium text-${col.align || 'left'} ${
                      sortable && col.sortable !== false ? 'cursor-pointer hover:bg-muted/70' : ''
                    }`}
                    style={{ width: col.width }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className={`flex items-center gap-1 justify-${col.align || 'start'}`}>
                      {col.header}
                      {sortable && col.sortable !== false && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                    Nenhum resultado encontrado
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b last:border-b-0 ${
                      onRowClick ? 'cursor-pointer hover:bg-muted/30' : 'hover:bg-muted/20'
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-3 text-${col.align || 'left'}`}
                      >
                        {col.format ? col.format(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} linhas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="px-3 text-sm">
                Página {currentPage} de {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Se tiver título, renderiza dentro de Card
  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
