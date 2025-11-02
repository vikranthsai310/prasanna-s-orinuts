import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeImageErrorHandling } from './utils/imageErrorHandler'
import { initializeExtensionErrorSuppression, detectProblematicExtensions } from './utils/extensionErrorSuppressor'
import { initializeProductionLogging } from './utils/productionConsole'

// Initialize production-ready console (silent except errors)
initializeProductionLogging();

// Initialize error handling systems
initializeImageErrorHandling();
initializeExtensionErrorSuppression();

// Detect and log any problematic extensions (dev only via logger)
if (import.meta.env.DEV) {
  detectProblematicExtensions();
}

createRoot(document.getElementById("root")!).render(<App />);
