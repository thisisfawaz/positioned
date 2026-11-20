'use server'

import { isPremiumActive } from '@/lib/premium'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'

export type ContactFormState = {
  ok?: boolean
  error?: string
}

const DAILY_LIMIT = 10

export async function sendContactRequest(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'You must be signed in to send a message.' }
  }

  // EITHER SIDE CAN MESSAGE. Posts carry a MESSAGE response type for both
  // professionals and recruiters, so a professional must be able to open a
  // conversation from a recruiter's post. The role gate that used to live here
  // was correct when messaging only flowed recruiter -> professional.
  //
  // Verification still applies TO RECRUITERS, because that is the side whose
  // identity is being vouched for. A professional needs no verification to
  // reply to a vacancy.
  if (user.role === 'RECRUITER') {
    if (!user.recruiterProfile) {
      return { error: 'Your recruiter profile is not set up yet.' }
    }
    if (!user.recruiterProfile.isVerified) {
      return { error: 'Your recruiter account must be verified to send messages.' }
    }
  }

  const toUserId = String(formData.get('toUserId') || '')
  const workPostId = String(formData.get('workPostId') || '') || null
  const subject = String(formData.get('subject') || '').trim()
  const message = String(formData.get('message') || '').trim()

  // PREMIUM GATE: a PROFESSIONAL must be premium to message/submit to a recruiter.
  if (user.role === 'PROFESSIONAL') {
    const pu = await prisma.user.findUnique({ where: { id: user.id }, select: { premiumUntil: true } })
    if (!isPremiumActive(pu?.premiumUntil)) return { error: 'premium_required' }
  }

  if (!toUserId) return { error: 'Missing recipient.' }
  if (!subject) return { error: 'Subject is required.' }
  if (!message) return { error: 'Message is required.' }
  if (message.length > 4000) return { error: 'Message is too long (max 4000 chars).' }

  if (toUserId === user.id) {
    return { error: 'You cannot contact yourself.' }
  }

  // Recipient preference: enforced here, not just by hiding the button, so the
  // setting cannot be bypassed by calling the action directly.
  const recipientSettings = await prisma.userSettings.findUnique({
    where: { userId: toUserId },
    select: { allowRecruiterMessages: true },
  })
  if (recipientSettings && recipientSettings.allowRecruiterMessages === false) {
    return { error: 'This person is not accepting messages from recruiters right now.' }
  }

  // Rate limit: max N contacts in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentCount = await prisma.contactRequest.count({
    where: { fromUserId: user.id, createdAt: { gte: since } },
  })
  if (recentCount >= DAILY_LIMIT) {
    return { error: `You've reached your daily limit of ${DAILY_LIMIT} messages. Try again tomorrow.` }
  }

  try {
    await prisma.contactRequest.create({
      data: {
        fromUserId: user.id,
        toUserId,
        workPostId: workPostId || undefined,
        subject,
        message,
      },
    })
  } catch (err) {
    console.error('Failed to send contact request:', err)
    return { error: 'Failed to send message. Please try again.' }
  }

  revalidatePath('/messages')
  return { ok: true }
}

export async function replyToContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const contactRequestId = String(formData.get('contactRequestId') || '')
  const body = String(formData.get('body') || '').trim()

  if (!contactRequestId) return { error: 'Missing conversation.' }
  if (!body) return { error: 'Reply cannot be empty.' }
  if (body.length > 4000) return { error: 'Reply is too long (max 4000 chars).' }

  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  })
  if (!contact) return { error: 'Conversation not found.' }

  // Only the sender or recipient can reply
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) {
    return { error: 'You do not have access to this conversation.' }
  }

  try {
    // Un-hide for both parties so neither misses the new reply.
    await prisma.$transaction([
      prisma.contactReply.create({
        data: { contactRequestId, fromUserId: user.id, body },
      }),
      prisma.contactRequest.update({
        where: { id: contactRequestId },
        data: {
          status: 'RESPONDED',
          hiddenForUserIds: [],
        },
      }),
    ])
  } catch (err) {
    console.error('Failed to reply:', err)
    return { error: 'Failed to send reply. Please try again.' }
  }

  revalidatePath('/messages')
  revalidatePath(`/messages/${contactRequestId}`)
  return { ok: true }
}

export async function markContactRead(contactRequestId: string) {
  const user = await getCurrentUser()
  if (!user) return

  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  })
  if (!contact) return
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) return

  const now = new Date()
  const isRecipient = contact.toUserId === user.id

  const data: Record<string, unknown> = isRecipient
    ? { toUserLastReadAt: now }
    : { fromUserLastReadAt: now }

  // Bump status out of PENDING only for the recipient (sender keeps whatever)
  if (isRecipient && contact.status === 'PENDING') {
    data.status = 'READ'
    data.readAt = now
  }

  await prisma.contactRequest.update({
    where: { id: contactRequestId },
    data,
  })
}

export async function hideConversation(contactRequestId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  })
  if (!contact) return { error: 'Conversation not found.' }
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) {
    return { error: 'Access denied.' }
  }

  // Add me to hiddenForUserIds if not already present
  const hidden = new Set(contact.hiddenForUserIds)
  hidden.add(user.id)

  await prisma.contactRequest.update({
    where: { id: contactRequestId },
    data: { hiddenForUserIds: Array.from(hidden) },
  })

  revalidatePath('/messages')
  return { ok: true }
}

export async function deleteReply(replyId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const reply = await prisma.contactReply.findUnique({
    where: { id: replyId },
    include: { contactRequest: true },
  })
  if (!reply) return { error: 'Reply not found.' }

  const contact = reply.contactRequest
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) {
    return { error: 'Access denied.' }
  }

  const ageMs = Date.now() - reply.createdAt.getTime()
  const within5Min = ageMs < 5 * 60 * 1000

  if (within5Min) {
    // Either side can delete within 5 minutes — hard delete
    await prisma.contactReply.delete({ where: { id: replyId } })
  } else {
    // After 5 min — only the author can delete
    if (reply.fromUserId !== user.id) {
      return { error: 'You can only delete your own replies after 5 minutes.' }
    }
    await prisma.contactReply.delete({ where: { id: replyId } })
  }

  revalidatePath(`/messages/${contact.id}`)
  revalidatePath('/messages')
  return { ok: true }
}

export async function deleteInitialMessage(contactRequestId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  })
  if (!contact) return { error: 'Conversation not found.' }
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) {
    return { error: 'Access denied.' }
  }

  const ageMs = Date.now() - contact.createdAt.getTime()
  const within5Min = ageMs < 5 * 60 * 1000

  if (within5Min) {
    // Hard delete the whole conversation from both ends
    await prisma.contactRequest.delete({ where: { id: contactRequestId } })
    revalidatePath('/messages')
    return { ok: true, hardDeleted: true }
  }

  // After 5 min — only the original sender can delete it
  if (contact.fromUserId !== user.id) {
    return { error: 'Only the sender can delete this conversation after 5 minutes.' }
  }

  await prisma.contactRequest.delete({ where: { id: contactRequestId } })
  revalidatePath('/messages')
  return { ok: true, hardDeleted: true }
}
