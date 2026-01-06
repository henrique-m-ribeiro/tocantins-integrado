'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Filter, Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AnalysisList } from '@/components/analyses/AnalysisCard';
import { api } from '@/lib/api';

interface Analysis {
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
}

const ANALYSIS_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'municipal_profile', label: 'Perfil Municipal' },
  { value: 'dimensional_summary', label: 'Análise Dimensional' },
  { value: 'comparative', label: 'Análise Comparativa' },
  { value: 'microregional', label: 'Análise Microrregional' },
  { value: 'thematic', label: 'Análise Temática' },
  { value: 'ranking', label: 'Ranking' }
];

const YEARS = [2024, 2023, 2022, 2021, 2020];

export default function AnalisesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(
    searchParams.get('municipio') || null
  );

  useEffect(() => {
    loadAnalyses();
  }, [selectedType, selectedYear, selectedMunicipality]);

  async function loadAnalyses() {
    setIsLoading(true);
    try {
      const data = await api.getRecentAnalyses({
        type: selectedType || undefined,
        year: selectedYear || undefined,
        municipality_id: selectedMunicipality || undefined,
        limit: 50
      });
      setAnalyses(data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleView(slug: string) {
    router.push(`/analises/${slug}`);
  }

  async function handleDownload(id: string, pdfUrl: string) {
    // Registrar download e abrir PDF
    try {
      await api.registerDownload(id);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao registrar download:', error);
      window.open(pdfUrl, '_blank');
    }
  }

  // Filtrar por busca textual
  const filteredAnalyses = analyses.filter(a =>
    !searchQuery ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.executive_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.municipality_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onChatClick={() => router.push('/')}
        isChatOpen={false}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedMunicipality={selectedMunicipality}
          onSelectMunicipality={(id) => {
            setSelectedMunicipality(id);
            setIsSidebarOpen(false);
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Page Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao mapa
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Análises Territoriais</h1>
              <p className="text-gray-600 mt-1">
                Explore análises detalhadas sobre os municípios e microrregiões do Tocantins
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar análises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tocantins-blue/50 focus:border-tocantins-blue"
                  />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="appearance-none w-full md:w-48 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tocantins-blue/50 focus:border-tocantins-blue bg-white"
                  >
                    {ANALYSIS_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Year Filter */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : '')}
                    className="appearance-none w-full md:w-36 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tocantins-blue/50 focus:border-tocantins-blue bg-white"
                  >
                    <option value="">Todos os anos</option>
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Municipality indicator */}
                {selectedMunicipality && (
                  <button
                    onClick={() => setSelectedMunicipality(null)}
                    className="flex items-center gap-2 px-3 py-2 bg-tocantins-blue/10 text-tocantins-blue rounded-lg text-sm"
                  >
                    <Filter className="h-4 w-4" />
                    Município selecionado
                    <span className="ml-1">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'análise encontrada' : 'análises encontradas'}
            </div>

            {/* Analysis List */}
            <AnalysisList
              analyses={filteredAnalyses}
              isLoading={isLoading}
              emptyMessage="Nenhuma análise encontrada com os filtros selecionados"
              onView={handleView}
              onDownload={handleDownload}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
