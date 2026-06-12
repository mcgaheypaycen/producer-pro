import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { textures, ONBOARDING_KEY } from './assets/index.js';
import './fonts.css';
import './styles.css';

if (window.api?.resetOnboarding) {
  localStorage.removeItem(ONBOARDING_KEY);
}

const textureVars = {
  '--bg-rail-texture': textures.rail(),
  '--bg-paper-texture': textures.paper(),
  '--bg-runsheet-desk': textures.runsheetDesk(),
  '--bg-runsheet-paper': textures.runsheetPaper(),
};
for (const [name, url] of Object.entries(textureVars)) {
  if (url) document.documentElement.style.setProperty(name, `url(${url})`);
}

// In-browser fallback (vite dev server outside Electron): in-memory store so
// the UI stays fully navigable. The real preload bridge always wins.
if (!window.api) {
  const db = { performers: [], venues: [], acts: [], shows: [] };
  let seq = 1;
  window.api = {
    list: async (c) => db[c],
    save: async (c, item) => {
      if (item.id) {
        const idx = db[c].findIndex((i) => i.id === item.id);
        if (idx >= 0) { db[c][idx] = { ...db[c][idx], ...item }; return db[c][idx]; }
      }
      const saved = { ...item, id: item.id || 'dev-' + seq++ };
      db[c].push(saved);
      return saved;
    },
    remove: async (c, id) => { db[c] = db[c].filter((i) => i.id !== id); },
    pickMedia: async () => ({ path: 'C:/dev/sample-track.mp3', name: 'sample-track.mp3', length: '3:45', isImage: false }),
    createShowPackage: async () => ({ canceled: false, folderPath: 'C:/dev/Show Folder', copied: [], missing: [] }),
    exportCsv: async () => ({ canceled: false, filePath: 'C:/dev/settlement.csv' }),
    openPath: async () => {},
    getDataInfo: async () => ({ path: 'producer-pro-data.json (dev)', lastSaved: new Date().toISOString() }),
    listFonts: async () => [
      'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas',
      'Courier New', 'Franklin Gothic Medium', 'Georgia', 'Impact', 'Lucida Console',
      'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
    ],
  };
}

createRoot(document.getElementById('root')).render(<App />);
