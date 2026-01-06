'use client';

import { useQuery } from '@tanstack/react-query';
import { X, MapPin, Users, Ruler, TrendingUp, Download, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface MunicipalityPanelProps {
  municipalityId: string;
  onClose: () => void;
}

const DIMENSION_COLORS = {
  ECON: { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  SOCIAL: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  TERRA: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
  AMBIENT: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' }
};

const DIMENSION_LABELS = {
  ECON: 'Econômica',
  SOCIAL: 'Social',
  TERRA: 'Territorial',
  AMBIENT: 'Ambiental'
};

export function MunicipalityPanel({ municipalityId, onClose }: MunicipalityPanelProps) {
  // Buscar perfil do município
  const { data: profile, isLoading } = useQuery({
    queryKey: ['municipality-profile', municipalityId],
    queryFn: () => api.getMunicipalityProfile(municipalityId)
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Município não encontrado</div>
      </div>
    );
  }

  const { municipality, summary, rankings } = profile;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{municipality.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{municipality.microregion_name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick stats */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">População</span>
            </div>
            <p className="text-lg font-bold text-blue-800">
              {municipality.population?.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Ruler className="h-4 w-4" />
              <span className="text-xs font-medium">Área</span>
            </div>
            <p className="text-lg font-bold text-green-800">
              {municipality.area_km2?.toLocaleString('pt-BR')} km²
            </p>
          </div>
        </div>

        {/* Dimension scores */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Perfil por Dimensão
          </h3>

          <div className="space-y-3">
            {summary?.dimension_scores && Object.entries(summary.dimension_scores).map(([dimension, data]: [string, any]) => {
              const colors = DIMENSION_COLORS[dimension as keyof typeof DIMENSION_COLORS];
              const label = DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS];

              return (
                <div key={dimension} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {label}
                    </span>
                    <span className="text-sm text-gray-600">
                      #{data.rank} de {data.total}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} transition-all duration-500`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>

                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500">
                      Score: {data.score}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top indicators */}
        {profile.top_indicators && profile.top_indicators.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Principais Indicadores
            </h3>

            <div className="space-y-2">
              {profile.top_indicators.slice(0, 5).map((indicator: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {indicator.indicator_name}
                  </span>
                  <span className="text-sm font-medium text-gray-800 ml-2">
                    {typeof indicator.value === 'number'
                      ? indicator.value.toLocaleString('pt-BR')
                      : indicator.value}
                    {' '}{indicator.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-tocantins-blue text-white rounded-lg hover:bg-tocantins-blue/90 transition-colors">
          <TrendingUp className="h-4 w-4" />
          <span>Ver análise completa</span>
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Download className="h-4 w-4" />
          <span>Exportar relatório</span>
        </button>
      </div>
    </div>
  );
}
