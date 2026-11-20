'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import {
  boostCost,
  meetsDailyFloor,
  minBoostsForDays,
  weightForCredits,
} from '@/lib/pricing/boosts'
import { isKnownCountry } from '@/lib/geo/countries'

export type BoostFormState = {
  ok?: boolean
  error?: string
}

const HOUR_MS = 60 * 60 * 1000

/**
 * Spends boost credits to place a weighted stake on the boosted slot.
 *
 * TWO choices, NOT multiplied:
 *   - boosts - the BUDGET (1 boost = $1); also becomes the share `weight`
 *   - days   - the WINDOW the budget is spread across
 *
 * Cost is the budget. A 7-day and a 30-day run at the same budget cost the same
 * credits; the longer run just gets a thinner per-day share. The only coupling
 * is a FLOOR of 1 boost per day, so a 30-day run needs at least 30 boosts.
 *
 * MULTIPLE BOOSTS MAY RUN AT ONCE. The old "you already have a boost running"
 * refusal was removed deliberately: it is exactly what made spending more
 * boosts in the same period impossible. A new purchase becomes an additional
 * weighted stake alongside any existing one.
 *
 * The deduction and the Boost row are created in ONE transaction - if either
 * fails, neither happens, so credits can never disappear without a boost
 * existing.
 */
export async function startBoost(
  _prevState: BoostFormState,
  formData: FormData
): Promise<BoostFormState> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }
  if (user.role !== 'PROFESSIONAL') {
    return { error: 'Boosting is only available to professional accounts.' }
  }

  const days = Math.round(Number(formData.get('days') || 0))
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return { error: 'Choose how many days the boost should run.' }
  }

  const boosts = Math.round(Number(formData.get('boosts') || 0))
  if (!Number.isInteger(boosts) || boosts < 1) {
    return { error: 'Enter how many boosts to put behind it.' }
  }
  if (boosts > 1000) {
    return { error: 'That is more boosts than can be spent at once.' }
  }

  // Cost = the budget itself. Computed server-side from the raw input so a
  // tampered form cannot claim a cheaper total. Days are NOT a multiplier;
  // they only enforce the 1-boost-per-day floor.
  if (!meetsDailyFloor(boosts, days)) {
    return {
      error: `A ${days}-day boost needs at least ${minBoostsForDays(days)} boosts (1 per day).`,
    }
  }
  const credits = boostCost(boosts, days)
  if (credits < 1) {
    return { error: 'That combination is not valid.' }
  }

  const postIds = formData.getAll('postIds').map((v) => String(v))
  if (postIds.length === 0) {
    return { error: 'Select at least one post to boost.' }
  }

  // Empty = everywhere. Anything else must be a code we actually support, so a
  // tampered form cannot store a country the picker would never offer.
  const targetCountries = formData.getAll('targetCountries').map((v) => String(v))
  if (!targetCountries.every(isKnownCountry)) {
    return { error: 'One of the selected countries is not supported.' }
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { boostCredits: true },
  })
  const balance = current?.boostCredits ?? 0

  if (balance < credits) {
    return {
      error: `That costs ${credits} boosts and you have ${balance}. Buy more boosts to continue.`,
    }
  }

  const now = new Date()
  // Weight comes from the BUDGET (boosts), not from the day count. Days only
  // spread that weight over a longer window.
  const weight = weightForCredits(boosts)

  try {
    await prisma.$transaction(async (tx) => {
      // Guard the deduction against a concurrent spend: only decrement if the
      // balance still covers it.
      const debited = await tx.user.updateMany({
        where: { id: user.id, boostCredits: { gte: credits } },
        data: { boostCredits: { decrement: credits } },
      })
      if (debited.count === 0) {
        throw new Error('INSUFFICIENT_CREDITS')
      }

      await tx.boost.create({
        data: {
          userId: user.id,
          amount: credits,
          currency: 'USD',
          creditsSpent: credits,
          weight,
          days,
          targetCountries,
          startsAt: now,
          expiresAt: new Date(now.getTime() + days * 24 * HOUR_MS),
          posts: { create: postIds.map((workPostId) => ({ workPostId })) },
        },
      })
    })
  } catch (err) {
    console.error('[startBoost] failed:', err)
    if (err instanceof Error && err.message === 'INSUFFICIENT_CREDITS') {
      return { error: 'You do not have enough boosts for this.' }
    }
    return { error: 'Could not start the boost. Please try again.' }
  }

  revalidatePath('/profile/visibility')
  redirect('/profile/visibility')
}

import { isUserPremium as __isUserPremium, PREMIUM_BOOST_SLOTS } from '@/lib/premium'

export async function setPremiumBoostPosts(workPostIds: string[]) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  if (!(await __isUserPremium(user.id))) {
    return { error: 'premium_required' as const }
  }
  const ids = Array.from(new Set(workPostIds)).slice(0, PREMIUM_BOOST_SLOTS)
  if (ids.length === 0) return { error: 'Select at least one post.' }

  const now = new Date()
  const until = (await prisma.user.findUnique({
    where: { id: user.id },
    select: { premiumUntil: true },
  }))!.premiumUntil!

  let boost = await prisma.boost.findFirst({
    where: { userId: user.id, status: 'ACTIVE', expiresAt: { gt: now } },
    select: { id: true },
  })
  if (!boost) {
    boost = await prisma.boost.create({
      data: {
        userId: user.id,
        amount: 0,
        currency: 'USD',
        creditsSpent: 0,
        weight: 1,
        days: Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 864e5)),
        startsAt: now,
        expiresAt: until,
        status: 'ACTIVE',
      },
      select: { id: true },
    })
  }

  const bid = boost.id
  await prisma.$transaction([
    prisma.boostPost.deleteMany({ where: { boostId: bid } }),
    prisma.boostPost.createMany({
      data: ids.map((workPostId) => ({ boostId: bid, workPostId })),
    }),
  ])

  revalidatePath('/profile/visibility')
  return { ok: true as const }
}
