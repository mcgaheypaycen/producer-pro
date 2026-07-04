import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useShell } from './shell.jsx';
import { api } from './lib/api.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState({ performers: [], venues: [], acts: [], shows: [], loaded: false });
  const { refreshDataInfo } = useShell();

  const reloadAll = useCallback(async () => {
    const [performers, venues, acts, shows] = await Promise.all([
      api.list('performers'),
      api.list('venues'),
      api.list('acts'),
      api.list('shows'),
    ]);
    setData({ performers, venues, acts, shows, loaded: true });
  }, []);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const save = useCallback(async (collection, item) => {
    const saved = await api.save(collection, item);
    setData((d) => {
      const items = d[collection].slice();
      const idx = items.findIndex((i) => i.id === saved.id);
      if (idx >= 0) items[idx] = saved;
      else items.push(saved);
      return { ...d, [collection]: items };
    });
    refreshDataInfo();
    return saved;
  }, [refreshDataInfo]);

  const remove = useCallback(async (collection, id) => {
    await api.remove(collection, id);
    setData((d) => ({ ...d, [collection]: d[collection].filter((i) => i.id !== id) }));
    refreshDataInfo();
  }, [refreshDataInfo]);

  return (
    <DataContext.Provider value={{ ...data, save, remove, reloadAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
