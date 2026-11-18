import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversationDetail } from '@/services/queries/messages'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversation = await getConversationDetail(id, user.id)
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ conversation })
}
