import React from 'react';
import { icons } from '../assets/index.js';
import Icon from './Icon.jsx';

const PHASES = ['idle', 'copying', 'writing-rtf', 'complete'];

export default function PackageProgressIcon({ phase = 'idle', size = 48 }) {
  const safe = PHASES.includes(phase) ? phase : 'idle';
  return <Icon img src={icons.packageProgress(safe)} size={size} className="package-progress-icon" alt="" />;
}
