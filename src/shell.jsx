import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ShellContext = createContext(null);

export function ShellProvider({ children }) {
  const [topBar, setTopBarState] = useState({ breadcrumb: [], action: null });
  const [dataInfo, setDataInfo] = useState({ path: '', lastSaved: null });

  const refreshDataInfo = useCallback(async () => {
    if (window.api?.getDataInfo) {
      const info = await window.api.getDataInfo();
      setDataInfo(info);
    }
  }, []);

  useEffect(() => { refreshDataInfo(); }, [refreshDataInfo]);

  const setTopBar = useCallback((config) => {
    setTopBarState(config || { breadcrumb: [], action: null });
  }, []);

  return (
    <ShellContext.Provider value={{ topBar, setTopBar, dataInfo, refreshDataInfo }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}

/** Registers breadcrumb + primary action for the contextual top bar. */
export function useTopBar(breadcrumb, action) {
  const { setTopBar } = useShell();
  useEffect(() => {
    setTopBar({ breadcrumb, action });
    return () => setTopBar(null);
  });
}
