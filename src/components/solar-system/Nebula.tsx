import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Shader pour créer une nébuleuse avec un aspect plus réaliste
// Inspiré des vraies nébuleuses spatiales photographiées par Hubble et James Webb
const NebulaMaterial = shaderMaterial(
  {
    time: 0,
    // Des couleurs plus proches des vraies nébuleuses
    color1: new THREE.Color('#600f30'),  // Rouge foncé (régions d'hydrogène ionisé)
    color2: new THREE.Color('#100a40'),  // Bleu foncé (régions plus froides)
    color3: new THREE.Color('#3b0e64'),  // Violet (mélange de gaz)
    color4: new THREE.Color('#0a1d50'),  // Bleu profond (régions d'oxygène ionisé)
    noiseScale: 1.5,                     // Échelle du bruit
    nebulaOpacity: 0.5,                  // Opacité globale de la nébuleuse
    luminosityFactor: 2.0,               // Facteur pour accentuer les variations de luminosité
    cloudDetail: 3.0,                    // Niveau de détail des nuages de gaz
  },
  // Vertex shader
  /*glsl*/`
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader avec fonctions de bruit plus complexes pour un aspect plus réaliste
  /*glsl*/`
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform vec3 color4;
    uniform float noiseScale;
    uniform float nebulaOpacity;
    uniform float luminosityFactor;
    uniform float cloudDetail;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Fonction de hachage pour générer des nombres pseudo-aléatoires
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }
    
    // Bruit de valeur amélioré pour un aspect plus organique
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = p.x + p.y * 157.0 + 113.0 * p.z;
      return mix(
        mix(
          mix(hash(n + 0.0), hash(n + 1.0), f.x),
          mix(hash(n + 157.0), hash(n + 158.0), f.x),
          f.y),
        mix(
          mix(hash(n + 113.0), hash(n + 114.0), f.x),
          mix(hash(n + 270.0), hash(n + 271.0), f.x),
          f.y),
        f.z);
    }
    
    // Bruit fractal pour créer des formes de nuages complexes (FBM - Fractal Brownian Motion)
    float fbm(vec3 p) {
      float total = 0.0;
      float amplitude = 1.0;
      float frequency = 1.0;
      float maxVal = 0.0;
      
      // Nombre d'octaves optimisé pour les performances
      for (int i = 0; i < 5; i++) {
        total += amplitude * noise(p * frequency);
        maxVal += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return total / maxVal;
    }
    
    // Fonction de turbulence pour créer des variations dans la densité de la nébuleuse
    float turbulence(vec3 p) {
      float t = -0.5;
      for (float f = 1.0; f <= cloudDetail; f *= 2.0) {
        float power = pow(2.0, f);
        t += abs(noise(p * power) / power);
      }
      return t;
    }
    
    // Fonction pour créer un effet de densité variable comme dans les vraies nébuleuses
    float cloudDensity(vec3 p) {
      float d = fbm(p * noiseScale + vec3(time * 0.01, time * 0.0017, time * 0.005));
      d += turbulence(p * noiseScale * 2.5 + vec3(time * -0.01, 0.0, time * 0.01)) * 0.3;
      return smoothstep(0.15, 0.8, d) * turbulence(p * 4.0);
    }
    
    void main() {
      // Coordonnées pour le bruit
      vec3 p = vPosition * noiseScale;
      
      // Créer plusieurs couches de densité pour l'effet volumétrique
      float density = cloudDensity(p);
      
      // Variation dans la densité pour donner un effet volumétrique
      float densityVariation = fbm(p * 2.5 + vec3(0.0, 0.0, time * 0.02)) * density;
      float brightnessVariation = smoothstep(0.2, 0.7, densityVariation) * luminosityFactor;
      
      // Mélange des couleurs plus complexe basé sur la densité et la position
      // Simule la structure des vraies nébuleuses avec différentes régions chimiques
      vec3 baseColor = mix(color1, color2, smoothstep(0.3, 0.7, densityVariation));
      
      // Zones plus denses = plus d'émission (rouge/rose comme l'hydrogène)
      float emission = smoothstep(0.4, 0.9, densityVariation);
      baseColor = mix(baseColor, color3, emission * 0.7);
      
      // Zones moins denses = plus bleutées (comme l'oxygène ionisé dans les nébuleuses)
      baseColor = mix(baseColor, color4, (1.0 - emission) * 0.5);
      
      // Ajout d'effets de luminosité pour les étoiles et régions brillantes
      float starEffect = pow(brightnessVariation, 3.0) * 0.5;
      baseColor += vec3(starEffect);
      
      // Variation de la luminosité basée sur la position pour imiter les effets de lumière
      float lightVariation = fbm(p * 0.5 + vec3(time * 0.015)) * 0.5 + 0.5;
      baseColor *= (0.8 + lightVariation * 0.4);
      
      // Calcul de l'opacité pour un effet volumétrique
      float alpha = density * nebulaOpacity;
      alpha = smoothstep(0.05, 0.3, alpha); // Contours plus doux
      
      // Couleur finale avec transparence
      gl_FragColor = vec4(baseColor, alpha);
    }
  `
);

// Extension du matériau de shader pour Three.js
extend({ NebulaMaterial });

// Types pour le matériau de shader (pour TypeScript)
declare module '@react-three/fiber' {
  interface ThreeElements {
    nebulaMaterial: {
      ref?: React.MutableRefObject<THREE.ShaderMaterial | null>;
      transparent?: boolean;
      depthWrite?: boolean;
      side?: THREE.Side;
      color1?: THREE.Color;
      color2?: THREE.Color;
      color3?: THREE.Color;
      color4?: THREE.Color;
      noiseScale?: number;
      nebulaOpacity?: number;
      luminosityFactor?: number;
      cloudDetail?: number;
      time?: number;
    }
  }
}

interface NebulaProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  colors?: {
    color1?: string;
    color2?: string;
    color3?: string;
    color4?: string;
  };
  noiseScale?: number;
  opacity?: number;
  luminosityFactor?: number;
  cloudDetail?: number;
}

export const Nebula: React.FC<NebulaProps> = ({
  position = [0, 0, -100],
  scale = [150, 150, 150],
  rotation = [0, 0, 0],
  colors = {
    color1: '#600f30', // Rouge foncé (régions d'hydrogène ionisé)
    color2: '#100a40', // Bleu foncé (régions plus froides)
    color3: '#3b0e64', // Violet (mélange de gaz)
    color4: '#0a1d50'  // Bleu profond (régions d'oxygène ionisé)
  },
  noiseScale = 1.5,
  opacity = 0.5,
  luminosityFactor = 2.0,
  cloudDetail = 3.0
}) => {
  // Référence au matériau pour l'animation
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Conversion des couleurs en objets THREE.Color
  const color1 = useMemo(() => new THREE.Color(colors.color1), [colors.color1]);
  const color2 = useMemo(() => new THREE.Color(colors.color2), [colors.color2]);
  const color3 = useMemo(() => new THREE.Color(colors.color3), [colors.color3]);
  const color4 = useMemo(() => new THREE.Color(colors.color4), [colors.color4]);
  
  // Animation du temps pour faire évoluer la nébuleuse lentement
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      renderOrder={-1} // Pour s'assurer que la nébuleuse est rendue derrière tout
    >
      <sphereGeometry args={[1, 32, 32]} />
      <nebulaMaterial 
        ref={materialRef} 
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        color1={color1}
        color2={color2}
        color3={color3}
        color4={color4}
        noiseScale={noiseScale}
        nebulaOpacity={opacity}
        luminosityFactor={luminosityFactor}
        cloudDetail={cloudDetail}
      />
    </mesh>
  );
};

// Composant pour créer plusieurs nébuleuses avec différentes configurations
export const NebulaBackground: React.FC = () => {
  // Configurations de plusieurs nébuleuses pour créer un effet de profondeur et diversité
  // Basé sur de vraies nébuleuses célèbres (Orion, Aigle, Carina, etc.)
  const nebulaeConfig = useMemo(() => [
    {
      position: [0, 0, -150] as [number, number, number],
      scale: [180, 180, 180] as [number, number, number],
      colors: {
        color1: '#600f30', // Rouge foncé (Nébuleuse d'Orion)
        color2: '#100a40', // Bleu foncé
        color3: '#3b0e64', // Violet
        color4: '#0a1d50'  // Bleu profond
      },
      noiseScale: 1.3,
      opacity: 0.4,
      luminosityFactor: 2.2,
      cloudDetail: 3.5,
      rotation: [0, 0, 0] as [number, number, number]
    },
    {
      position: [120, -40, -190] as [number, number, number],
      scale: [130, 130, 130] as [number, number, number],
      colors: {
        color1: '#471740', // Violet rougeâtre (Nébuleuse Eagle)
        color2: '#0a1935', // Bleu très foncé
        color3: '#7b1c9e', // Violet vif
        color4: '#172464'  // Bleu royal
      },
      noiseScale: 1.8,
      opacity: 0.35,
      luminosityFactor: 1.8,
      cloudDetail: 2.8,
      rotation: [0.2, 0.1, 0] as [number, number, number]
    },
    {
      position: [-150, 60, -220] as [number, number, number],
      scale: [160, 160, 160] as [number, number, number],
      colors: {
        color1: '#700c0c', // Rouge intense (Nébuleuse Carina)
        color2: '#091042', // Bleu nuit
        color3: '#960a5d', // Rose foncé
        color4: '#061639'  // Bleu profond
      },
      noiseScale: 1.6,
      opacity: 0.3,
      luminosityFactor: 2.0,
      cloudDetail: 3.2,
      rotation: [-0.1, 0.3, 0.1] as [number, number, number]
    }
  ], []);
  
  return (
    <group>
      {nebulaeConfig.map((config, index) => (
        <Nebula 
          key={index}
          position={config.position}
          scale={config.scale}
          rotation={config.rotation}
          colors={config.colors}
          noiseScale={config.noiseScale}
          opacity={config.opacity}
          luminosityFactor={config.luminosityFactor}
          cloudDetail={config.cloudDetail}
        />
      ))}
    </group>
  );
};

export default NebulaBackground; 