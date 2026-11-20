import { prisma } from '@/lib/db'

export const PREMIUM_PRICE = 2
export const PREMIUM_CURRENCY = 'USD'
export const PREMIUM_PERIOD_DAYS = 30
export const PREMIUM_BOOST_SLOTS = 4

export function isPremiumActive(premiumUntil: Date | null | undefined): boolean {
  return Boolean(premiumUntil && premiumUntil.getTime() > Date.now())
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { premiumUntil: true },
  })
  return isPremiumActive(u?.premiumUntil)
}
