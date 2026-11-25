'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import type { ResponseType, PostMediaType } from '@prisma/client'
// ONE source of truth for which responses each side may pick. This used to be
// duplicated here and in lib/posts/response-types.ts, and they drifted - a
// value shown in the dropdown could be silently coerced away by validation.
import {
  PROFESSIONAL_RESPONSES,
  RECRUITER_RESPONSES,
} from '@/lib/posts/response-types'
import { toStoredAsset } from '@/lib/storage/media-url'
import { deleteStoredAsset } from '@/lib/storage/cloudinary'
import { youtubeEmbedUrl } from '@/lib/client/youtube'

function allowedResponses(role: string): readonly string[] {
  return role === 'RECRUITER' ? RECRUITER_RESPONSES : PROFESSIONAL_RESPONSES
}

function toResponseType(value: string, role: string): ResponseType {
  const allowed = allowedResponses(role)
  return (allowed.includes(value) ? value : allowed[0]) as ResponseType
}

/**
 * Who owns the post. Returns exactly one of the two ids, mirroring the
 * Experience pattern - a post belongs to a professional OR a recruiter.
 */
function ownerFields(user: {
  role: string
  professionalProfile?: { id: string } | null
  recruiterProfile?: { id: string } | null
}) {
  if (user.role === 'RECRUITER' && user.recruiterProfile) {
    return { recruiterProfileId: user.recruiterProfile.id }
  }
  if (user.professionalProfile) {
    return { professionalId: user.professionalProfile.id }
  }
  return null
}

/** Normalises whatever the user pasted into a bare YouTube embed URL. */
const parseYouTube = youtubeEmbedUrl

export type WorkFormState = {
  ok?: boolean
  error?: string
  reason?: string
  /** Id of the post just created, returned instead of redirecting. */
  createdId?: string
  /**
   * The just-created post, shaped like a `/api/home` row (media + owner
   * relations included) so the composer can hand it to the feed and it shows
   * at the top IMMEDIATELY, without waiting for a refetch.
   */
  createdPost?: any
  /**
   * Echoed back on failure so the form can repopulate.
   *
   * Uncontrolled inputs are RESET by React after every server action, success
   * or failure - so returning a bare error used to wipe everything the user
   * typed. These values put it back.
   */
  values?: Record<string, string>
}

/** Snapshot of every text field, for repopulating the form after a failure. */
function rawValues(formData: FormData): Record<string, string> {
  const keys = [
    'title',
    'purpose',
    'challenge',
    'goal',
    'approach',
    'solution',
    'contribution',
    'result',
    'metrics',
    'situation',
    'action',
    'skills',
    'links',
    'caption',
  ]
  const out: Record<string, string> = {}
  for (const k of keys) out[k] = String(formData.get(k) || '')
  return out
}

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function extractFormData(formData: FormData, role: string) {
  return {
    desiredResponse: toResponseType(String(formData.get('desiredResponse') || ''), role),
    videoUrl: parseYouTube(String(formData.get('videoUrl') || '')),
    applyUrl: String(formData.get('applyUrl') || '').trim(),
    title: String(formData.get('title') || '').trim(),
    purpose: String(formData.get('purpose') || '').trim(),
    challenge: String(formData.get('challenge') || '').trim(),
    goal: String(formData.get('goal') || '').trim(),
    approach: String(formData.get('approach') || '').trim(),
    solution: String(formData.get('solution') || '').trim(),
    contribution: String(formData.get('contribution') || '').trim(),
    result: String(formData.get('result') || '').trim(),
    metrics: String(formData.get('metrics') || '').trim(),
    situation: String(formData.get('situation') || '').trim(),
    action: String(formData.get('action') || '').trim(),
    skillsRaw: String(formData.get('skills') || ''),
    linksRaw: String(formData.get('links') || ''),
    caption: String(formData.get('caption') || '').trim(),
    mediaUrl: String(formData.get('mediaUrl') || '').trim(),
    // An UPLOADED video (Cloudinary secure_url). Mutually exclusive with an
    // image and with a YouTube link.
    uploadedVideoUrl: String(formData.get('uploadedVideoUrl') || '').trim(),
    // Which frame the post is shown in. Validated on write rather than trusted:
    // the value rides in a hidden input and could be tampered with.
    aspect: formData.get('aspect') === '16:9' ? '16:9' : '9:16',
  }
}

