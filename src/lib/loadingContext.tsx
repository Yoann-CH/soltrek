import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LoadingContextType {
  isAppLoading: boolean;
  appLoaded: boolean;
  setAppLoaded: (loaded: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isAppLoading: true,
  appLoaded: false,
  setAppLoaded: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appLoaded, setAppLoaded] = useState(false);
  
  // Quand appLoaded devient true, mettre isAppLoading à false après un court délai
  useEffect(() => {
    if (appLoaded) {
      // Petit délai pour s'assurer que les transitions sont terminées
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [appLoaded]);
  
  return (
    <LoadingContext.Provider value={{ isAppLoading, appLoaded, setAppLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
}; 