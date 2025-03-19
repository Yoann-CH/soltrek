import { usePlanetNews } from '../../lib/api';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect, useRef } from 'react';

// Style pour l'animation wave du skeleton
const skeletonWaveStyle = `
  @keyframes skeletonWave {
    0% {
      transform: translateX(-100%);
    }
    50%, 100% {
      transform: translateX(100%);
    }
  }
  
  .skeleton-wave {
    animation: skeletonWave 1.5s infinite;
  }
`;

interface PlanetNewsProps {
  planetName: string;
}

// Fonction utilitaire pour formater la date de manière sécurisée
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Date non disponible';
    }
    return format(date, 'dd MMMM yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date non disponible';
  }
};

// Composant d'image optimisée avec chargement progressif
const OptimizedImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imageSrc, setImageSrc] = useState('/assets/default.webp');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Réinitialiser l'état quand la source change
    setImageLoaded(false);
    setHasError(false);
    setImageSrc('/assets/default.webp');
    
    // Observer quand l'image entre dans le viewport
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // On crée une nouvelle image pour précharger
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImageSrc(src);
          setImageLoaded(true);
        };
        img.onerror = () => {
          setHasError(true);
          setImageSrc('/assets/default.webp');
        };
        
        // Arrêter d'observer une fois détecté
        if (imgRef.current) observer.unobserve(imgRef.current);
      }
    }, {
      rootMargin: '200px 0px', // Précharger quand on est à 200px de l'image
      threshold: 0.01
    });
    
    if (imgRef.current) observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden bg-gray-800 aspect-video">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-80'}`}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc('/assets/default.webp');
          }
        }}
      />
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/40">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-400 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Composant de skeleton pour les cartes d'actualités
const NewsCardSkeleton = () => (
  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-lg shadow-blue-500/10 dark:shadow-blue-500/10 backdrop-blur-sm">
    <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-3/4 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
      </div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-1/2 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-2/3 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
      </div>
    </div>
  </div>
);

export function PlanetNews({ planetName }: PlanetNewsProps) {
  const { news, loading, error } = usePlanetNews(planetName);
  const containerRef = useRef<HTMLDivElement>(null);

  // Injection du style pour l'animation wave
  useEffect(() => {
    // Vérifier si le style est déjà présent
    if (!document.getElementById('skeleton-wave-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'skeleton-wave-style';
      styleElement.innerHTML = skeletonWaveStyle;
      document.head.appendChild(styleElement);

      // Nettoyage lors du démontage
      return () => {
        const styleToRemove = document.getElementById('skeleton-wave-style');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Actualités</h2>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-32 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100/20 dark:bg-red-900/20 border border-red-200/30 dark:border-red-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-red-500/5">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Erreur de communication</h2>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Impossible de récupérer les actualités pour le moment. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-blue-100/20 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-blue-500/5">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Aucune actualité récente</h2>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Aucune actualité récente n'a été trouvée pour {planetName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Actualités</h2>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
          Source : Spaceflight News API
          <span className="px-2 py-1 bg-blue-100/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded">
            Articles en anglais
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white/50 dark:bg-gray-800/50 rounded-lg overflow-hidden hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5"
          >
            <div className="aspect-video relative overflow-hidden">
              <OptimizedImage 
                src={article.image_url || '/assets/default.webp'} 
                alt={article.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-2 left-3 right-3">
                <p className="text-xs sm:text-sm text-gray-200">
                  {formatDate(article.published_at)}
                </p>
                <p className="text-xs text-gray-300">{article.news_site}</p>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                {article.summary}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}