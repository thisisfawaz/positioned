import { FeedSkeleton } from '@/components/work/FeedSkeleton'

/** Shown the instant /feed opens, before the page's own data gate renders. */
export default function FeedLoading() {
  return <FeedSkeleton />
}
