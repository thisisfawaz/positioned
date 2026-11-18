import Link from 'next/link'
import { DeleteWorkButton } from '@/components/work/DeleteWorkButton'
import { ContactButton } from '@/components/contact/ContactButton'
import { EditProfileButton } from '@/components/profile/EditProfileButton'
import {
  ASPECT_CLASS,
  aspectFromMetadata,
  parseAspect,
} from '@/lib/posts/aspect'

type Post = {
  id: string
  title: string
  template: string
  caption?: string | null
  mediaAssets?:
    | { id: string; providerAssetId: string; metadata?: unknown }[]
    | null
  purpose?: string | null
  challenge?: string | null
  goal?: string | null
  situation?: string | null
  approach?: string | null
  action?: string | null
  solution?: string | null
  contribution?: string | null
  result?: string | null
  metrics?: string | null
  skills: string[]
  links: string[]
  createdAt: Date | string
}

type Author = {
  id: string
  name: string
  username: string | null
}

type Professional = {
  title?: string | null
  location?: string | null
  profilePhoto?: string | null
}

/**
 * Shared post detail markup, used by both the full page and the intercepted modal.
 * Keeps content identical wherever it opens - one source of truth.
 */
export function WorkDetailBody({
  post,
  author,
  prof,
  isOwner,
  isRecruiter,
  inModal = false,
}: {
  post: Post
  author: Author
  prof: Professional
  isOwner: boolean
  isRecruiter: boolean
  inModal?: boolean
}) {
  const authorHandle = author.username || author.id
  const initials = author.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={inModal ? 'space-y-6' : 'card p-6 md:p-8 space-y-6'}>
      <div className="flex items-start justify-between gap-3">
        <Link href={`/${authorHandle}`} className="flex items-center gap-4 group min-w-0">
          <div className="w-14 h-14 rounded-full bg-surface-sunken overflow-hidden flex items-center justify-center text-lg font-semibold text-ink-muted flex-shrink-0">
            {prof.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prof.profilePhoto} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold group-hover:underline truncate">{author.name}</p>
            <p className="text-sm text-gray-600 truncate">{prof.title || 'Professional'}</p>
            {prof.location && <p className="text-xs text-gray-500 mt-0.5 truncate">{prof.location}</p>}
          </div>
        </Link>
        {isOwner && (
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href={`/profile/work/${post.id}/edit`}
              className="text-[14px] font-semibold text-ink hover:underline"
            >
              Edit
            </Link>
            <DeleteWorkButton postId={post.id} />
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">
          {post.template.replace(/_/g, ' ')}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>
      </div>

      {/* Image and caption come BEFORE the structured sections: for a free
          post they are the whole content, and for a templated post they are
          what the reader sees first. */}
      {post.mediaAssets?.[0] && (
        <div
          className={`overflow-hidden rounded-lg border border-line ${
            ASPECT_CLASS[
              parseAspect(aspectFromMetadata(post.mediaAssets[0].metadata))
            ]
          }`}
        >
          {/* object-cover, not contain: on the detail page the frame is a
              deliberate shape, and the blurred-copy fallback used in the feed
              would look odd at full width. The user's chosen frame wins here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              /^https?:\/\//i.test(post.mediaAssets[0].providerAssetId)
                ? post.mediaAssets[0].providerAssetId
                : `/uploads/${post.mediaAssets[0].providerAssetId}`
            }
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {post.caption && (
        <p className="text-[16px] leading-relaxed text-near-black whitespace-pre-wrap">
          {post.caption}
        </p>
      )}

      <div className="space-y-6">
        {post.purpose && <Section label="Purpose / Problem">{post.purpose}</Section>}
        {post.challenge && <Section label="Challenge">{post.challenge}</Section>}
        {post.goal && <Section label="Goal">{post.goal}</Section>}
        {post.situation && <Section label="Situation">{post.situation}</Section>}
        {post.approach && <Section label="Approach">{post.approach}</Section>}
        {post.action && <Section label="Action">{post.action}</Section>}
        {post.solution && <Section label="Solution">{post.solution}</Section>}
        {post.contribution && <Section label="Contribution">{post.contribution}</Section>}
        {post.result && <Section label="Result">{post.result}</Section>}
        {post.metrics && <Section label="Metrics">{post.metrics}</Section>}
      </div>

      {post.skills.length > 0 && (
        <div className="border-t border-line pt-6">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-subtle">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {post.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-brand-light px-3 py-1 text-[13px] font-medium text-ink">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {post.links.length > 0 && (
        <div className="border-t border-line pt-6">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-subtle">Links</h2>
          <ul className="space-y-2">
            {post.links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[14px] font-medium text-ink hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-6 gap-3 flex-wrap">
        <div className="text-sm text-gray-500">
          Published {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-3">
          {isOwner ? (
            <EditProfileButton label="Manage profile" className="btn-secondary text-sm px-4 py-2" />
          ) : (
            <>
              {isRecruiter && (
                <ContactButton toUserId={author.id} toName={author.name} workPostId={post.id} />
              )}
              <Link href={`/${authorHandle}`} className="btn-secondary text-sm px-4 py-2">
                View profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{label}</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{children}</p>
    </div>
  )
}
