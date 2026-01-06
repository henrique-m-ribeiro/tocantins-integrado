'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, BarChart3, Leaf } from 'lucide-react';
import { api } from '@/lib/api';

export function StatsOverview() {
  // Dados estáticos do Tocantins para overview rápido
  const stats = [
    {
      label: 'Municípios',
      value: '139',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'População',
      value: '1,6 mi',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Microrregiões',
      value: '8',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Área',
      value: '277.720 km²',
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-4 flex items-center gap-3`}
          >
            <div className={`${stat.color} p-2 bg-white/50 rounded-lg`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
