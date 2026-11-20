'use client'

/**
 * Carries a JUST-PUBLISHED post from the composer to the feed.
 *
 * Publishing clears the `/api/home` cache, but a refetch takes a round trip -
 * the new post would not appear until it returned. Stashing the created post
 * here lets the feed prepend it on the very next render, so it shows instantly
 * and the refetch simply confirms it.
 *
 * Module-level on purpose: the composer and the feed are separate components
 * with no shared parent state.
 */

type PendingPost = { post: any; at: number }

let pending: PendingPost | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

/** Call right after a successful publish. */
export function setPendingPost(post: any) {
  pending = { post, at: Date.now() }
  emit()
}

/**
 * Read and CLEAR the pending post. It is consumed once: after the first feed
 * render has it, the refetched list is authoritative.
 *
 * Anything older than 30s is ignored so a stale entry can never resurface.
 */
export function takePendingPost(): any | null {
  if (!pending) return null
  if (Date.now() - pending.at > 30_000) {
    pending = null
    return null
  }
  const post = pending.post
  pending = null
  return post
}

export function subscribePendingPost(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
