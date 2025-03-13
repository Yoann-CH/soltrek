import { useState, useEffect } from 'react';

// Mappage des noms français aux noms anglais pour l'API
const planetNameMapping: Record<string, string> = {
  'mercure': 'mercury',
  'vénus': 'venus',
  'terre': 'earth',
  'mars': 'mars',
  'jupiter': 'jupiter',
  'saturne': 'saturn',
  'uranus': 'uranus',
  'neptune': 'neptune'
};

// Interface pour les données de planètes récupérées
export interface PlanetData {
  id: string;
  name: string;
  englishName: string;
  isPlanet: boolean;
  moons: { moon: string; rel: string }[] | null;
  semimajorAxis: number;
  perihelion: number;
  aphelion: number;
  eccentricity: number;
  inclination: number;
  mass: { massValue: number; massExponent: number };
  vol: { volValue: number; volExponent: number };
  density: number;
  gravity: number;
  escape: number;
  meanRadius: number;
  equaRadius: number;
  polarRadius: number;
  flattening: number;
  dimension: string;
  sideralOrbit: number;
  sideralRotation: number;
  aroundPlanet: { planet: string; rel: string } | null;
  discoveredBy: string;
  discoveryDate: string;
  alternativeName: string;
  axialTilt: number;
  avgTemp: number;
  mainAnomaly: number;
  argPeriapsis: number;
  longAscNode: number;
  bodyType: string;
  rel: string;
}

// Cache pour les données récupérées
const planetCache: Record<string, { data: PlanetData; timestamp: number }> = {};
// Durée de validité du cache (1 heure)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Récupère les données d'une planète depuis l'API Solar System OpenData
 */
