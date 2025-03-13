// Utilitaire pour générer des textures procédurales
import * as THREE from 'three';

/**
 * Génère une texture pour les astéroïdes
 * @returns {THREE.CanvasTexture} La texture générée
 */
export function generateAsteroidTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Fond de base
  const baseColor = '#807060';
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Ajouter une texture rocheuse
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 1 + Math.random() * 3;
    
    // Couleur aléatoire pour les cailloux
    const brightness = 0.7 + Math.random() * 0.3;
    ctx.fillStyle = `rgba(${128 * brightness}, ${112 * brightness}, ${96 * brightness}, 0.5)`;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Ajouter des cratères
  const numCraters = 20 + Math.random() * 30;
  for (let i = 0; i < numCraters; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 5 + Math.random() * 20;
    
    // Bord du cratère
    const gradient = ctx.createRadialGradient(
      x, y, size * 0.5,
      x, y, size
    );
    
    gradient.addColorStop(0, 'rgba(60, 50, 40, 0.8)');
    gradient.addColorStop(0.7, 'rgba(160, 150, 140, 0.8)');
    gradient.addColorStop(1, 'rgba(120, 110, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
} 