/**
 * Decides which single media kind a submission carries and the (mediaType,
 * videoUrl) pair to persist. Shared by create and update so the exclusivity
 * rules cannot drift between them.
 *
 * Exactly one of: an image (mediaUrl), a YouTube embed (videoUrl), or an
 * uploaded video (uploadedVideoUrl). Returns an error string when the input is
 * contradictory or malformed.
 */
function resolveMedia(d: {
  mediaUrl: string
  videoUrl: string | null
  uploadedVideoUrl: string
  aspect: string
}):
  | {
      mediaType: PostMediaType | null
      videoUrl: string | null
      hasImage: boolean
      imageUrl: string
    }
  | { error: string } {
  const hasImage = Boolean(d.mediaUrl)
  const hasYouTube = Boolean(d.videoUrl)
  const hasUploadedVideo = Boolean(d.uploadedVideoUrl)

  const kinds = [hasImage, hasYouTube, hasUploadedVideo].filter(Boolean).length
  if (kinds > 1) {
    return { error: 'Add an image, a YouTube link, or a video - not more than one.' }
  }

  if (hasUploadedVideo) {
    // Only accept a value the upload route could have produced: an absolute
    // https URL. A hidden input can be tampered with.
    if (!/^https:\/\//i.test(d.uploadedVideoUrl)) {
      return { error: 'The uploaded video link is invalid.' }
    }
    return {
      mediaType: 'VIDEO',
      videoUrl: d.uploadedVideoUrl,
      hasImage: false,
      imageUrl: '',
    }
  }

  if (hasYouTube) {
    return { mediaType: 'YOUTUBE', videoUrl: d.videoUrl, hasImage: false, imageUrl: '' }
  }

  if (hasImage) {
    return { mediaType: 'IMAGE', videoUrl: null, hasImage: true, imageUrl: d.mediaUrl }
  }

  return { mediaType: null, videoUrl: null, hasImage: false, imageUrl: '' }
}

/**
 * Builds the MediaAsset rows for a post from the uploaded URL.
 *
 * The upload route returns EITHER a `/uploads/<uuid>.<ext>` path (LOCAL
 * fallback) OR a full Cloudinary https URL. `toStoredAsset` normalizes both to
 * the (provider, providerAssetId) pair the schema expects - LOCAL keeps a bare
 * filename, CLOUDINARY stores the absolute URL. Returns [] when there is no
 * image, so a text post stores no media at all rather than an empty row.
 */
function mediaRows(mediaUrl: string, aspect: string) {
  const asset = toStoredAsset(mediaUrl)
  if (!asset) return []
  return [
    {
      provider: asset.provider,
      providerAssetId: asset.providerAssetId,
      type: 'IMAGE' as const,
      // The chosen FRAME lives in the Json metadata column, so adding it needed
      // no migration. The renderers read it back to decide fill vs contain.
      metadata: { aspect },
    },
  ]
}

