export function isDesktop() {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 1000;
  return !hasTouch && !isSmallScreen;
}
