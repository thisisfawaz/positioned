import { redirect } from 'next/navigation'

// The social timeline lives at /feed. This route is kept as a permanent
// redirect so existing links (from work posts, profiles and the sidebar)
// continue to work instead of 404-ing.
export default function FeedRedirect() {
  redirect('/feed')
}
