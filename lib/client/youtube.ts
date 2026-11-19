/**
 * Extracts the 11-character YouTube video id from any common URL shape, or
 * returns null when the input is not a recognizable YouTube reference.
 *
 * Accepts:
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   ID  (bare 11-char id)
 */
export function youtubeVideoId(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null

  const embed = v.match(/youtube\.com\/embed\/([\w-]{11})/i)
  if (embed) return embed[1]

  const watch = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i)
  if (watch) return watch[1]

  if (/^[\w-]{11}$/.test(v)) return v

  return null
}
