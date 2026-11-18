import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUnreadSummary } from '@/services/queries/messages'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ totalUnread: 0, byConversation: {} })

  const unread = await getUnreadSummary(user.id)
  return NextResponse.json(unread)
}
