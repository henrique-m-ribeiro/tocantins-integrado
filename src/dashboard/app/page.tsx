'use client';

import { useState } from 'react';
import { MapPin, MessageSquare, BarChart3, FileText, Menu, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MunicipalityPanel } from '@/components/municipality/MunicipalityPanel';
import { StatsOverview } from '@/components/stats/StatsOverview';

// Importar mapa dinamicamente para evitar SSR issues com Leaflet
const TocantinsMap = dynamic(
  () => import('@/components/map/TocantinsMap'),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-2 animate-pulse" />
        <p>Carregando mapa...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onChatClick={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedMunicipality={selectedMunicipality}
          onSelectMunicipality={setSelectedMunicipality}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Overview */}
          <div className="p-4 border-b bg-white">
            <StatsOverview />
          </div>

          {/* Map and Municipality Panel */}
          <div className="flex-1 flex overflow-hidden">
            {/* Map Container */}
            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                <TocantinsMap
                  selectedMunicipality={selectedMunicipality}
                  onSelectMunicipality={setSelectedMunicipality}
                />
              </div>
            </div>

            {/* Municipality Details Panel */}
            {selectedMunicipality && (
              <div className="w-96 border-l bg-white overflow-y-auto">
                <MunicipalityPanel
                  municipalityId={selectedMunicipality}
                  onClose={() => setSelectedMunicipality(null)}
                />
              </div>
            )}
          </div>
        </main>

        {/* Chat Panel */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          context={{
            municipality_id: selectedMunicipality || undefined
          }}
        />
      </div>
    </div>
  );
}
