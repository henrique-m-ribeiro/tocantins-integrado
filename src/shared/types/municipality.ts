/**
 * Tipos relacionados a Municípios do Tocantins
 */

export interface Municipality {
  id: string;
  ibge_code: string;
  name: string;
  microregion_id: string;
  mesoregion_id: string;
  population: number;
  area_km2: number;
  density: number;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
}

export interface Microregion {
  id: string;
  ibge_code: string;
  name: string;
  mesoregion_id: string;
  municipality_count: number;
  total_population: number;
  total_area_km2: number;
}

export interface Mesoregion {
  id: string;
  ibge_code: string;
  name: string;
  microregion_count: number;
  municipality_count: number;
  total_population: number;
}

export interface MunicipalityWithRegions extends Municipality {
  microregion: Microregion;
  mesoregion: Mesoregion;
}

// Lista oficial das microrregiões do Tocantins
export const MICROREGIONS = [
  'Bico do Papagaio',
  'Araguaína',
  'Miracema do Tocantins',
  'Rio Formoso',
  'Gurupi',
  'Porto Nacional',
  'Jalapão',
  'Dianópolis'
] as const;

export type MicroregionName = typeof MICROREGIONS[number];

// Lista oficial das mesorregiões do Tocantins
export const MESOREGIONS = [
  'Ocidental do Tocantins',
  'Oriental do Tocantins'
] as const;

export type MesoregionName = typeof MESOREGIONS[number];