export async function createWorkPost(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be signed in to publish.', values: rawValues(formData) }
  }

  // ONE post model for both sides. A recruiter posting a vacancy is the same
  // act as a professional posting work - only the response options differ.
  const owner = ownerFields(user)
  if (!owner) {
    return {
      error: 'Your profile is not set up yet, so you cannot post.',
      values: rawValues(formData),
    }
  }

  const d = extractFormData(formData, user.role)

  // The form no longer asks for a title; a post is a caption plus media. The
  // column is still required in the DB, so derive it from the caption. Keep it
  // short - the caption itself is rendered in full on the card.
  const derivedTitle = (d.caption || 'Untitled post').slice(0, 80)

  // Media is an image, a YouTube link, OR an uploaded video - exactly one.
  const rawVideo = String(formData.get('videoUrl') || '').trim()
  if (rawVideo && !d.videoUrl) {
    return {
      error: 'That does not look like a YouTube link.',
      values: rawValues(formData),
    }
  }
  const resolved = resolveMedia(d)
  if ('error' in resolved) {
    return { error: resolved.error, values: rawValues(formData) }
  }
  const { mediaType, videoUrl, hasImage } = resolved

  // MEDIA IS COMPULSORY FOR PROFESSIONAL POSTS, OPTIONAL FOR RECRUITING.
  // A recruiter post can be a caption on a background - see the card, which
  // renders a colour block when there is nothing to show. A professional post
  // is work, and work needs something to look at.
  const isRecruiterPost = user.role === 'RECRUITER'
  if (!mediaType && !isRecruiterPost) {
    return {
      error: 'Add an image, a video, or a YouTube link to publish.',
      values: rawValues(formData),
    }
  }

  // APPLY sends applicants somewhere, so it needs a destination. Unlike the
  // other response types this is a real requirement, not a nicety.
  if (d.desiredResponse === 'APPLY') {
    if (!d.applyUrl) {
      return { error: 'Add an application link for Apply.', values: rawValues(formData) }
    }
    if (!/^https?:\/\//i.test(d.applyUrl)) {
      return {
        error: 'The application link must start with http:// or https://',
        values: rawValues(formData),
      }
    }
  }

  const skills = parseList(d.skillsRaw)
  const links = parseList(d.linksRaw)

  // NO CONTENT GATE. The validator was a hardcoded keyword check that read
  // only title/purpose/result and required one of 13 action verbs, so it
  // rejected legitimate work written into the other eight fields - and the
  // rejection wiped the whole form. Users post what they want; a recruiter is
  // the judge of whether a claim is true, not a string match.

  let createdId: string
  let createdPost: any = null
  try {
    const created = await prisma.workPost.create({
      data: {
        ...owner,
        desiredResponse: d.desiredResponse,
        mediaType,
        videoUrl,
        applyUrl: d.desiredResponse === 'APPLY' ? d.applyUrl || null : null,
        title: derivedTitle,
        purpose: d.purpose || null,
        challenge: d.challenge || null,
        goal: d.goal || null,
        approach: d.approach || null,
        solution: d.solution || null,
        contribution: d.contribution || null,
        result: d.result || null,
        metrics: d.metrics || null,
        situation: d.situation || null,
        action: d.action || null,
        caption: d.caption || null,
        skills,
        links,
        status: 'PUBLISHED',
        mediaAssets: { create: mediaRows(hasImage ? resolved.imageUrl : '', d.aspect) },
      },
    })
    createdId = created.id

    // Re-read with the SAME relations `/api/home` returns, so the object the
    // feed prepends renders exactly like a fetched post (media, author).
    createdPost = await prisma.workPost.findUnique({
      where: { id: created.id },
      include: {
        mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
        professional: {
          include: {
            user: true,
            skills: { include: { skill: true } },
          },
        },
        recruiterProfile: { include: { user: true } },
      },
    })
  } catch (err) {
    console.error('Failed to create work post:', err)
    return {
      error: 'Failed to publish. Please try again.',
      values: rawValues(formData),
    }
  }

  revalidatePath('/profile/work')
  revalidatePath('/profile/feed')
  revalidatePath('/feed')
  revalidateTag('feed', 'max')

  // NO REDIRECT. Publishing happens inside a modal ON the feed, so navigating
  // away is wrong - the author should see their post appear in place. The
  // client clears its cache and refetches; `createdId` comes back so the
  // caller can act on it if it ever needs to.
  return { ok: true, createdId, createdPost }
}

