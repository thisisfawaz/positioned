import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordWorkView } from '@/lib/views/record-view'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const views = await recordWorkView(id, user?.id ?? null)
  return NextResponse.json({ views })
}
