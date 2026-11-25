'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { deleteStoredAsset } from '@/lib/storage/cloudinary'

export type RecruitmentFormState = {
  ok?: boolean
  error?: string
  /**
   * Echoed back on failure so the form can repopulate.
   *
   * Uncontrolled inputs are RESET by React after every server action, success
   * or failure - so returning a bare error used to wipe everything the user
   * typed into a long form.
   */
  values?: Record<string, string>
}

/** Snapshot of every text field, for repopulating the form after a failure. */
function rawValues(formData: FormData): Record<string, string> {
  const keys = [
    'title',
    'organization',
    'location',
    'country',
    'employmentType',
    'description',
    'responsibilities',
    'requirements',
    'salaryRange',
    'applyInstructions',
    'applyUrl',
    'imageUrl',
    'videoUrl',
    'closingDate',
  ]
  const out: Record<string, string> = {}
  for (const k of keys) out[k] = String(formData.get(k) || '')
  return out
}

function extract(formData: FormData) {
  return {
    title: String(formData.get('title') || '').trim(),
    organization: String(formData.get('organization') || '').trim(),
    location: String(formData.get('location') || '').trim(),
    country: String(formData.get('country') || '').trim(),
    employmentType: String(formData.get('employmentType') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    responsibilities: String(formData.get('responsibilities') || '').trim(),
    requirements: String(formData.get('requirements') || '').trim(),
    salaryRange: String(formData.get('salaryRange') || '').trim(),
    salaryHidden: String(formData.get('salaryHidden') || '') === 'true',
    applyMethod: String(formData.get('applyMethod') || 'LINK').trim(),
    applyInstructions: String(formData.get('applyInstructions') || '').trim(),
    applyUrl: String(formData.get('applyUrl') || '').trim(),
    closingDateRaw: String(formData.get('closingDate') || '').trim(),
    imageUrl: String(formData.get('imageUrl') || '').trim(),
    videoUrl: String(formData.get('videoUrl') || '').trim(),
  }
}

export async function createRecruitment(
  _prevState: RecruitmentFormState,
  formData: FormData
): Promise<RecruitmentFormState> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    return {
      error: 'You must be signed in as a recruiter to post a role.',
      values: rawValues(formData),
    }
  }

  const d = extract(formData)
  if (!d.title) {
    return { error: 'Job title is required.', values: rawValues(formData) }
  }

  let createdId: string
  try {
    const created = await prisma.recruitment.create({
      data: {
        recruiterId: user.id,
        title: d.title,
        organization: d.organization || null,
        location: d.location || null,
        country: d.country || null,
        employmentType: d.employmentType || null,
        description: d.description || null,
        responsibilities: d.responsibilities || null,
        requirements: d.requirements || null,
        salaryRange: d.salaryHidden ? null : d.salaryRange || null,
        salaryHidden: d.salaryHidden,
        applyMethod: d.applyMethod || 'LINK',
        applyInstructions: d.applyInstructions || null,
        applyUrl: d.applyUrl || null,
        // Media: an image OR a YouTube link, never both. Exactly one wins,
        // matching the professional composer's rule.
        imageUrl: d.imageUrl || null,
        videoUrl: d.videoUrl || null,
        mediaType: d.imageUrl ? 'IMAGE' : d.videoUrl ? 'YOUTUBE' : null,
        closingDate: d.closingDateRaw ? new Date(d.closingDateRaw) : null,
      },
    })
    createdId = created.id
  } catch (err) {
    console.error('Failed to create recruitment:', err)
    return {
      error: 'Failed to publish. Please try again.',
      values: rawValues(formData),
    }
  }

  revalidatePath('/recruitments')
  revalidatePath('/profile/recruitments')
  redirect(`/recruitments/${createdId}`)
}

export type TeamRole = {
  title: string
  description: string
  employmentType?: string
  salaryRange?: string
  salaryHidden?: boolean
}

/**
 * Creates one Recruitment row per role in a team posting.
 * Shared fields come from the common inputs; each role supplies its own title
 * and short description. Roles are created together so a partial failure does
 * not leave a half-published team.
 */
