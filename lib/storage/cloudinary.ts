import { v2 as cloudinary } from 'cloudinary'

/**
 * Cloudinary storage helper (server-only).
 *
 * The single source of truth for how this app talks to Cloudinary. The upload
 * route calls `uploadToCloudinary`; the delete helper is exported for future
 * cleanup work (not wired yet - deleting a post does not delete its asset).
 *
 * ENV (server-only, never NEXT_PUBLIC_*):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * The SDK reads CLOUDINARY_URL if present, but explicit config is clearer and
 * avoids surprises across environments.
 */

let configured = false

function configure() {
  if (configured) return
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    )
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
  configured = true
}

/** True when all three Cloudinary env vars are present. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export type CloudinaryResourceType = 'image' | 'video'

export type CloudinaryUploadResult = {
  /** Full HTTPS delivery URL - safe to store and render directly. */
  url: string
  /** Cloudinary public_id, needed to delete or transform later. */
  publicId: string
  resourceType: CloudinaryResourceType
  /** Delivered video duration in seconds, when Cloudinary reports it. */
  duration?: number
  /** Intrinsic width/height, when reported. Used to derive an aspect ratio. */
  width?: number
  height?: number
}

/**
 * Upload a buffer to Cloudinary via upload_stream.
 *
 * `folder` groups assets in the Cloudinary console (e.g. "positioned/posts").
 * resource_type must be 'video' for video files, otherwise Cloudinary treats
 * the bytes as an image and rejects them.
 */
export function uploadToCloudinary(
  buffer: Buffer,
  options: { resourceType: CloudinaryResourceType; folder?: string }
): Promise<CloudinaryUploadResult> {
  configure()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType,
        folder: options.folder,
        // Do not let Cloudinary silently alter the incoming bytes beyond what
        // its default pipeline already does; the app decides framing at render.
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload returned no result.'))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: options.resourceType,
          duration: typeof result.duration === 'number' ? result.duration : undefined,
          width: typeof result.width === 'number' ? result.width : undefined,
          height: typeof result.height === 'number' ? result.height : undefined,
        })
      }
    )
    stream.end(buffer)
  })
}

/**
 * Delete an asset by public_id. Safe to call for assets that are already gone
 * (Cloudinary returns { result: 'not found' } rather than throwing).
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: CloudinaryResourceType
): Promise<void> {
  configure()
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
