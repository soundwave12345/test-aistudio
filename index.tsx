import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import VConsole from 'vconsole';

// Initialize vConsole for on-device debugging
// We exclude the 'network' plugin because it tries to overwrite window.fetch,
// which causes a crash on some Capacitor WebViews where fetch is read-only.
try {
  // @ts-ignore - VConsole types might conflict with the CDN version
  const vConsole = new VConsole({ 
    theme: 'dark',
    defaultPlugins: ['system', 'element', 'storage'] 
  });
  console.log("vConsole initialized");
} catch (e) {
  console.warn("Failed to initialize vConsole:", e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);