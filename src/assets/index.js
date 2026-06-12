/** Vite-resolved URLs for files under /assets (bundled into dist on build). */

const modules = import.meta.glob('../../assets/**/*.{svg,png}', {
  eager: true,
  import: 'default',
});

export function asset(path) {
  const key = `../../assets/${path.replace(/^\//, '')}`;
  return modules[key] || null;
}

export const brand = {
  wordmarkHorizontal: () => asset('brand/wordmark-horizontal.svg'),
  wordmarkTagline: () => asset('brand/wordmark-tagline.svg'),
  wordmarkStacked: () => asset('brand/wordmark-stacked.svg'),
  logoIcon: () => asset('brand/logo-icon-only.svg'),
  logoFullColor: () => asset('brand/logo-full-color.svg'),
  logoMonochromeWhite: () => asset('brand/logo-monochrome-white.svg'),
  logoMonochromeBlack: () => asset('brand/logo-monochrome-black.svg'),
  sampleWatermark: () => asset('brand/runsheet-sample-watermark.svg'),
};

export const build = {
  icon: () => asset('build/icon-1024.png') || asset('build/icon.ico'),
  splash: () => asset('build/splash-1600x1000.png') || asset('build/splash-800x500.png'),
};

export const textures = {
  rail: () => asset('textures/texture-rail.png'),
  paper: () => asset('textures/texture-paper.png'),
  runsheetDesk: () => asset('textures/runsheet-desk-texture.png'),
  runsheetPaper: () => asset('textures/runsheet-paper-tile.png'),
};

export const illustrations = {
  emptyShows: () => asset('illustrations/empty-shows-320x240.png') || asset('illustrations/empty-shows.svg'),
  emptyPerformers: () => asset('illustrations/empty-performers-320x240.png') || asset('illustrations/empty-performers.svg'),
  emptyVenues: () => asset('illustrations/empty-venues-320x240.png') || asset('illustrations/empty-venues.svg'),
  emptyActs: () => asset('illustrations/empty-acts-320x240.png') || asset('illustrations/empty-acts.svg'),
  emptyLineup: () => asset('illustrations/empty-lineup-320x240.png') || asset('illustrations/empty-lineup.svg'),
  onboardingHero: () => asset('illustrations/onboarding-hero-1200x800.png') || asset('illustrations/onboarding-hero-600x400.png') || asset('illustrations/onboarding-hero.svg'),
};

export const icons = {
  nav: (id, active = false) => asset(`icons/nav/nav-${id}-${active ? 'active' : 'default'}.svg`),
  action: (name) => asset(`icons/actions/icon-${name}.svg`),
  status: (name) => asset(`icons/status/${name}.svg`),
  motion: (name) => asset(`motion/${name}.svg`),
  packageProgress: (phase) => asset(`motion/package-progress-${phase}.svg`),
  filetype: (size = 256) => asset(`icons/filetype-show-${size}.png`),
};

export const ONBOARDING_KEY = 'producer-pro-onboarding-dismissed';
