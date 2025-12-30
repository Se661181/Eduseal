import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster as Sonner } from 'sonner';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Code splitting for all routes
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TalentScout = lazy(() => import('./pages/TalentScout'));
const Placeholder = lazy(() => import('./pages/Placeholder'));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#020202] flex items-center justify-center">
    <div className="text-white/40 font-mono text-xs uppercase tracking-wider">Loading...</div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" position="top-right" richColors />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/talent-scout" element={<TalentScout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Placeholder />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
