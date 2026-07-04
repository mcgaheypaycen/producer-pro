import React from 'react';
import { brand, motion } from '../assets/index.js';

export default function LoadingScreen() {
  const loop = motion.loadingLoop();
  return (
    <div className="loading-screen">
      {loop && (
        <video
          className="loading-screen-video"
          src={loop}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      <div className="loading-screen-content">
        <span className="loading-logo" aria-hidden>
          <img src={brand.logoIcon()} alt="" width={32} height={32} style={{ filter: 'brightness(0) invert(1)' }} />
        </span>
        <img src={brand.wordmarkHorizontal()} alt="Producer Pro" className="loading-wordmark" height={22} />
        <span className="loading-spinner" aria-label="Loading" />
      </div>
    </div>
  );
}
