import * as THREE from 'three';
import { useRef } from 'react';
import { PlanetData } from './types';

// Convertir des degrés en radians
export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Fonction pour formater une date en chaîne lisible
export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculer la position actuelle réelle d'une planète avec une précision améliorée
export function calculateRealPosition(planet: PlanetData, date: Date): THREE.Vector3 {
  // Calculer le nombre de jours depuis J2000 (1er janvier 2000 à 12:00 UTC)
  const j2000 = new Date('2000-01-01T12:00:00Z');
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculer l'anomalie moyenne (en degrés)
  const meanAnomaly = (360 / planet.orbitalPeriod) * daysSinceJ2000 % 360;
  const meanAnomalyRadians = degToRad(meanAnomaly);
  
  // Calculer l'anomalie excentrique (approximation en utilisant la méthode itérative)
  let eccentricAnomaly = meanAnomalyRadians;
  const e = planet.eccentricity;
  
  // Méthode de Newton-Raphson pour résoudre l'équation de Kepler
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly = eccentricAnomaly - 
      (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomalyRadians) / 
      (1 - e * Math.cos(eccentricAnomaly));
  }
  
  // Calculer l'anomalie vraie (angle réel dans l'orbite)
  const trueAnomaly = 2 * Math.atan(
    Math.sqrt((1 + e) / (1 - e)) * Math.tan(eccentricAnomaly / 2)
  );
  
  // Distance au soleil (en UA)
  const distanceToSun = planet.semimajorAxis * (1 - e * Math.cos(eccentricAnomaly));
  
  // Appliquer l'inclinaison et la rotation des nœuds
  const inclination = degToRad(planet.inclination);
  const node = degToRad(planet.longitudeOfAscendingNode);
  const perihelion = degToRad(planet.longitudeOfPerihelion - planet.longitudeOfAscendingNode);
  
  // Position dans le plan orbital (coordonnées polaires -> cartésiennes)
  const xOrbit = distanceToSun * Math.cos(trueAnomaly + perihelion);
  const yOrbit = distanceToSun * Math.sin(trueAnomaly + perihelion);
  
  // Rotation pour appliquer l'inclinaison et la ligne des nœuds
  const xHelio = xOrbit * Math.cos(node) - yOrbit * Math.sin(node) * Math.cos(inclination);
  const yHelio = yOrbit * Math.sin(inclination);
  const zHelio = xOrbit * Math.sin(node) + yOrbit * Math.cos(node) * Math.cos(inclination);
  
  // Mettre à l'échelle pour notre visualisation
  const scaleFactor = planet.distance / planet.semimajorAxis;
  return new THREE.Vector3(
    xHelio * scaleFactor,
    yHelio * scaleFactor,
    zHelio * scaleFactor
  );
}

// Calculer la rotation actuelle d'une planète
export function calculatePlanetRotation(planet: PlanetData, date: Date): THREE.Euler {
  // Calculer le nombre de jours depuis J2000
  const j2000 = new Date('2000-01-01T12:00:00Z');
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculer l'angle de rotation en fonction du temps écoulé
  // 360 degrés / période de rotation = vitesse angulaire par jour
  const rotationAngle = ((daysSinceJ2000 % planet.rotationPeriod) / planet.rotationPeriod) * 360;
  
  // Appliquer l'angle initial de la texture
  const totalRotation = degToRad(rotationAngle + planet.initialRotation);
  
  // Créer la rotation avec l'inclinaison axiale
  const axialTilt = degToRad(planet.axialTilt);
  
  // Créer une rotation 3D qui combine l'inclinaison de l'axe et la rotation propre
  const rotation = new THREE.Euler(
    axialTilt, // Inclinaison de l'axe (autour de l'axe X)
    totalRotation, // Rotation propre (autour de l'axe Y)
    0, // Pas de rotation autour de l'axe Z
    'XYZ' // Ordre de rotation
  );
  
  return rotation;
}

// Fonction pour créer et gérer les références aux positions des planètes
export function usePlanetPositions(planetCount: number) {
  return useRef<THREE.Vector3[]>(
    Array(planetCount).fill(0).map(() => new THREE.Vector3())
  );
} 