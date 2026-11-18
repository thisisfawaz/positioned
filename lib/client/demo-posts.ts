export type DemoPost = {
  id: string
  title: string
  caption: string
  skills: string[]
  createdAt: string
  likes: number
  views: number
  mediaAssets: { id: string; provider: string; providerAssetId: string }[]
  professional: {
    title: string
    profilePhoto: null
    user: { id: string; name: string; username: string }
  }
}

const px = (id: number, w = 700) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

const A1 = { id: 'demo-1', name: 'Sophia Chen', username: 'sophiachen' }
const A2 = { id: 'demo-2', name: 'Marcus Johnson', username: 'marcusjohnson' }
const A3 = { id: 'demo-3', name: 'Priya Sharma', username: 'priyasharma' }

function post(
  n: number,
  title: string,
  caption: string,
  skills: string[],
  hours: number,
  likes: number,
  views: number,
  photoId: number,
  role: string,
  author: { id: string; name: string; username: string }
): DemoPost {
  return {
    id: `demo-post-${n}`,
    title,
    caption,
    skills,
    createdAt: hoursAgo(hours),
    likes,
    views,
    mediaAssets: [{ id: `m${n}`, provider: 'S3', providerAssetId: px(photoId) }],
    professional: { title: role, profilePhoto: null, user: author },
  }
}

export const DEMO_POSTS: DemoPost[] = [
  post(1, 'Redesigning the onboarding experience', 'Redesigning the onboarding experience for a more intuitive user journey. Three screens became one, and completion went from 41% to 78%.', ['Product Design', 'UX'], 2, 128, 1420, 196644, 'UI/UX Designer', A1),
  post(2, 'Shipping a design system that cut build time in half', 'Six months of consolidating buttons, inputs and spacing into one documented kit. Teams now ship screens without re-deciding the basics.', ['Design Systems', 'Figma'], 5, 94, 980, 326502, 'Web Developer', A2),
  post(3, 'A dashboard rebuild that made the numbers readable', 'The old dashboard showed 34 metrics at once. This one shows the four that matter and lets you drill in when you need the rest.', ['Data Viz', 'Frontend'], 9, 76, 640, 590016, 'Data Scientist', A3),
  post(4, 'Brand refresh for a logistics startup', 'New wordmark, new palette, and a set of templates the team can actually use without a designer in the room.', ['Branding', 'Illustration'], 14, 210, 2310, 3184465, 'Brand Designer', A1),
  post(5, 'Turning a spreadsheet into an internal tool', 'Ops were tracking 200 shipments a week in a spreadsheet. Now it is a small app with validation, search and an audit trail.', ['Product', 'Engineering'], 22, 43, 410, 1181671, 'Software Engineer', A2),
  post(6, 'Mobile checkout, rebuilt around one tap', 'Cut the four-step checkout to a single confirmation screen. Cart abandonment dropped by a third in the first month.', ['Mobile', 'UX'], 30, 156, 1780, 3183150, 'Product Designer', A3),
  post(7, 'A photography portfolio rebuilt from scratch', 'Twelve years of work, reorganised around three series instead of a chronological dump. Enquiries doubled.', ['Photography', 'Art Direction'], 38, 88, 760, 1181244, 'Photographer', A1),
  post(8, 'Editorial layout for a quarterly report', 'A 60-page report that people actually read. Type scale, grids, and a colour system that survives print and screen.', ['Editorial', 'Typography'], 46, 61, 520, 3182812, 'Graphic Designer', A2),
  post(9, 'Onboarding flows for a fintech app', 'KYC in three steps instead of nine. Drop-off at the identity check fell from 34% to 11%.', ['Fintech', 'UX'], 55, 119, 1340, 3184291, 'Product Designer', A3),
]

export const DEMO_PEOPLE = [
  { id: 'demo-1', userId: 'demo-1', name: 'Sophia Chen', username: 'sophiachen', title: 'UI/UX Designer', profilePhoto: null, postId: 'demo-post-1', image: px(196644, 400) },
  { id: 'demo-2', userId: 'demo-2', name: 'Marcus Johnson', username: 'marcusjohnson', title: 'Web Developer', profilePhoto: null, postId: 'demo-post-2', image: px(326502, 400) },
  { id: 'demo-3', userId: 'demo-3', name: 'Priya Sharma', username: 'priyasharma', title: 'Data Scientist', profilePhoto: null, postId: 'demo-post-3', image: px(590016, 400) },
  { id: 'demo-4', userId: 'demo-4', name: 'Daniel Kim', username: 'danielkim', title: 'Product Designer', profilePhoto: null, postId: 'demo-post-4', image: px(3184465, 400) },
  { id: 'demo-5', userId: 'demo-5', name: 'Maria Lopez', username: 'marialopez', title: 'Marketing Strategist', profilePhoto: null, postId: 'demo-post-5', image: px(3183150, 400) },
  { id: 'demo-6', userId: 'demo-6', name: 'Ade Okafor', username: 'adeokafor', title: 'Software Engineer', profilePhoto: null, postId: 'demo-post-6', image: px(1181671, 400) },
  { id: 'demo-7', userId: 'demo-7', name: 'Nina Berg', username: 'ninaberg', title: 'Photographer', profilePhoto: null, postId: 'demo-post-7', image: px(1181244, 400) },
  { id: 'demo-8', userId: 'demo-8', name: 'Omar Haddad', username: 'omarhaddad', title: 'Graphic Designer', profilePhoto: null, postId: 'demo-post-8', image: px(3182812, 400) },
  { id: 'demo-9', userId: 'demo-9', name: 'Leah Mensah', username: 'leahmensah', title: 'Product Designer', profilePhoto: null, postId: 'demo-post-9', image: px(3184291, 400) },
]
