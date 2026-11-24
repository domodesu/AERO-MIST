// Require a deliberate, predominantly horizontal right swipe so vertical scrolling is unaffected.
export function isMenuOpenSwipe(start, end) {
  const dx = end.x - start.x;
  const dy = Math.abs(end.y - start.y);
  return dx >= 75 && dx > dy * 1.5;
}
