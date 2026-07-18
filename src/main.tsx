import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import App from './App';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import './styles/global.css';

// ── Dynamic favicon from CMS settings ────────────────────────────
export function applyFavicon(url: string | null | undefined) {
  if (!url) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      // Global query error handler — surfaces API failures as toasts
      // instead of silently failing on every page
      throwOnError: false,
    },
    mutations: {
      onError: (error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong';
        toast.error(msg);
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
