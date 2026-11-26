import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getVisibilityAnalytics } from '@/services/queries/analytics'
import { WorkPerformanceList } from '@/components/profile/WorkPerformanceList'
import { PremiumBoostForm } from '@/components/profile/PremiumBoostForm'
import { isPremiumActive } from '@/lib/premium'

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl bg-surface-sunken p-4 sm:p-5">
      <div className="text-[13px] text-ink-subtle">{label}</div>
      <div className="mt-1 text-xl font-bold leading-8">{value}</div>
      {hint && <div className="mt-1 text-[12px] text-ink-subtle">{hint}</div>}
    </div>
  )
}

export default async function VisibilityPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const analytics = await getVisibilityAnalytics(user.id)
  // Boost costs are priced in CREDITS, not money. Currency is deliberately not
  // resolved here - see lib/pricing/boosts.ts. Money only enters the picture
  // when credits are bought, which is not built yet.
  const premium = isPremiumActive((user as any).premiumUntil)
  const selectedBoostIds = analytics?.activeBoost?.posts.map((p) => p.id) ?? []

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Visibility</h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              How much attention your work is getting.
            </p>
          </div>

        {/*
          Buying credits lives HERE, at the top of the page, not on the boost
          form - the form spends credits, this buys them. Opens the pricing
          popup; the popup is real even though checkout is not wired yet.
        */}
        </div>
      </div>

      {!analytics ? (
        <div className="rounded-xl bg-surface-sunken p-12 text-center">
          <p className="text-[15px] font-semibold text-ink">No professional profile</p>
          <p className="mt-1 text-[14px] text-ink-muted">
            Visibility stats appear once you have published work.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:gap-3 lg:grid-cols-4">
            <Stat label="Total views" value={analytics.totals.views} hint="All time" />
            <Stat
              label="Recruiter views"
              value={analytics.totals.recruiterViews}
              hint="From verified recruiters"
            />
            <Stat
              label="Seen by recruiters"
              value={analytics.totals.seenByRecruiters}
              hint="Through boosts"
            />
            <Stat label="Likes" value={analytics.totals.likes} />
          </div>

          <section className="mb-3 rounded-xl bg-surface-sunken p-4 sm:mb-4 sm:p-5">
            <h2 className="mb-4 text-[15px] font-bold text-ink">Work performance</h2>
            <WorkPerformanceList rows={analytics.perPost} />
          </section>

          {/* overflow-hidden: the country dropdown inside BoostForm is an
              absolutely-positioned panel. Without clipping here it escapes the
              card and floats over the page below. Clipping keeps it inside the
              Boost Visibility frame, which is the intended look. The trade-off
              is that the list is cut off at the card edge rather than being
              able to spill - acceptable, and better than a panel hanging over
              unrelated content. */}
          <section className="overflow-hidden rounded-xl bg-surface-sunken p-4 sm:p-5">
            <h2 className="text-[15px] font-bold text-ink">Boost Visibility</h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Put your work in front of recruiters - at the top of their feed and in
              Explore. Professionals already see your work by you posting; a boost
              reaches the audience you cannot reach organically.
            </p>

            <div className="mt-4">
              <PremiumBoostForm
                posts={analytics.perPost.filter((p) => p.status === 'PUBLISHED').map((p) => ({ id: p.id, title: p.title, image: p.image }))}
                selected={selectedBoostIds}
                premium={premium}
              />
            </div>

          </section>
        </>
      )}
    </div>
  )
}
