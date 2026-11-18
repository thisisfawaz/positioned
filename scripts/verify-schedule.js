// Verifies the scheduler's arithmetic WITHOUT touching the database.
// Re-implements the pure functions here so the check does not depend on a
// build step, then asserts the properties the product promises.

const HOUR_MS = 60 * 60 * 1000

function hoursPerSurface(days) {
  return Math.floor((days * 24) / 2)
}

function slotOwnedBy(index, participants, hourOffset) {
  if (participants <= 0) return false
  return hourOffset % participants === index % participants
}

function postForTurn(ids, i) {
  if (ids.length === 0) return null
  return ids[i % ids.length]
}

function buildTurns({ startsAt, days, workPostIds, index, participants }) {
  const turns = []
  const totalHours = days * 24
  const perSurface = hoursPerSurface(days)
  let feed = 0
  let explore = 0

  for (let h = 0; h < totalHours; h++) {
    if (!slotOwnedBy(index, participants, h)) continue
    const turnStart = new Date(startsAt.getTime() + h * HOUR_MS)
    const turnEnd = new Date(turnStart.getTime() + HOUR_MS)
    const wantsFeed = feed <= explore

    if (wantsFeed && feed < perSurface) {
      turns.push({ surface: 'FEED', workPostId: postForTurn(workPostIds, feed), startsAt: turnStart, endsAt: turnEnd })
      feed++
    } else if (explore < perSurface) {
      turns.push({ surface: 'EXPLORE', workPostId: null, startsAt: turnStart, endsAt: turnEnd })
      explore++
    } else if (feed < perSurface) {
      turns.push({ surface: 'FEED', workPostId: postForTurn(workPostIds, feed), startsAt: turnStart, endsAt: turnEnd })
      feed++
    }
  }
  return turns
}

const start = new Date('2026-11-07T00:00:00Z')
const results = []

for (const days of [1, 7, 14, 30]) {
  for (const participants of [1, 2, 3, 5]) {
    for (const posts of [[], ['p1'], ['p1', 'p2', 'p3']]) {
      const index = 0
      const turns = buildTurns({
        startsAt: start,
        days,
        workPostIds: posts.length ? posts : ['only'],
        index,
        participants,
      })

      const feed = turns.filter((t) => t.surface === 'FEED').length
      const explore = turns.filter((t) => t.surface === 'EXPLORE').length
      const perSurface = hoursPerSurface(days)

      results.push({
        days,
        participants,
        posts: posts.length || 1,
        feed,
        explore,
        perSurface,
        ok: feed === perSurface && explore === perSurface,
      })
    }
  }
}

const failures = results.filter((r) => !r.ok)

console.log('total scenarios:', results.length)
console.log('failures:', failures.length)
if (failures.length) {
  console.log(JSON.stringify(failures.slice(0, 10), null, 2))
} else {
  const sample = results.filter((r) => r.days === 7 && r.participants === 3)
  console.log('sample (7 days, 3 participants):')
  console.log(JSON.stringify(sample, null, 2))
}

// Additional property: with N participants, each gets ~totalHours / N turns.
const fairness = []
for (const participants of [1, 2, 3, 5]) {
  const totalHours = 7 * 24
  const counts = []
  for (let i = 0; i < participants; i++) {
    let c = 0
    for (let h = 0; h < totalHours; h++) if (slotOwnedBy(i, participants, h)) c++
    counts.push(c)
  }
  fairness.push({ participants, counts, spread: Math.max(...counts) - Math.min(...counts) })
}
console.log('fairness (7 days):')
console.log(JSON.stringify(fairness, null, 2))
