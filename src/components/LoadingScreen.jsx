import React from 'react';
import { brand } from '../assets/index.js';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img src={brand.logoIcon()} alt="" className="loading-logo" width={56} height={56} />
      <img src={brand.wordmarkHorizontal()} alt="Producer Pro" className="loading-wordmark" height={26} />
      <span className="loading-spinner" aria-label="Loading" />
    </div>
  );
}
