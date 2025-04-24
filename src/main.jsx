import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add global error handler to catch and log issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent third-party scripts from breaking the app
  if (event.error && event.error.message && event.error.message.includes('ethereum')) {
    console.warn('Prevented ethereum-related error. This is likely from a browser extension.');
    event.preventDefault();
    return true;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
