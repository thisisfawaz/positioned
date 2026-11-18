import Link from 'next/link'
import { initialsOf } from '@/lib/client/social'
import { ContactButton } from '@/components/contact/ContactButton'
import { SaveProfessionalButton } from '@/components/contact/SaveProfessionalButton'
import { FollowPostsButton } from '@/components/contact/FollowPostsButton'
import { EditProfileButton } from '@/components/profile/EditProfileButton'
import { ProfilePosts } from '@/components/profile/ProfilePosts'
import { ShareProfileButton } from '@/components/profile/ShareProfileButton'
import { recruitingLabel } from '@/lib/client/status'

/**
 * Shared profile markup, used by the full page and the intercepted modal.
 * The two callers differ only in wrapper: the page renders it inside `.card`,
 * the modal renders it inside the Modal panel.
 */
export function ProfileBody({
  user,
  prof,
  recruiter,
  isRecruiter,
  isOwn,
  onList,
  posts,
  roles,
  canFollow,
}: {
  user: { id: string; name: string; username: string | null }
  prof: any
  recruiter: any
  isRecruiter: boolean
  isOwn: boolean
  onList: boolean
  posts: Array<{ id: string; title: string; purpose?: string | null; challenge?: string | null; result?: string | null; views: number; likes: number; status: string }>
  roles: Array<{ id: string; title: string; organization?: string | null; location?: string | null; employmentType?: string | null; status: string; views: number }>
  canFollow: boolean
}) {
  const displayName = user.name
  const handle = user.username || user.id

  return (
    <div className="mx-auto w-full max-w-[980px] overflow-hidden bg-white lg:rounded-2xl">
      {/* No cover image - just the avatar, with the description and about
          moved into a right-hand column. */}
      <div className="px-0 pb-5 pt-1 sm:px-4 lg:pt-3">
        {/* The header CONTENT keeps its gutter on mobile (px-3) while the body
            wrapper is full-bleed, so the tabs + published grid below can reach
            the screen edge. Restore px-4 at sm+. */}
        <div className="px-3 sm:px-0">
        {/* Avatar on top, then name/handle, then actions, then the bio below. */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-lg font-bold text-ink">
          {prof?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prof.profilePhoto} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initialsOf(displayName)
          )}
        </div>

        <div className="mt-2 min-w-0">
          <h1 className="text-[19px] font-bold leading-tight text-ink">{displayName}</h1>
          {user.username && (
            <p className="text-[13px] text-ink-subtle">@{user.username}</p>
          )}
          {prof?.title && (
            <p className="text-[14px] font-medium text-ink">{prof.title}</p>
          )}
          {recruiter?.organization && (
            <p className="text-[14px] font-medium text-ink">{recruiter.organization}</p>
          )}
          {recruiter && (
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                recruiter.recruitingStatus === 'NOT_RECRUITING'
                  ? 'bg-surface-sunken text-ink-subtle'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {recruitingLabel(recruiter.recruitingStatus)?.toLowerCase()}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isOwn ? (
            <>
              <EditProfileButton className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface-sunken sm:rounded-xl sm:px-4 sm:py-2 sm:text-[14px]" />
              <ShareProfileButton handle={handle} />
            </>
          ) : (
            <>
              {prof && (
                <SaveProfessionalButton professionalId={user.id} initialSaved={false} />
              )}
              {prof && <ContactButton toUserId={user.id} toName={user.name} />}
              {canFollow && (
                <FollowPostsButton userId={user.id} initialFollowing={onList} />
              )}
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            {(prof?.location || recruiter?.location) && (
              <span>{prof?.location || recruiter?.location}</span>
            )}
            <span>
              <strong className="text-ink">{isRecruiter ? roles.length : posts.length}</strong>{' '}
              {isRecruiter
                ? roles.length === 1
                  ? 'role'
                  : 'roles'
                : posts.length === 1
                  ? 'post'
                  : 'posts'}
            </span>
            {prof?.availability && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                {prof.availability.replace(/_/g, ' ').toLowerCase()}
              </span>
            )}
          </div>

          {prof?.skills && prof.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prof.skills.map((s: any) => (
                <span
                  key={s.id}
                  className="rounded-full bg-brand-light px-2.5 py-1 text-[12px] font-medium text-ink"
                >
                  #{s.skill?.name?.replace(/s+/g, '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + content: Published (9 then more on scroll) | Experience.
          The old single-item block and the "All posts" link are gone. */}
      <ProfilePosts
        posts={posts as any}
        experiences={isRecruiter ? recruiter?.experiences : prof?.experiences}
        about={prof?.bio || recruiter?.bio || null}
        handle={handle}
        isOwn={isOwn}
        isRecruiter={isRecruiter}
        roles={roles}
      />

    </div>
  )
}
