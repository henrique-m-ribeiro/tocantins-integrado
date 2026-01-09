/**
 * Navegação por tabs dimensionais
 * Permite alternar entre Overview, Econômico, Social, Territorial, Ambiental e Comparação
 */

'use client';

import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Map,
  Leaf,
  GitCompare,
} from 'lucide-react';
import type { TabId } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

const TABS_CONFIG = [
  {
    id: 'overview' as TabId,
    label: 'Visão Geral',
    icon: LayoutDashboard,
    color: 'text-slate-600',
  },
  {
    id: 'economic' as TabId,
    label: 'Econômica',
    icon: TrendingUp,
    color: 'text-dimension-econ',
  },
  {
    id: 'social' as TabId,
    label: 'Social',
    icon: Users,
    color: 'text-dimension-social',
  },
  {
    id: 'territorial' as TabId,
    label: 'Territorial',
    icon: Map,
    color: 'text-dimension-terra',
  },
  {
    id: 'environmental' as TabId,
    label: 'Ambiental',
    icon: Leaf,
    color: 'text-dimension-ambient',
  },
  {
    id: 'comparison' as TabId,
    label: 'Comparação',
    icon: GitCompare,
    color: 'text-purple-600',
  },
] as const;

/**
 * Navegação horizontal por tabs (desktop)
 */
export function TabNavigation({ activeTab, onTabChange, className }: TabNavigationProps) {
  return (
    <div className={className}>
      {/* Desktop: Tabs horizontais */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabId)}>
          <TabsList className="grid w-full grid-cols-6 h-auto">
            {TABS_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-accent"
                >
                  <Icon className={`h-5 w-5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile: Select dropdown */}
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={(value) => onTabChange(value as TabId)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(() => {
                const currentTab = TABS_CONFIG.find(t => t.id === activeTab);
                if (!currentTab) return 'Selecione uma dimensão';
                const Icon = currentTab.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${currentTab.color}`} />
                    <span>{currentTab.label}</span>
                  </div>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TABS_CONFIG.map((tab) => {
              const Icon = tab.icon;
              return (
                <SelectItem key={tab.id} value={tab.id}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${tab.color}`} />
                    <span>{tab.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
