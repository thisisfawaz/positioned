import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { isPremiumActive, PREMIUM_BOOST_SLOTS } from '@/lib/premium'
import { GoPremiumButton } from './GoPremiumButton'

export const dynamic = 'force-dynamic'

export default async function PremiumPage() {
  const user = await getCurrentUser()
  const premium = user
    ? isPremiumActive(
        (await prisma.user.findUnique({ where: { id: user.id }, select: { premiumUntil: true } }))?.premiumUntil
      )
    : false

  const features = [
    'Message recruiters directly',
    'Submit your work as a response to recruiter posts',
    `Boost ${PREMIUM_BOOST_SLOTS} of your best posts every month — rotate them anytime`,
  ]

  return (
    <div className="w-full px-3 pb-8 pt-2 sm:px-4 lg:pt-6">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[22px] font-bold text-ink sm:text-[26px]">Positioned Premium</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Everything you need to get in front of recruiters. $2/month.
        </p>

        <div className="card mt-5 p-5">
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[14px] text-ink">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-light text-[12px] text-brand">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-5">
            {user?.role === 'PROFESSIONAL' ? (
              <GoPremiumButton premium={premium} />
            ) : (
              <p className="text-[13px] text-ink-subtle">Premium is available for professional accounts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
