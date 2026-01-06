'use client';

import { FileText, Download, Calendar, Eye, ChevronRight } from 'lucide-react';

interface AnalysisCardProps {
  analysis: {
    id: string;
    title: string;
    slug: string;
    analysis_type: string;
    executive_summary: string;
    municipality_name?: string;
    microregion_name?: string;
    data_year: number;
    published_at: string;
    pdf_url?: string;
  };
  onView?: (slug: string) => void;
  onDownload?: (id: string, pdfUrl: string) => void;
}

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  municipal_profile: 'Perfil Municipal',
  dimensional_summary: 'Análise Dimensional',
  comparative: 'Análise Comparativa',
  microregional: 'Análise Microrregional',
  thematic: 'Análise Temática',
  ranking: 'Ranking'
};

const ANALYSIS_TYPE_COLORS: Record<string, string> = {
  municipal_profile: 'bg-blue-100 text-blue-700',
  dimensional_summary: 'bg-purple-100 text-purple-700',
  comparative: 'bg-amber-100 text-amber-700',
  microregional: 'bg-green-100 text-green-700',
  thematic: 'bg-pink-100 text-pink-700',
  ranking: 'bg-indigo-100 text-indigo-700'
};

export function AnalysisCard({ analysis, onView, onDownload }: AnalysisCardProps) {
  const typeLabel = ANALYSIS_TYPE_LABELS[analysis.analysis_type] || 'Análise';
  const typeColor = ANALYSIS_TYPE_COLORS[analysis.analysis_type] || 'bg-gray-100 text-gray-700';

  const publishedDate = new Date(analysis.published_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-tocantins-blue/50 hover:shadow-md transition-all p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeColor} mb-2`}>
            {typeLabel}
          </span>
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {analysis.title}
          </h3>
        </div>
        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Location */}
      {(analysis.municipality_name || analysis.microregion_name) && (
        <p className="text-sm text-gray-600 mb-2">
          {analysis.municipality_name || analysis.microregion_name}
        </p>
      )}

      {/* Summary */}
      <p className="text-sm text-gray-500 line-clamp-3 mb-4">
        {analysis.executive_summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {publishedDate}
          </span>
          <span>Dados: {analysis.data_year}</span>
        </div>

        <div className="flex items-center gap-2">
          {analysis.pdf_url && (
            <button
              onClick={() => onDownload?.(analysis.id, analysis.pdf_url!)}
              className="p-1.5 text-gray-500 hover:text-tocantins-blue hover:bg-blue-50 rounded transition-colors"
              title="Baixar PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onView?.(analysis.slug)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-tocantins-blue hover:bg-blue-50 rounded transition-colors"
          >
            <Eye className="h-4 w-4" />
            Ver
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Lista de análises com loading state
 */
interface AnalysisListProps {
  analyses: AnalysisCardProps['analysis'][];
  isLoading?: boolean;
  emptyMessage?: string;
  onView?: (slug: string) => void;
  onDownload?: (id: string, pdfUrl: string) => void;
}

export function AnalysisList({
  analyses,
  isLoading,
  emptyMessage = 'Nenhuma análise disponível',
  onView,
  onDownload
}: AnalysisListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {analyses.map(analysis => (
        <AnalysisCard
          key={analysis.id}
          analysis={analysis}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
