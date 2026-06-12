import React from 'react';
import { asset } from '../assets/index.js';

export default function Icon({ src, path, size = 16, className = '', alt = '' }) {
  const url = src || (path ? asset(path) : null);
  if (!url) return null;
  return (
    <img
      src={url}
      alt={alt}
      className={`icon-img ${className}`.trim()}
      width={size}
      height={size}
      draggable={false}
    />
  );
}

export function IconButton({ path, src, size = 16, className = '', title, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={`icon-btn ${className}`.trim()}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon path={path} src={src} size={size} alt="" />
    </button>
  );
}

export function BtnWithIcon({ icon, iconSize = 18, children, className = 'btn', type = 'button', ...props }) {
  return (
    <button type={type} className={className} {...props}>
      <span className="btn-with-icon">
        {icon && <Icon src={icon} size={iconSize} alt="" />}
        {children}
      </span>
    </button>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
