import * as THREE from 'three';
import React from 'react';

// Données de base pour les planètes
export interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  rotationSpeed: number;
  orbitSpeed: number;
  texturePath: string;
  semimajorAxis: number;
  orbitalPeriod: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  longitudeOfPerihelion: number;
  axialTilt: number;
  rotationPeriod: number;
  initialRotation: number;
  hasRings?: boolean;
  hasAtmosphere?: boolean;
  atmosphereColor?: THREE.Color;
  atmosphereOpacity?: number;
  cloudTexturePath?: string;
}

// Interface pour les paramètres de qualité
export interface QualitySettings {
  dpr: [number, number];
  starsCount: number;
  usePostProcessing: boolean;
  drawDistance: number;
  asteroidsCount: number;
  frameloop: 'always' | 'demand' | 'never';
  planetDetail: number;
  textureQuality: number;
  shadowsEnabled: boolean;
  atmosphereQuality: string;
}

// Props pour le composant Planet
export interface PlanetProps {
  radius: number;
  distance: number;
  texturePath: string;
  hasRings?: boolean;
  name: string;
  index: number;
  planet: PlanetData;
  qualitySettings?: QualitySettings;
}

// Props pour le composant PlanetOrbit
export interface OrbitProps {
  distance: number;
  planet: PlanetData;
}

// Props pour le composant CameraControls
export interface CameraControlsProps {
  focusedPlanetIndex: number | null;
  onCameraUpdate: (position: THREE.Vector3, target: THREE.Vector3) => void;
}

// Props pour le composant DateDisplay
export interface DateDisplayProps {
  date: Date;
  onDateSelect: (date: Date) => void;
  showDatePicker: boolean;
  toggleDatePicker: () => void;
  isLiveDate?: boolean;
  isFullscreen?: boolean;
}

// Contexte du système solaire
export interface SolarSystemContext {
  setFocusedPlanet: (index: number | null) => void;
  planetPositions: React.MutableRefObject<THREE.Vector3[]>;
  currentDate: Date;
  focusedPlanetIndex: number | null;
  timeScale: number;
  isLiveDate: boolean;
} 