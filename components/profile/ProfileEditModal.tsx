'use client'

import { Modal } from '@/components/ui/Modal'
import { useUser } from '@/lib/client/use-user'
import { ProfessionalSettingsForm } from '@/components/settings/ProfessionalSettingsForm'
import { RecruiterSettingsForm } from '@/components/settings/RecruiterSettingsForm'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Profile editing as a popup.
 *
 * Reuses the existing settings forms verbatim - no form logic is duplicated.
 * Values come from useUser(), which reads /api/me, so reopening the modal after
 * a save shows the newly saved data. The form is keyed on the saved values so
 * it remounts (and therefore re-reads defaultValue) whenever they change.
 */
export function ProfileEditModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user } = useUser()

  const key = user
    ? `${user.id}-${user.name}-${user.username ?? ''}-${user.professionalProfile?.title ?? ''}-${user.recruiterProfile?.organization ?? ''}`
    : 'loading'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      ariaLabel="Edit profile"
      maxWidth="max-w-[720px]"
      fullScreenOnMobile
    >
      {!user ? (
        <div className="space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
      ) : user.role === 'PROFESSIONAL' && user.professionalProfile ? (
        <ProfessionalSettingsForm
          key={key}
          username={user.username || ''}
          name={user.name}
          title={user.professionalProfile.title || ''}
          bio={user.professionalProfile.bio || ''}
          location={user.professionalProfile.location || ''}
          country={user.professionalProfile.country || ''}
          availability={user.professionalProfile.availability}
          skills={(user.professionalProfile.skills || []).map((s: any) => s.skill.name)}
          linkedinUrl={user.professionalProfile.linkedinUrl || ''}
          twitterUrl={user.professionalProfile.twitterUrl || ''}
          githubUrl={user.professionalProfile.githubUrl || ''}
          websiteUrl={user.professionalProfile.websiteUrl || ''}
          contactEmail={user.professionalProfile.contactEmail || ''}
          experiences={(user.professionalProfile.experiences || []).map(
            (e: any) => ({
              title: e.title || '',
              company: e.company || '',
              startDate: e.startDate
                ? new Date(e.startDate).toISOString().slice(0, 7)
                : '',
              endDate: e.endDate
                ? new Date(e.endDate).toISOString().slice(0, 7)
                : '',
              current: Boolean(e.current),
              description: e.description || '',
            })
          )}
        />
      ) : user.role === 'RECRUITER' && user.recruiterProfile ? (
        <RecruiterSettingsForm
          key={key}
          username={user.username || ''}
          name={user.name}
          organization={user.recruiterProfile.organization || ''}
          bio={user.recruiterProfile.bio || ''}
          location={user.recruiterProfile.location || ''}
          hiringInterests={user.recruiterProfile.hiringInterests || ''}
          recruitingStatus={user.recruiterProfile.recruitingStatus || 'CURRENTLY_RECRUITING'}
          experiences={(user.recruiterProfile.experiences || []).map((e: any) => ({
            title: e.title || '',
            company: e.company || '',
            startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : '',
            endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 7) : '',
            current: Boolean(e.current),
            description: e.description || '',
          }))}
        />
      ) : (
        <p className="text-gray-500">Profile not found.</p>
      )}
    </Modal>
  )
}
