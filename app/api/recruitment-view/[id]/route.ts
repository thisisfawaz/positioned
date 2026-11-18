import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordRecruitmentView } from '@/lib/views/record-recruitment-view'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const views = await recordRecruitmentView(id, user?.id ?? null)
  return NextResponse.json({ views })
}
