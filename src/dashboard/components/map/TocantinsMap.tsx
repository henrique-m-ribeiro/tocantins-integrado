'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '@/lib/api';

// Fix para ícones do Leaflet no Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SelectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TocantinsMapProps {
  selectedMunicipality: string | null;
  onSelectMunicipality: (id: string) => void;
}

// Componente para centralizar o mapa quando um município é selecionado
function MapController({ selectedMunicipality, municipalities }: {
  selectedMunicipality: string | null;
  municipalities: any[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedMunicipality) {
      const municipality = municipalities.find(m => m.properties.id === selectedMunicipality);
      if (municipality) {
        const [lng, lat] = municipality.geometry.coordinates;
        map.flyTo([lat, lng], 10, { duration: 1 });
      }
    }
  }, [selectedMunicipality, municipalities, map]);

  return null;
}

export default function TocantinsMap({
  selectedMunicipality,
  onSelectMunicipality
}: TocantinsMapProps) {
  // Buscar dados geográficos
  const { data: geojsonData, isLoading } = useQuery({
    queryKey: ['municipalities-geojson'],
    queryFn: () => api.getGeoJSON()
  });

  const municipalities = useMemo(() => {
    return geojsonData?.features || [];
  }, [geojsonData]);

  // Centro do Tocantins
  const tocantinsCenter: [number, number] = [-10.2, -48.3];
  const defaultZoom = 7;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={tocantinsCenter}
      zoom={defaultZoom}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedMunicipality={selectedMunicipality}
        municipalities={municipalities}
      />

      {municipalities.map((feature: any) => {
        const { id, name, population, microregion } = feature.properties;
        const [lng, lat] = feature.geometry.coordinates;
        const isSelected = id === selectedMunicipality;

        return (
          <Marker
            key={id}
            position={[lat, lng]}
            icon={isSelected ? SelectedIcon : DefaultIcon}
            eventHandlers={{
              click: () => onSelectMunicipality(id)
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-base">{name}</h3>
                <p className="text-gray-600">{microregion}</p>
                <p className="mt-1">
                  <span className="font-medium">População:</span>{' '}
                  {population?.toLocaleString('pt-BR')} hab.
                </p>
                <button
                  onClick={() => onSelectMunicipality(id)}
                  className="mt-2 px-3 py-1 bg-tocantins-blue text-white rounded text-xs hover:bg-tocantins-blue/90"
                >
                  Ver detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
