/**
 * The feed scrolls INSIDE its own container, not the window, so the mobile
 * chrome (which listens to window.scrollY) never sees it. The reel dispatches
 * this event on every scroll - and on tap - so the top bar and bottom nav can
 * hide/reveal together.
 *
 * `detail.hidden` is the state the chrome should move to:
 *   true  -> hide (scrolling down, or tapping to dismiss)
 *   false -> reveal (scrolling up, near the top, or tapping to show)
 */
export const REEL_SCROLL_EVENT = 'reel-scroll'

export type ReelScrollDetail = { hidden: boolean }

/** Convenience so the reel and the navs agree on the event shape. */
export function emitReelScroll(hidden: boolean) {
  window.dispatchEvent(
    new CustomEvent<ReelScrollDetail>(REEL_SCROLL_EVENT, {
      detail: { hidden },
    })
  )
}
