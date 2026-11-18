/**
 * Media aspect ratios for posts.
 *
 * TWO supported frames: 9:16 (portrait) and 16:9 (landscape). The chosen frame
 * is stored on `MediaAsset.metadata.aspect`, not as a column - no migration was
 * needed for it.
 *
 * FILL vs CONTAIN is the whole point of this file. A 9:16 image in a 9:16 frame
 * should reach all four edges; a near-9:16 image should too, with the small
 * mismatch absorbed as an invisible trim. An image that is nowhere near the
 * frame must NOT be cropped - it is shown at its true shape over a blurred
 * copy of itself (that fallback already existed in WorkCard).
 */

export type AspectRatio = '9:16' | '16:9'

export const ASPECT_RATIOS: AspectRatio[] = ['9:16', '16:9']

/** width / height for each frame. */
export const ASPECT_VALUE: Record<AspectRatio, number> = {
  '9:16': 9 / 16,
  '16:9': 16 / 9,
}

/** Tailwind class for each frame, used by the renderers. */
export const ASPECT_CLASS: Record<AspectRatio, string> = {
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-video',
}

/**
 * How far an image's ratio may be from the frame before it stops being
 * "close enough to fill".
 *
 * 10% of the ratio: for 9:16 (0.5625) that accepts roughly 0.506 to 0.619,
 * which covers phone photos and normal exports. Tighter rejected real files;
 * looser started treating near-square images as portrait.
 */
export const ASPECT_TOLERANCE = 0.1

/** True when an image of this ratio should FILL the frame rather than contain. */
export function fillsFrame(
  imageRatio: number,
  target: AspectRatio
): boolean {
  if (!Number.isFinite(imageRatio) || imageRatio <= 0) return false
  const targetRatio = ASPECT_VALUE[target]
  return Math.abs(imageRatio - targetRatio) / targetRatio <= ASPECT_TOLERANCE
}

/** Which frame an image ratio most naturally belongs to. */
export function nearestAspect(imageRatio: number): AspectRatio {
  const portraitGap = Math.abs(imageRatio - ASPECT_VALUE['9:16'])
  const landscapeGap = Math.abs(imageRatio - ASPECT_VALUE['16:9'])
  return portraitGap <= landscapeGap ? '9:16' : '16:9'
}

/** Reads a stored value back, falling back to portrait. */
export function parseAspect(value: unknown): AspectRatio {
  return value === '16:9' ? '16:9' : '9:16'
}

/**
 * The ratio stored on a MediaAsset, if any. `metadata` is a Json column, so the
 * value is untrusted and has to be narrowed rather than cast.
 */
export function aspectFromMetadata(metadata: unknown): AspectRatio | null {
  if (!metadata || typeof metadata !== 'object') return null
  const raw = (metadata as Record<string, unknown>).aspect
  if (raw === '9:16' || raw === '16:9') return raw
  return null
}
