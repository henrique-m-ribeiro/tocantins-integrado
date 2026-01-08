/**
 * Seletor de território (município ou microrregião)
 * Agrupa municípios por microrregião e permite busca
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useTerritory } from '@/hooks/useTerritory';
import type { Municipality, Microregion } from '@/types';
import { cn } from '@/lib/utils';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TerritorySelectorProps {
  className?: string;
  placeholder?: string;
  onSelect?: (municipality: Municipality | undefined) => void;
}

/**
 * Componente para seleção de município com busca e agrupamento
 *
 * @example
 * ```tsx
 * <TerritorySelector
 *   placeholder="Selecione um município..."
 *   onSelect={(municipality) => console.log(municipality)}
 * />
 * ```
 */
export function TerritorySelector({
  className,
  placeholder = 'Selecione um município',
  onSelect,
}: TerritorySelectorProps) {
  const { selectedMunicipality, setMunicipality } = useTerritory();
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [microregions, setMicroregions] = useState<Microregion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carregar municípios e microrregiões
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [municsResponse, microResponse] = await Promise.all([
          api.getMunicipalities(),
          api.getMicroregions(),
        ]);

        setMunicipalities(municsResponse.municipalities);
        setMicroregions(microResponse.microregions);
      } catch (error) {
        console.error('Error loading territories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar municípios pela busca
  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery) return municipalities;

    const query = searchQuery.toLowerCase();
    return municipalities.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.ibge_code.includes(query)
    );
  }, [municipalities, searchQuery]);

  // Agrupar municípios por microrregião
  const municipalitiesByMicroregion = useMemo(() => {
    const groups = new Map<string, Municipality[]>();

    for (const municipality of filteredMunicipalities) {
      const key = municipality.microregion_id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(municipality);
    }

    return groups;
  }, [filteredMunicipalities]);

  const handleSelect = (municipalityId: string) => {
    const municipality = municipalities.find(m => m.id === municipalityId);
    setMunicipality(municipality);
    onSelect?.(municipality);
    setIsDialogOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setMunicipality(undefined);
    onSelect?.(undefined);
  };

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <Button variant="outline" className="w-full justify-between" disabled>
          <span className="text-muted-foreground">Carregando...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isDialogOpen}
            className="w-full justify-between"
          >
            {selectedMunicipality ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedMunicipality.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Município</DialogTitle>
            <DialogDescription>
              Escolha um município do Tocantins para visualizar os indicadores.
            </DialogDescription>
          </DialogHeader>

          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar município ou código IBGE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Lista de municípios */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredMunicipalities.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum município encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(municipalitiesByMicroregion.entries()).map(([microregionId, munics]) => {
                  const microregion = microregions.find(mr => mr.id === microregionId);

                  return (
                    <div key={microregionId}>
                      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                        {microregion?.name || 'Sem microrregião'}
                      </div>
                      <div className="space-y-1">
                        {munics.map((municipality) => (
                          <button
                            key={municipality.id}
                            onClick={() => handleSelect(municipality.id)}
                            className={cn(
                              'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                              'hover:bg-accent hover:text-accent-foreground',
                              selectedMunicipality?.id === municipality.id && 'bg-accent'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{municipality.name}</span>
                            </div>
                            {selectedMunicipality?.id === municipality.id && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão para limpar seleção */}
          {selectedMunicipality && (
            <div className="border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Versão simplificada usando Select nativo (sem Dialog)
 * Para uso em formulários ou espaços menores
 */
export function SimpleTerritory Selector({
  className,
  placeholder = 'Selecione um município',
  onSelect,
}: TerritorySelectorProps) {
  const { selectedMunicipality, setMunicipality } = useTerritory();
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [microregions, setMicroregions] = useState<Microregion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [municsResponse, microResponse] = await Promise.all([
          api.getMunicipalities(),
          api.getMicroregions(),
        ]);

        setMunicipalities(municsResponse.municipalities);
        setMicroregions(microResponse.microregions);
      } catch (error) {
        console.error('Error loading territories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Agrupar municípios por microrregião
  const municipalitiesByMicroregion = useMemo(() => {
    const groups = new Map<string, Municipality[]>();

    for (const municipality of municipalities) {
      const key = municipality.microregion_id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(municipality);
    }

    return groups;
  }, [municipalities]);

  const handleValueChange = (value: string) => {
    const municipality = municipalities.find(m => m.id === value);
    setMunicipality(municipality);
    onSelect?.(municipality);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={selectedMunicipality?.id}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Array.from(municipalitiesByMicroregion.entries()).map(([microregionId, munics]) => {
          const microregion = microregions.find(mr => mr.id === microregionId);

          return (
            <SelectGroup key={microregionId}>
              <SelectLabel>{microregion?.name || 'Sem microrregião'}</SelectLabel>
              {munics.map((municipality) => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
