import { cache } from 'react'
import { prisma } from '@/lib/db'

/**
 * Number of conversations with unread content for this user.
 * A conversation is "unread" if:
 *  - I'm the recipient and the initial message hasn't been read (createdAt > toUserLastReadAt), OR
 *  - Any reply from the other side was sent after my last read.
 *  AND the conversation isn't hidden for me.
 */
export const getUnreadContactCount = cache(async (userId: string) => {
  try {
    const conversations = await prisma.contactRequest.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        NOT: { hiddenForUserIds: { has: userId } },
      },
      select: {
        id: true,
        fromUserId: true,
        toUserId: true,
        createdAt: true,
        fromUserLastReadAt: true,
        toUserLastReadAt: true,
        replies: {
          select: { fromUserId: true, createdAt: true },
        },
      },
    })

    let unread = 0

    for (const c of conversations) {
      const isRecipient = c.toUserId === userId
      const isSender = c.fromUserId === userId

      // My last read time for this conversation
      const myLastRead = isRecipient
        ? c.toUserLastReadAt
        : isSender
          ? c.fromUserLastReadAt
          : null

      // Check initial message
      let hasUnread = false

      if (isRecipient) {
        // I'm the recipient — unread if the initial message hasn't been read
        if (!c.toUserLastReadAt) hasUnread = true
      }

      // Check replies from the other side
      for (const r of c.replies) {
        if (r.fromUserId === userId) continue // my own reply — not unread for me
        if (!myLastRead || r.createdAt > myLastRead) {
          hasUnread = true
          break
        }
      }

      if (hasUnread) unread++
    }

    return unread
  } catch (err) {
    console.error('[getUnreadContactCount] error:', err)
    return 0
  }
})

/**
 * Returns a map of contactRequestId -> unread count for this user.
 * Counts: unread initial message (if I'm the recipient) + unread replies from the other side.
 */
export const getUnreadCountByConversation = cache(async (userId: string) => {
  const conversations = await prisma.contactRequest.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    select: {
      id: true,
      fromUserId: true,
      toUserId: true,
      createdAt: true,
      fromUserLastReadAt: true,
      toUserLastReadAt: true,
      replies: {
        select: { fromUserId: true, createdAt: true },
      },
    },
  })

  const map: Record<string, number> = {}

  for (const c of conversations) {
    const isRecipient = c.toUserId === userId
    const isSender = c.fromUserId === userId

    const myLastRead = isRecipient
      ? c.toUserLastReadAt
      : isSender
        ? c.fromUserLastReadAt
        : null

    let count = 0

    // Unread initial message (only counts for the recipient)
    if (isRecipient && !c.toUserLastReadAt) {
      count += 1
    }

    // Unread replies from the other side
    for (const r of c.replies) {
      if (r.fromUserId === userId) continue
      if (!myLastRead || r.createdAt > myLastRead) {
        count += 1
      }
    }

    if (count > 0) map[c.id] = count
  }

  return map
})
