/**
 * Demo posts with REAL photographs, stored LOCALLY.
 *
 * WHY LOCAL FILES AND NOT URLS: this machine's connection to every external
 * image CDN measured 2-3 KB/s (Pexels: 32KB in 13.8s; Cloudinary: 75KB in
 * 22.9s). Hotlinking renders as a wall of empty boxes. Downloading ONCE and
 * serving from /uploads makes the browser read them from localhost.
 *
 * Downloads are skipped if the file already exists, so re-running is cheap.
 *
 * THESE ARE STILL PLACEHOLDERS - stock photos that do not illustrate the post
 * text. Every demo title starts with `[demo]` so it can be removed.
 *
 * USAGE
 *   node scripts/seed-placeholder-posts.js          # download + seed
 *   node scripts/seed-placeholder-posts.js --clean  # remove demo posts + files
 */
const { PrismaClient } = require('@prisma/client')
const fs = require('node:fs/promises')
const path = require('node:path')

const prisma = new PrismaClient()
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const DEMO_TAG = '[demo]'
const PHOTO_PREFIX = 'demo-photo-'

const PEXELS = (id, w = 700) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const DEMO_POSTS = [
  {
    title: 'Redesigning the onboarding experience for a more intuitive user journey',
    caption:
      'Redesigning the onboarding experience for a more intuitive user journey. Three screens became one, and completion went from 41% to 78%.',
    skills: ['Product Design', 'UX'],
    photo: 'demo-photo-1.jpg',
    source: PEXELS(196644),
  },
  {
    title: 'Shipping a design system that cut UI build time in half',
    caption:
      'Six months of consolidating buttons, inputs and spacing into one documented kit. Teams now ship screens without re-deciding the basics.',
    skills: ['Design Systems', 'Figma'],
    photo: 'demo-photo-2.jpg',
    source: PEXELS(326502),
  },
  {
    title: 'A dashboard rebuild that made the numbers readable',
    caption:
      'The old dashboard showed 34 metrics at once. This one shows the four that matter and lets you drill in when you need the rest.',
    skills: ['Data Viz', 'Frontend'],
    photo: 'demo-photo-3.jpg',
    source: PEXELS(590016),
  },
  {
    title: 'Brand refresh for a logistics startup',
    caption:
      'New wordmark, new palette, and a set of templates the team can actually use without a designer in the room.',
    skills: ['Branding', 'Illustration'],
    photo: 'demo-photo-4.jpg',
    source: PEXELS(3184465),
  },
  {
    title: 'Turning a spreadsheet into an internal tool people wanted to use',
    caption:
      'Ops were tracking 200 shipments a week in a spreadsheet. Now it is a small app with validation, search and an audit trail.',
    skills: ['Product', 'Engineering'],
    photo: 'demo-photo-5.jpg',
    source: PEXELS(1181671),
  },
  {
    title: 'Mobile checkout, rebuilt around one tap',
    caption:
      'Cut the four-step checkout to a single confirmation screen. Cart abandonment dropped by a third in the first month.',
    skills: ['Mobile', 'UX'],
    photo: 'demo-photo-6.jpg',
    source: PEXELS(3183150),
  },
]

async function download(url, filename) {
  const dest = path.join(UPLOAD_DIR, filename)

  try {
    const stat = await fs.stat(dest)
    if (stat.size > 1000) {
      console.log(`[download] ${filename} already present (${stat.size} bytes)`)
      return
    }
  } catch {
    // not there yet
  }

  console.log(`[download] fetching ${filename} ...`)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`${filename}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(dest, buf)
  console.log(`[download] ${filename} ${buf.length} bytes`)
}

async function clean() {
  const demoPosts = await prisma.workPost.findMany({
    where: { title: { startsWith: DEMO_TAG } },
    select: { id: true },
  })
  const ids = demoPosts.map((p) => p.id)

  // Children first: relying on the cascade loses the row list, which left
  // orphaned files behind on an earlier attempt.
  await prisma.mediaAsset.deleteMany({ where: { workPostId: { in: ids } } })
  await prisma.workPost.deleteMany({ where: { id: { in: ids } } })

  const assets = await prisma.mediaAsset.findMany({
    where: {
      OR: [
        { providerAssetId: { startsWith: PHOTO_PREFIX } },
        { providerAssetId: { startsWith: 'https://images.pexels.com/' } },
      ],
    },
    select: { id: true, providerAssetId: true },
  })
  await prisma.mediaAsset.deleteMany({ where: { id: { in: assets.map((a) => a.id) } } })

  let removed = 0
  for (const a of assets) {
    if (a.providerAssetId.startsWith('http')) continue
    try {
      await fs.unlink(path.join(UPLOAD_DIR, a.providerAssetId))
      removed++
    } catch {
      /* already gone */
    }
  }

  try {
    const files = await fs.readdir(UPLOAD_DIR)
    for (const f of files) {
      if (f.startsWith(PHOTO_PREFIX)) {
        await fs.unlink(path.join(UPLOAD_DIR, f))
        removed++
      }
    }
  } catch {
    /* no uploads dir */
  }

  console.log(`[clean] removed ${demoPosts.length} demo post(s), ${assets.length} asset row(s), ${removed} file(s).`)
}

async function seed() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  // Download FIRST, so a failure never leaves posts pointing at nothing.
  for (const spec of DEMO_POSTS) {
    await download(spec.source, spec.photo)
  }

  const profiles = await prisma.professionalProfile.findMany({
    select: { id: true, user: { select: { name: true } } },
    take: 6,
  })

  if (profiles.length === 0) {
    console.log('[seed] no professional profiles found.')
    return
  }

  let created = 0
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const spec = DEMO_POSTS[i]
    const profile = profiles[i % profiles.length]

    await prisma.workPost.create({
      data: {
        professionalId: profile.id,
        template: 'PROJECT_SHOWCASE',
        title: `${DEMO_TAG} ${spec.title}`,
        caption: spec.caption,
        skills: spec.skills,
        links: [],
        status: 'PUBLISHED',
        likes: Math.floor(Math.random() * 60) + 4,
        views: Math.floor(Math.random() * 400) + 30,
        createdAt: new Date(Date.now() - (i + 1) * 5 * 60 * 60 * 1000),
        mediaAssets: {
          create: {
            provider: 'LOCAL',
            providerAssetId: spec.photo,
            type: 'IMAGE',
          },
        },
      },
    })

    created++
    console.log(`[seed] ${profile.user.name} -> ${spec.title}`)
  }

  console.log(`[seed] created ${created} demo post(s) with local images.`)
}

async function main() {
  if (process.argv.includes('--clean')) await clean()
  else await seed()
}

main()
  .catch((e) => {
    console.error('[seed] FAILED:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