export async function fetchPlanetData(planetName: string): Promise<PlanetData | null> {
  try {
    const englishName = planetNameMapping[planetName.toLowerCase()] || planetName;
    
    // Vérifier le cache
    const now = Date.now();
    if (
      planetCache[englishName] && 
      now - planetCache[englishName].timestamp < CACHE_DURATION
    ) {
      console.log(`Utilisation des données en cache pour ${englishName}`);
      return planetCache[englishName].data;
    }
    
    console.log(`Récupération des données pour ${englishName} depuis l'API`);
    const response = await fetch(`https://api.le-systeme-solaire.net/rest/bodies/${englishName}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mettre en cache
    planetCache[englishName] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données planétaires:", error);
    return null;
  }
}

/**
 * Hook personnalisé pour récupérer les données d'une planète
 */
export function usePlanetData(planetName: string) {
  const [data, setData] = useState<PlanetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const planetData = await fetchPlanetData(planetName);
        
        if (isMounted) {
          setData(planetData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [planetName]);
  
  return { data, isLoading, error };
}

/**
 * Récupère les données pour toutes les planètes
 */
export async function fetchAllPlanets(): Promise<PlanetData[]> {
  try {
    const response = await fetch('https://api.le-systeme-solaire.net/rest/bodies?filter[]=isPlanet,eq,true');
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    return data.bodies;
  } catch (error) {
    console.error("Erreur lors de la récupération des planètes:", error);
    return [];
  }
}

/**
 * Traduit un nombre en notation scientifique en format lisible
 */
export function formatScientificNotation(value: number, exponent: number): string {
  const fullValue = value * Math.pow(10, exponent);
  
  // Pour les grands nombres, utiliser la notation avec des espaces
  if (fullValue >= 1e9) {
    return (fullValue / 1e9).toFixed(2) + ' milliards';
  } else if (fullValue >= 1e6) {
    return (fullValue / 1e6).toFixed(2) + ' millions';
  } else if (fullValue >= 1e3) {
    return (fullValue / 1e3).toFixed(2) + ' milliers';
  }
  
  return fullValue.toFixed(2);
}

/**
 * Convertit les données brutes de l'API en informations affichables
 */
export function formatPlanetDataForDisplay(planetData: PlanetData, planetName: string) {
  // Fallback vers les données statiques si les données API sont indisponibles
  const staticData = {
    'mercure': {
      color: '#A6A6A6',
      description: 'Mercure est la planète la plus proche du Soleil et la plus petite du système solaire. Sa surface est criblée de cratères similaires à ceux de la Lune.',
      funFact: 'Sur Mercure, une journée dure deux ans mercuriens !',
      composition: ['Fer', 'Nickel', 'Silicates']
    },
    'vénus': {
      color: '#E8B584', 
      description: 'Vénus est souvent appelée la jumelle de la Terre en raison de sa taille similaire, mais son atmosphère épaisse de dioxyde de carbone en fait un monde inhospitalier.',
      funFact: 'Vénus tourne dans le sens inverse des autres planètes !',
      composition: ['Dioxyde de carbone', 'Azote', 'Roches volcaniques']
    },
    'terre': {
      color: '#4B82C3',
      description: 'La Terre est notre maison, la seule planète connue pour abriter la vie. Elle est caractérisée par ses océans d\'eau liquide et son atmosphère riche en oxygène.',
      funFact: 'La Terre est la seule planète qui n\'est pas nommée d\'après un dieu ou une déesse.',
      composition: ['Azote', 'Oxygène', 'Eau', 'Silicates', 'Fer']
    },
    'mars': {
      color: '#E27B58',
      description: 'Mars est connue comme la "planète rouge" en raison de son apparence rougeâtre causée par l\'oxyde de fer qui domine sa surface.',
      funFact: 'Mars abrite le plus grand volcan du système solaire, Olympus Mons.',
      composition: ['Oxyde de fer', 'Silicates', 'Dioxyde de carbone']
    },
    'jupiter': {
      color: '#E0A951',
      description: 'Jupiter est la plus grande planète du système solaire, une géante gazeuse avec une atmosphère turbulente caractérisée par sa Grande Tache Rouge.',
      funFact: 'Jupiter est si massive qu\'elle pourrait contenir toutes les autres planètes du système solaire.',
      composition: ['Hydrogène', 'Hélium', 'Méthane', 'Ammoniac']
    },
    'saturne': {
      color: '#C5AB6E',
      description: 'Saturne est célèbre pour ses anneaux spectaculaires composés principalement de glace et de poussière. C\'est la deuxième plus grande planète du système.',
      funFact: 'Saturne est si peu dense qu\'elle pourrait flotter dans un océan suffisamment grand !',
      composition: ['Hydrogène', 'Hélium', 'Glace', 'Roches']
    },
    'uranus': {
      color: '#8FD1E0',
      description: 'Uranus est la première planète découverte à l\'aide d\'un télescope. Elle est unique car elle tourne pratiquement sur le côté.',
      funFact: 'Uranus est inclinée à presque 90 degrés, ce qui fait qu\'elle "roule" sur son orbite.',
      composition: ['Hydrogène', 'Hélium', 'Méthane', 'Glace']
    },
    'neptune': {
      color: '#4A6FE3',
      description: 'Neptune est la planète la plus éloignée (depuis le déclassement de Pluton). Elle est connue pour ses vents violents, parmi les plus rapides du système solaire.',
      funFact: 'Neptune a été découverte par calcul mathématique avant d\'être observée !',
      composition: ['Hydrogène', 'Hélium', 'Méthane', 'Glace']
    },
  };
  
  const planetKey = planetName.toLowerCase() as keyof typeof staticData;
  const staticInfo = staticData[planetKey] || {
    color: '#A6A6A6',
    description: 'Information non disponible',
    funFact: 'Information non disponible',
    composition: ['Information non disponible']
  };
  
  // Calcul de la distance moyenne au soleil en millions de km
  const distance = planetData ? (planetData.semimajorAxis / 1000000).toFixed(1) + ' millions km' : 'N/A';
  
  // Calcul du diamètre moyen
  const diameter = planetData ? (planetData.meanRadius * 2).toFixed(0) + ' km' : 'N/A';
  
  // Calcul de la durée du jour (rotation)
  let dayLength = 'N/A';
  if (planetData) {
    const rotation = planetData.sideralRotation;
    if (rotation > 24) {
      dayLength = `${(rotation / 24).toFixed(1)} jours`;
    } else {
      dayLength = `${rotation.toFixed(1)} heures`;
    }
  }
  
  // Calcul de la durée de l'année (révolution)
  let yearLength = 'N/A';
  if (planetData) {
    const orbit = planetData.sideralOrbit;
    if (orbit > 365) {
      yearLength = `${(orbit / 365).toFixed(1)} ans`;
    } else {
      yearLength = `${orbit.toFixed(1)} jours`;
    }
  }
  
  // Nombre de lunes
  const moons = planetData?.moons ? planetData.moons.length : 0;
  
  // Formatage des données orbitales supplémentaires
  const inclination = planetData?.inclination ? `${planetData.inclination.toFixed(2)}°` : undefined;
  const eccentricity = planetData?.eccentricity ? `${planetData.eccentricity.toFixed(4)}` : undefined;
  const escapeVelocity = planetData?.escape ? `${planetData.escape.toFixed(2)} km/s` : undefined;
  const axialTilt = planetData?.axialTilt ? `${planetData.axialTilt.toFixed(2)}°` : undefined;
  
  // Informations de découverte
  const discoveredBy = planetData?.discoveredBy && planetData.discoveredBy !== '' ? planetData.discoveredBy : undefined;
  const discoveryDate = planetData?.discoveryDate && planetData.discoveryDate !== '' ? planetData.discoveryDate : undefined;
  
  return {
    // Combinaison des données API et statiques
    color: staticInfo.color,
    description: staticInfo.description,
    diameter,
    distance,
    dayLength,
    yearLength,
    moons,
    funFact: staticInfo.funFact,
    composition: staticInfo.composition,
    // Données supplémentaires de l'API
    density: planetData?.density ? `${planetData.density.toFixed(2)} g/cm³` : 'N/A',
    gravity: planetData?.gravity ? `${planetData.gravity.toFixed(2)} m/s²` : 'N/A',
    discoveredBy: discoveredBy || 'N/A',
    discoveryDate: discoveryDate || 'N/A',
    temperature: planetData?.avgTemp ? `${planetData.avgTemp}K (${(planetData.avgTemp - 273.15).toFixed(1)}°C)` : 'N/A',
    mass: planetData?.mass ? formatScientificNotation(planetData.mass.massValue, planetData.mass.massExponent) + ' kg' : 'N/A',
    // Données orbitales supplémentaires
    inclination,
    eccentricity,
    escapeVelocity,
    axialTilt,
    // Type de corps céleste
    bodyType: planetData?.bodyType || 'PLANÈTE',
    // Pour les métadonnées
    englishName: planetData?.englishName || planetName,
    id: planetData?.id || planetName
  };
}

export interface PlanetFeature {
  id: string;
  name: string;
  type: string; // 'crater', 'volcano', 'mountain', etc.
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  discoveredBy?: string;
  discoveryDate?: string;
  diameter?: number; // en km
  depth?: number; // en km
  height?: number; // en km pour les montagnes
  length?: number; // en km pour les formations comme les canyons
  imageUrl?: string;
}

// Mappage des noms français aux noms de fichiers en anglais
// Copie du mappage défini dans planetDetail.tsx
const planetTextureMap: Record<string, string> = {
  'mercure': 'mercury',
  'vénus': 'venus',
  'terre': 'earth',
  'mars': 'mars',
  'jupiter': 'jupiter',
  'saturne': 'saturn',
  'uranus': 'uranus',
  'neptune': 'neptune'
};

/**
 * Récupère les caractéristiques importantes (cratères, volcans, etc.) d'une planète
 * 
 * Note: Cette fonction utilise actuellement des données simulées.
 * Pour une implémentation avec de vraies données d'API, plusieurs options sont possibles:
 * - NASA Mars Rover Photos API (uniquement pour Mars)
 * - Solar System OpenData (données limitées sur les caractéristiques)
 * - Implémentation de scraping web pour des sources comme Wikipedia (nécessite backend)
 */
export async function fetchPlanetFeatures(planetName: string): Promise<PlanetFeature[]> {
  try {
    // Utilisez le nom anglais de la planète 
    const englishPlanetName = planetTextureMap[planetName.toLowerCase()] || planetName.toLowerCase();
    
    // Différentes caractéristiques selon la planète (données simulées)
    let features: PlanetFeature[] = [];
    
    switch (englishPlanetName) {
      case 'mercury':
        features = [
          {
            id: '1',
            name: 'Caloris Planitia',
            type: 'crater',
            description: 'Un immense bassin d\'impact, l\'un des plus grands du système solaire',
            diameter: 1550,
            discoveredBy: 'Mariner 10',
            discoveryDate: '1974'
          },
          {
            id: '2',
            name: 'Rembrandt',
            type: 'crater',
            description: 'Un des plus grands et plus jeunes cratères d\'impact sur Mercure',
            diameter: 715,
            discoveredBy: 'MESSENGER',
            discoveryDate: '2008'
          }
        ];
        break;
      
      case 'venus':
        features = [
          {
            id: '1',
            name: 'Maxwell Montes',
            type: 'mountain',
            description: 'La plus haute montagne sur Vénus, située dans Ishtar Terra',
            height: 11,
            discoveredBy: 'Mission Venera',
            discoveryDate: '1978'
          },
          {
            id: '2',
            name: 'Maat Mons',
            type: 'volcano',
            description: 'Un des volcans les plus actifs de Vénus',
            height: 8,
            discoveredBy: 'Mission Magellan',
            discoveryDate: '1990'
          }
        ];
        break;
      
      case 'earth':
        features = [
          {
            id: '1',
            name: 'Mont Everest',
            type: 'mountain',
            description: 'Le plus haut sommet de la Terre',
            height: 8.848,
            coordinates: {
              lat: 27.9881,
              lng: 86.9250
            }
          },
          {
            id: '2',
            name: 'Mariana Trench',
            type: 'ocean_trench',
            description: 'La fosse océanique la plus profonde de la Terre',
            depth: 10.994,
            coordinates: {
              lat: 11.3494,
              lng: 142.1996
            }
          }
        ];
        break;
      
      case 'mars':
        features = [
          {
            id: '1',
            name: 'Olympus Mons',
            type: 'volcano',
            description: 'Le plus grand volcan connu du système solaire',
            height: 21.9,
            diameter: 600,
            discoveredBy: 'Mariner 9',
            discoveryDate: '1971'
          },
          {
            id: '2',
            name: 'Valles Marineris',
            type: 'canyon',
            description: 'Un vaste système de canyons qui s\'étend sur près de 4000 km',
            length: 4000,
            depth: 7,
            discoveredBy: 'Mariner 9',
            discoveryDate: '1971'
          }
        ];
        break;
      
      case 'jupiter':
        features = [
          {
            id: '1',
            name: 'Grande Tache Rouge',
            type: 'storm',
            description: 'Une gigantesque tempête anticyclonique persistante',
            diameter: 16000,
            discoveredBy: 'Robert Hooke',
            discoveryDate: '1664'
          },
          {
            id: '2',
            name: 'Ovale BA',
            type: 'storm',
            description: 'Une tempête anticyclonique, parfois appelée "Tache Rouge Junior"',
            diameter: 8000,
            discoveredBy: 'Hubble Space Telescope',
            discoveryDate: '2000'
          }
        ];
        break;
      
      case 'saturn':
        features = [
          {
            id: '1',
            name: 'Hexagone polaire',
            type: 'storm',
            description: 'Un modèle météorologique persistant en forme d\'hexagone au pôle nord',
            diameter: 30000,
            discoveredBy: 'Voyager 1',
            discoveryDate: '1980'
          },
          {
            id: '2',
            name: 'Tempête de 2010',
            type: 'storm',
            description: 'Une des plus grandes tempêtes jamais observées sur Saturne',
            diameter: 10000,
            discoveredBy: 'Cassini',
            discoveryDate: '2010'
          }
        ];
        break;
      
      case 'uranus':
        features = [
          {
            id: '1',
            name: 'Tache claire',
            type: 'storm',
            description: 'Une tempête brillante observée dans l\'atmosphère d\'Uranus',
            discoveredBy: 'Hubble Space Telescope',
            discoveryDate: '2014'
          },
          {
            id: '2',
            name: 'Anneaux d\'Uranus',
            type: 'ring',
            description: 'Système d\'anneaux composé de particules sombres',
            discoveredBy: 'William Herschel',
            discoveryDate: '1789'
          }
        ];
        break;
      
      case 'neptune':
        features = [
          {
            id: '1',
            name: 'Grande Tache Sombre',
            type: 'storm',
            description: 'Un gigantesque système de tempête anticyclonique',
            diameter: 13000,
            discoveredBy: 'Voyager 2',
            discoveryDate: '1989'
          },
          {
            id: '2',
            name: 'Scooter',
            type: 'storm',
            description: 'Un nuage ou une tempête qui se déplace rapidement dans l\'atmosphère',
            discoveredBy: 'Voyager 2',
            discoveryDate: '1989'
          }
        ];
        break;
        
      default:
        features = [];
    }
    
    return features;
  } catch (error) {
    console.error('Erreur lors de la récupération des caractéristiques de la planète:', error);
    return [];
  }
}

/**
 * Pour implémenter une véritable API:
 * 
 * 1. Pour Mars: 
 *    Utiliser NASA Mars Rover Photos API
 *    https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos
 * 
 * 2. Pour des données générales:
 *    Utiliser l'API Solar System OpenData pour les informations de base
 *    https://api.le-systeme-solaire.net/rest/bodies/
 * 
 * 3. Pour une exploration plus avancée:
 *    - Implémenter un backend qui pourrait récupérer et combiner diverses sources de données
 *    - Stocker les données dans une base de données locale pour éviter des appels API répétés
 */

// Créer un hook pour utiliser les caractéristiques de la planète
export function usePlanetFeatures(planetName: string) {
  const [features, setFeatures] = useState<PlanetFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        const data = await fetchPlanetFeatures(planetName);
        setFeatures(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        setLoading(false);
      }
    };
    
    loadFeatures();
  }, [planetName]);
  
  return { features, loading, error };
}

// Types pour les actualités
export interface SpaceNewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
  updated_at: string;
  featured: boolean;
  launches: {
    id: string;
    provider: string;
  }[];
  events: {
    id: string;
    provider: string;
  }[];
}

/**
 * Récupère les actualités liées à une planète spécifique
 * Note: Les articles sont en anglais car ils proviennent d'une source anglophone
 */
export async function fetchPlanetNews(planetName: string): Promise<SpaceNewsArticle[]> {
  try {
    const englishName = planetTextureMap[planetName.toLowerCase()] || planetName;
    const response = await fetch(
      `https://api.spaceflightnewsapi.net/v4/articles/?limit=6&search=${englishName}`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    return [];
  }
}

/**
 * Hook pour utiliser les actualités de la planète
 */
export function usePlanetNews(planetName: string) {
  const [news, setNews] = useState<SpaceNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchPlanetNews(planetName);
        setNews(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        setLoading(false);
      }
    };

    loadNews();
  }, [planetName]);

  return { news, loading, error };
} 