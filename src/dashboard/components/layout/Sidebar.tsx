'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, ChevronRight, X, Filter, Map, FileText, Download, Home } from 'lucide-react';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/', label: 'Mapa', icon: Map },
  { href: '/analises', label: 'Análises', icon: FileText },
  { href: '/documentos', label: 'Documentos', icon: Download },
];

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
  const router = useRouter();
  const pathname = usePathname();
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
      {/* Navigation */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Navegação</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-tocantins-blue text-white'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Municípios</h2>

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
