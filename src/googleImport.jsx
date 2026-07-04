import React, { createContext, useCallback, useContext, useState } from 'react';
import GoogleFormsImportModal from './components/GoogleFormsImportModal.jsx';

const GoogleImportContext = createContext(null);

export function GoogleImportProvider({ children, onOpenShow }) {
  const [open, setOpen] = useState(false);
  const openImport = useCallback(() => setOpen(true), []);
  const closeImport = useCallback(() => setOpen(false), []);

  return (
    <GoogleImportContext.Provider value={openImport}>
      {children}
      {open && (
        <GoogleFormsImportModal onClose={closeImport} onOpenShow={onOpenShow} />
      )}
    </GoogleImportContext.Provider>
  );
}

export function useGoogleImport() {
  return useContext(GoogleImportContext);
}
