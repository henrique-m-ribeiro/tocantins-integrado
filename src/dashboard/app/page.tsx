/**
 * Página Principal do Dashboard
 * Layout híbrido com navegação por tabs dimensionais
 */

'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useTerritory } from '@/hooks/useTerritory';
import { TerritorySelector } from '@/components/controls/TerritorySelector';
import { TabNavigation } from '@/components/tabs/TabNavigation';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { EconomicTab } from '@/components/tabs/EconomicTab';
import { SocialTab } from '@/components/tabs/SocialTab';
import { TerritorialTab } from '@/components/tabs/TerritorialTab';
import { EnvironmentalTab } from '@/components/tabs/EnvironmentalTab';
import type { TabId } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const { selectedMunicipality } = useTerritory();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Tocantins Integrado
                </h1>
                <p className="text-sm text-muted-foreground">
                  Plataforma de Indicadores Municipais
                </p>
              </div>
            </div>

            {/* Seletor de Território */}
            <div className="flex items-center gap-4">
              <div className="w-80">
                <TerritorySelector placeholder="Selecione um município" />
              </div>

              {/* Botão Chat */}
              <Button
                variant={isChatOpen ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Abrir chat de exploração"
              >
                {isChatOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-2">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Área de Conteúdo */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Conteúdo da Tab Ativa */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <OverviewTab
                municipality={selectedMunicipality || null}
                isLoading={false}
                error={null}
              />
            )}

            {activeTab === 'economic' && (
              <EconomicTab
                municipality={selectedMunicipality || null}
                isLoading={false}
                error={null}
              />
            )}

            {activeTab === 'social' && (
              <SocialTab
                municipality={selectedMunicipality || null}
                isLoading={false}
                error={null}
              />
            )}

            {activeTab === 'territorial' && (
              <TerritorialTab
                municipality={selectedMunicipality || null}
                isLoading={false}
                error={null}
              />
            )}

            {activeTab === 'environmental' && (
              <EnvironmentalTab
                municipality={selectedMunicipality || null}
                isLoading={false}
                error={null}
              />
            )}

            {activeTab === 'comparison' && (
              <div className="text-center py-12 text-muted-foreground">
                Tab Comparação (em desenvolvimento)
              </div>
            )}
          </div>

          {/* Chat Sidebar (placeholder) */}
          {isChatOpen && (
            <aside className="w-96 shrink-0">
              <Card className="sticky top-24 h-[calc(100vh-8rem)]">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Chat de Exploração</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 h-full flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                    <p>Chat interativo será implementado aqui</p>
                    <p className="text-xs">(Integração com módulo de IA)</p>
                  </div>
                </div>
              </Card>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Tocantins Integrado © 2026 · Dados: IBGE, SICONFI, INEP
          </p>
        </div>
      </footer>
    </div>
  );
}