export async function createTeamRoles(
  _prevState: RecruitmentFormState,
  formData: FormData
): Promise<RecruitmentFormState> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    return { error: 'You must be signed in as a recruiter to post roles.' }
  }

  const d = extract(formData)

  let roles: TeamRole[] = []
  try {
    roles = JSON.parse(String(formData.get('teamRoles') || '[]'))
  } catch {
    return { error: 'Could not read the roles. Please try again.' }
  }

  roles = roles
    .map((r) => ({
      title: String(r.title || '').trim(),
      description: String(r.description || '').trim(),
      employmentType: String(r.employmentType || '').trim(),
      salaryRange: String(r.salaryRange || '').trim(),
      salaryHidden: Boolean(r.salaryHidden),
    }))
    .filter((r) => r.title.length > 0)

  if (roles.length === 0) {
    return { error: 'Add at least one role with a title.' }
  }

  let firstId: string
  try {
    const created = await prisma.$transaction(
      roles.map((role) =>
        prisma.recruitment.create({
          data: {
            recruiterId: user.id,
            title: role.title,
            organization: d.organization || null,
            location: d.location || null,
            country: d.country || null,
            // Per role: each role carries its own employment type and salary.
            employmentType: role.employmentType || null,
            description: role.description || null,
            salaryRange: role.salaryHidden ? null : role.salaryRange || null,
            salaryHidden: role.salaryHidden ?? false,
            applyMethod: d.applyMethod || 'LINK',
            applyInstructions: d.applyInstructions || null,
            applyUrl: d.applyUrl || null,
            closingDate: d.closingDateRaw ? new Date(d.closingDateRaw) : null,
          },
        })
      )
    )
    firstId = created[0].id
  } catch (err) {
    console.error('Failed to create team roles:', err)
    return { error: 'Failed to publish. Please try again.' }
  }

  revalidatePath('/recruitments')
  revalidatePath('/profile/recruitments')
  redirect(`/recruitments/${firstId}`)
}

export async function updateRecruitment(
  _prevState: RecruitmentFormState,
  formData: FormData
): Promise<RecruitmentFormState> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    return { error: 'Not signed in as a recruiter.' }
  }

  const id = String(formData.get('id') || '')
  if (!id) {
    return { error: 'Missing recruitment ID.', values: rawValues(formData) }
  }

  const existing = await prisma.recruitment.findUnique({ where: { id } })
  if (!existing || existing.recruiterId !== user.id) {
    return { error: 'You can only edit your own postings.', values: rawValues(formData) }
  }

  const d = extract(formData)
  if (!d.title) {
    return { error: 'Job title is required.', values: rawValues(formData) }
  }

  try {
    await prisma.recruitment.update({
      where: { id },
      data: {
        title: d.title,
        organization: d.organization || null,
        location: d.location || null,
        country: d.country || null,
        employmentType: d.employmentType || null,
        description: d.description || null,
        responsibilities: d.responsibilities || null,
        requirements: d.requirements || null,
        salaryRange: d.salaryHidden ? null : d.salaryRange || null,
        salaryHidden: d.salaryHidden,
        applyMethod: d.applyMethod || 'LINK',
        applyInstructions: d.applyInstructions || null,
        applyUrl: d.applyUrl || null,
        closingDate: d.closingDateRaw ? new Date(d.closingDateRaw) : null,
      },
    })
  } catch (err) {
    console.error('Failed to update recruitment:', err)
    return {
      error: 'Failed to save. Please try again.',
      values: rawValues(formData),
    }
  }

  revalidatePath('/recruitments')
  revalidatePath(`/recruitments/${id}`)
  redirect(`/recruitments/${id}`)
}

export async function deleteRecruitment(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') return

  const id = String(formData.get('id') || '')
  if (!id) return

  const existing = await prisma.recruitment.findUnique({ where: { id } })
  if (!existing || existing.recruiterId !== user.id) return

  await prisma.recruitment.delete({ where: { id } })

  // Best-effort Cloudinary cleanup for the role's image (videoUrl is a YouTube
  // embed, which parseCloudinaryUrl ignores). Runs after the row is gone so a
  // storage hiccup cannot fail the delete.
  await deleteStoredAsset(existing.imageUrl)

  revalidatePath('/recruitments')
  revalidatePath('/profile/recruitments')
  redirect('/profile/recruitments')
}
