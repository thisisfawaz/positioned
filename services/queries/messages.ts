import { prisma } from '@/lib/db'

async function getUser() {
  return null as any // placeholder, unused
}

export async function getConversationsForUser(userId: string) {
  const conversations = await prisma.contactRequest.findMany({
    where: {
      AND: [
        { OR: [{ fromUserId: userId }, { toUserId: userId }] },
        { NOT: { hiddenForUserIds: { has: userId } } },
      ],
    },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
      replies: { select: { fromUserId: true, createdAt: true } },
      _count: { select: { replies: true } },
    },
    // NOTE: do not order by updatedAt. It is Prisma's @updatedAt and bumps on
    // ANY row write, including the read-marker - opening a thread would
    // reorder the inbox. Sorting happens below on real message activity.
    orderBy: { createdAt: 'desc' },
  })

  const items = conversations.map((c) => {
    const isRecipient = c.toUserId === userId
    const isSender = c.fromUserId === userId
    const myLastRead = isRecipient
      ? c.toUserLastReadAt
      : isSender
        ? c.fromUserLastReadAt
        : null

    let unreadCount = 0
    if (isRecipient && !c.toUserLastReadAt) unreadCount += 1

    for (const r of c.replies) {
      if (r.fromUserId === userId) continue
      if (!myLastRead || r.createdAt > myLastRead) unreadCount += 1
    }

    const other = isSender ? c.toUser : c.fromUser

    // Last activity = the newest thing actually SENT in this thread. Reading a
    // conversation changes toUserLastReadAt / status, which bumps updatedAt,
    // so updatedAt must not be used for display or ordering.
    const lastReplyAt = c.replies.length
      ? new Date(
          Math.max(...c.replies.map((r) => new Date(r.createdAt).getTime()))
        )
      : null
    const lastActivityAt =
      lastReplyAt && lastReplyAt > c.createdAt ? lastReplyAt : c.createdAt

    return {
      id: c.id,
      subject: c.subject,
      messagePreview: c.message.slice(0, 120),
      lastActivityAt: lastActivityAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      otherName: other.name,
      otherId: other.id,
      isSender,
      replyCount: c._count.replies,
      unreadCount,
    }
  })

  // Newest real activity first. Reading a thread must not move it.
  return items.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  )
}

export type ConversationListItem = Awaited<
  ReturnType<typeof getConversationsForUser>
>[number]

export async function getConversationDetail(id: string, userId: string) {
  const contact = await prisma.contactRequest.findUnique({
    where: { id },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
      replies: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!contact) return null
  if (contact.fromUserId !== userId && contact.toUserId !== userId) return null

  const isRecipient = contact.toUserId === userId
  const isSender = contact.fromUserId === userId
  const myLastRead = isRecipient
    ? contact.toUserLastReadAt
    : isSender
      ? contact.fromUserLastReadAt
      : null

  const other = isSender ? contact.toUser : contact.fromUser

  const items = [
    {
      id: 'initial',
      fromUserId: contact.fromUserId,
      fromName: contact.fromUser.name,
      isMine: contact.fromUserId === userId,
      body: contact.message,
      createdAt: contact.createdAt.toISOString(),
    },
    ...contact.replies.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      fromName:
        r.fromUserId === contact.fromUser.id
          ? contact.fromUser.name
          : contact.toUser.name,
      isMine: r.fromUserId === userId,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  ]

  return {
    id: contact.id,
    subject: contact.subject,
    otherName: other.name,
    items,
    myLastRead: myLastRead ? myLastRead.toISOString() : null,
    isRecipient,
  }
}

export type ConversationDetail = NonNullable<
  Awaited<ReturnType<typeof getConversationDetail>>
>

export async function getUnreadSummary(userId: string) {
  const conversations = await prisma.contactRequest.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
      NOT: { hiddenForUserIds: { has: userId } },
    },
    select: {
      id: true,
      fromUserId: true,
      toUserId: true,
      fromUserLastReadAt: true,
      toUserLastReadAt: true,
      replies: { select: { fromUserId: true, createdAt: true } },
    },
  })

  let totalUnread = 0
  const byConversation: Record<string, number> = {}

  for (const c of conversations) {
    const isRecipient = c.toUserId === userId
    const isSender = c.fromUserId === userId
    const myLastRead = isRecipient
      ? c.toUserLastReadAt
      : isSender
        ? c.fromUserLastReadAt
        : null

    let count = 0
    if (isRecipient && !c.toUserLastReadAt) count += 1
    for (const r of c.replies) {
      if (r.fromUserId === userId) continue
      if (!myLastRead || r.createdAt > myLastRead) count += 1
    }

    if (count > 0) {
      totalUnread += count
      byConversation[c.id] = count
    }
  }

  return { totalUnread, byConversation }
}
