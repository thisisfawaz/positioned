'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import type { ResponseType } from '@prisma/client'


// A PROFESSIONAL must be premium to respond to a recruiter's post (submit CV/
// portfolio). Enforced in EVERY response path, not just submitPortfolioResponse -
// requestDocuments and fulfilDocumentRequest were reachable ungated.
async function requiresPremium(userId: string, role: string): Promise<boolean> {
  if (role !== 'PROFESSIONAL') return false
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { premiumUntil: true } })
  const { isPremiumActive } = await import('@/lib/premium')
  return !isPremiumActive(u?.premiumUntil)
}

export type RequestActionState = {
  ok?: boolean
  error?: string
  requestId?: string
  /** True when the CLICKER is the supplier and must fill the form now. */
  needsForm?: boolean
}

// Only these ask for a document. MESSAGE and APPLY are a plain conversation /
// application and must NOT create a DocumentRequest.
const DOCUMENT_RESPONSES: ResponseType[] = ['CV', 'PORTFOLIO', 'CV_AND_PORTFOLIO']

const DAILY_LIMIT = 20

/**
 * Resolves a post's owner to a User id. A post is owned by a PROFILE, so this
 * is the one place that turns professional/recruiter ownership into a person.
 */
async function ownerUserIdOf(post: {
  professionalId: string | null
  recruiterProfileId: string | null
}): Promise<string | null> {
  if (post.professionalId) {
    const p = await prisma.professionalProfile.findUnique({
      where: { id: post.professionalId },
      select: { userId: true },
    })
    return p?.userId ?? null
  }
  if (post.recruiterProfileId) {
    const r = await prisma.recruiterProfile.findUnique({
      where: { id: post.recruiterProfileId },
      select: { userId: true },
    })
    return r?.userId ?? null
  }
  return null
}

/**
 * Called when a viewer clicks a post's CTA.
 *
 * Creates a PENDING DocumentRequest - or REUSES the existing one for this
 * (post, requester) pair. Reuse is the explicit product decision: asking twice
 * must not produce two rows or two notifications. The unique index on
 * (postId, requesterId) backstops it against a double-click race.
 */
export async function requestDocuments(
  _prevState: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'You must be signed in.' }
  if (await requiresPremium(user.id, user.role)) return { error: 'premium_required' }

  const postId = String(formData.get('postId') || '')
  if (!postId) return { error: 'Missing post.' }

  const post = await prisma.workPost.findUnique({
    where: { id: postId },
    select: { id: true, desiredResponse: true, professionalId: true, recruiterProfileId: true },
  })
  if (!post) return { error: 'That post no longer exists.' }

  if (!DOCUMENT_RESPONSES.includes(post.desiredResponse)) {
    return { error: 'This post is not asking for documents.' }
  }

  const ownerId = await ownerUserIdOf(post)
  if (!ownerId) return { error: 'This post has no owner to notify.' }
  if (ownerId === user.id) return { error: 'That is your own post.' }

  // Reuse an existing request for this post, whatever its state - a fulfilled
  // one should be shown again rather than re-asked.
  const existing = await prisma.documentRequest.findUnique({
    where: { postId_requesterId: { postId, requesterId: user.id } },
    select: { id: true },
  })
  if (existing) {
    revalidatePath('/responses')
    return { ok: true, requestId: existing.id }
  }

  // Rate limit: mirrors the contact action's guard so this cannot be used to
  // spam authors with notifications.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentCount = await prisma.documentRequest.count({
    where: { requesterId: user.id, createdAt: { gte: since } },
  })
  if (recentCount >= DAILY_LIMIT) {
    return { error: `You have reached your daily limit of ${DAILY_LIMIT} requests. Try again tomorrow.` }
  }

  // WHICH DIRECTION IS THIS?
  //   Post owned by a PROFESSIONAL -> the clicker is a recruiter REQUESTING.
  //     The author supplies later, so the row starts PENDING and notifies them.
  //   Post owned by a RECRUITER -> the clicker is a professional SUBMITTING.
  //     They are the supplier, so the row is addressed to THEM and they fill
  //     it in straight away. No notification is owed to anyone.
  const postOwnerIsRecruiter = Boolean(post.recruiterProfileId)

  try {
    const created = await prisma.documentRequest.create({
      data: {
        postId,
        // `requesterId` is whoever INITIATED it; `ownerId` is whoever must
        // SUPPLY the links. On a recruiter's post those are the same person.
        requesterId: user.id,
        ownerId: postOwnerIsRecruiter ? user.id : ownerId,
        response: post.desiredResponse,
        status: 'PENDING',
      },
      select: { id: true },
    })
    revalidatePath('/responses')
    if (!postOwnerIsRecruiter) revalidatePath('/profile/notifications')
    return { ok: true, requestId: created.id, needsForm: postOwnerIsRecruiter }
  } catch (err) {
    console.error('Failed to create document request:', err)
    return { error: 'Failed to send request. Please try again.' }
  }
}

/**
 * The author fills in the links. Only cvUrl / portfolioUrl that were actually
 * ASKED FOR are accepted - a CV-only request cannot smuggle in a portfolio.
 * Setting at least the asked-for link flips the row to FULFILLED.
 */
