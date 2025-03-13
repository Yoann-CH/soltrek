import { motion } from 'framer-motion';
import { usePlanetNews } from '../../lib/api';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export function PlanetNews({ planetName }: PlanetNewsProps) {
  const { news, loading, error } = usePlanetNews(planetName);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Actualités</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-3 sm:p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
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
          <motion.a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white/50 dark:bg-gray-800/50 rounded-lg overflow-hidden hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={article.image_url || '/assets/default.webp'}
                alt={article.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/assets/default.webp')) {
                    console.log('Image non trouvée, utilisation de la valeur par défaut');
                    target.src = '/assets/default.webp';
                  }
                }}
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
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
} 