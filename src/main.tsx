import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/globals.css'
import { ThemeProvider } from './lib/theme'
import AppWrapper from './components/AppWrapper'
import { LoadingProvider } from './lib/loadingContext'
import LoadingScreen from './components/LoadingScreen'

// Lazy loading des pages
const HomePage = lazy(() => import('./pages/index.tsx'))
const ExplorePage = lazy(() => import('./pages/explore.tsx'))
const PlanetDetailPage = lazy(() => import('./pages/planetDetail.tsx'))
const LegalPage = lazy(() => import('./pages/legal.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <LoadingProvider>
        <AppWrapper>
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/:planetName" element={<PlanetDetailPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppWrapper>
      </LoadingProvider>
    </ThemeProvider>
  </StrictMode>,
)
