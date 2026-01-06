'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Calendar,
  Search,
  ChevronDown,
  ArrowLeft,
  File,
  Eye
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';

interface Document {
  id: string;
  title: string;
  document_type: string;
  format: string;
  file_url: string;
  file_size_bytes: number;
  analysis_id?: string;
  analysis_title?: string;
  municipality_name?: string;
  download_count: number;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'analysis_pdf', label: 'Análises (PDF)' },
  { value: 'executive_summary', label: 'Resumo Executivo' },
  { value: 'data_export', label: 'Exportação de Dados' },
  { value: 'presentation', label: 'Apresentação' },
  { value: 'report', label: 'Relatório' }
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentosPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [selectedType]);

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const data = await api.getDocuments({
        type: selectedType || undefined,
        limit: 50
      });
      setDocuments(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload(doc: Document) {
    try {
      await api.registerDocumentDownload(doc.id);
      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error('Erro ao registrar download:', error);
      window.open(doc.file_url, '_blank');
    }
  }

  // Filtrar por busca textual
  const filteredDocuments = documents.filter(d =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.analysis_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.municipality_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocumentIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'xlsx':
      case 'csv':
        return <File className="h-8 w-8 text-green-500" />;
      case 'pptx':
        return <File className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onMenuClick={() => {}}
        onChatClick={() => router.push('/')}
        isChatOpen={false}
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
            <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
            <p className="text-gray-600 mt-1">
              Baixe análises em PDF, relatórios e exportações de dados
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
                  placeholder="Buscar documentos..."
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
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-gray-600">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
          </div>

          {/* Documents List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="w-24 h-9 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-tocantins-blue/50 hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getDocumentIcon(doc.format)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        {doc.municipality_name && (
                          <span>{doc.municipality_name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                        <span className="uppercase text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                          {doc.format}
                        </span>
                        {doc.download_count > 0 && (
                          <span>{doc.download_count} downloads</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {doc.analysis_id && (
                        <button
                          onClick={() => router.push(`/analises/${doc.analysis_id}`)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-tocantins-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Ver análise</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center gap-2 px-4 py-2 bg-tocantins-blue text-white rounded-lg hover:bg-tocantins-blue/90 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Baixar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
