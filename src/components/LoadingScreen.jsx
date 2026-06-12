import React from 'react';
import { brand, build, icons } from '../assets/index.js';
import Icon from './Icon.jsx';
import { useReducedMotion } from './Icon.jsx';

export default function LoadingScreen() {
  const reducedMotion = useReducedMotion();
  const splash = build.splash();
  const spinner = reducedMotion ? icons.motion('spinner-static') : icons.motion('spinner-24');

  if (splash) {
    return (
      <div className="loading-screen loading-screen-splash" style={{ backgroundImage: `url(${splash})` }}>
        <Icon src={spinner} size={24} className={'loading-spinner' + (reducedMotion ? ' loading-spinner-static' : '')} />
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <img src={brand.logoIcon()} alt="" className="loading-logo" width={64} height={64} />
      <img src={brand.wordmarkHorizontal()} alt="Producer Pro" className="loading-wordmark" height={28} />
      <Icon src={spinner} size={24} className={'loading-spinner' + (reducedMotion ? ' loading-spinner-static' : '')} />
    </div>
  );
}
