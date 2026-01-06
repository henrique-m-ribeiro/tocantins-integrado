'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';

interface AnalysisDetail {
  id: string;
  title: string;
  slug: string;
  analysis_type: string;
  executive_summary: string;
  full_content: any;
  key_findings: any;
  recommendations: any;
  municipality_name?: string;
  microregion_name?: string;
  data_year: number;
  published_at: string;
  pdf_url?: string;
  generated_by: string;
  metadata?: any;
}

const SECTION_ICONS: Record<string, any> = {
  strengths: CheckCircle,
  weaknesses: AlertCircle,
  opportunities: TrendingUp,
  threats: TrendingDown,
  recommendations: Lightbulb
};

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [slug]);

  async function loadAnalysis() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAnalysisBySlug(slug);
      setAnalysis(data);
    } catch (err) {
      setError('Análise não encontrada');
      console.error('Erro ao carregar análise:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    if (!analysis?.pdf_url) return;
    try {
      await api.registerDownload(analysis.id);
      window.open(analysis.pdf_url, '_blank');
    } catch (error) {
      console.error('Erro ao registrar download:', error);
      window.open(analysis.pdf_url, '_blank');
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: analysis?.title,
        text: analysis?.executive_summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header onMenuClick={() => {}} onChatClick={() => {}} isChatOpen={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400 animate-pulse" />
            <p className="text-gray-500">Carregando análise...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header onMenuClick={() => {}} onChatClick={() => {}} isChatOpen={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
            <p className="text-gray-700 font-medium">{error || 'Análise não encontrada'}</p>
            <button
              onClick={() => router.push('/analises')}
              className="mt-4 px-4 py-2 bg-tocantins-blue text-white rounded-lg hover:bg-tocantins-blue/90"
            >
              Ver todas as análises
            </button>
          </div>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(analysis.published_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onMenuClick={() => {}} onChatClick={() => router.push('/')} isChatOpen={false} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => router.push('/analises')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para análises
          </button>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-tocantins-blue/10 text-tocantins-blue rounded mb-2">
                  {analysis.analysis_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{analysis.title}</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Compartilhar"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                {analysis.pdf_url && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-tocantins-blue text-white rounded-lg hover:bg-tocantins-blue/90"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </button>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {(analysis.municipality_name || analysis.microregion_name) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {analysis.municipality_name || analysis.microregion_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Publicado em {publishedDate}
              </span>
              <span>Dados: {analysis.data_year}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumo Executivo</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {analysis.executive_summary}
            </p>
          </div>

          {/* Key Findings */}
          {analysis.key_findings && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Principais Descobertas</h2>
              <div className="space-y-3">
                {Array.isArray(analysis.key_findings) ? (
                  analysis.key_findings.map((finding: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-tocantins-blue text-white text-sm font-medium rounded-full">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{finding}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">{JSON.stringify(analysis.key_findings)}</p>
                )}
              </div>
            </div>
          )}

          {/* Full Content Sections */}
          {analysis.full_content && typeof analysis.full_content === 'object' && (
            <>
              {/* Strengths */}
              {analysis.full_content.strengths && (
                <ContentSection
                  title="Pontos Fortes"
                  items={analysis.full_content.strengths}
                  icon={CheckCircle}
                  iconColor="text-green-600"
                  bgColor="bg-green-50"
                />
              )}

              {/* Weaknesses */}
              {analysis.full_content.weaknesses && (
                <ContentSection
                  title="Desafios"
                  items={analysis.full_content.weaknesses}
                  icon={AlertCircle}
                  iconColor="text-amber-600"
                  bgColor="bg-amber-50"
                />
              )}

              {/* Opportunities */}
              {analysis.full_content.opportunities && (
                <ContentSection
                  title="Oportunidades"
                  items={analysis.full_content.opportunities}
                  icon={TrendingUp}
                  iconColor="text-blue-600"
                  bgColor="bg-blue-50"
                />
              )}
            </>
          )}

          {/* Recommendations */}
          {analysis.recommendations && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recomendações
              </h2>
              <div className="space-y-3">
                {Array.isArray(analysis.recommendations) ? (
                  analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-500 text-white text-sm font-medium rounded-full">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">{JSON.stringify(analysis.recommendations)}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="text-center text-sm text-gray-500 py-4">
            <p>Análise gerada por: {analysis.generated_by}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

interface ContentSectionProps {
  title: string;
  items: string[] | any;
  icon: any;
  iconColor: string;
  bgColor: string;
}

function ContentSection({ title, items, icon: Icon, iconColor, bgColor }: ContentSectionProps) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        {title}
      </h2>
      <div className="space-y-2">
        {Array.isArray(items) ? (
          items.map((item: string, index: number) => (
            <div key={index} className={`p-3 ${bgColor} rounded-lg`}>
              <p className="text-gray-700">{item}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-700">{JSON.stringify(items)}</p>
        )}
      </div>
    </div>
  );
}
