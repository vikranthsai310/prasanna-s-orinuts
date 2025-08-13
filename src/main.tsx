import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeImageErrorHandling } from './utils/imageErrorHandler'

// Initialize global image error handling
initializeImageErrorHandling();

createRoot(document.getElementById("root")!).render(<App />);
