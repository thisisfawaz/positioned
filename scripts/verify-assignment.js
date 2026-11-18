// Verifies the per-viewer assignment is fair and deterministic.

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

const HOURS = 168 // one week
const VIEWERS = 500

for (const count of [1, 2, 3, 5, 10]) {
  const totals = new Array(count).fill(0)

  for (let v = 0; v < VIEWERS; v++) {
    const viewerId = `user-${v}`
    for (let h = 0; h < HOURS; h++) {
      totals[pickIndex(viewerId, h, count)]++
    }
  }

  const expected = (VIEWERS * HOURS) / count
  const deviations = totals.map((t) => ((t - expected) / expected) * 100)
  const worst = Math.max(...deviations.map(Math.abs))

  console.log(
    JSON.stringify({
      participants: count,
      totals,
      expected: Math.round(expected),
      worstDeviationPct: Number(worst.toFixed(2)),
    })
  )
}

// Determinism: the same viewer+hour must always give the same answer.
const a = pickIndex('user-42', 12345, 7)
const b = pickIndex('user-42', 12345, 7)
console.log('deterministic:', a === b, `(${a})`)

// Variety: a single viewer should not be stuck on one booster all week.
const seq = new Set()
for (let h = 0; h < HOURS; h++) seq.add(pickIndex('user-42', h, 4))
console.log('distinct boosters seen by one viewer over a week:', seq.size, 'of 4')

// Two different viewers should be able to see different boosters in the same hour.
const sameHour = [0, 1, 2, 3, 4].map((v) => pickIndex(`user-${v}`, 999, 5))
console.log('same hour, different viewers:', JSON.stringify(sameHour))
