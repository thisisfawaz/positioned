import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ListRow } from '@/components/contact/ListRow'

export const dynamic = 'force-dynamic'

export default async function ListPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          professionalProfile: { select: { title: true, profilePhoto: true } },
          recruiterProfile: { select: { organization: true } },
        },
      },
    },
  })

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <h1 className="text-[26px] font-bold tracking-tight text-ink">My list</h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          People whose work you want to keep up with.
        </p>
      </div>

      {follows.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[14px] text-ink-subtle">
            Your list is empty. Open a profile and &quot;Add to list&quot; to collect
            the people whose posts you want to keep up with.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center rounded-xl bg-brand px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Find others
          </Link>
        </div>
      ) : (
        <ul className="space-y-1">
          {follows.map((f) => {
            const p = f.following
            const handle = p.username || p.id
            const subtitle =
              p.professionalProfile?.title ||
              p.recruiterProfile?.organization ||
              ''

            return (
              <ListRow
                key={f.id}
                userId={p.id}
                handle={handle}
                name={p.name}
                username={p.username}
                subtitle={subtitle}
                photo={p.professionalProfile?.profilePhoto ?? null}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
