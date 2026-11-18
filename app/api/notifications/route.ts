import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Notification = {
  id: string
  kind: 'message' | 'like' | 'document_request'
  actorName: string
  text: string
  href: string
  createdAt: string
  unread: boolean
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user: sbUser },
  } = await supabase.auth.getUser()

  if (!sbUser) {
    return NextResponse.json({ notifications: [], totalUnread: 0 })
  }

  const me = await prisma.user.findUnique({
    where: { id: sbUser.id },
    include: { professionalProfile: true },
  })

  if (!me) {
    return NextResponse.json({ notifications: [], totalUnread: 0 })
  }

  const notifications: Notification[] = []

  // Unread inbound messages
  const conversations = await prisma.contactRequest.findMany({
    where: {
      AND: [
        { toUserId: me.id },
        { NOT: { hiddenForUserIds: { has: me.id } } },
      ],
    },
    include: { fromUser: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  for (const c of conversations) {
    const isUnread = !c.toUserLastReadAt || c.updatedAt > c.toUserLastReadAt
    if (!isUnread) continue

    notifications.push({
      id: `msg-${c.id}`,
      kind: 'message',
      actorName: c.fromUser.name,
      text: c.subject,
      href: `/messages/${c.id}`,
      createdAt: (c.updatedAt ?? c.createdAt).toISOString(),
      unread: true,
    })
  }

  // PENDING document requests addressed to me.
  //
  // This is the notification the CTA produces: someone clicked Request CV /
  // Portfolio / both on one of my posts, and I owe them the links. It is
  // DERIVED from the DocumentRequest row exactly like messages and likes - no
  // notifications table exists, and adding one just for this would be a second
  // source of truth for the same list.
  //
  // Only PENDING is unread. Fulfilling it is what clears the notification; the
  // row itself stays so the requester keeps their links.
  const documentRequests = await prisma.documentRequest.findMany({
    where: { ownerId: me.id, status: 'PENDING' },
    include: {
      requester: { select: { name: true } },
      post: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const askLabel: Record<string, string> = {
    CV: 'your CV',
    PORTFOLIO: 'your portfolio',
    CV_AND_PORTFOLIO: 'your CV and portfolio',
  }

  for (const r of documentRequests) {
    notifications.push({
      id: `docreq-${r.id}`,
      kind: 'document_request',
      actorName: r.requester?.name ?? 'Someone',
      text: `requested ${askLabel[r.response] ?? 'your documents'} - ${r.post.title}`,
      href: `/requests/${r.id}`,
      createdAt: r.createdAt.toISOString(),
      unread: true,
    })
  }

  // Likes on my posts
  if (me.professionalProfile) {
    const likes = await prisma.like.findMany({
      where: {
        workPost: { professionalId: me.professionalProfile.id },
        userId: { not: me.id },
      },
      include: {
        user: { select: { name: true } },
        workPost: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    for (const like of likes) {
      notifications.push({
        id: `like-${like.id}`,
        kind: 'like',
        actorName: like.user.name,
        text: like.workPost.title,
        href: `/profile/work/${like.workPost.id}`,
        createdAt: like.createdAt.toISOString(),
        unread: false,
      })
    }
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({
    notifications,
    totalUnread: notifications.filter((n) => n.unread).length,
  })
}
