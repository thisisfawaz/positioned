const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'viral41682' },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      professionalProfile: {
        select: { id: true, title: true, bio: true, experiences: true },
      },
      recruiterProfile: {
        select: { id: true, organization: true, bio: true, experiences: true },
      },
    },
  })

  if (!user) {
    console.log('NO USER viral41682')
    return
  }

  const posts = user.professionalProfile
    ? await prisma.workPost.count({
        where: { professionalId: user.professionalProfile.id, status: 'PUBLISHED' },
      })
    : 0

  console.log(
    JSON.stringify(
      {
        name: user.name,
        role: user.role,
        publishedPosts: posts,
        title: user.professionalProfile?.title ?? null,
        bio: user.professionalProfile?.bio ?? null,
        professionalExperiences: user.professionalProfile?.experiences?.length ?? 0,
        recruiterExperiences: user.recruiterProfile?.experiences?.length ?? 0,
      },
      null,
      2
    )
  )
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