export async function fulfilDocumentRequest(
  _prevState: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'You must be signed in.' }
  if (await requiresPremium(user.id, user.role)) return { error: 'premium_required' }

  const requestId = String(formData.get('requestId') || '')
  if (!requestId) return { error: 'Missing request.' }

  const request = await prisma.documentRequest.findUnique({ where: { id: requestId } })
  if (!request) return { error: 'Request not found.' }
  // `ownerId` is the SUPPLIER. That is the professional who owns the post, or
  // the professional who clicked Submit on a recruiter's post.
  if (request.ownerId !== user.id) return { error: 'This request is not yours to fulfil.' }

  const wantsCv = request.response === 'CV' || request.response === 'CV_AND_PORTFOLIO'
  const wantsPortfolio =
    request.response === 'PORTFOLIO' || request.response === 'CV_AND_PORTFOLIO'

  const cvUrl = wantsCv ? String(formData.get('cvUrl') || '').trim() : ''
  const portfolioUrl = wantsPortfolio ? String(formData.get('portfolioUrl') || '').trim() : ''

  const validUrl = (u: string) => /^https?:\/\//i.test(u)

  if (wantsCv && cvUrl && !validUrl(cvUrl)) {
    return { error: 'The CV link must start with http:// or https://' }
  }
  if (wantsPortfolio && portfolioUrl && !validUrl(portfolioUrl)) {
    return { error: 'The portfolio link must start with http:// or https://' }
  }

  // At least one of the ASKED-FOR links must be provided.
  if (wantsCv && wantsPortfolio && !cvUrl && !portfolioUrl) {
    return { error: 'Add a CV link or a portfolio link.' }
  }
  if (wantsCv && !wantsPortfolio && !cvUrl) {
    return { error: 'Add a CV link.' }
  }
  if (wantsPortfolio && !wantsCv && !portfolioUrl) {
    return { error: 'Add a portfolio link.' }
  }

  try {
    await prisma.documentRequest.update({
      where: { id: requestId },
      data: {
        cvUrl: cvUrl || null,
        portfolioUrl: portfolioUrl || null,
        status: 'FULFILLED',
        fulfilledAt: new Date(),
      },
    })
  } catch (err) {
    console.error('Failed to fulfil document request:', err)
    return { error: 'Failed to save. Please try again.' }
  }

  revalidatePath('/profile/notifications')
  revalidatePath('/responses')
  revalidatePath(`/requests/${requestId}`)
  return { ok: true, requestId }
}

/**
 * PREMIUM submit path for a professional responding to a recruiter's post.
 *
 * Combines create + fulfil in ONE call so the CTA can open a form FIRST (which
 * is what the product wants) instead of silently creating a PENDING request on
 * click. Premium is enforced here, server-side, so it cannot be bypassed.
 */
export async function submitPortfolioResponse(
  _prevState: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'You must be signed in.' }

  if (user.role === 'PROFESSIONAL') {
    const pu = await prisma.user.findUnique({
      where: { id: user.id },
      select: { premiumUntil: true },
    })
    const { isPremiumActive } = await import('@/lib/premium')
    if (!isPremiumActive(pu?.premiumUntil)) return { error: 'premium_required' }
  }

  const postId = String(formData.get('postId') || '')
  const cvUrl = String(formData.get('cvUrl') || '').trim()
  const portfolioUrl = String(formData.get('portfolioUrl') || '').trim()
  if (!postId) return { error: 'Missing post.' }

  const post = await prisma.workPost.findUnique({
    where: { id: postId },
    select: { id: true, desiredResponse: true, recruiterProfileId: true },
  })
  if (!post) return { error: 'That post no longer exists.' }
  if (!DOCUMENT_RESPONSES.includes(post.desiredResponse)) {
    return { error: 'This post is not asking for documents.' }
  }

  const validUrl = (u: string) => /^https?:\/\//i.test(u)
  if (cvUrl && !validUrl(cvUrl)) return { error: 'CV link must start with http.' }
  if (portfolioUrl && !validUrl(portfolioUrl)) return { error: 'Portfolio link must start with http.' }

  const wantsCv = post.desiredResponse === 'CV' || post.desiredResponse === 'CV_AND_PORTFOLIO'
  const wantsPortfolio =
    post.desiredResponse === 'PORTFOLIO' || post.desiredResponse === 'CV_AND_PORTFOLIO'
  if (wantsCv && !cvUrl) return { error: 'A CV link is required.' }
  if (wantsPortfolio && !portfolioUrl) return { error: 'A portfolio link is required.' }

  try {
    const row = await prisma.documentRequest.upsert({
      where: { postId_requesterId: { postId, requesterId: user.id } },
      create: {
        postId,
        requesterId: user.id,
        ownerId: user.id,
        response: post.desiredResponse,
        status: 'FULFILLED',
        cvUrl: wantsCv ? cvUrl : null,
        portfolioUrl: wantsPortfolio ? portfolioUrl : null,
      },
      update: {
        status: 'FULFILLED',
        cvUrl: wantsCv ? cvUrl : undefined,
        portfolioUrl: wantsPortfolio ? portfolioUrl : undefined,
      },
      select: { id: true },
    })
    revalidatePath('/responses')
    return { ok: true, requestId: row.id }
  } catch (err) {
    console.error('submitPortfolioResponse failed:', err)
    return { error: 'Failed to submit. Please try again.' }
  }
}
