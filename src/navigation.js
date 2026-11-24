// Hash links work both locally and under the GitHub Pages project URL.
export function pageFromHash(hash) {
  if (hash === '#environment') return 'environment';
  if (hash === '#history') return 'history';
  return 'system';
}
