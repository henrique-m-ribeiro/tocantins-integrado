'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, ChevronRight, X, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMunicipality: string | null;
  onSelectMunicipality: (id: string | null) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  selectedMunicipality,
  onSelectMunicipality
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [selectedMicroregion, setSelectedMicroregion] = useState<string | null>(null);

  // Buscar municípios
  const { data: municipalitiesData, isLoading } = useQuery({
    queryKey: ['municipalities', search, selectedMicroregion],
    queryFn: () => api.getMunicipalities({
      search,
      microregion: selectedMicroregion || undefined
    })
  });

  // Buscar microrregiões
  const { data: microregionsData } = useQuery({
    queryKey: ['microregions'],
    queryFn: () => api.getMicroregions()
  });

  const municipalities = municipalitiesData?.municipalities || [];
  const microregions = microregionsData?.microregions || [];

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-white border-r flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Municípios</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar município..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tocantins-blue/50"
          />
        </div>

        {/* Microregion filter */}
        <div className="mt-3">
          <select
            value={selectedMicroregion || ''}
            onChange={(e) => setSelectedMicroregion(e.target.value || null)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tocantins-blue/50 text-sm"
          >
            <option value="">Todas as microrregiões</option>
            {microregions.map((mr: any) => (
              <option key={mr.id} value={mr.name}>
                {mr.name} ({mr.municipality_count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Municipality list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Carregando...
          </div>
        ) : municipalities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhum município encontrado
          </div>
        ) : (
          <ul className="divide-y">
            {municipalities.map((municipality: any) => (
              <li key={municipality.id}>
                <button
                  onClick={() => onSelectMunicipality(municipality.id)}
                  className={`
                    w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                    ${selectedMunicipality === municipality.id
                      ? 'bg-tocantins-blue/10 border-l-4 border-tocantins-blue'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <MapPin className={`h-4 w-4 flex-shrink-0 ${
                    selectedMunicipality === municipality.id
                      ? 'text-tocantins-blue'
                      : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {municipality.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {municipality.microregion_name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
        <p>
          <span className="font-medium">{municipalities.length}</span> municípios
          {selectedMicroregion && ` em ${selectedMicroregion}`}
        </p>
      </div>
    </aside>
  );
}
