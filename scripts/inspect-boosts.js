// Prints the state of the boost system so rotation can be OBSERVED.
//
// With one or two boosters, correct rotation looks identical to a permanent
// pin. This script is how you tell the difference: it samples which post each
// viewer would see right now, and shows what has actually been recorded.
//
// Usage: node scripts/inspect-boosts.js

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
    where: {
      status: 'ACTIVE',
      startsAt: { lte: now },
      expiresAt: { gt: now },
    },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      days: true,
      startsAt: true,
      expiresAt: true,
      user: { select: { name: true, email: true } },
      posts: { select: { workPostId: true } },
      _count: { select: { impressions: true } },
    },
  })

  console.log(`active boosts: ${active.length}`)
  console.log(`hour bucket: ${hour}\n`)

  for (const b of active) {
    console.log(
      JSON.stringify(
        {
          id: b.id,
          user: b.user.name,
          email: b.user.email,
          days: b.days,
          endsAt: b.expiresAt.toISOString(),
          posts: b.posts.length,
          impressions: b._count.impressions,
        },
        null,
        2
      )
    )
  }

  if (active.length === 0) {
    console.log('\nNothing is boosted right now. Nothing will be pinned.')
    return
  }

  // Sample viewers to show that assignment varies per person.
  const sampleViewers = Array.from({ length: 8 }, (_, i) => `sample-viewer-${i}`)
  const seen = new Map()

  for (const v of sampleViewers) {
    const idx = pickIndex(v, hour, active.length)
    const boost = active[idx]
    seen.set(boost.id, (seen.get(boost.id) ?? 0) + 1)
  }

  console.log('\nthis hour, 8 sample viewers would be shown:')
  for (const [boostId, count] of seen) {
    const b = active.find((x) => x.id === boostId)
    console.log(`  ${count} viewer(s) -> ${b?.user.name} (${boostId.slice(0, 8)})`)
  }

  if (seen.size === 1 && active.length > 1) {
    console.log(
      '\n  NOTE: all samples landed on one boost this hour. That is possible; ' +
        'run again next hour, or widen the sample, to see the rotation.'
    )
  }

  // Impression breakdown by surface.
  const bySurface = await prisma.boostImpression.groupBy({
    by: ['surface'],
    _count: { _all: true },
  })
  console.log('\nimpressions recorded (all time):')
  for (const row of bySurface) {
    console.log(`  ${row.surface}: ${row._count._all}`)
  }

  const recruiterImpressions = await prisma.boostImpression.count({
    where: { viewerRole: 'RECRUITER' },
  })
  console.log(`  of which seen by recruiters: ${recruiterImpressions}`)
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
