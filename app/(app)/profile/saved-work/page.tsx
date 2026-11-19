import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { type GridItem } from '@/components/explore/PostTileGrid'
import { SavedWorkGrid } from '@/components/profile/SavedWorkGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SavedWorkPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const saved = await prisma.savedWork.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      workPost: {
        include: {
          // mediaAssets is REQUIRED here: without it every tile falls back to the
          // gradient placeholder (same silent-break as the feed/profile queries).
          mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
          professional: {
            include: { user: { select: { id: true, name: true, username: true } } },
          },
        },
      },
    },
  })

  // Map saved posts onto the SAME GridItem shape Explore uses, so both grids
  // render identically through PostTileGrid.
  const items: GridItem[] = saved
    .filter(({ workPost }) => workPost)
    .map(({ workPost: post }) => {
      const asset = post.mediaAssets[0]
      const user = post.professional?.user
      return {
        id: post.id,
        postId: post.id,
        userId: user?.id ?? '',
        name: user?.name ?? 'Unknown',
        username: user?.username ?? null,
        title: post.professional?.title ?? null,
        profilePhoto: post.professional?.profilePhoto ?? null,
        // providerAssetId may be a bare LOCAL filename OR a full external URL.
        image: asset
          ? /^https?:\/\//i.test(asset.providerAssetId)
            ? asset.providerAssetId
            : `/uploads/${asset.providerAssetId}`
          : null,
      }
    })

  return (
    <div className="w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-[26px]">Saves</h1>
        <p className="mt-1 text-[14px] text-ink-muted">Work you&apos;ve saved for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[14px] text-ink-subtle">You haven&apos;t saved any work yet.</p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center rounded-xl bg-brand px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Explore work
          </Link>
        </div>
      ) : (
        // Tiles open the SAVES-SCOPED reel (`/profile/saved-work/reels?post=`),
        // so clicking a saved post scrolls through the other SAVED posts, not the
        // author's whole reel or the global feed. SavedWorkGrid (client) also
        // restores scroll on Back so the user lands where they clicked.
        <SavedWorkGrid items={items} />
      )}
    </div>
  )
}