export async function updateWorkPost(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not signed in.', values: rawValues(formData) }
  }

  const owner = ownerFields(user)
  if (!owner) {
    return { error: 'Your profile is not set up yet.', values: rawValues(formData) }
  }

  const postId = String(formData.get('postId') || '')
  if (!postId) {
    return { error: 'Missing post ID.', values: rawValues(formData) }
  }

  // Verify ownership against WHICHEVER side owns the post.
  const existing = await prisma.workPost.findUnique({ where: { id: postId } })
  const isOwner =
    existing &&
    (('professionalId' in owner && existing.professionalId === owner.professionalId) ||
      ('recruiterProfileId' in owner && existing.recruiterProfileId === owner.recruiterProfileId))
  if (!existing || !isOwner) {
    return { error: 'You can only edit your own posts.', values: rawValues(formData) }
  }

  const d = extractFormData(formData, user.role)
  const derivedTitle = (d.caption || existing.title || 'Untitled post').slice(0, 80)

  const rawVideo = String(formData.get('videoUrl') || '').trim()
  if (rawVideo && !d.videoUrl) {
    return { error: 'That does not look like a YouTube link.', values: rawValues(formData) }
  }
  const resolved = resolveMedia(d)
  if ('error' in resolved) {
    return { error: resolved.error, values: rawValues(formData) }
  }
  const { mediaType, videoUrl, hasImage } = resolved

  const isRecruiterPost = user.role === 'RECRUITER'
  if (!mediaType && !isRecruiterPost) {
    return { error: 'Add an image, a video, or a YouTube link to publish.', values: rawValues(formData) }
  }

  if (d.desiredResponse === 'APPLY') {
    if (!d.applyUrl) {
      return { error: 'Add an application link for Apply.', values: rawValues(formData) }
    }
    if (!/^https?:\/\//i.test(d.applyUrl)) {
      return {
        error: 'The application link must start with http:// or https://',
        values: rawValues(formData),
      }
    }
  }

  const skills = parseList(d.skillsRaw)
  const links = parseList(d.linksRaw)

  // NO CONTENT GATE. The validator was a hardcoded keyword check that read
  // only title/purpose/result and required one of 13 action verbs, so it
  // rejected legitimate work written into the other eight fields - and the
  // rejection wiped the whole form. Users post what they want; a recruiter is
  // the judge of whether a claim is true, not a string match.

  try {
    await prisma.workPost.update({
      where: { id: postId },
      data: {
        desiredResponse: d.desiredResponse,
        mediaType,
        videoUrl,
        applyUrl: d.desiredResponse === 'APPLY' ? d.applyUrl || null : null,
        title: derivedTitle,
        purpose: d.purpose || null,
        challenge: d.challenge || null,
        goal: d.goal || null,
        approach: d.approach || null,
        solution: d.solution || null,
        contribution: d.contribution || null,
        result: d.result || null,
        metrics: d.metrics || null,
        situation: d.situation || null,
        action: d.action || null,
        caption: d.caption || null,
        skills,
        links,
      },
    })

    // REPLACE-ALL for media on edit: the form carries at most one image, so the
    // simplest correct behaviour is to drop whatever was there and recreate it.
    // Doing this in two statements rather than a nested write keeps it obvious
    // that removing the image actually removes the row.
    await prisma.mediaAsset.deleteMany({ where: { workPostId: postId } })
    if (hasImage) {
      const asset = toStoredAsset(resolved.imageUrl)
      if (asset) {
        await prisma.mediaAsset.create({
          data: {
            workPostId: postId,
            provider: asset.provider,
            providerAssetId: asset.providerAssetId,
            type: 'IMAGE',
            metadata: { aspect: d.aspect },
          },
        })
      }
    }
  } catch (err) {
    console.error('Failed to update work post:', err)
    return {
      error: 'Failed to save. Please try again.',
      values: rawValues(formData),
    }
  }

  revalidatePath('/profile/work')
  revalidatePath(`/profile/work/${postId}`)
  revalidatePath('/profile/feed')
  revalidateTag('feed', 'max')

  redirect(`/profile/work/${postId}`, 'push')
}

