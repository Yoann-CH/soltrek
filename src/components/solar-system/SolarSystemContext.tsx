import React, { createContext } from 'react';
import { SolarSystemContext as SolarSystemContextType } from './types';

// Contexte global pour la visualisation du système solaire
export const SolarSystemContext = createContext<SolarSystemContextType | null>(null);

interface SolarSystemProviderProps {
  value: SolarSystemContextType;
  children: React.ReactNode;
}

export function SolarSystemProvider({ value, children }: SolarSystemProviderProps) {
  return (
    <SolarSystemContext.Provider value={value}>
      {children}
    </SolarSystemContext.Provider>
  );
} 