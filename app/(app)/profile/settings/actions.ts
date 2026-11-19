'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { BIO_MAX, ABOUT_MAX } from '@/lib/profile/limits'

export type ProfileFormState = {
  ok?: boolean
  error?: string
}

type ExperienceInput = {
  title: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

/** Parses the hidden JSON field the experience repeater submits. */
function parseExperiences(formData: FormData): ExperienceInput[] {
  try {
    const raw = JSON.parse(String(formData.get('experiences') || '[]'))
    if (!Array.isArray(raw)) return []
    return raw
      .map((e: any) => ({
        title: String(e?.title || '').trim(),
        company: String(e?.company || '').trim(),
        // month input gives YYYY-MM; treat as the first of the month.
        startDate: String(e?.startDate || '').trim(),
        endDate: String(e?.endDate || '').trim(),
        current: Boolean(e?.current),
        description: String(e?.description || '').trim(),
      }))
      // A role without a title or company is not a role.
      .filter((e) => e.title.length > 0 && e.company.length > 0)
  } catch {
    return []
  }
}

function toDate(month: string): Date | null {
  if (!month) return null
  const d = new Date(`${month}-01T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeUrl(input: string): string {
  const t = input.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export async function updateProfessionalProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'PROFESSIONAL' || !user.professionalProfile) {
    return { error: 'Not signed in as a professional.' }
  }

  const name = String(formData.get('name') || '').trim()
  const usernameRaw = String(formData.get('username') || '').trim()
  const username = usernameRaw
    ? usernameRaw.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '')
    : null
  const title = String(formData.get('title') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const availabilityRaw = String(formData.get('availability') || 'OPEN_TO_WORK')
  const skillsRaw = String(formData.get('skills') || '')
  const linkedinUrl = normalizeUrl(String(formData.get('linkedinUrl') || ''))
  const twitterUrl = normalizeUrl(String(formData.get('twitterUrl') || ''))
  const githubUrl = normalizeUrl(String(formData.get('githubUrl') || ''))
  const websiteUrl = normalizeUrl(String(formData.get('websiteUrl') || ''))
  const contactEmail = String(formData.get('contactEmail') || '').trim()
  // Only accept a path this app produced, never an arbitrary URL.
  const photoRaw = String(formData.get('profilePhoto') || '').trim()
  const profilePhoto = /^\/uploads\/[\w.-]+$/.test(photoRaw) ? photoRaw : null
  const experiences = parseExperiences(formData)

  if (!name) {
    return { error: 'Name is required.' }
  }

  // Length limits are ALSO enforced here, not just in the form: a crafted
  // request could skip maxLength, so the DB must never take an overlong value.
  if (title.length > BIO_MAX) {
    return { error: `Bio must be ${BIO_MAX} characters or fewer.` }
  }
  if (bio.length > ABOUT_MAX) {
    return { error: `About must be ${ABOUT_MAX} characters or fewer.` }
  }

  // At least one social link is mandatory
  if (!linkedinUrl && !twitterUrl && !githubUrl && !websiteUrl) {
    return {
      error:
        'At least one social link is required (LinkedIn, X/Twitter, GitHub, or website). This helps recruiters reach you.',
    }
  }

  const skillNames = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { name, username },
      })

      await tx.professionalProfile.update({
        where: { userId: user.id },
        data: {
          title: title || null,
          bio: bio || null,
          location: location || null,
          country: country || null,
          availability: availabilityRaw as any,
          linkedinUrl: linkedinUrl || null,
          twitterUrl: twitterUrl || null,
          githubUrl: githubUrl || null,
          websiteUrl: websiteUrl || null,
          contactEmail: contactEmail || null,
          profilePhoto,
        },
      })

      await tx.professionalSkill.deleteMany({
        where: { professionalId: user.professionalProfile!.id },
      })

      for (const skillName of skillNames) {
        const skill = await tx.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        })
        await tx.professionalSkill.create({
          data: {
            professionalId: user.professionalProfile!.id,
            skillId: skill.id,
          },
        })
      }

      // Replace-all: work history is a small list and nothing references
      // Experience rows by id, so deleting and recreating is simpler than
      // diffing. Rows without a valid start month are dropped.
      await tx.experience.deleteMany({
        where: { professionalId: user.professionalProfile!.id },
      })

      for (const exp of experiences) {
        const startDate = toDate(exp.startDate)
        if (!startDate) continue
        await tx.experience.create({
          data: {
            professionalId: user.professionalProfile!.id,
            title: exp.title,
            company: exp.company,
            startDate,
            endDate: exp.current ? null : toDate(exp.endDate),
            current: exp.current,
            description: exp.description || null,
          },
        })
      }
    })

    revalidatePath('/settings')

    return { ok: true }
  } catch (err) {
    console.error('Failed to update profile:', err)
    return { error: 'Failed to save. Please try again.' }
  }
}

export async function updateRecruiterProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER' || !user.recruiterProfile) {
    return { error: 'Not signed in as a recruiter.' }
  }

  const name = String(formData.get('name') || '').trim()
  const usernameRaw = String(formData.get('username') || '').trim()
  const username = usernameRaw
    ? usernameRaw.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '')
    : null
  const organization = String(formData.get('organization') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const hiringInterests = String(formData.get('hiringInterests') || '').trim()
  // Only accept a path this app produced, never an arbitrary URL.
  const photoRaw = String(formData.get('profilePhoto') || '').trim()
  const profilePhoto = /^\/uploads\/[\w.-]+$/.test(photoRaw) ? photoRaw : null
  const experiences = parseExperiences(formData)
  const statusRaw = String(formData.get('recruitingStatus') || 'CURRENTLY_RECRUITING')
  const recruitingStatus =
    statusRaw === 'NOT_RECRUITING' ? 'NOT_RECRUITING' : 'CURRENTLY_RECRUITING'

  if (!name) {
    return { error: 'Name is required.' }
  }

  if (bio.length > ABOUT_MAX) {
    return { error: `About must be ${ABOUT_MAX} characters or fewer.` }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { name, username },
      })
      await tx.recruiterProfile.update({
        where: { userId: user.id },
        data: {
          organization: organization || null,
          bio: bio || null,
          location: location || null,
          hiringInterests: hiringInterests || null,
          recruitingStatus: recruitingStatus as any,
          profilePhoto,
        },
      })

      // Same replace-all strategy as the professional path.
      await tx.experience.deleteMany({
        where: { recruiterProfileId: user.recruiterProfile!.id },
      })

      for (const exp of experiences) {
        const startDate = toDate(exp.startDate)
        if (!startDate) continue
        await tx.experience.create({
          data: {
            recruiterProfileId: user.recruiterProfile!.id,
            title: exp.title,
            company: exp.company,
            startDate,
            endDate: exp.current ? null : toDate(exp.endDate),
            current: exp.current,
            description: exp.description || null,
          },
        })
      }
    })

    revalidatePath('/settings')

    return { ok: true }
  } catch (err) {
    console.error('Failed to update recruiter profile:', err)
    return { error: 'Failed to save. Please try again.' }
  }
}
