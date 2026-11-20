'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { PREMIUM_PRICE, PREMIUM_CURRENCY, PREMIUM_PERIOD_DAYS } from '@/lib/premium'

/**
 * Starts a Premium subscription ($2/month, Professionals only).
 *
 * Everything up to the real charge is wired: it refuses non-professionals,
 * creates a PENDING Payment row with the provider set, and would return the
 * provider's checkout URL. The ACTUAL card charge / Stripe session creation is
 * the one missing piece - marked below. Until it is wired, this activates the
 * subscription immediately so the feature can be used and tested.
 */
export async function startPremium() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'PROFESSIONAL') {
    return { error: 'Premium is for professionals only.' }
  }

  // Payment record (audit trail). boostId is unused for subscriptions.
  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: PREMIUM_PRICE,
      currency: PREMIUM_CURRENCY,
      provider: 'STRIPE',
      status: 'PENDING',
    },
  })

  // ---- PAYMENT PROVIDER CALL GOES HERE ----
  // const session = await stripe.checkout.sessions.create({ ... })
  // return redirect(session.url)
  // ---------------------------------------

  // STUB: activate for the period so the feature works end to end today.
  const now = new Date()
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { premiumUntil: true },
  })
  const base =
    current?.premiumUntil && current.premiumUntil.getTime() > now.getTime()
      ? current.premiumUntil
      : now
  const until = new Date(base.getTime() + PREMIUM_PERIOD_DAYS * 864e5)

  await prisma.user.update({
    where: { id: user.id },
    data: { premiumUntil: until },
  })

  revalidatePath('/premium')
  revalidatePath('/profile/visibility')
  redirect('/premium?success=1')
}
