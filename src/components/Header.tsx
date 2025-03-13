import { Link } from 'react-router-dom';

interface HeaderProps {
  pageName?: string;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

export function Header({ 
  pageName = 'explorer', 
  showBackButton = false, 
  backTo = '/explore',
  backText = 'Retour'
}: HeaderProps) {
  return (
    <header className="py-4 px-4 sm:px-6 border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur-xl bg-white/40 dark:bg-black/40 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            SolTrek
          </Link>
          <div className="flex items-center mt-[5px]">
            <span className="text-blue-600 mx-2 font-mono text-base">//</span>
            <span className="text-gray-600 dark:text-gray-400 font-mono tracking-wide uppercase text-xs">
              {pageName}.sys
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link 
              to={backTo} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center rounded-full p-1 sm:px-3 sm:py-1 bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-black/50"
              title={backText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline ml-1">{backText}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 