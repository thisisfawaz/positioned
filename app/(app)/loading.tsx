/**
 * App-level loading boundary.
 *
 * This MUST return null. A loading.tsx here wraps EVERY route below it, so
 * any markup rendered here is what the user sees first on navigation - before
 * (and instead of) the destination route's own loading.tsx. A generic shape
 * here means every page flashes the WRONG skeleton (header + list) no matter
 * how good its own skeleton is.
 *
 * Returning null leaves the job entirely to each route's loading.tsx, which is
 * shaped to mirror that specific page. Routes with no own loading.tsx just
 * wait for the streamed page, which is correct - better than a wrong shape.
 */
export default function AppLoading() {
  return null
}
