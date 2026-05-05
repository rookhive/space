export function isDesktop() {
  return matchMedia('(hover: hover) and (pointer: fine)').matches;
}
