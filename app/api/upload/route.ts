import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCurrentUser } from '@/lib/auth/get-current-user'

/**
 * Local image upload.
 *
 * FOR DEVELOPMENT ONLY. Files are written to public/uploads and the URL is a
 * plain /uploads/... path, which Next serves statically. This does NOT work on
 * Vercel: public/ is baked at build time and the filesystem is read-only, so
 * writes fail and nothing is served back. Replacing this with S3 (the schema
 * already has that provider) is required before deploying.
 *
 * Accepts ONE file per request as `file` in multipart form data. Returns
 * { url, provider, providerAssetId, type } so the caller can write a MediaAsset
 * row without re-deriving anything.
 */

const MAX_BYTES = 8 * 1024 * 1024 // 8MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
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

  const ext = EXT_BY_MIME[file.type]
  if (!ext) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP or GIF images are supported.' },
      { status: 415 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'That image is larger than 8MB.' },
      { status: 413 }
    )
  }

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
    console.error('[upload] failed:', err)
    return NextResponse.json({ error: 'Could not save the image.' }, { status: 500 })
  }

  return NextResponse.json({
    url: `/uploads/${filename}`,
    provider: 'LOCAL',
    providerAssetId: filename,
    type: 'IMAGE',
  })
}
