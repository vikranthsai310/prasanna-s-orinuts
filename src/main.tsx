import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeImageErrorHandling } from './utils/imageErrorHandler'
import { initializeExtensionErrorSuppression, detectProblematicExtensions } from './utils/extensionErrorSuppressor'

// Initialize error handling systems
initializeImageErrorHandling();
initializeExtensionErrorSuppression();

// Detect and log any problematic extensions
detectProblematicExtensions();

createRoot(document.getElementById("root")!).render(<App />);
