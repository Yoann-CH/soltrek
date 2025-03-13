import { PlanetData } from './types';

// Données des planètes avec espacement amélioré et facteurs astronomiques
export const PLANETS_DATA: PlanetData[] = [
  { 
    name: 'Mercure', 
    radius: 0.38, 
    distance: 8, 
    rotationSpeed: 0.004,
    orbitSpeed: 0.01,
    texturePath: '/assets/textures/planets/mercury.jpg',
    semimajorAxis: 0.387, // UA
    orbitalPeriod: 88, // jours
    eccentricity: 0.2056, // excentricité de l'orbite
    inclination: 7.0, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 48.3, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 77.5, // longitude du périhélie (degrés)
    axialTilt: 0.034, // inclinaison de l'axe (degrés)
    rotationPeriod: 58.646, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Vénus', 
    radius: 0.95, 
    distance: 14, 
    rotationSpeed: 0.002,
    orbitSpeed: 0.007,
    texturePath: '/assets/textures/planets/venus.jpg',
    semimajorAxis: 0.723, // UA
    orbitalPeriod: 225, // jours
    eccentricity: 0.0068, // excentricité de l'orbite
    inclination: 3.4, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 76.7, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 131.5, // longitude du périhélie (degrés)
    axialTilt: 177.3, // inclinaison de l'axe (degrés) - rotation rétrograde
    rotationPeriod: 243.018, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Terre', 
    radius: 1, 
    distance: 20, 
    rotationSpeed: 0.01,
    orbitSpeed: 0.005,
    texturePath: '/assets/textures/planets/earth.jpg',
    semimajorAxis: 1, // UA
    orbitalPeriod: 365.25, // jours
    eccentricity: 0.0167, // excentricité de l'orbite
    inclination: 0.0, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 348.7, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 102.9, // longitude du périhélie (degrés)
    axialTilt: 23.44, // inclinaison de l'axe (degrés)
    rotationPeriod: 0.997, // période de rotation (jours)
    initialRotation: 180 // rotation initiale (degrés) - orientation de base de la texture
  },
  { 
    name: 'Mars', 
    radius: 0.53, 
    distance: 26, 
    rotationSpeed: 0.008,
    orbitSpeed: 0.004,
    texturePath: '/assets/textures/planets/mars.jpg',
    semimajorAxis: 1.524, // UA
    orbitalPeriod: 687, // jours
    eccentricity: 0.0934, // excentricité de l'orbite
    inclination: 1.8, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 49.6, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 336.0, // longitude du périhélie (degrés)
    axialTilt: 25.19, // inclinaison de l'axe (degrés)
    rotationPeriod: 1.026, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Jupiter', 
    radius: 2.5, 
    distance: 40, 
    rotationSpeed: 0.02,
    orbitSpeed: 0.002,
    texturePath: '/assets/textures/planets/jupiter.jpg',
    semimajorAxis: 5.203, // UA
    orbitalPeriod: 4333, // jours
    eccentricity: 0.0484, // excentricité de l'orbite
    inclination: 1.3, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 100.5, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 14.8, // longitude du périhélie (degrés)
    axialTilt: 3.13, // inclinaison de l'axe (degrés)
    rotationPeriod: 0.41, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Saturne', 
    radius: 2.2, 
    distance: 60, 
    rotationSpeed: 0.018,
    orbitSpeed: 0.0015,
    texturePath: '/assets/textures/planets/saturn.jpg',
    hasRings: true,
    semimajorAxis: 9.537, // UA
    orbitalPeriod: 10759, // jours
    eccentricity: 0.0542, // excentricité de l'orbite
    inclination: 2.5, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 113.7, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 92.9, // longitude du périhélie (degrés)
    axialTilt: 26.73, // inclinaison de l'axe (degrés)
    rotationPeriod: 0.444, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Uranus', 
    radius: 1.8, 
    distance: 78, 
    rotationSpeed: 0.012,
    orbitSpeed: 0.001,
    texturePath: '/assets/textures/planets/uranus.jpg',
    semimajorAxis: 19.191, // UA
    orbitalPeriod: 30687, // jours
    eccentricity: 0.0472, // excentricité de l'orbite
    inclination: 0.8, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 74.0, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 170.4, // longitude du périhélie (degrés)
    axialTilt: 97.77, // inclinaison de l'axe (degrés) - rotation presque couchée
    rotationPeriod: 0.718, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
  { 
    name: 'Neptune', 
    radius: 1.8, 
    distance: 95, 
    rotationSpeed: 0.014,
    orbitSpeed: 0.0008,
    texturePath: '/assets/textures/planets/neptune.jpg',
    semimajorAxis: 30.069, // UA
    orbitalPeriod: 60190, // jours
    eccentricity: 0.0086, // excentricité de l'orbite
    inclination: 1.8, // inclinaison de l'orbite (degrés)
    longitudeOfAscendingNode: 131.8, // longitude du nœud ascendant (degrés)
    longitudeOfPerihelion: 44.6, // longitude du périhélie (degrés)
    axialTilt: 28.32, // inclinaison de l'axe (degrés)
    rotationPeriod: 0.671, // période de rotation (jours)
    initialRotation: 0 // rotation initiale (degrés)
  },
]; 