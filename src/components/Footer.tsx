import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

interface FooterProps {
  apiName?: string;
  showStatus?: boolean;
}

export function Footer({ apiName = 'Solar System OpenData', showStatus = true }: FooterProps) {
  return (
    <footer className="mt-12 py-8 border-t border-gray-200/60 dark:border-gray-800/60 text-gray-600 dark:text-gray-400 backdrop-blur-xl bg-white/40 dark:bg-black/40 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section API et Status */}
          <div className="space-y-4">
            <h3 className="text-gray-900 dark:text-blue-500 font-semibold text-lg">API Status</h3>
            <div className="font-mono text-xs space-y-2">
              <p className="flex items-center">
                <span className="text-gray-700 dark:text-blue-500">{apiName}</span>
                <span className="ml-2">ACTIVE</span>
                <span className="inline-block w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse"></span>
              </p>
              <p className="flex items-center">
                <span className="text-gray-700 dark:text-blue-500">NASA API:</span>
                <span className="ml-2">ACTIVE</span>
                <span className="inline-block w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse"></span>
              </p>
              <p className="flex items-center">
                <span className="text-gray-700 dark:text-blue-500">SpaceNews API:</span>
                <span className="ml-2">ACTIVE</span>
                <span className="inline-block w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse"></span>
              </p>
              {showStatus && (
                <p className="flex items-center mt-4">
                  <span className="text-gray-700 dark:text-blue-500">STATUS:</span>
                  <span className="ml-2">CONNEXION SÉCURISÉE</span>
                  <span className="inline-block w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse"></span>
                </p>
              )}
            </div>
          </div>

          {/* Section Liens */}
          <div className="space-y-4">
            <h3 className="text-gray-900 dark:text-blue-500 font-semibold text-lg">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Explorer
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Mentions Légales
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Créateur */}
          <div className="space-y-4">
            <h3 className="text-gray-900 dark:text-blue-500 font-semibold text-lg">Créateur</h3>
            <div className="space-y-2">
              <p>Yoann CHAMBEUX</p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/Yoann-CH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <FaGithub className="text-xl" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/yoann-chambeux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <FaLinkedin className="text-xl" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200/60 dark:border-gray-800/60 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} SolTrek. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
} 