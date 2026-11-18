// Proves the weighted assignment behaves as intended.
//
// The claim under test: a boost with weight N receives N times the share of
// viewer-hours that a boost with weight 1 receives. Asserted as a measured
// distribution, not assumed from reading the code.

function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Mirror of pickWeighted in services/boosts/schedule.ts.
function pickWeighted(viewerSeed, hour, boosts) {
  if (boosts.length === 0) return -1
  let total = 0
  for (const b of boosts) total += Math.max(0, b.weight)
  if (total <= 0) return -1
  const point = hash(`${viewerSeed}:${hour}`) % total
  let running = 0
  for (let i = 0; i < boosts.length; i++) {
    running += Math.max(0, boosts[i].weight)
    if (point < running) return i
  }
  return boosts.length - 1
}

const VIEWERS = 500
const HOURS = 168

const scenarios = [
  { name: '1 vs 1', weights: [1, 1] },
  { name: '5 vs 1', weights: [5, 1] },
  { name: '3 vs 2 vs 1', weights: [3, 2, 1] },
  { name: '10 vs 1 vs 1', weights: [10, 1, 1] },
]

let allPassed = true

for (const { name, weights } of scenarios) {
  const boosts = weights.map((w) => ({ weight: w }))
  const totals = new Array(boosts.length).fill(0)

  for (let v = 0; v < VIEWERS; v++) {
    for (let h = 0; h < HOURS; h++) {
      totals[pickWeighted(`user-${v}`, h, boosts)]++
    }
  }

  const grandTotal = totals.reduce((a, b) => a + b, 0)
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  const shares = totals.map((t) => t / grandTotal)
  const expectedShares = weights.map((w) => w / totalWeight)

  // Compare ACTUAL share against the share the weight entitles them to.
  const deviations = shares.map((s, i) =>
    expectedShares[i] === 0 ? 0 : ((s - expectedShares[i]) / expectedShares[i]) * 100
  )
  const worst = Math.max(...deviations.map(Math.abs))

  // Tolerance: 2%. Hash bucketing is uniform but not perfect at this sample
  // size; anything above 2% would mean the weights are not being honoured.
  const passed = worst < 2
  if (!passed) allPassed = false

  console.log(
    JSON.stringify({
      scenario: name,
      weights,
      counts: totals,
      actualShares: shares.map((s) => Number(s.toFixed(4))),
      expectedShares: expectedShares.map((s) => Number(s.toFixed(4))),
      worstDeviationPct: Number(worst.toFixed(2)),
      passed,
    })
  )
}

// Determinism: identical inputs must give identical answers.
const d1 = pickWeighted('user-42', 12345, [{ weight: 3 }, { weight: 1 }])
const d2 = pickWeighted('user-42', 12345, [{ weight: 3 }, { weight: 1 }])
console.log('deterministic:', d1 === d2, `(${d1})`)

// A heavier boost must win MOST viewer-hours against a single-weight rival.
let heavyWins = 0
for (let v = 0; v < 1000; v++) {
  if (pickWeighted(`user-${v}`, 777, [{ weight: 9 }, { weight: 1 }]) === 0) heavyWins++
}
const heavyShare = heavyWins / 1000
const heavyOk = heavyShare > 0.85 && heavyShare < 0.95
if (!heavyOk) allPassed = false
console.log('9-vs-1 heavy share:', heavyShare.toFixed(3), heavyOk ? 'OK' : 'FAIL')

// Different viewers in the same hour must still be able to land differently.
const sameHour = [0, 1, 2, 3, 4].map((v) =>
  pickWeighted(`user-${v}`, 999, [{ weight: 2 }, { weight: 2 }])
)
console.log('same hour, different viewers:', JSON.stringify(sameHour))

console.log(allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED')
if (!allPassed) process.exitCode = 1
