import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversationsForUser, getUnreadSummary } from '@/services/queries/messages'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [conversations, unread] = await Promise.all([
    getConversationsForUser(user.id),
    getUnreadSummary(user.id),
  ])

  return NextResponse.json({ conversations, unread })
}
