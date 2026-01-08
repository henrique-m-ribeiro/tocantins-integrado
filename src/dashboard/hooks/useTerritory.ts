/**
 * Hook para gerenciamento de seleção territorial
 * Persiste seleção em localStorage e fornece estado global
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Municipality, Microregion, TerritorySelection } from '@/types';

const STORAGE_KEY = 'tocantins_territory_selection';

interface UseTerritoryReturn {
  // Estado atual
  selection: TerritorySelection;
  selectedMunicipality: Municipality | undefined;
  selectedMicroregion: Microregion | undefined;

  // Ações
  setMunicipality: (municipality: Municipality | undefined) => void;
  setMicroregion: (microregion: Microregion | undefined) => void;
  clearSelection: () => void;

  // Status
  hasSelection: boolean;
}

/**
 * Hook personalizado para gerenciar seleção territorial
 *
 * @example
 * ```tsx
 * const { selectedMunicipality, setMunicipality } = useTerritory();
 *
 * // Selecionar município
 * setMunicipality(palmas);
 *
 * // Limpar seleção
 * clearSelection();
 * ```
 */
export function useTerritory(): UseTerritoryReturn {
  const [selection, setSelection] = useState<TerritorySelection>({
    municipality: undefined,
    microregion: undefined,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar do localStorage na montagem (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TerritorySelection;
        setSelection(parsed);
      }
    } catch (error) {
      console.error('Error loading territory selection from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    try {
      if (selection.municipality || selection.microregion) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving territory selection to localStorage:', error);
    }
  }, [selection, isInitialized]);

  /**
   * Define o município selecionado
   * Automaticamente define a microrregião se disponível
   */
  const setMunicipality = useCallback((municipality: Municipality | undefined) => {
    setSelection(prev => ({
      ...prev,
      municipality,
      microregion: municipality?.microregion,
    }));
  }, []);

  /**
   * Define a microrregião selecionada
   * Limpa o município se ele não pertencer à microrregião
   */
  const setMicroregion = useCallback((microregion: Microregion | undefined) => {
    setSelection(prev => {
      // Se há município selecionado e ele não pertence à nova microrregião, limpa
      const shouldClearMunicipality =
        prev.municipality &&
        microregion &&
        prev.municipality.microregion_id !== microregion.id;

      return {
        ...prev,
        microregion,
        municipality: shouldClearMunicipality ? undefined : prev.municipality,
      };
    });
  }, []);

  /**
   * Limpa toda a seleção territorial
   */
  const clearSelection = useCallback(() => {
    setSelection({
      municipality: undefined,
      microregion: undefined,
    });
  }, []);

  return {
    selection,
    selectedMunicipality: selection.municipality,
    selectedMicroregion: selection.microregion,
    setMunicipality,
    setMicroregion,
    clearSelection,
    hasSelection: !!(selection.municipality || selection.microregion),
  };
}
