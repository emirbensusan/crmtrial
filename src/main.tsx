import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './components/AuthProvider.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { checkRequiredEnvVars, validateEnvironment } from './utils/envCheck.ts';
import { measureWebVitals } from './utils/performance.ts';
import { Logger } from './utils/logging.ts';
import './index.css';

// Initialize environment and logging
try {
  checkRequiredEnvVars();
  validateEnvironment();
  measureWebVitals();
  
  const logger = Logger.getInstance();
  logger.info('Application starting', { 
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('❌ Application startup failed:', error);
  // Show user-friendly error instead of crashing
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
