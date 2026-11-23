/**
 * Pure helpers for the MediaAsset.providerAssetId convention. No I/O, no
 * server-only imports, so both server actions and any client code can use them.
 *
 * CONVENTION (see prisma/schema.prisma MediaAsset.providerAssetId):
 *   - LOCAL provider      -> providerAssetId is a BARE filename, `<uuid>.<ext>`
 *   - CLOUDINARY provider -> providerAssetId is the FULL secure_url (https://...)
 *
 * Renderers test `^https?://` and prefix only the bare-filename case with
 * /uploads/. To stay compatible with rows written before Cloudinary existed,
 * `toStoredAssetId` keeps `/uploads/<file>` inputs as bare filenames.
 */

export type StorageProviderName = 'LOCAL' | 'CLOUDINARY'

export type StoredAsset = {
  provider: StorageProviderName
  providerAssetId: string
}

/**
 * Take whatever the upload form carried (a `/uploads/<file>` path, a bare
 * filename, or a full https URL) and produce the (provider, providerAssetId)
 * pair to persist.
 */
export function toStoredAsset(mediaUrl: string): StoredAsset | null {
  const value = mediaUrl.trim()
  if (!value) return null

  if (/^https?:\/\//i.test(value)) {
    // Cloudinary (or any external host). Store the absolute URL verbatim.
    return { provider: 'CLOUDINARY', providerAssetId: value }
  }

  // A LOCAL path: `/uploads/<file>` or a bare filename.
  const filename = value.startsWith('/uploads/') ? value.slice('/uploads/'.length) : value
  if (!filename) return null
  return { provider: 'LOCAL', providerAssetId: filename }
}

/**
 * Inverse of toStoredAsset for rendering: turn a stored providerAssetId back
 * into a src the browser can load.
 */
export function toSrc(providerAssetId: string | null | undefined): string | null {
  if (!providerAssetId) return null
  return /^https?:\/\//i.test(providerAssetId)
    ? providerAssetId
    : `/uploads/${providerAssetId}`
}
