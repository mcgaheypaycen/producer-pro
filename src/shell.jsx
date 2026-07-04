import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

const EMPTY_TOP_BAR = { breadcrumb: [], action: null };

const ShellContext = createContext(null);

export function ShellProvider({ children }) {
  const topBarRef = useRef(EMPTY_TOP_BAR);
  const [, syncTopBar] = useState(0);
  const [dataInfo, setDataInfo] = useState({ lastSaved: null });

  const requestTopBarSync = useCallback(() => {
    syncTopBar((n) => n + 1);
  }, []);

  const refreshDataInfo = useCallback(() => {
    setDataInfo({ lastSaved: new Date().toISOString() });
  }, []);

  return (
    <ShellContext.Provider value={{ topBarRef, requestTopBarSync, dataInfo, refreshDataInfo }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}

/** Registers breadcrumb + primary action for the contextual top bar. */
export function useTopBar(breadcrumb, action) {
  const { topBarRef, requestTopBarSync } = useShell();
  topBarRef.current = { breadcrumb, action };

  const breadcrumbKey = JSON.stringify(breadcrumb);
  useLayoutEffect(() => {
    requestTopBarSync();
  }, [breadcrumbKey, requestTopBarSync]);

  useEffect(() => {
    return () => {
      topBarRef.current = EMPTY_TOP_BAR;
      requestTopBarSync();
    };
  }, [topBarRef, requestTopBarSync]);
}
