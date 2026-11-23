import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  type CloudinaryResourceType,
} from '@/lib/storage/cloudinary'

/**
 * Media upload.
 *
 * PRIMARY PROVIDER: Cloudinary (images AND video). When the three
 * CLOUDINARY_* env vars are set, bytes go to Cloudinary and the response
 * carries the full secure_url. That URL is what gets stored in
 * MediaAsset.providerAssetId - every renderer already passes absolute
 * `https://` values through untouched, so no caller needed changing.
 *
 * FALLBACK: LOCAL disk under public/uploads, ONLY when Cloudinary is not
 * configured. This keeps local development working with no Cloudinary account.
 * It is NOT deployable: public/ is baked at build time and the filesystem is
 * read-only on Vercel.
 *
 * Accepts ONE file per request as `file` in multipart form data. Returns
 * { url, provider, providerAssetId, type } so the caller can write a MediaAsset
 * row (or, for recruitments, imageUrl/videoUrl) without re-deriving anything.
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
// Videos are far larger than images; Cloudinary's free tier allows up to 100MB
// per file, and the app only needs short reels. 50MB is a deliberate ceiling.
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50MB

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const VIDEO_EXT_BY_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  const isImage = Boolean(IMAGE_EXT_BY_MIME[file.type])
  const isVideo = Boolean(VIDEO_EXT_BY_MIME[file.type])
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use JPEG/PNG/WebP/GIF images or MP4/WebM/MOV video.' },
      { status: 415 }
    )
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: isVideo
          ? 'That video is larger than 50MB.'
          : 'That image is larger than 5MB.',
      },
      { status: 413 }
    )
  }

  const mediaType = isVideo ? 'VIDEO' : 'IMAGE'

  // ---- Cloudinary path -----------------------------------------------------
  if (isCloudinaryConfigured()) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer())
      const resourceType: CloudinaryResourceType = isVideo ? 'video' : 'image'
      const result = await uploadToCloudinary(bytes, {
        resourceType,
        folder: 'positioned/uploads',
      })

      // providerAssetId = the FULL secure_url. Read sites already pass absolute
      // URLs through; write sites store whatever comes back here verbatim.
      return NextResponse.json({
        url: result.url,
        provider: 'CLOUDINARY',
        providerAssetId: result.url,
        publicId: result.publicId,
        type: mediaType,
        duration: result.duration ?? null,
        width: result.width ?? null,
        height: result.height ?? null,
      })
    } catch (err) {
      console.error('[upload] Cloudinary failed:', err)
      return NextResponse.json(
        { error: 'Could not upload the file to storage.' },
        { status: 502 }
      )
    }
  }

  // ---- LOCAL fallback (development only) ----------------------------------
  if (isVideo) {
    // Local disk has no transcoding/streaming; refuse video rather than store
    // something the app cannot play back reliably.
    return NextResponse.json(
      {
        error:
          'Video uploads need Cloudinary. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.',
      },
      { status: 501 }
    )
  }

  const ext = IMAGE_EXT_BY_MIME[file.type]
  // Random name, not the user's filename: avoids collisions, avoids path
  // traversal, and avoids leaking anything about the uploader's disk.
  const assetId = randomUUID()
  const filename = `${assetId}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads')

  try {
    await mkdir(dir, { recursive: true })
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(dir, filename), bytes)
  } catch (err) {
    console.error('[upload] local write failed:', err)
    return NextResponse.json({ error: 'Could not save the image.' }, { status: 500 })
  }

  return NextResponse.json({
    url: `/uploads/${filename}`,
    provider: 'LOCAL',
    providerAssetId: filename,
    type: 'IMAGE',
  })
}
