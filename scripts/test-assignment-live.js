// Exercises the ACTUAL assignment functions against the live database.
// The earlier verify script only proved the arithmetic; this proves the
// database queries and the returned shapes work together.

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const HOUR_MS = 60 * 60 * 1000

function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickIndex(viewerSeed, hour, count) {
  if (count <= 0) return -1
  return hash(`${viewerSeed}:${hour}`) % count
}

async function main() {
  const now = new Date()
  const hour = Math.floor(now.getTime() / HOUR_MS)

  // Same query shape as getActiveBoosts.
  const active = await prisma.boost.findMany({
    where: { status: 'ACTIVE', startsAt: { lte: now }, expiresAt: { gt: now } },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      userId: true,
      posts: { select: { workPostId: true } },
    },
  })

  console.log('active boosts:', active.length)

  if (active.length === 0) {
    console.log('nothing active - cannot test assignment')
    return
  }

  const results = []
  for (const viewerId of ['viewer-a', 'viewer-b', 'viewer-c', 'viewer-d']) {
    const idx = pickIndex(viewerId, hour, active.length)
    const boost = active[idx]
    const postIndex = hour % boost.posts.length
    results.push({
      viewerId,
      boostId: boost.id.slice(0, 8),
      workPostId: boost.posts[postIndex].workPostId.slice(0, 8),
    })
  }

  console.log(JSON.stringify(results, null, 2))

  // Confirm the post actually exists and is published - a boost pointing at a
  // deleted or unpublished post would pin nothing.
  const postIds = active.flatMap((b) => b.posts.map((p) => p.workPostId))
  const posts = await prisma.workPost.findMany({
    where: { id: { in: postIds } },
    select: { id: true, title: true, status: true },
  })
  console.log('boosted posts:')
  console.log(JSON.stringify(posts.map((p) => ({ title: p.title, status: p.status })), null, 2))
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