export async function deleteWorkPost(
  formData: FormData
): Promise<WorkFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not signed in.' }
  }

  const owner = ownerFields(user)
  if (!owner) {
    return { error: 'Your profile is not set up yet.' }
  }

  const postId = String(formData.get('postId') || '')
  if (!postId) return { error: 'Missing post ID.' }

  const existing = await prisma.workPost.findUnique({ where: { id: postId } })
  const isOwner =
    existing &&
    (('professionalId' in owner && existing.professionalId === owner.professionalId) ||
      ('recruiterProfileId' in owner && existing.recruiterProfileId === owner.recruiterProfileId))
  if (!existing || !isOwner) {
    return { error: 'You can only delete your own posts.' }
  }

  // Snapshot the media BEFORE the rows are removed, so the Cloudinary copies
  // can be cleaned up afterwards. Only CLOUDINARY assets resolve to a URL here;
  // LOCAL filenames are skipped by deleteStoredAsset.
  const assets = await prisma.mediaAsset.findMany({
    where: { workPostId: postId },
    select: { providerAssetId: true },
  })

  try {
    // Delete related rows first (no cascade configured)
    await prisma.$transaction([
      prisma.savedWork.deleteMany({ where: { workPostId: postId } }),
      prisma.workView.deleteMany({ where: { workPostId: postId } }),
      prisma.mediaAsset.deleteMany({ where: { workPostId: postId } }),
      prisma.workPost.delete({ where: { id: postId } }),
    ])
  } catch (err) {
    console.error('Failed to delete work post:', err)
    return { error: 'Failed to delete. Please try again.' }
  }

  // Best-effort storage cleanup AFTER the DB commit. deleteStoredAsset never
  // throws, so a Cloudinary hiccup cannot fail the user's delete.
  await Promise.all(assets.map((a) => deleteStoredAsset(a.providerAssetId)))

  revalidatePath('/profile/work')
  revalidatePath('/profile/feed')
  revalidateTag('feed', 'max')

  // Deliberately NO redirect: the caller stays on the page it deleted from
  // and refreshes in place (router.refresh()). A redirect here navigated to
  // /profile/work, which is a retired route that now 404s.
  return {}
}

/**
 * MINIMAL EDIT: caption + orientation ONLY. Media links are never touched.
 *
 * The full updateWorkPost replaces all media (delete + recreate) because its
 * form carries an image. This action exists so editing TEXT cannot wipe a
 * post's existing image/video. Ownership is verified the same way.
 */
export async function updatePostText(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.', values: rawValues(formData) }
  const owner = ownerFields(user)
  if (!owner) return { error: 'Your profile is not set up yet.', values: rawValues(formData) }

  const postId = String(formData.get('postId') || '')
  const caption = String(formData.get('caption') || '').trim()
  const aspect = String(formData.get('aspect') || '') === '16:9' ? '16:9' : '9:16'
  if (!postId) return { error: 'Missing post ID.', values: rawValues(formData) }

  const existing = await prisma.workPost.findUnique({ where: { id: postId } })
  const isOwner =
    existing &&
    (('professionalId' in owner && existing.professionalId === owner.professionalId) ||
      ('recruiterProfileId' in owner && existing.recruiterProfileId === owner.recruiterProfileId))
  if (!existing || !isOwner) {
    return { error: 'You can only edit your own posts.', values: rawValues(formData) }
  }

  const derivedTitle = (caption || existing.title || 'Untitled post').slice(0, 80)

  try {
    await prisma.workPost.update({
      where: { id: postId },
      data: { caption: caption || null, title: derivedTitle },
    })
    // Orientation lives on the media asset metadata; update the first asset
    // WITHOUT deleting/recreating it, so the image itself is preserved.
    const asset = await prisma.mediaAsset.findFirst({
      where: { workPostId: postId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, metadata: true },
    })
    if (asset) {
      const prev = (asset.metadata ?? {}) as Record<string, unknown>
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { metadata: { ...prev, aspect } },
      })
    }
  } catch (err) {
    console.error('updatePostText failed:', err)
    return { error: 'Failed to save. Please try again.', values: rawValues(formData) }
  }

  revalidatePath('/profile/work')
  revalidatePath(`/profile/work/${postId}`)
  revalidatePath('/profile/feed')
  revalidateTag('feed', 'max')
  return { ok: true } as WorkFormState
}
