/**
 * Fallback for any (app) route without its own loading.tsx.
 *
 * Returning null is deliberate. Next keeps the PREVIOUS page on screen while the
 * next route's server render resolves, which reads as an instant page switch.
 * This used to render a generic card skeleton that matched almost no route, so
 * every transition flashed a placeholder that was not the destination's shape
 * before the real page appeared - which read as "it loads before it switches".
 * Routes with a known shape (feed, explore, profile, reels, list, messages,
 * responses, trending, settings, visibility, saved-*, recruitments) now carry
 * their own loading.tsx, so this fallback only applies to routes that render
 * their own skeleton in-page.
 */
export default function AppLoading() {
  return null
}
