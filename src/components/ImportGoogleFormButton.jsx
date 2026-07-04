import React from 'react';
import { icons } from '../assets/index.js';
import { useGoogleImport } from '../googleImport.jsx';
import { BtnWithIcon } from './Icon.jsx';

/** Opens the Google Form tech-notes import wizard (modal lives in GoogleImportProvider). */
export default function ImportGoogleFormButton({ className = 'btn ghost sm', label = 'Import from Form' }) {
  const openImport = useGoogleImport();

  return (
    <BtnWithIcon
      icon={icons.action('export')}
      className={className}
      onClick={() => openImport?.()}
      disabled={!openImport}
    >
      {label}
    </BtnWithIcon>
  );
}
