import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

export default async function ProfileRedirectPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  redirect(`/${user.username || user.id}`)
}
