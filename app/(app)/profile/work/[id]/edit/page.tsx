import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { WorkForm } from '@/components/work/NewWorkForm'
import { aspectFromMetadata, parseAspect } from '@/lib/posts/aspect'
import { BackIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // One post model: the owner may be a professional OR a recruiter.
  const post = await prisma.workPost.findUnique({
    where: { id },
    include: { mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })

  if (!post) notFound()

  const myProfessionalId = user.professionalProfile?.id ?? null
  const myRecruiterId = user.recruiterProfile?.id ?? null
  const isOwner =
    (myProfessionalId && post.professionalId === myProfessionalId) ||
    (myRecruiterId && post.recruiterProfileId === myRecruiterId)

  if (!isOwner) {
    redirect(`/profile/work/${id}`)
  }

  return (
    <div className="flex-1 min-w-0 min-h-screen p-4">
      <div className="page-header flex items-center gap-3">
        <Link href={`/profile/work/${id}`} aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-surface-sunken hover:text-near-black">
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold leading-8">Edit Work</h1>
      </div>

      <div className="max-w-2xl px-3 py-3 sm:px-4 sm:py-4">
      <div className="card p-6 md:p-8">
        <WorkForm
          initial={{
            id: post.id,
            caption: post.caption ?? undefined,
            // An image is a MediaAsset; a YouTube post stores its embed URL on
            // the post itself. Passing both lets the form restore either.
            // providerAssetId is EITHER a bare LOCAL filename OR a full URL
            // (Cloudinary). Prefix only the bare-filename case, otherwise the
            // prefill becomes `/uploads/https://...` and never loads.
            mediaUrl:
              post.mediaType === 'IMAGE' && post.mediaAssets?.[0]
                ? /^https?:\/\//i.test(post.mediaAssets[0].providerAssetId)
                  ? post.mediaAssets[0].providerAssetId
                  : `/uploads/${post.mediaAssets[0].providerAssetId}`
                : undefined,
            videoUrl: post.mediaType === 'YOUTUBE' ? post.videoUrl : undefined,
            desiredResponse: post.desiredResponse,
            // The saved FRAME, so editing does not silently reset it to 9:16.
            aspect: parseAspect(
              aspectFromMetadata(post.mediaAssets?.[0]?.metadata)
            ),
          }}
        />
      </div>
      </div>
    </div>
  )
}
