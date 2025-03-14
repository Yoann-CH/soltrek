import { useMemo } from 'react';
import { QualitySettings } from './types';

// Interface pour les props de l'éclairage
interface LightingProps {
  qualitySettings?: QualitySettings;
}

// Composant pour l'éclairage global du système solaire
export function Lighting({ qualitySettings }: LightingProps = {}) {
  // Adapter l'intensité de l'éclairage ambiant en fonction de la qualité
  const ambientLightIntensity = useMemo(() => {
    if (!qualitySettings) return 0.3;
    
    switch (qualitySettings.planetDetail) {
      case 16: return 0.4;     // Plus d'éclairage ambiant en basse qualité pour compenser
      case 32: return 0.3;     // Qualité moyenne - normal
      case 64: return 0.2;     // Moins d'éclairage ambiant en haute qualité pour des ombres plus prononcées
      default: return 0.3;
    }
  }, [qualitySettings]);

  // Intensité de l'éclairage hémisphérique
  const hemisphereLightIntensity = useMemo(() => {
    if (!qualitySettings) return 0.3;
    
    switch (qualitySettings.planetDetail) {
      case 16: return 0.4;     // Plus d'éclairage en basse qualité
      case 32: return 0.3;     // Qualité moyenne - normal
      case 64: return 0.3;     // Qualité haute - normal
      default: return 0.3;
    }
  }, [qualitySettings]);

  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <hemisphereLight 
        color="#ffffff" 
        groundColor="#444444" 
        intensity={hemisphereLightIntensity} 
      />
      {qualitySettings?.shadowsEnabled !== false && (
        <directionalLight 
          position={[0, 0, 0]} 
          intensity={1.2} 
          castShadow 
        />
      )}
    </>
  );
} 