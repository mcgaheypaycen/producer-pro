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
  icon: () => asset('build/icon-1024.png'),
};

export const illustrations = {
  emptyShows: () => asset('illustrations/empty-shows-320x240.png'),
  emptyPerformers: () => asset('illustrations/empty-performers-320x240.png'),
  emptyVenues: () => asset('illustrations/empty-venues-320x240.png'),
  emptyActs: () => asset('illustrations/empty-acts-320x240.png'),
  emptyLineup: () => asset('illustrations/empty-lineup-320x240.png'),
  onboardingHero: () => asset('illustrations/onboarding-hero-1200x800.png'),
  authArt: () => asset('illustrations/auth-side-768x1024.png'),
};

export const icons = {
  // One file per nav icon; active tint is applied via CSS mask color.
  nav: (id) => asset(`icons/nav/nav-${id}-default.svg`),
  action: (name) => asset(`icons/actions/icon-${name}.svg`),
  status: (name) => asset(`icons/status/${name}.svg`),
  motion: (name) => asset(`motion/${name}.svg`),
  packageProgress: (phase) => asset(`motion/package-progress-${phase}.svg`),
  filetype: (size = 256) => asset(`icons/filetype-show-${size}.png`),
};

export const ONBOARDING_KEY = 'producer-pro-onboarding-dismissed';
