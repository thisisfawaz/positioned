import 'server-only'
import { prisma } from '@/lib/db'
import { isPremiumActive } from '@/lib/premium'

export async function isUserPremium(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { premiumUntil: true },
  })
  return isPremiumActive(u?.premiumUntil)
}
