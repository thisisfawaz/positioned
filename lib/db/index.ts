import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions for common database operations
export async function getProfessionalProfile(userId: string) {
  return prisma.professionalProfile.findUnique({
    where: { userId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      experiences: true,
      workPosts: {
        include: {
          mediaAssets: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function getRecruiterProfile(userId: string) {
  return prisma.recruiterProfile.findUnique({
    where: { userId },
  })
}

export async function getWorkPost(id: string) {
  return prisma.workPost.findUnique({
    where: { id },
    include: {
      professional: {
        include: {
          user: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      mediaAssets: true,
    },
  })
}

export async function getWorkPosts(filters?: {
  category?: string
  skills?: string[]
  availability?: string
  status?: string
}) {
  const where: any = {}
  
  if (filters?.status) {
    where.status = filters.status
  }
  
  // TODO: Add more filter logic
  
  return prisma.workPost.findMany({
    where,
    include: {
      professional: {
        include: {
          user: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      mediaAssets: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getVisibilityAnalytics(workPostId: string) {
  const workPost = await prisma.workPost.findUnique({
    where: { id: workPostId },
    select: {
      views: true,
      recruiterViews: true,
      saves: true,
      boosted: true,
    },
  })
  
  if (!workPost) return null
  
  return {
    totalViews: workPost.views,
    recruiterViews: workPost.recruiterViews,
    professionalViews: workPost.views - workPost.recruiterViews,
    saves: workPost.saves,
    profileVisits: 0, // TODO: Track this
    contacts: 0, // TODO: Track this
    boostGeneratedViews: workPost.boosted ? workPost.views : 0,
  }
}
