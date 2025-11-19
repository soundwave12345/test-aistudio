import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import VConsole from 'vconsole';

// Initialize vConsole for on-device debugging
// We exclude the 'network' plugin because it tries to overwrite window.fetch,
// which causes a crash on some Capacitor WebViews where fetch is read-only.
// Our manual logging in subsonicService.ts will still appear in the 'Log' tab.
try {
  const vConsole = new VConsole({ defaultPlugins: ['system', 'element', 'storage'] });
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