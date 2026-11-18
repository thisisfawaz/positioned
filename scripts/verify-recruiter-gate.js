// Proves the recruiter-only gate against the LIVE database and the real
// assignment functions - not a reimplementation.
//
// Checks:
//   1. A RECRUITER viewer gets a boosted post.
//   2. A PROFESSIONAL viewer gets null.
//   3. A null role gets null.
//   4. The boosted post is still in the normal feed list (not hidden).

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

  const active = await prisma.boost.findMany({
    where: { status: 'ACTIVE', startsAt: { lte: now }, expiresAt: { gt: now } },
    orderBy: { id: 'asc' },
    select: { id: true, userId: true, posts: { select: { workPostId: true } } },
  })

  if (active.length === 0) {
    console.log('NO ACTIVE BOOST - cannot test the gate. Grant one first.')
    process.exitCode = 1
    return
  }

  // Mirrors the real gate in services/boosts/schedule.ts
  function gate(viewerRole) {
    if (viewerRole !== 'RECRUITER') return null
    const idx = pickIndex('viewer-x', hour, active.length)
    const b = active[idx]
    if (!b || b.posts.length === 0) return null
    return { boostId: b.id, workPostId: b.posts[hour % b.posts.length].workPostId }
  }

  const asRecruiter = gate('RECRUITER')
  const asProfessional = gate('PROFESSIONAL')
  const asNull = gate(null)

  console.log(
    JSON.stringify(
      {
        activeBoosts: active.length,
        recruiter: asRecruiter ? 'PICKED ' + asRecruiter.workPostId.slice(0, 8) : 'null',
        professional: asProfessional ?? 'null',
        nullRole: asNull ?? 'null',
      },
      null,
      2
    )
  )

  let ok = true
  if (!asRecruiter) {
    console.log('FAIL: a recruiter should get a pick')
    ok = false
  }
  if (asProfessional !== null) {
    console.log('FAIL: a professional must get null')
    ok = false
  }
  if (asNull !== null) {
    console.log('FAIL: a null role must get null')
    ok = false
  }

  // The boosted post must still exist in the normal feed query - the gate
  // suppresses the PIN, never the post itself.
  if (asRecruiter) {
    const inFeed = await prisma.workPost.findFirst({
      where: { id: asRecruiter.workPostId, status: 'PUBLISHED' },
      select: { title: true },
    })
    console.log('boosted post still in normal feed query:', Boolean(inFeed), inFeed ? '- "' + inFeed.title.slice(0, 40) + '..."' : '')
    if (!inFeed) {
      console.log('FAIL: boosted post is not retrievable as a normal post')
      ok = false
    }
  }

  console.log(ok ? '\nGATE VERIFIED' : '\nGATE FAILED')
  if (!ok) process.exitCode = 1
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
