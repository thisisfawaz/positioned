import type { DemoPost } from './demo-posts'

const px = (id: number, w = 700) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

const A4 = { id: 'demo-4', name: 'Daniel Kim', username: 'danielkim' }
const A5 = { id: 'demo-5', name: 'Maria Lopez', username: 'marialopez' }
const A6 = { id: 'demo-6', name: 'Ade Okafor', username: 'adeokafor' }

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

export const DEMO_POSTS_2: DemoPost[] = [
  post(10, 'Rebuilding a checkout flow for accessibility', 'Every step keyboard-navigable and screen-reader tested. Support tickets about checkout fell by two thirds.', ['Accessibility', 'Frontend'], 60, 73, 890, 1181263, 'Frontend Engineer', A4),
  post(11, 'A visual identity for a community arts space', 'Posters, signage and a wayfinding system built from one modular grid. Produced in-house by volunteers.', ['Branding', 'Print'], 68, 145, 1120, 256490, 'Art Director', A5),
  post(12, 'Analytics that answer one question instead of forty', 'Replaced a wall of charts with a single funnel view. Weekly reporting time went from four hours to twenty minutes.', ['Analytics', 'Product'], 76, 52, 610, 669615, 'Product Manager', A6),
  post(13, 'Designing a scheduling tool for shift workers', 'Built around swapping shifts, not creating them. That was the part every other tool got wrong.', ['Research', 'UX'], 84, 97, 1040, 1181354, 'UX Researcher', A4),
  post(14, 'A component library documented for the people who use it', 'Every component has a do, a dont, and a reason. Docs got more traffic than the design file.', ['Design Systems', 'Docs'], 92, 134, 1560, 1104768, 'Design Engineer', A5),
  post(15, 'Photographing a product range with one light', 'A single softbox, a white sweep and a lot of patience. Whole catalogue shot in two days.', ['Photography', 'Lighting'], 100, 201, 2240, 3184418, 'Photographer', A6),
  post(16, 'Type system for a bilingual publication', 'Two scripts, one rhythm. Setting rules that hold for Latin and Arabic without either looking squeezed.', ['Typography', 'Editorial'], 112, 64, 540, 261949, 'Type Designer', A4),
  post(17, 'An internal wiki people actually update', 'Cut it from 400 pages to 60, then added an owner and a review date to every one. Stale content dropped to near zero.', ['Content', 'Ops'], 124, 41, 380, 159711, 'Content Lead', A5),
  post(18, 'Onboarding emails rewritten as one conversation', 'Nine emails became four, written as a single thread from one person. Open rates went up, unsubscribes went down.', ['Copywriting', 'Lifecycle'], 136, 158, 1290, 3183197, 'Copywriter', A6),
]

export const DEMO_PEOPLE_2 = [
  { id: 'demo-10', userId: 'demo-10', name: 'Tomas Novak', username: 'tomasnovak', title: 'Frontend Engineer', profilePhoto: null as string | null, postId: 'demo-post-10', image: px(1181263, 400) },
  { id: 'demo-11', userId: 'demo-11', name: 'Amara Diallo', username: 'amaradiallo', title: 'Art Director', profilePhoto: null as string | null, postId: 'demo-post-11', image: px(256490, 400) },
  { id: 'demo-12', userId: 'demo-12', name: 'Ben Carter', username: 'bencarter', title: 'Product Manager', profilePhoto: null as string | null, postId: 'demo-post-12', image: px(669615, 400) },
  { id: 'demo-13', userId: 'demo-13', name: 'Hana Sato', username: 'hanasato', title: 'UX Researcher', profilePhoto: null as string | null, postId: 'demo-post-13', image: px(1181354, 400) },
  { id: 'demo-14', userId: 'demo-14', name: 'Rui Almeida', username: 'ruialmeida', title: 'Design Engineer', profilePhoto: null as string | null, postId: 'demo-post-14', image: px(1104768, 400) },
  { id: 'demo-15', userId: 'demo-15', name: 'Zoe Bennett', username: 'zoebennett', title: 'Photographer', profilePhoto: null as string | null, postId: 'demo-post-15', image: px(3184418, 400) },
  { id: 'demo-16', userId: 'demo-16', name: 'Yusuf Rahman', username: 'yusufrahman', title: 'Type Designer', profilePhoto: null as string | null, postId: 'demo-post-16', image: px(261949, 400) },
  { id: 'demo-17', userId: 'demo-17', name: 'Clara Nowak', username: 'claranowak', title: 'Content Lead', profilePhoto: null as string | null, postId: 'demo-post-17', image: px(159711, 400) },
  { id: 'demo-18', userId: 'demo-18', name: 'Ivan Petrov', username: 'ivanpetrov', title: 'Copywriter', profilePhoto: null as string | null, postId: 'demo-post-18', image: px(3183197, 400) },
]
