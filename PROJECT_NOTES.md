# Positioned.Pro - Working Notes

Shared log of changes made in this workspace across chats. Keep this updated every time we
change something so a future chat has full context: what was changed, where, why, and how it
was verified.

## Standing instruction (user-requested)

- This file MUST be updated automatically as part of every task, without being asked.
- Never finish a change without adding a Change Log entry. Never wait for the user to say "update the notes".
- If a write to this file fails, retry and verify it, then tell the user.

## How to use this file

- Add a new entry to the Change Log for every task (newest at the top).
- Use the Problem Log for recurring gotchas, broken patterns, or tooling quirks.
- Keep the Conventions section current so styling/code choices stay consistent.
- Mark unverified work explicitly. Never claim a build/lint/test passed unless it was run.

---

## PRESERVED DESIGN - the UI as it stands on 2026-11-10 (pre-redesign)

This section records the interface as it is NOW, before the planned change to a
social work-showcase platform. It is written to be read later, when the old
version is gone and the question is "what did we have?". Screenshots were taken
but do not cover everything; this is the written account. Nothing here is a
recommendation - it is a description of the state being left behind.

### Why the UI is being replaced

The product is moving from STRUCTURED TEMPLATE POSTING to FREE POSTING FIRST:
an image, video or attachment plus a caption, posted fast, with templates
available optionally for anyone who wants to structure a post further. The
current UI is built entirely around the structured model, so its central
assumption no longer holds.

### Shell and layout

- Three columns, fixed height, only the middle column scrolls.
  `app/(app)/layout.tsx`: `h-screen overflow-hidden`, inner row
  `max-w-[1560px] gap-5 px-5 pt-6`.
- LEFT: `components/navigation/Sidebar.tsx`, `w-[264px]` (`xl:w-[280px]`),
  hidden below `lg`. Three stacked cards: profile card (gradient
  `from-brand/25 via-surface`, avatar with green status dot, name, handle/role
  line, View Profile), a tools list (3 role-aware shortcuts with icons), and a
  gradient promo card.
- MIDDLE: `flex-1 min-w-0 h-full overflow-y-auto scroll-hidden` - the only
  scrolling region.
- RIGHT: `components/navigation/RightRail.tsx` - promo card plus Trending.
- TOP: `components/navigation/TopNav.tsx`, fixed, `h-[72px]`; six primary
  links (Home, Jobs, Professionals, Recruiters, Explore, Trending), a search
  field, and an icon cluster with an avatar dropdown.
- `ScrollBridge` exists because the shell is `overflow-hidden`: it listens for
  wheel events and forwards them to the middle column. Any overlay must carry
  `role="dialog"` or `.modal-overlay` or the bridge preventDefaults its wheel
  events and the modal cannot scroll.

### The feed

- `app/(app)/feed/page.tsx`. Four tabs: For You, List, Recruiter Feed, Recent.
  For You and List are SHUFFLED on every render - the order is not stable.
- Above the feed, a composer trigger whose chips pick the post TYPE: for a
  professional, Project / Case study / Achievement / Work sample (each maps to
  a `WorkTemplate`); for a recruiter, Individual role / Team recruitment.
- Post card: `components/work/WorkCard.tsx`, `<article className="feed-post">`
  plus a `tint-N` class for the background.
- Card anatomy, top to bottom: 44px rounded-xl avatar (initials or photo);
  name, `·`, relative time, and an Add-to-list pill; handle and title line;
  a 17px semibold TITLE; a 3-line excerpt taken from purpose/challenge/result;
  a "see more" toggle that expands into labelled sections (Purpose, Challenge,
  Goal, Situation, Approach, Action, Solution, Contribution, Result, Metrics);
  up to four `#skill` pills; a reaction summary bar (emoji stack, like count,
  comment count, save count); and a four-action row - Like, Comment, Share,
  Send.
- This is the single most important thing to note: THE CARD IS BUILT AROUND
  NAMED FIELDS. The excerpt picks one field, "see more" reveals the rest by
  label. Free-form caption posting has no fields to pick from or reveal, so
  this component does not survive the change intact.

### Profile

- `/[username]`, rendered by `components/profile/ProfileBody.tsx`.
- Cover banner: two-stop gradient `from-brand to-[#8B5CF6]`, identical to
  `.card-gradient`. Overlapping avatar, name, handle, title, status pill, stat
  row.
- About clamps to 4 lines with a More/Less toggle (`AboutSection`, client).
- Skills as pills. Then the posts section: ONE post shown, plus an "All posts"
  link when there is more than one, going to `/[username]/posts`.
- Experience moved BELOW the posts list on 2026-11-08.
- Editing is a popup (`ProfileEditModal`), not a page.

### Post detail

- `/[username]/work/[id]`, `components/work/WorkDetailBody.tsx`. Same named
  sections as the card, rendered in full. Owner sees Edit/Delete. Recruiters
  see the Contact action.

### Visibility / boosts

- `/profile/visibility`. Header row: title plus a "Buy boosts" button and an
  "N boosts available" line.
- Four stat cards (Total views, Recruiter views, Seen by recruiters, Likes).
- A per-post performance list with a "boosted" pill.
- The boost section: either an active-boost panel (end date, seen-by count,
  boosted posts) or `BoostForm`.
- `BoostForm`, as of today: post checkboxes (first 5, plus a Search-more popup),
  a days row of 7 / 14 / 30 / Custom, a boosts number input, a summary line
  reading "N days x M boosts" with the credit total, and an impact note.
- `BuyBoostsButton` popup: 760px, two columns. Left explains how boosts work;
  right has an amount input, `$1 per boost`, a live total, and a disabled Pay
  button with an honest note that checkout is not wired.

### Modals

- One shared shell, `components/ui/Modal.tsx`: 640px default (overridable),
  `rounded-[1.5rem]`, Escape to close, click-outside to close, body scroll
  lock, focus trap, focus restored to the trigger. Carries `role="dialog"` and
  `.modal-overlay` for ScrollBridge.
- Used by the work composer, the recruitment composer, the post picker, the
  buy-boosts popup and the profile edit popup.

### Visual language

- Tokens: `ink` / `ink-muted` / `ink-subtle` for text, `surface` /
  `surface-sunken` / `surface-muted` for fills, `line` for borders, `brand`
  #5B3DF5 with `brand-light` #EDE9FE as its tint.
- `.card` and `.feed-post` use `var(--surface)` / `var(--line)` so they invert
  in dark mode. `.tint-0` to `.tint-4` are the feed card backgrounds and have
  their own dark override.
- Radii are generous: cards `rounded-xl` to `rounded-[1.25rem]`, modals
  `rounded-[1.5rem]`. Pills everywhere for actions and tags.
- Type sizes are hand-set per element (`text-[13px]`, `text-[15px]`, ...)
  rather than coming from a scale. Density is high.
- Dark mode is class-based on `<html>`, applied by a blocking script in
  `app/layout.tsx` before first paint.

### Honest assessment of what this UI is

It reads as a PROFESSIONAL NETWORK - LinkedIn-shaped. Dense cards, named
fields, avatars, a title line, a reaction bar. That shape was chosen because
the product was structured proof. Once a post is a caption and a piece of
media, this shell fights the content: the middle column is narrow relative to
its importance, the side rails compete with the work, and the card's anatomy
has nothing to render.

---

## Project snapshot

- Stack: Next.js (App Router) + TypeScript + Tailwind CSS, Supabase + Prisma.
- Styling: Tailwind utility classes inline; custom tokens such as `near-black`, `brand`, `brand-dark`.
- Sidebar: `components/navigation/Sidebar.tsx`; responsive at `md` (icon rail, `w-[88px]`) and `xl` (expanded, `w-[360px]`).
- Top nav: `components/navigation/TopNav.tsx`. Right rail: `components/navigation/RightRail.tsx`.
- Data fetching: `lib/client/fetcher.ts`, `lib/client/use-cached.ts` (cached fetch + prefetch seeding).

---

## Open Work - the checklist, newest thinking first

This section exists because pending work was being scattered across Change Log
entries, where it has to be excavated. Keep THIS list current. When an item is
done, delete it here and record the outcome in the Change Log.

### Not started

- **Phase 4 of the post migration: DROP the retired tables.** `Recruitment`,
  `RecruitmentLike`, `SavedRecruitment`, `RecruitmentView` still exist in the
  database and in `prisma/schema.prisma`, marked DEPRECATED. Nothing writes to
  them and `/api/home` no longer queries them, but they are still there. This
  is the one clearly-defined phase from the original plan that has NOT been
  done. Requires a migration (`supabase/031_...`), NOT `db push` - see the
  drift item below.
- **`db push` bookkeeping drift.** BLOCKS the item above. The live DB has a
  PARTIAL unique index `User_username_key ... WHERE username IS NOT NULL`
  (applied by hand in `supabase/003`). Prisma's snapshot does not recognise it,
  so `db push` tries to recreate it and Postgres refuses. Everything since has
  been applied as raw SQL to avoid this. TWO options, neither taken, decision
  DEFERRED: (a) drop and recreate the index as Prisma expects - briefly loses a
  uniqueness guarantee on `username`; (b) write a migration Prisma recognises -
  needs its snapshot inspected first. Do not `db push` until one is chosen.
- **`title` is derived from the caption** (first 80 chars) because the column
  is still `String` NOT NULL while the composer no longer asks for a title.
  Works, but it is a workaround. The clean fix is making `title` nullable, which
  needs a schema change and therefore the drift decision above.

### Small, contained

- **Role/name flash on first paint (accepted trade of the 2026-11-20 instant-switch fix).**
  The layout no longer awaits the session, so `Sidebar`/`MobileBottomNav` show the
  default (professional, no name) for a beat until `useUser()` (`/api/me`) resolves.
  Optional smoothing: seed the `/api/me` cache from the JWT claims, or render a
  neutral placeholder instead of the default label, so nothing appears to flip.
- **SWR cache is NOT seeded on hover.** `prefetch` on nav `Link`s warms the RSC
  payload only. The client fetches behind `/api/home`, `/api/explore-grid`, etc.
  still start on arrival. `lib/client/use-cached.ts` already exports `seedCache`
  but nothing calls it on hover. Wiring a hover/touch-start prefetch would make
  the FIRST visit to a warm page feel truly instant - the last piece of the
  Instagram pattern.
- **Remaining pages with no inline loading gate.** Messages, Responses, Settings
  render their content without a `!data`/`isLoading` skeleton (they rely on the
  route `loading.tsx` only, and `(app)/loading.tsx` is now `null`). Add an inline
  skeleton gate so they never show a blank frame mid-fetch.
- **"Message" vs "Contact" label mismatch.** The composer dropdown offers
  "Message" (from `AUTHOR_SIDE_LABEL`), but the card renders `ContactButton`,
  whose button text is hardcoded "Contact". Same action, two words. Pick one and
  make both say it. Applies to BOTH sides.
- **`allowRecruiterMessages` is now a misleading name.** After the contact gate
  was relaxed, either side can message, but this preference still only gates
  RECRUITER-initiated messages. A professional setting it to false will NOT stop
  other professionals messaging them. Rename it, or make it symmetric, and say
  which in the UI.
- **`askedFor` in `RequestDocumentsCta` is dead code** - nothing reads it after
  the pending button started using `label`. Safe to delete.
- **Mobile bottom bar is now SIX slots** (Home, Explore, Create, Messages,
  Requests, Profile) where the reference design called for five. It fits, but
  needs a phone-width look before it is called done.

### Known inaccuracies / edge cases, accepted for now

- **APPLY posts with no `applyUrl`** render NO cta at all, because the card
  checks `isApply && post.applyUrl`. Harmless today - there are ZERO APPLY posts
  in the database - but the first one created before migration 030, or any row
  with a null link, will show an empty action area.
- **The fulfil form is one-shot from the card.** `/requests/[id]` is now
  editable, so a wrong link CAN be corrected there, but the card gives no route
  back to it once fulfilled. Low priority.
- **`MediaAsset`/uploads are LOCAL-only.** `public/uploads` does not survive a
  deploy. Real blocker for launch, unrelated to the current work.
- **Placeholder seed data is still in the database.** `node
  scripts/seed-placeholder-posts.js --clean` must be run before any demo or
  deploy - see the 2026-11-12 entry.

### Process lessons that keep costing time

- **A green `npx tsc --noEmit` does NOT prove an edit landed.** Today an
  `edit_file` batch aborted on "Found 2 matches" and the rest silently did not
  apply, while the type-check stayed clean because the form simply sent a field
  the action ignored. RE-READ THE FILE after a multi-edit batch.
- **Several bugs today were found by the USER looking at the screen**, not by
  any check available here: the inverted CV label, the "Submitted" state on an
  empty request, the disappearing CTA after refresh. Type-checking catches none
  of these. Browser verification is not optional.
- **Nothing built in this session has been seen rendered.** That is the single
  biggest risk in this file right now.

---

## Change Log

### 2026-11-20 - Premium (professionals): messaging/submit gate + 4-post monthly boost

- NEW DOMAIN: Premium, professionals only, $2/month. `User.premiumUntil DateTime?` (null/past = not premium) via raw SQL `supabase/034_add_premium.sql` - NOT db push (username drift). Helper `lib/premium.ts` (isPremiumActive / isUserPremium, PREMIUM_BOOST_SLOTS=4).
- MESSAGE/SUBMIT GATE: `app/(app)/profile/contact/actions.ts` now returns `premium_required` for a PROFESSIONAL who is not premium. Recruiter posts use the SAME ContactRequest path with workPostId (that IS the submit), so both are gated by the one check. `ContactButton.tsx` shows a Premium CTA block (not a red error) linking to /premium.
- CHECKOUT: `/premium` page + `startPremium` action. Creates a PENDING Payment (provider STRIPE), then ACTIVATES 30 days as a STUB (the real Stripe session call is the single marked TODO). Refuses non-professionals.
- BOOSTS RE-HOMED UNDER PREMIUM: credits/buy-boosts UI removed from the visibility page. `BoostForm`/`BuyBoostsButton` replaced by `PremiumBoostForm` - pick up to 4 published posts, rotate anytime. `setPremiumBoostPosts` reuses the EXISTING Boost engine untouched (one ACTIVE Boost row per premium period, BoostPost rows = selection; scheduling/weighting/impressions unchanged).
- SIDEBAR: Premium item under Boost Visibility, new DollarIcon.
- TOOLING: `cat > file` / append via heredoc DID persist where `write_file`/`edit_file` silently failed (`lib/premium.ts` and the actions append were silently lost on first attempt - verified with ls/grep). `node -e` breaks when the JS contains backticks or nested quotes; write the script to /tmp and run `node /tmp/x.js`.
- BLOCKERS FOR USER: (1) stop the dev server then run `npx prisma generate` - it hit the known EPERM engine lock; (2) APPLY `supabase/034_add_premium.sql` in Supabase or premiumUntil reads/writes fail at runtime.
- COMMITTED: 9285bbc (pushed). 12 files, +355/-36.
- VERIFIED: `npx tsc --noEmit` clean. NOT browser-verified.
### 2026-11-20 - Profile converted to client cache; mobile bar state fixed

- PROFILE FELT LIKE IT WAS NOT PART OF THE SITE: it was the only page still a force-dynamic SERVER component, doing SIX SEQUENTIAL Prisma awaits on every visit. Every other page is a client page on a cached SWR key, so it alone re-queried cold each time. CONVERTED to the same pattern: new app/api/profile/[username]/route.ts (queries run in PARALLEL via Promise.all) + app/(app)/[username]/page.tsx is now a client component using useCached('/api/profile/<username>') with a ProfileSkeleton gate. Repeat visits hit the memory cache and paint instantly. TRADE-OFF: profile data is no longer server-rendered for link previews/SEO - accepted by the user, same as the feed.
- The profile API route returns 404 for an unknown user; the client page calls notFound() on a 404 error.
- BOTTOM NAV STAYED HIDDEN AFTER THE REEL: hidden is local useState in each nav, driven by emitReelScroll. ReelFeed emitted true while scrolling but NEVER false on unmount, so the next page mounted already hidden. Fixed both ends: ReelFeed cleanup sets barsHidden.current=false and emits false; both MobileTopBar and MobileBottomNav reset hidden on pathname change.
- TOP BAR HID ON EVERY PAGE SCROLL: MobileTopBar used a window scroll listener unconditionally. Removed it. The top bar now ONLY auto-hides on the FEED via the reel-scroll event; normal pages keep their header while scrolling.
- TOOLING: edit_file silently failed AGAIN on a multi-line block (MobileTopBar). Used a node script with an explicit ANCHOR-NOT-FOUND guard instead. Also: passing JS with backticks through bash -e breaks (bash runs it as command substitution) - write the script to /tmp and run node /tmp/notes.js.
- COMMITTED: 8b2acf9 (pushed). 4 files, +168/-86.
- VERIFIED: npx tsc --noEmit clean. NOT browser-verified.
### 2026-11-20 - Instant page switches (the real cause of "click then dead air")

- SYMPTOM THE USER REPORTED: clicking ANY page showed NOTHING (no spinner, no skeleton) for a beat before the destination appeared. Same feel on every page. The user's description was exact and pointed at the shared shell, not the pages.
- ROOT CAUSE: `app/(app)/layout.tsx` did `await getSessionRole()` on EVERY navigation. Because that await sits in the LAYOUT, no `loading.tsx` below it could render until it resolved, so every click paid the session read before the screen changed. The middleware comment already documented that the layout "could not render until a Prisma query finished" - auth had been moved to middleware, but the layout's own await was never removed. Half-done fix.
- FIX: `app/(app)/layout.tsx` is now a SYNCHRONOUS component. Removed `await getSessionRole()`, the `redirect('/auth/login')`, and the `role`/`name` props to the shell. Auth is still enforced by `middleware.ts` (verified: it redirects unauthenticated requests before any layout runs, using `getSession()` local JWT decode). `Sidebar` and `MobileBottomNav` now take NO props and derive the viewer from the existing cached `useUser()` (`/api/me`) hook. Result: click -> shell + route swap immediately; role/name settle a beat later. This is the Instagram pattern (switch screen first, load content after).
- TRADE-OFF, EXPECTED: for a split second after load the Create-Post label / name may show the default before `useUser()` resolves. Same trade every social app makes. Smooth it later if it reads as a flash.
- FEED SKELETON EXTRACTED: `components/work/FeedSkeleton.tsx` (was inline in `feed/page.tsx`), so `app/(app)/feed/loading.tsx` and the page's own `!data` gate render the EXACT same shape - the swap is invisible.
- NEW `app/(app)/explore/loading.tsx` (header + search + chips + masonry grid).
- `app/(app)/loading.tsx` now returns `null` (was a generic card skeleton that matched almost no route, so every transition flashed a wrong-shaped placeholder before the real page - part of why it read as "loads before it switches"). Routes with a known shape carry their own `loading.tsx`.
- PREFETCH: `prefetch` added to every `Sidebar` and `MobileNav` `Link` (drawer + bottom bar + brand + search). NOTE this warms the RSC payload, NOT the client SWR fetch behind `/api/home` etc. - the real data still loads on arrival. A hover-seed of the SWR cache was CONSIDERED AND NOT DONE (see Open Work).
- TOOLING GOTCHA (cost real time, recorded): `write_file` reported success TWICE for `components/work/FeedSkeleton.tsx` while nothing landed on disk (a stale/empty VS Code buffer shadowing the path). `edit_file` also silently no-op'd on the `MobileBottomNav` signature change. Workaround that DID persist: write via shell `base64 -d > file` and verify with `ls`/`head`; apply `sed -i` for single-line edits and verify with `grep`. ALWAYS verify with a shell read after a write in this workspace.
- COMMITTED: `99b02f0` (pushed to origin/main). 25 files, +654/-92. The commit BUNDLED pre-existing uncommitted work that was already in the tree (instant-post wiring: `lib/client/pending-post.ts`, `feed/page.tsx`, `NewWorkForm`, `profile/work/actions.ts`, plus many other route `loading.tsx` files) at the user's explicit request ("Option B"). Worth a look in case any of it was mid-work.
- VERIFIED: `npx tsc --noEmit` clean. NOT browser-verified - the user must confirm the dead air is actually gone and that the role flash is acceptable.

### 2026-11-20 - Instant post, 3s auto-hide chrome, randomized Explore, fitted skeletons

- INSTANT POST: `createWorkPost` now re-reads the created row with the SAME relations `/api/home` returns and returns it as `state.createdPost`. `NewWorkForm` calls `setPendingPost(state.createdPost)` on success (it was NEVER called before - the whole pending-post mechanism was dead). The feed's existing `justPublished` logic then prepends it, so a new post appears at the TOP with no refetch. `clearCached('/api/home')` still runs, so the refetch simply confirms it.
- 3s AUTO-HIDE (mobile): `ReelFeed` gained an idle timer. 3s after the user settles on a post (scroll-stopped), it emits hidden=true so both bars slide away; any scroll cancels/re-arms it and normal scroll-driven reveal takes over. Skipped on desktop (no overlaid bars). Implemented with an `isDesktopRef` + `armIdle`/`clearIdle` refs inside the existing scroll effect.
- RANDOMIZED EXPLORE: `ExplorePage` shuffles the fetched items with a per-mount seed (stable across re-renders, differs per visit). Feed already had a seeded shuffle for professional posts - left intact. NOTE: ExploreGrid still APPENDS additional pages in server (newest-first) order; only the first batch is shuffled.
- SKELETONS FIT THE DESIGN: feed showed the literal text "Loading…" - replaced with a reel-shaped `FeedSkeleton` (media frame + overlaid author/caption), rendered while `/api/home` has no data. Explore's inline skeleton used the dead `bg-gray-200` class - now uses `Skeleton` and mirrors `PostTileGrid` (columns-2/3/4, alternating aspect-square / aspect-[3/4]). Added route `loading.tsx` for `/list`, `/messages`, `/responses`, `/trending`, each matching its real page's wrapper, title, and row/card anatomy.
- FIXED A PRE-EXISTING TYPE ERROR: `subscribePendingPost` returned `() => listeners.delete(fn)` (boolean), which is not a valid `EffectCallback` destructor. Now returns a void arrow. `npx tsc --noEmit` was failing on `app/(app)/feed/page.tsx:83` before this.
- VERIFIED: `npx tsc --noEmit` clean. NOT verified in a browser (skeleton visuals, the 3s timing feel, and instant-post appearance all need a real look).

### 2026-11-19 - Profile photos (both roles), unsaved-changes guard, modal fixes, bio/name layout

- PROFILE PHOTO UPLOAD: new `components/settings/ProfilePhotoPicker.tsx` uploads via the EXISTING `/api/upload` route (same MIME + size validation) and writes the returned `/uploads/...` path into a hidden `profilePhoto` field. Preview + Change/Remove, inline errors, initials fallback.
- RECRUITERS CAN NOW UPLOAD: `profilePhoto String?` added to `RecruiterProfile` in `prisma/schema.prisma`, with raw SQL in `supabase/033_recruiter_profile_photo.sql` (NOT `db push` - the username partial-index drift still blocks it). THE MIGRATION HAS NOT BEEN APPLIED - the user must run the ALTER TABLE in Supabase or recruiter saves will fail.
- Both settings actions read `profilePhoto` and accept ONLY `^/uploads/[\w.-]+$`, so a crafted request cannot inject an external URL.
- UPLOAD CAP: 8MB -> 5MB (`app/api/upload/route.ts` + the picker hint).
- PROFILE HEADER: avatar enlarged (h-16 -> h-24, sm:h-28) and wrapped in new `components/profile/PhotoLightbox.tsx` - click opens the photo full-size over a portal backdrop (the profile page sits inside transformed ancestors, so an inline fixed overlay would misplace).
- NAME/USERNAME moved to the RIGHT of the photo; the BIO sits under them. TITLE/ORGANIZATION/recruiting pill stay BELOW the row. GOTCHA: the field labelled "Bio" is stored as `title`; the field labelled "About" is stored as `bio`. I first added `bio` beside the name and the user rightly called it wrong - it must be `title`.
- UNSAVED-CHANGES GUARD (app-wide): new `lib/client/use-form-dirty.ts` (listens for input/change on the form element, no per-field wiring) and `components/ui/ConfirmDiscard.tsx`. `Modal` gained `isDirty` + `discardMessage`; EVERY close path (Escape, backdrop, x) goes through `requestClose`, which asks before discarding. Wired into ProfessionalSettingsForm, RecruiterSettingsForm, WorkForm, RecruitmentForm. Each clears its flag on a successful save. NOT yet covered: FulfilForm (it is not inside a Modal) and BoostForm.
- MODAL BACKGROUND, THE REAL CAUSE: popups were `bg-surface`, which the flat dark theme made identical to the page - no visible panel. Added a dedicated `--modal` token (`#ffffff` light, `#15191d` dark) used by `Modal` and `CountryMultiSelect`.
- "BACKGROUND STOPS AT STATUS": the desktop panel was capped at `max-h-[calc(100dvh-5rem)]` while the body had `sm:overflow-visible`, so the FORM OVERFLOWED PAST THE PANEL and rendered on the page with no background. Fixed with `sm:overflow-hidden` on the panel and `sm:min-h-0` on the body. Three earlier guesses (colour, token, width) all missed this - it was overflow.
- FORM INPUTS: every hardcoded `border-[#e5e5e5]` / `bg-white` in both settings forms, ExperienceFields, and the photo picker switched to `border-line` / `bg-[var(--modal)]`. Those literals were punching bright holes through the dark modal.
- MOBILE MODALS: `fullScreenOnMobile` now DEFAULTS TRUE - every popup fills the phone screen with square corners. Desktop unchanged.
- CREATE POST ON MOBILE OPENED BELOW THE PAGE: `CreatePostTrigger` renders inside the mobile bottom nav, which is `fixed` AND transformed. A transformed ancestor becomes the containing block for `position: fixed` children, so the modal positioned against the NAV. Fixed by portalling the modal to `document.body`.
- NOT YET DONE: the `profilePhoto` migration must be applied by the user; recruiter avatars elsewhere (cards, ProfileBody now reads it) still need checking; FulfilForm + BoostForm have no discard guard.
- VERIFIED: `npx tsc --noEmit` clean after every step. NOT verified: a full `next build` (pre-existing Prisma EPERM lock and Turbopack next/font bug).

### 2026-11-19 - Responses page (post-grouped + modal), row alignment, page restyles, flat dark theme, menu tweaks

- REQUESTS -> RESPONSES: `/requests` renamed to `/responses` (`git mv`; the parenthesis in `(app)` needs quoting or git mv fails with ENOENT). Nav label + href, 3 `revalidatePath` calls in `app/(app)/profile/requests/actions.ts`, `FulfilForm` back-link and `RequestDocumentsCta` 'Submitted - view' link all updated. `app/api/notifications/route.ts` deliberately LEFT on `/requests/${r.id}` - that is the fulfil DETAIL page, which did not move.
- RESPONSES IS NOW POST-GROUPED: new `components/requests/ResponsesClient.tsx` (client) renders one card per POST with a thumbnail, title, and "N responses" (singular/plural, plus "· N pending"). Clicking opens a `Modal` listing every response for that post, scrolling inside `max-h-[70vh] overflow-y-auto`. `app/(app)/responses/page.tsx` (server) only fetches and groups by `postId`, preserving newest-first order. First media asset is used as the thumbnail.
- STALE NEXT TYPES: moving a route leaves `.next/types/validator.ts` pointing at the old path, so `tsc --noEmit` fails with "Cannot find module '../../app/(app)/requests/page.js'". Fix: delete `.next/types` (build cache, not code).
- ROW ALIGNMENT (the user's "content is not aligned with the title" issue): the titles were ALREADY correct. The cause was rows/cards carrying their own `px-4`/`p-3`/`p-5`, so their content started at title-padding PLUS that inset. Changed to `pl-[5px] pr-4` in `components/contact/ListRow.tsx`, `components/messages/MessagesList.tsx`, and the Responses card. NOTE: the offset is INSIDE the page's `px-3 sm:px-4`, so the visual edge is title-padding + 5px, not 5px from the screen.
- MOBILE TITLE SIZE: all six page titles `text-[26px]` -> `text-[20px] sm:text-[26px]` (Explore, My list, Saves, Visibility, Settings, Messages).
- REQUESTS + NOTIFICATIONS RESTYLED onto the standard page style (wrapper `w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6`, title `text-[20px] ... sm:text-[26px]`, subtitle `text-[14px] text-ink-muted`). Requests had a SECOND inner `px-3 sm:px-4` wrapper (the same double-padding bug as My list) - removed. Notifications lost `.card`, `text-gray-*`, `text-near-black`, and a hardcoded `#dc2626` dot (now `bg-rose-500`).
- DARK THEME, FLAT: background `#0c1014`. Getting there exposed THREE separate cascade problems, recorded so they are not rediscovered: (1) `body` hardcoded `#ffffff` unlayered near the END of globals.css, so changing `--background` did nothing - `body` now uses `var(--background)`. (2) `app/(app)/layout.tsx` carried `bg-white dark:bg-[#0c1014]`, and the unlayered `html.dark .bg-white { background-color: #1a1a1a }` out-specifies the `dark:` utility - the wrapper now uses `bg-[var(--background)]`. (3) That override is WHY the user measured exactly `#1a1a1a`. FINAL STATE: ONE flat colour - `--background`, `--surface`, `--surface-muted`, `--surface-sunken`, `html.dark .bg-white`/`.tint-*`/`.bg-gray-*`/skeleton/inputs are ALL `#0c1014`; borders `--line: #2f2f2f` are the only separator. Also neutralised every blue-tinted hex (the whole Tailwind `gray-50..900` scale in `tailwind.config.js`, `--ink*`, `--brand-black`, post-image outline) - NOTE this shifts LIGHT mode slightly too, since the gray scale is shared.
- MENUS: sidebar icon-rail hover tooltip changed from hardcoded `bg-[#1f1f27]`/white to `bg-brand-light` + `text-ink` + `border-line`. Profile dropdowns (TopNav + ProfileMenu): View profile / Sign out hover moved from `hover:bg-surface-sunken` (which resolved to `#0c1014` and was INVISIBLE on the flat background) and `hover:bg-rose-50` to `hover:bg-[#242424]`. CAVEAT: `#242424` is hardcoded, so light mode now gets a dark grey hover on a white popup - a theme token would be the correct fix.
- USER PROFILE LINKS: avatar and author name on a post now link to `/[username]` (`profileHref` added beside `href`). ReelFeed's tap handler already ignores taps inside `a`, so this does not fight the chrome toggle.
- 'On list' -> 'Unlist' (`components/contact/FollowPostsButton.tsx`, the single source for that label).
- VERIFIED: `npx tsc --noEmit` clean after every step; CSS parsed via PostCSS. NOT verified: a full `next build` (still blocked by the pre-existing Prisma EPERM lock and the Turbopack `next/font` resolution bug).

### 2026-11-19 - Desktop reel fixes, video poster + real autoplay, mobile-only scrollbars, horizontal engagement icons

- DESKTOP STRIP BUG: `<main>` in `app/(app)/layout.tsx` set the bar padding as INLINE styles (`paddingTop/Bottom: var(--topbar-h)/var(--bottombar-h)`), which beat the `lg:pt-0 lg:pb-0` classes and leaked onto desktop - pushing the reel down and leaving a strip at the top. Fix: `<main className="app-main ...">` with NO inline padding; `app/globals.css` now applies the padding inside `@media (max-width: 1023px) { .app-main { ... } }`. Media queries cannot be overridden by the inline-style ordering problem.
- DESKTOP REEL HEIGHT: `ReelFeed`'s desktop branch was `{ width: '100%' }` with no height, so the inner `h-full` scroller and `h-full` cards collapsed. `<main>` is a content-height flex item, so the reel must supply its own: desktop now gets `height: '100dvh'`.
- DESKTOP HAS NO CHROME OFFSETS: `WorkCard` gained its own `isDesktop` (`matchMedia('(min-width: 1024px)')`). The header push-down, collapsed-caption lift, and rail lift are all gated so they are MOBILE-ONLY - desktop has no fixed bars over the reel, so it renders as a plain full frame. (Previously `WorkCard` referenced `isDesktop` without defining it - that broke the build mid-session.)
- REEL ARROWS: up/down arrows were positioned via a full-height `aspect-[9/16]` box that no longer matched the frame, so they rode up over it. Re-anchored to a centred box of the SAME width/height as the frame (`h-full aspect-[9/16]`, wrapper is now `relative`), buttons at `-right-[86px]` (was `-right-14`; moved out 30px at the user's request). Assumes a 9:16 desktop frame - if landscape posts are ever honoured there, this needs revisiting.
- VIDEO AUTOPLAY ROOT CAUSE: `new YT.Player(containerRef.current, ...)` REPLACES the mount div with an iframe, so the mount node is DETACHED. The IntersectionObserver was watching that detached node and never fired - which is why nothing autoplayed on desktop OR mobile. Fix: observe a new STABLE `wrapperRef` that YouTube does not replace. (This was the open issue recorded in the 2026-11-19 VideoPlayer entry below; now resolved.)
- VIDEO POSTER: the frame was blank before playback. Added `https://i.ytimg.com/vi/<id>/hqdefault.jpg` as a poster behind the player, gated on `!ready` (NOT `!playing`) - gating on `playing` made the still image sit over an already-playing video. 
- AUTOPLAY EAGERNESS: IntersectionObserver threshold lowered from `> 0.6` to `> 0.1` (`threshold: [0, 0.1, 0.6, 1]`) so playback starts as soon as the card is essentially on screen, instead of waiting until 60% is visible.
- SCROLLBARS: added `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` for `html, body, *` in `app/globals.css`. First made GLOBAL, then scoped to `@media (max-width: 1023px)` at the user's request - MOBILE ONLY. Desktop keeps normal scrollbars. Scrolling itself is untouched; only the bar is hidden. NOTE: `.scroll-thin` is now dead on mobile (overridden); desktop elements still carrying `.scroll-hidden` stay bar-less.
- ENGAGEMENT ICONS: the vertical rail (heart/comment/send/save) became HORIZONTAL with HEART, SAVE, SHARE only - the comment icon and its `CommentIcon` import were removed. It is no longer absolutely docked bottom-right: it renders INLINE beside the CTA (`flex items-center justify-between`, rail wrapped in `ml-auto`) in BOTH the collapsed caption and the expanded panel, so it floats to the far right. The `absolute bottom-3 right-3` render site and the mobile bottom-bar offset logic for the rail were removed with it (it now inherits the caption's own padding). `pr-12` on the collapsed caption wrapper and `pr-16` on the expanded CTA row were removed - they only existed to clear the old right-hand rail and were holding the icons off the edge.
- VERIFIED: `npx tsc --noEmit` clean after every step, and the CSS parsed cleanly via PostCSS. NOT verified: a full `next build` - it fails for UNRELATED pre-existing reasons (`EPERM` rename on Prisma's query-engine DLL while the dev server holds it; and a Turbopack `next/font/google` resolution bug on Next 16 / Windows). Browser behaviour was confirmed by the USER on mobile and desktop except where noted.

### 2026-11-19 - Recruitment videos autoplay muted; reel fills between bars, grows to full screen

- MUTED AUTOPLAY (recruitment cards): `components/recruitments/RecruitmentCard.tsx` used a bare `<iframe src={r.videoUrl}>`, which never autoplayed. Added `autoplayEmbedUrl()` which rewrites the stored bare embed URL (`https://www.youtube.com/embed/ID`) into one with `autoplay=1&mute=1&playsinline=1&loop=1&modestbranding=1&rel=0&playlist=<id>`. YouTube only autoplays when muted; looping needs the id repeated in `playlist`. `controls=0` was REMOVED because YouTube frequently refuses to autoplay embeds with controls disabled. Stored DB values are untouched - normalised at render time. NOTE: this is the plain-iframe path, NOT `VideoPlayer`; iOS Safari still blocks muted autoplay in cross-origin iframes on first load regardless of params.
- MOBILE CHROME HEIGHTS: added `--topbar-h: calc(60px + 1px)` and `--bottombar-h: calc(64px + env(safe-area-inset-bottom, 0px))` to `:root` in `app/globals.css`. The top bar (py-3*2 + h-9 + border), bottom bar (h-16 + safe-area), the layout padding, and the reel all read the SAME vars so they cannot drift. `app/(app)/layout.tsx` `<main>` now pads by those vars instead of the hard-coded `pt-14 pb-16` (which were 4px short at the top and ignored the safe-area at the bottom). Both bars in `components/navigation/MobileNav.tsx` take their height from the vars explicitly.
- REEL BETWEEN BARS / FULL SCREEN: `components/work/ReelFeed.tsx`. The frame is now `position: fixed; inset: 0` on mobile (gated in JS via `matchMedia('(min-width: 1024px)')`, NOT `lg:` classes, because inline styles beat classes), so it is a CONSTANT full-screen box behind both bars. Hiding the bars slides their transforms away and reveals frame that was already there - zero layout work, so the reveal is smooth. The previous attempt animated `top`/`bottom` between two sizes, which forced layout+paint of a container holding an iframe and snap cards every frame and looked janky. DESKTOP unchanged (normal flow, 9:16).
- FIRST ATTEMPT THAT FAILED (recorded so it is not repeated): negative margins (`-mt-14 -mb-16`) only pulled the reel's VISUAL box over `<main>`'s padding; `<main>` still reserved `--bottombar-h` of real height, so when the bar slid away a blank strip was exposed and never covered. Fixed positioning ignores parent padding/height entirely.
- SECOND FAILURE: Tailwind arbitrary classes containing `calc()` + CSS vars (`h-[calc(100dvh-var(--topbar-h)-var(--bottombar-h))]`) can be silently dropped by the class extractor, leaving the wrapper with NO height (blank page). Heights that depend on CSS vars are now set via inline `style`, not class names.
- CARD CONTENT CLEARS BARS: `components/work/WorkCard.tsx` gained a `chromeHidden` prop (passed from ReelFeed). The overlaid author header translates down by `--topbar-h` while bars are visible and back to 0 when hidden (transform only, 200ms, matches the bars). The COLLAPSED caption overlay gets `paddingBottom: calc(0.75rem + var(--bottombar-h))` while visible. The action rail (like/comment/send/save) in that same overlay animates its `bottom` the same way, so the icons move with the caption text and CTA. The EXPANDED panel's rail stays at `bottom-3` (it is in normal flow with its own padding).
- TRADE-OFF: the bars now OVERLAY the card (standard TikTok/Reels look) rather than the card resizing to avoid them. Media runs edge-to-edge behind the bars; only the header/caption/rail content is offset.
- VERIFIED: `npx tsc --noEmit` clean after each step. Browser-verified by the USER: reel fills between the bars, grows to full screen on scroll, reveal is smooth, icons track the caption. Autoplay confirmed working on desktop; iOS iframe caveat above stands.

### 2026-11-19 - Reels: own video player, inline timeline, muted autoplay

- USER: replace the raw YouTube iframe in the feed with an OWN player (no YouTube chrome), with a scrub/timeline bar, muted autoplay on view, tap to play/pause.
- NEW `lib/client/youtube.ts`: `youtubeVideoId()` parses the 11-char id from embed / watch / youtu.be / bare id. Already present and reused.
- NEW `components/work/VideoPlayer.tsx`: loads the YouTube IFrame API once (shared promise), creates the player with chrome hidden (`controls:0, modestbranding:1, rel:0, showinfo:0, fs:0, playsinline:1, disablekb:1, iv_load_policy:3`). Muted autoplay when the card is >60% in view via IntersectionObserver; pause when out of view; tap toggles play/pause; a mute button.
- MUTED AUTOPLAY: added `mute: 1` and `autoplay: 1` to `playerVars` (plus `onReady` calls `.mute()`), because browsers only allow unprompted autoplay when muted.
- TIMELINE: the scrub bar is NOT drawn inside the player overlay. `VideoPlayer` exposes a `VideoPlayerHandle` (via `forwardRef`/`useImperativeHandle`: `seekTo`, `subscribe`, `getDuration`) and a separate `VideoTimeline` component drives it. `WorkCard` renders `<VideoTimeline>` in the caption block ABOVE the CTA in both collapsed and expanded states - so the bar is part of the text/CTA section, not floating over the media or covering it.
- Scrub bar stops pointer propagation so a horizontal drag seeks without the reel reading it as a tap/scroll (ReelFeed listens on pointerdown/up for tap-to-toggle chrome).
- KNOWN ISSUE (open): autoplay still does not fire in the browser. Suspected cause: `new YT.Player(containerRef.current, ...)` REPLACES the ref'd div with an iframe, so the IntersectionObserver is observing a detached node and never fires. Fix direction: observe a STABLE outer wrapper that YouTube does not replace, not the mount div. NOT yet implemented/verified.
- `WorkCard`: raw `<iframe>` replaced with `<VideoPlayer ref={playerRef} videoUrl={post.videoUrl} />`.

### 2026-11-19 - Hydration error on the feed (relative time)

- SYMPTOM: `Hydration failed because the server rendered text didn't match the client` on WorkCard's author line - "UI/UX Designer - 2h" (client) vs "- 4h" (server).
- CAUSE: `relativeTime()` in `lib/client/social.ts` uses `Date.now()`, so the SSR string and the hydrated string disagree whenever the bucket ticks over between render and hydrate.
- FIX (WorkCard): added `mounted` state + `useEffect(() => setMounted(true), [])`; the author line renders `authorTitle` only on the server and swaps in `relativeTime(post.createdAt)` after mount: `[authorTitle, mounted ? relativeTime(post.createdAt) : null].filter(Boolean).join(' - ')`. Import updated to `useEffect, useRef, useState`.
- SCOPE: `relativeTime` is used in ~10 other places (notifications, recruitments x3, requests, trending, messages, RecruitmentCard, RecruitmentDetailBody). They share the same latent risk; only WorkCard was fixed here because it is the reported crash. A shared hydration-safe `<RelativeTime>` client component would fix all sites at once - TODO.
- NOTE: edits to these files repeatedly reported success but did not persist while a VS Code buffer was open/unsaved (see Problem Log). Final changes were written directly on disk and verified with `sed`/`grep` + `npx tsc --noEmit` (clean).

### 2026-11-18 - Post media: 9:16 / 16:9 frame with fill-vs-contain

- USER: when uploading an image, let the poster choose 9:16 or 16:9. If the image really is close to that shape it should FILL the frame (all four edges, accepting a tiny trim). If it is genuinely a different shape it must NOT be cropped - it keeps its own proportions.
- NEW `lib/posts/aspect.ts`: `AspectRatio`, `ASPECT_VALUE`, `ASPECT_CLASS`, `ASPECT_TOLERANCE` (0.1 = 10% of the target ratio), `fillsFrame()`, `nearestAspect()`, `parseAspect()`, `aspectFromMetadata()`.
- WHY 10%: 9:16 is 0.5625, so tolerance accepts roughly 0.506-0.619. Covers phone photos and normal exports; tighter rejected real files, looser started counting near-square images as portrait.
- STORAGE: `MediaAsset.metadata` is an existing `Json` column, so `{ aspect: '9:16' }` needed NO MIGRATION. `mediaRows()` and the update path both write it; `actions.ts` validates the value on write (`'16:9'` else `'9:16'`) rather than trusting the hidden input.
- COMPOSER (`NewWorkForm`): a Frame selector appears once an image exists. On upload the image is probed with `new Image()` + `decode()` and the matching frame is PRESELECTED, so the user confirms rather than guesses.
- FEED CARD (`WorkCard`): the card's outer frame was hardcoded `lg:aspect-[9/16]` - it now uses the post's aspect. The media is still two stacked images (blurred cover behind, main in front). The FRONT image measures its own ratio in `onLoad` and sets `data-fit=cover|contain`: within tolerance it fills all four edges, otherwise it is contained over the blur that already existed. Nothing is ever cropped outside tolerance.
- DETAIL PAGE (`WorkDetailBody`): image wrapped in the chosen aspect with `object-cover`. Deliberate difference from the card - at full width the blur fallback looked wrong, so the frame wins there.
- EDIT PAGE: passes the saved aspect back into the form, so editing does not silently reset it.
- All feed queries use `include` (not `select`), so `metadata` flows through without changes.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser - needs a real 9:16, a near-9:16 and a 16:9 upload checked in the feed and detail page, and the fill/contain switch confirmed visually.

### 2026-11-18 - Work performance and All posts scroll internally

- USER: liked that the Buy boosts popup stays static with an inner scroll; wants the same for Work performance.
- `WorkPerformanceList.tsx`: the visible `ul` gained `scroll-hidden max-h-[14rem] overflow-y-auto`, so the card keeps a fixed size and the rows move. 14rem is roughly three rows plus the divider spacing.
- `AllPostsModal.tsx`: the popup list gained the same treatment at `max-h-[60vh]`. This is the one that actually matches the Buy boosts popup - the panel and title bar stay fixed, only the list scrolls.
- Both use the existing `.scroll-hidden` utility, so no scrollbar is visible.
- NOTE: `WorkPerformanceList` still slices to `VISIBLE = 4` before rendering. With a 14rem cap the fourth row sits below the fold and needs a scroll to see, which is slightly odd for a list that was already capped at 4. If the scroll feels pointless there, either raise the cap to fit all 4 (~19rem) or drop the slice - a decision for the user, not something to change unprompted.
- Verified: no typecheck needed (class names only). NOT verified in a browser.

### 2026-11-18 - Boost summary: closing sentence removed

- USER: cut "The same budget over more days means fewer recruiters per day." Reason (agreed before cutting): it is accurate but it sits last, right before the price and the button, and describes the DOWNSIDE of a choice the user just made. It reads as a warning and invites them to second-guess the duration instead of proceeding.
- Nothing is hidden by removing it: the line directly above still states the pacing plainly as `~N boosts per day`. The number carries the fact; the cut sentence only carried the interpretation.
- `BoostForm.tsx`: summary paragraph now ends at the per-day figure.
- Verified: no typecheck needed (copy only). NOT verified in a browser.

### 2026-11-18 - btn-secondary text follows the theme

- USER: the Close text in the Buy boosts popup should be white in dark mode.
- `app/globals.css`: `.btn-secondary` changed from `text-brand` to `text-ink`. Brand purple on a dark surface is unreadable, and this is a leftover from before the app-wide "no purple text" sweep - every other accent had already moved to `text-ink`.
- Fixed at the CLASS, not in `BuyBoostsButton`: `.btn-secondary` is used in 8 places (error page, not-found, contact, edit profile, work detail, buy boosts). They all had the same purple-on-dark problem, so patching one call site would have left the rest broken.
- The fill is still `bg-brand-light`, which already has a dark override (`#24242e`), so the button reads as a subtle dark chip with light text in dark mode.
- Verified: no typecheck needed (CSS only). NOT verified in a browser.

### 2026-11-18 - Country picker: flat field, viewport-capped list

- USER: remove the grey behind "Search countries…" (it should lie directly in the box), and the dropdown was too long for the screen.
- `CountryMultiSelect.tsx`: the combobox wrapper lost `bg-white` and the input lost its UA field styling (`border-0 bg-transparent p-0 focus:ring-0`). The input now sits directly in the bordered box with no inset panel. NOTE: the outer box is deliberately NOT `bg-white` any more - it inherits the surrounding surface, which is what the user asked for.
- Dropdown height changed from `max-h-64` (fixed 16rem) to `max-h-[min(16rem,60vh)]`. A fixed height is fine on a short page but let the list run past the bottom of a laptop viewport; capping against `60vh` keeps the last entries reachable without scrolling the page first.
- Still `overflow-y-auto` + `scroll-hidden`, so the bar stays invisible as before.
- FOLLOW-UP, same day: the user wants the dropdown to stay INSIDE the Boost Visibility card rather than floating over the page. `app/(app)/profile/visibility/page.tsx` - that section gained `overflow-hidden`. The list is absolutely positioned, so clipping the card is what keeps it inside the frame. TRADE-OFF: the list is cut at the card edge instead of spilling; if a future change makes the card too short, the country list will look truncated and the fix is card padding/height, NOT removing `overflow-hidden`.
- FOLLOW-UP, same day: the list now opens UPWARD (dropup). The field sits low in the card, so a downward list hit the card's bottom edge and was clipped by the new `overflow-hidden`. The panel is anchored `bottom-full mb-1` instead of `top-full mt-1`. The height cap stays for the same reason: the card clips, so an over-tall list gets cut at the top instead.
- HEIGHT raised on request from `max-h-[min(16rem,60vh)]` to `max-h-[min(24rem,70vh)]` - 24rem / 70vh shows noticeably more countries before scrolling. Remember the card still clips: if entries start disappearing at the TOP of the list, lower this, do not remove `overflow-hidden`.
- REVERSED the same day: back to a DROPDOWN (`top-full mt-1`), because the user prefers it and wants it to stop at the bottom of the Boost Visibility card. Height lowered to `max-h-[min(12rem,50vh)]` so it fits the remaining card space instead of being clipped by the card's `overflow-hidden`. The list still scrolls internally, so every country stays reachable. If the bottom of the list ever looks cut off, reduce this cap - never remove the card's clipping.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser - the 60vh cap is a judgement call, not measured against the real boost form.

### 2026-11-18 - Duration buttons labelled with the number

- USER: 7 should show 7, 14 should show 14, 30 should show 30, Custom should show 1.
- `BoostForm.tsx`: each preset button is now the NUMBER (`text-[18px] font-bold`) with a small `days` caption underneath, instead of "7 days" on one line. Three identical-looking boxes became three distinct choices.
- The Custom button shows `1` at rest and switches to the live `customDays` value while Custom is selected.
- `customDays` default changed from `'5'` to `'1'`. Clicking Custom RESETS it to `'1'` rather than inheriting whatever was typed before - so the button label and the input always agree on entry.
- Reducing below the floor is still ALLOWED: `NumberInput` clamps only at `min={1}`, so the user can type or step to 1 and the existing floor message (`A N-day run needs at least N boosts (1 per day)`) appears instead of blocking the control. This was already the behaviour - only the label changed.
- FOLLOW-UP, same day: 7 days was showing 1 boost, which is below the 1-per-day floor, so the form opened in an invalid state. `boosts` is now SEEDED from the day count (`useState(String(BOOST_DAY_OPTIONS[0]))`), and a new `chooseDays(choice, dayCount)` helper re-seeds it whenever the window changes - preset click, Custom click (1), or typing a custom day count. The user can still raise or lower the budget afterwards; lowering below the floor shows the error rather than being blocked.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser - check the button height is unchanged now that it has two stacked lines.

### 2026-11-18 - Native number spinners replaced with SVG chevrons

- USER, after two failed CSS attempts: just make the arrows white in dark mode and dark in light mode. The native spinner cannot do this - it is UA chrome with an uncolourable arrow IMAGE, and on a dark field the browser paints its own track, which is what showed up as a dark box on hover.
- NEW `components/ui/NumberInput.tsx`: `appearance: none` on the native spinner, and two absolutely-positioned buttons holding the EXISTING `ChevronIcon` (`direction="up"` / `"down"`). They use `text-ink-muted` / `hover:text-ink`, so they inherit the theme automatically - white-ish in dark mode, dark in light mode, with no filter and no track.
- Props: `value` is the RAW STRING so half-typed input survives; `onChange(next: string)`; optional `min`/`max`/`step`/`id`/`placeholder`/`ariaLabel`/`className`. The stepper buttons are `tabIndex={-1}` so they do not join the tab order, and they clamp to min/max.
- `app/globals.css`: the `filter: invert(...)` rule is GONE. Replaced by a global `appearance: none` (both WebKit pseudo-elements, plus `-moz-appearance: textfield`). Do NOT re-enable the native spinner - it would double up with the custom arrows.
- Replaced in `BoostForm.tsx` (custom days, boost count) and `BuyBoostsButton.tsx` (boost amount). Any FUTURE number input should use `NumberInput`, not a bare `<input type="number">`, or it will have no arrows at all.
- FOLLOW-UP, same day: arrows changed from stroked `ChevronIcon` to SOLID triangles with curved edges, per the user. Drawn inline in `NumberInput` as a filled `<path>` with quadratic corners in a `0 0 10 6` viewBox, `fill-current`; the down arrow is the same path with `rotate-180`. Do NOT go back to `ChevronIcon` here - it is a stroked polyline and at 6px the round joins blob together.
- DIRECTION FIX: the raw path points DOWN (apex at the bottom), so the INCREASE button needs `rotate-180` and the DECREASE button takes the path unrotated. They were initially swapped - if the arrows ever read inverted again, check which button carries `rotate-180` before touching the path.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser - the arrow alignment inside the 4px-wide stepper column and the focus ring around the wrapper both need a look in both themes.

### 2026-11-18 - Number-input spinners made theme-aware

- USER: the up/down arrows on the boost-count input look wrong in dark mode.
- Cause: the spinner steppers are BROWSER CHROME, not elements - they ignore the input's background and `color`. On a dark input they render as a light track with dark arrows.
- `app/globals.css`, APPENDED at the end (the dark-mode section - anything earlier loses the cascade): a base rule styles `::-webkit-inner-spin-button` / `::-webkit-outer-spin-button` with `var(--surface-sunken)` and `var(--line)`; an `html.dark` rule darkens the track to `#2f2f3b` and applies `filter: invert(1) brightness(1.6)` so the UA-drawn arrows become light instead of dark-on-dark.
- The arrows themselves cannot be recoloured directly - the filter is the only lever short of replacing the native control, which was not worth it for a stepper.
- FOLLOW-UP, same day: the painted spinner track (`background-color` + `border-left`) looked like a dark box and the user rejected it. Both background rules were REMOVED; only the `filter: invert(1) brightness(1.6)` on the arrows remains, and the track is transparent so the input's own background shows through. Do not re-add a background here.
- Applies to EVERY number input app-wide (boost count, custom days, boost amount), not just this one - intentional, they all had the same problem.
- Firefox does not support these pseudo-elements; it keeps its native spinner, which follows the OS colour scheme. Unverified.
- Verified: no build or typecheck needed (CSS only, not yet rendered). NOT verified in a browser - needs a dark-mode look at the boost form.

### 2026-11-18 - Country picker: searchable grouped dropdown, not a chip grid

- USER: the flat chip grid was the wrong presentation. Wanted a dropdown, multi-select, type-to-filter, countries shown under their starting letter.
- NEW `components/ui/CountryMultiSelect.tsx`: search input inside a bordered field; the list opens below it as an absolute panel (`z-20`, `max-h-64`, `scroll-hidden`) with STICKY letter headings; selected values appear as removable chips above the field.
- Order of operations matters: FILTER FIRST, THEN GROUP. Grouping the unfiltered list would leave empty letter headings visible while searching. The `useMemo` keys on `query` only.
- Matches on BOTH the display name and the ISO code, so typing "NG" finds Nigeria.
- Closes on outside mousedown (document listener) and on Escape from the input. The chevron button toggles without stealing focus, then refocuses the input.
- Values stay ISO codes; `countryName()` is used only for display in chips.
- `BoostForm.tsx`: chip grid replaced by `<CountryMultiSelect value={targetCountries} onChange={setTargetCountries} />`. The hidden `targetCountries` inputs and the "Showing everywhere / N countries" line are unchanged, so the action contract did not move. The now-unused `toggleCountry` helper was removed.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser - the open/close behaviour, the sticky headings, and the panel overlapping the summary card below it all need a look.

### 2026-11-18 - Boost country targeting (by viewer IP)

- USER: boosters should choose which countries their boosted posts show in. Decided to do COUNTRIES ONLY for now; recruiter-type targeting is deferred - the user will add a "kinds of professionals I'm interested in" field to the recruiter profile edit form first, and targeting keys off that later.
- Geo source: **Vercel**. `x-vercel-ip-country` is set by the edge and cannot be spoofed by the client, so no GeoIP database and no IP parsing. It is ABSENT in local dev, which is why the resolver is permissive.
- `prisma/schema.prisma`: `Boost.targetCountries String[] @default([])`. EMPTY = everywhere, so every existing row keeps working with no backfill. Also replaced the STALE `days` comment (it referenced a `BOOST_WINDOW_DAYS` constant that does not exist) with an accurate description of the budget/window model.
- NEW `supabase/032_boost_target_countries.sql`: additive `ALTER TABLE "Boost" ADD COLUMN IF NOT EXISTS "targetCountries" TEXT[] NOT NULL DEFAULT '{}'`.
- NEW `lib/geo/countries.ts`: curated ISO 3166-1 alpha-2 list + `countryName()`, `isKnownCountry()`. CURATED, not exhaustive - add entries as needed. Never key off display names.
- `services/boosts/schedule.ts`: `getActiveBoosts(now, viewerCountry)` filters by country; both `boostedPostForViewer` and `boostedProfileForViewer` take a trailing `viewerCountry` argument. PERMISSIVE: empty list matches everything, and `null` (unknown country - local dev, VPN, lookup failure) matches everything. Showing nobody anything because geo failed is worse than showing everyone.
- `app/api/home/route.ts` + `app/api/explore-boost/route.ts`: handler signature changed from `GET()` to `GET(request: Request)` to read the header. Both routes are already `force-dynamic`; the boosted slot is chosen per request, so there is no cache leak between countries.
- `actions.ts`: validates every submitted code with `isKnownCountry` (a tampered form cannot store an unsupported country) and persists `targetCountries`.
- `BoostForm.tsx`: "Where should it show?" toggle-chip picker over the curated list, plus a hidden input per selected code. Copy is explicit that this follows WHERE THE VIEWER IS, not where they are from.
- Verdict on the "by IP" question: the boost pin is computed per request in a route handler, so the country is reachable and correct. The known limitation is that IP geolocation is approximate (VPNs, corporate proxies) and a recruiter travelling sees the boost for the country they are in.
- Verified: `npx tsc --noEmit` CLEAN, and the generated Prisma client already contains `targetCountries`. `npx prisma generate` FAILED with EPERM (the dev server holds `query_engine-windows.dll.node` open) - the client had been regenerated by the running dev server, so this was not blocking, but a clean generate should be run after stopping `next dev`. NOT verified in a browser; NOT tested against a real Vercel deployment with geo headers.

### 2026-11-18 - Boost pricing: budget, not days x boosts

- USER: did not like days x boosts. New rule, stated by the user: budget = credits spent (1 boost = $1); days = the WINDOW that budget is spread over. 7 days and 30 days at the same budget cost the SAME credits, but the longer run has less per-day visibility. HARD FLOOR: at least 1 boost per day, so a 30-day run needs >= 30 boosts.
- `lib/pricing/boosts.ts` REWRITTEN: `boostCost(credits, days)` now returns `credits` unchanged (0 if below the floor). NEW `meetsDailyFloor(credits, days)`, `minBoostsForDays(days)`, `MIN_BOOSTS_PER_DAY`. NOTE: the signature changed from `(days, boosts)` to `(credits, days)` - the two numbers swapped roles; do not "restore" the multiplication.
- `app/(app)/profile/visibility/actions.ts`: enforces `meetsDailyFloor` server-side (error names the minimum), cost = budget, error text dropped the "(days x boosts)" suffix. `weight` still comes from the budget, NOT from days.
- `components/profile/BoostForm.tsx`: copy now says the input is the budget and that days spread it; summary line reads "M boosts over N days" with a computed `~per day` figure; inline error when below the floor.
- SCHEDULER UNCHANGED (`services/boosts/schedule.ts`). It only reads `weight` and `expiresAt`, so a thinner budget over a longer window already produces the intended "fewer recruiters per day" effect.
- Design note: this mirrors Facebook Ads - budget sets volume, duration sets pace - except the estimate shown here is a simple `budget / days`, not an auction forecast.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser; no boost was started end to end.

### 2026-11-18 - Visibility popups: scrollbars hidden

- USER: hide the scrollbar in the work performance and boost visibility popups.
- `components/ui/Modal.tsx` (shared popup shell): `scroll-hidden` added to the overlay (`modal-overlay ...`) and to the `fullScreenOnMobile` inner `overflow-y-auto` region. The plain `p-6` content div is not a scroll container and was left alone.
- `components/profile/PostPickerModal.tsx` (the boost form's "All posts" picker, infinite-scroll list): `scroll-hidden` added to the `max-h-[50vh] overflow-y-auto` list - the one region here that genuinely scrolls.
- Reused the EXISTING `.scroll-hidden` utility in `app/globals.css` (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`). No new CSS, no change to scroll behaviour - only the bar is invisible.
- Scope note: `BuyBoostsButton` has no internal scroll region (the overlay scrolls), and `BoostForm` renders inline on the visibility page rather than in a popup, so the shared Modal shell plus the picker list cover both surfaces.
- Verified: both files re-read after writing (the first write attempt silently did not apply; it was reapplied and confirmed). NOT verified in a browser; no build/lint run.

### 2026-11-18 - Boost Visibility page brought onto the standard page shell

- USER: the Visibility page should follow the same design style as the other pages.
- `app/(app)/profile/visibility/page.tsx` was the odd one out. Shell changed from `flex-1 min-w-0 w-full pb-4` + a `page-header` wrapper + an INNER `px-3 py-3 sm:px-4 sm:py-4` (so it was padded twice) to the standard `w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6`. The inner padded div was removed, not just restyled.
- Heading now matches Saves/Explore: `text-[26px] font-bold tracking-tight text-ink` (was `text-xl font-bold leading-8`), subtitle `mt-1 text-[14px] text-ink-muted` (was `text-[13px] text-ink-subtle`).
- CONTENT UNCHANGED - the four stat cards, Work performance list, active-boost panel and `BoostForm` are byte-identical. This was a shell/typography change only. `BuyBoostsButton` still sits top-right of the header.
- THE PATTERN, for any page still off-style: wrapper `w-full px-3 pb-6 pt-2 sm:px-4 lg:pt-6`, heading `text-[26px] font-bold tracking-tight text-ink`, subtitle `mt-1 text-[14px] text-ink-muted`, and NO inner padded container.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser.

### 2026-11-18 - Shared PostTileGrid; Saves becomes a real grid with its own reel; nav list extracted

- These were made outside this session and were NOT in the notes; recorded here after reading the source.
- NEW `components/explore/PostTileGrid.tsx`: the masonry tile grid SHARED by Explore and Saves. Takes `items` plus `hrefKind: 'exploreReel' | 'authorReel' | 'savedReel'`, and builds each tile link from that. `onTileClick` is optional and client-only.
- IMPORTANT PATTERN, with the reason recorded in the file: `hrefKind` is a STRING MODE, not a callback, because a server component (the Saves page) renders this client component and FUNCTIONS CANNOT BE PASSED ACROSS THE SERVER->CLIENT BOUNDARY - it throws at runtime, while `tsc`/build stay green. Keep it a serializable mode. Do not "tidy" it into a function prop.
- NEW `components/profile/SavedWorkGrid.tsx` (client): the Saves grid plus round-trip scroll restore, keyed `saves:grid` with a `:returning` flag set on tile click. NO pagination - Saves renders its full list in one server fetch. Same rAF-after-layout ordering as the other grids.
- `app/(app)/profile/saved-work/page.tsx`: now maps saved posts onto Explore's `GridItem` shape so both grids render through `PostTileGrid`, and includes `mediaAssets` (without it every tile falls back to the gradient - the recurring silent break). Empty state links to Explore.
- NEW ROUTE `app/(app)/profile/saved-work/reels/page.tsx`: the Saves-scoped `ReelFeed`. Ordered by WHEN THE POST WAS SAVED (newest save first) so the reel mirrors the grid, not by post date. Tiles therefore open SAVED work, not the author's reel or the global feed.
- THREE SCOPED REELS NOW EXIST, all sharing `ReelFeed`: `/explore/reels`, `/[username]/reels`, `/profile/saved-work/reels`. Each answers to its own surface's tile grid. Do not collapse them into one.
- NEW `components/navigation/navItems.ts`: `NAV_ITEMS` extracted so the desktop sidebar and mobile drawer read ONE list (they had drifted). Order: Home, Explore, My List (UsersIcon), Messages, Saves, Notifications, Requests, Boost Visibility, Settings. Sidebar/Drawer should import this rather than keep local copies.
- `components/navigation/TopBar.tsx` (client): a `sticky` blurred bar with the POSITIONED.PRO wordmark, `xl:hidden`. IT IS NOT MOUNTED - `app/(app)/layout.tsx` renders `MobileTopBar` from `MobileNav.tsx`, not this. Treat TopBar as DEAD CODE; delete it or wire it in deliberately, but do not assume it is what users see.
- NOT VERIFIED in a browser by this session; the code was read, not run.

### 2026-11-18 - Purple text removed app-wide; use theme ink (dark in light mode, white in dark)

- USER: no more purple text. Use plain white/dark text depending on light or dark mode.
- EVERY `text-brand` / `text-brand-dark` in source was replaced with `text-ink`, which is `var(--ink)`: near-black in light mode, off-white in dark mode. A source-wide search for `text-brand` now returns ZERO matches.
- Scope: names/titles/organisation lines, experience company, skill pills, chips/badges (HIRING, VERIFIED, boosted, New), directory titles, gradient-tile fallback labels, avatar INITIALS on `bg-brand-light`, tab active states, sidebar/drawer/bottom-nav active items, hover accents, the WorkCard/RecruitmentCard saved icon, request CV/Portfolio links, and the recruiter verified checkbox accent.
- KEPT as brand: FILLED brand elements (`bg-brand` buttons, the raised Create button, the `bg-brand` tab underline bar, the brand wordmark tile) and `border-brand*`. Those are backgrounds/fills, not text, and still read correctly in both modes.
- THE RULE: theme text uses `text-ink` / `text-ink-muted` / `text-ink-subtle`. Do NOT reintroduce `text-brand` for body or label text; reserve brand for fills, borders and the logo.
- Verified: `npx tsc --noEmit` CLEAN, `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning), and a search for `text-brand` in `**/*.tsx` returns no matches. NOT verified visually in a browser.

### 2026-11-18 - Published grid is edge-to-edge on mobile

- USER: on mobile the Published posts should touch the screen edge (no padding).
- Three insets had to go on mobile for the tiles to actually reach the edge:
  1. `app/(app)/[username]/page.tsx` wrapper `px-3` -> `px-0 sm:px-4` (desktop unchanged).
  2. `components/profile/ProfileBody.tsx`: the card body wrapper is `px-0 sm:px-4`, and the HEADER content moved into its own `px-3 sm:px-0` block so the avatar/name/buttons keep a gutter while the tabs + grid below are full-bleed.
  3. `components/profile/ProfilePosts.tsx` published `<ul>`: `gap-[2px] p-0 sm:gap-1 sm:p-1` - the OUTER padding is removed on mobile and the GAP BETWEEN tiles is **2px** there (4px from `sm` up). Settled on 2px after trying 0, 4 and 3.
- The ROLES grid (recruiter) was NOT changed - only Published.
- If the grid ever stops reaching the edge again, check all THREE insets: page wrapper, card body, and the ul padding. Removing only the ul's `p-1` is not enough.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Reduced page padding on mobile

- USER: general page padding on mobile is too much.
- The page containers used `px-4` (16px) at every width. They are now `px-3` (12px) on mobile with `sm:px-4` restoring the old gutter from the `sm` breakpoint up, so desktop is unchanged. Some page wrappers also got a smaller top/bottom on mobile (`pt-3`/`py-3` with `sm:` restoring the larger value).
- Files touched: `app/(app)/list`, `app/(app)/profile/saved-work`, `app/(app)/settings` (+ `loading.tsx`), `app/(app)/[username]`, `app/(app)/explore` (header, grid, and the chip row's negative margin matched to `-mx-3 sm:-mx-4`), `app/(app)/requests` (+ `[id]`), `app/(app)/profile/work/new` (+ `[id]/edit`), and `components/messages/MessagesClient`.
- RULE: mobile gutters are `px-3`, desktop `sm:px-4`. Keep new page wrappers on that pattern so the mobile gutter stays consistent.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Bio / About character limits

- USER asked for word limits; agreed on **BIO 60** characters and **ABOUT 1,000** characters.
- NEW `lib/profile/limits.ts`: `BIO_MAX = 60`, `ABOUT_MAX = 1000` - the single source both the forms and the server actions read.
- NEW `components/settings/CharCounter.tsx`: live `n / max` counter, amber within 10 of the cap, rose at the cap.
- FORMS: `ProfessionalSettingsForm` Bio (`name=title`) is `maxLength={BIO_MAX}` with a counter; its About (`name=bio`) is `maxLength={ABOUT_MAX}` with a counter. `RecruiterSettingsForm` has only About - same treatment. Both are now CONTROLLED for those two fields (needed for the live count); `useEffect` re-syncs from props so a save/remount shows the saved value.
- SERVER: `app/(app)/profile/settings/actions.ts` rejects overlong values in BOTH `updateProfessionalProfile` (title > BIO_MAX, bio > ABOUT_MAX) and `updateRecruiterProfile` (bio > ABOUT_MAX). A crafted request cannot bypass `maxLength`.
- NOTE: BIO is stored in the `title` column and ABOUT in `bio` - labels were swapped long ago; keep that straight. No schema change.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Edit profile / Share shrunk on mobile

- USER: reduce the sizes of Edit profile and Share on mobile.
- `components/profile/ProfileBody.tsx` (EditProfileButton className) and `components/profile/ShareProfileButton.tsx`: MOBILE is now `rounded-lg px-3 py-1.5 text-[13px]`; from `sm` up the previous look is restored with `sm:rounded-xl sm:px-4 sm:py-2 sm:text-[14px]`. Desktop is unchanged.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - FIX: full-screen mobile modal looked transparent when scrolling

- USER: the Edit profile popup showed transparent when scrolled, on mobile.
- CAUSE: the Modal OVERLAY was `overflow-y-auto` and the full-screen panel was `h-full`. When content was taller than the viewport the OVERLAY scrolled, dragging the opaque panel up and leaving the blurred backdrop (translucent) showing behind it - which reads as a transparent popup.
- FIX in `components/ui/Modal.tsx`: when `fullScreenOnMobile`, the overlay is now `overflow-hidden` on mobile (only `sm:overflow-y-auto` restores overlay scrolling on desktop) and the PANEL BODY scrolls internally (`overflow-y-auto`, reset to `sm:overflow-visible`). So on a phone the panel stays edge-to-edge opaque and only its content scrolls. Non-full-screen modals keep the old overlay scroll behaviour.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Edit profile full-screen on mobile; About shows full text

- USER: (1) on mobile the Edit profile popup should have NO border line and NO curved edges; (2) since About has its own tab now, drop the read-more clamp and show the whole text.
- `components/profile/ProfileEditModal.tsx`: the shared `Modal` is now given `fullScreenOnMobile`, which below `sm` is `rounded-none border-0` edge-to-edge (the Modal already handled this for messages). Desktop keeps the `max-w-[720px]` rounded card.
- `components/profile/AboutSection.tsx`: REWRITTEN as a plain paragraph. The 4-line `line-clamp` and the More/Less toggle are GONE - the full text renders as written (`whitespace-pre-line`). It no longer needs `useState`.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Profile gains an About tab (before Experience)

- USER: the profile no longer showed the about text (it had been sitting under the header); add it as a TAB before Experience.
- `components/profile/ProfilePosts.tsx`: tab type is now `'published' | 'about' | 'experience'`; added the ABOUT tab between Published/Roles and Experience, with the same active underline. The About panel renders `AboutSection` (clamp + More/Less), or "No about added yet." when empty. The restored-tab initializer now accepts `about` as well as `experience`.
- The panel takes a NEW `about?: string | null` prop.
- `components/profile/ProfileBody.tsx`: the standalone bio block under the header was REMOVED (it would otherwise show twice) and the bio is passed to `ProfilePosts` as `about={prof?.bio || recruiter?.bio || null}`. The now-unused `AboutSection` import was dropped.
- Tab order: Published (Roles for recruiters) -> About -> Experience.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Profile header: smaller avatar/name, moved up (mobile-only lift)

- FOLLOW-UP: the lift was meant for MOBILE only and the first pass still read as too much space. Header padding is now `pt-1 lg:pt-3` - a tighter top on mobile, unchanged on desktop. Size reductions (avatar 64px, name 19px, handle 13px, title 14px) apply at all widths.

- USER: reduce the image and name text sizes, and take the image a bit upwards.
- `components/profile/ProfileBody.tsx`: avatar `h-20 w-20` -> `h-16 w-16` (initials `text-xl` -> `text-lg`); name `text-[22px]` -> `text-[19px]`; @handle `14px` -> `13px`; title/organization `15px` -> `14px`. Header padding `py-5` -> `pb-5 pt-3` to lift the avatar toward the top; the gap under the avatar `mt-3` -> `mt-2`. Bio and everything below are unchanged.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Profile header rearranged: stacked layout + Share button

- USER: bio should go BELOW the image icon and the name/username; and for the profile owner show Edit profile and Share (profile link as a button).
- `components/profile/ProfileBody.tsx`: the header is no longer a two-column (avatar left / text right) row. It is now STACKED: avatar (80px) -> name + @handle + title/org + recruiting badge -> action row -> location/posts/availability row -> BIO -> skills. The outer wrapper is `px-4 py-5`; the inner `flex gap-5` and its right-column `div` were removed (watch for the extra `</div>` when editing this block - a first attempt left one and broke JSX).
- OWNER ACTION ROW now shows `EditProfileButton` + the NEW `ShareProfileButton`. Non-owners keep Save / Contact / Add-to-list unchanged.
- NEW `components/profile/ShareProfileButton.tsx` (client): copies `${origin}/${handle}` to the clipboard via `navigator.clipboard`, label flips to \"Copied\" for 1.5s; falls back to `window.prompt` if the clipboard API is unavailable (insecure context). Uses `ShareIcon`.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-18 - Mobile bars trimmed: top = search only; bottom tab = Notifications

- USER (only these two changes): (1) remove the notifications and messages icons from the MOBILE TOP BAR, leaving only search; (2) replace the Profile icon in the MOBILE BOTTOM BAR with the Notifications (bell) icon.
- `components/navigation/MobileNav.tsx`: `MobileTopBar` right cluster is now the search link only. `MobileBottomNav` tabs are Home, Explore, Create (raised centre), Messages, Notifications (`/profile/notifications`, `BellIcon`). The Profile tab is GONE from the bottom bar - the profile is still reachable via the drawer's ProfileMenu (View profile) and the top-bar/drawer links.
- Removed the now-unused `UserIcon` import and `profileHref`/`user` usage from `MobileBottomNav`. `BellIcon` stays (now used in the bottom bar). The drawer is unchanged: it still lists NAV_ITEMS (Requests included) and the ProfileMenu.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). Built on a clean cache. NOT verified in a browser.

### 2026-11-18 - Profile Create-post removed; mobile drawer; Requests out of bottom bar

- USER (three asks): (1) remove "Create post" from the profile since the sidebar already has it; (2) add the sidebar as a DRAWER menu on mobile; (3) remove Requests from the mobile bottom menu.
- PROFILE: removed the owner-only `CreatePostTrigger` block ("+ Create post") from `components/profile/ProfileBody.tsx` and its now-unused import. Posting is reached via the sidebar/rail Create Post button (and the mobile centre button).
- MOBILE BOTTOM BAR: removed the Requests tab from `MobileBottomNav`. Tabs are now Home, Explore, Create (raised centre), Messages, Profile.
- NEW SHARED NAV: `components/navigation/navItems.ts` exports `NAV_ITEMS` (and the `NavItem` type). The SIDEBAR and the MOBILE DRAWER both read it, so the two lists cannot drift again (the Requests removal is exactly the kind of thing that used to go stale in one place). Edit NAV_ITEMS to add/remove a destination for BOTH.
- NEW MOBILE DRAWER: `MobileNav.tsx` rewritten. `MobileTopBar` gained a hamburger (`MenuIcon`, newly added to `components/icons.tsx` - a 3-line icon matching the stroke style). It opens a left slide-in drawer (`w-[280px] max-w-[82vw]`, `bg-surface`) listing NAV_ITEMS with active state + unread badge, and a `ProfileMenu` (View profile / Sign out) pinned at the bottom. Closes on backdrop click, Escape, and route change; locks body scroll while open. Hidden at `lg` (sidebar takes over).
- `Sidebar.tsx` now imports `NAV_ITEMS` instead of its local list; dropped the many unused icon imports.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). Built on a clean cache. NOT verified in a browser.

### 2026-11-17 - FIX: messages/modal stayed WHITE in dark mode

- USER: white background showing in dark mode in the conversation popup.
- CAUSE: the messages work hardcoded `bg-white` instead of the theme token. `bg-white` is a literal white and does NOT invert. The correct token is `bg-surface` (`--surface`: `#ffffff` in light, `#1a1a22` in dark - see tailwind.config.js `surface.DEFAULT` and globals.css).
- FIXED `bg-white` -> `bg-surface` in: `components/ui/Modal.tsx` (panel - this affects EVERY modal, not just messages), `components/messages/ConversationView.tsx` (loading card, error card, root panel, and the \"their\" bubble), `components/messages/MessagesClient.tsx` (list container), `components/contact/ContactButton.tsx` (popup panel). The \"mine\" bubble stays `bg-brand text-white` - brand is correct in both themes.
- RULE: for any surface that must invert with the theme, use `bg-surface` / `bg-surface-sunken` / `bg-surface-muted`, NOT `bg-white`. `bg-white` is only acceptable on something intentionally always-white (e.g. a white pill on a brand fill). Watch for this on remaining legacy pages.
- STILL WHITE (not touched, outside the messages path): `components/contact/ListRow.tsx` uses `bg-white` - same class of bug; fix when List is revisited.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). NOT verified visually in dark mode - user to confirm.

### 2026-11-17 - Conversation popup: full-screen on mobile, scrolling reply, compact header

- USER: (a) on mobile the popup should FILL THE SCREEN; (b) the reply section should NOT be static on mobile or desktop; (c) the chat-title header takes too much space.
- `components/ui/Modal.tsx`: added an OPTIONAL `fullScreenOnMobile` prop (default false, so no other modal changes). When true the overlay is `items-stretch p-0` below `sm` and the panel is `h-full rounded-none border-0`; from `sm` up it returns to the normal centred card with `max-h-[calc(100dvh-5rem)]`. The body becomes `flex min-h-0 flex-1 flex-col` on mobile so children can fill height. The title bar is `flex-shrink-0` so it never scrolls.
- `components/messages/ConversationView.tsx`: (1) HEADER collapsed from a two-line block (uppercase label + 18px subject) to ONE compact line `Name · subject` at `13px` with `px-4 py-2.5`. (2) REPLY is no longer `flex-shrink-0` outside the scroll area - it now sits INSIDE the scrolling region, after the messages, so messages and reply scroll together and nothing is pinned static. Root card is `sm:rounded-2xl sm:bg-white` so it goes edge-to-edge on mobile.
- `components/messages/MessagesClient.tsx`: passes `fullScreenOnMobile`; thread wrapper is `h-full sm:h-[70vh]` (mobile fills the full-height panel body, desktop keeps a definite height).
- SCROLL-TO-NEWEST: still runs on the same `scrollRef` (the region that now also holds the reply). Because the reply is inside it, the scroll lands just past the last message - acceptable, and the reply is visible at the end of the thread. If that feels wrong later, move the scroll anchor to a sentinel div above the reply.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; only the pre-existing middleware->proxy warning). Built on a clean cache (dev server stopped first). NOT verified in a browser.

### 2026-11-17 - Messages conversation is a POPUP (right pane removed)

- USER: clicking a message should open the conversation as a popup, and the right side should CLEAR. So the two-pane inbox (list + permanent thread) is gone.
- NEW `components/messages/MessagesClient.tsx` (client): full-width conversation list plus the shared `Modal` holding `ConversationView`. Owns `openId` state. On close it revalidates `/api/messages` and `/api/unread` so the list's unread badge and preview update after reading/replying.
- `components/messages/MessagesList.tsx`: rows are now a `<button onClick={() => onOpen(c.id)}>` instead of a `PrefetchLink` to `/messages/<id>`. The author name is still a profile link with `stopPropagation`. `onOpen` is a required prop.
- `app/(app)/messages/`: `layout.tsx` DELETED (no more two-pane). `page.tsx` renders `<MessagesClient />`. `[id]/page.tsx` now just `redirect('/messages')` so an old link or a refresh of `/messages/<id>` lands on the inbox instead of 404 - the conversation is not a route any more. If deep-linking a specific thread is ever wanted, use `/messages?open=<id>`, do not revive a permanent pane.
- MODAL FIT: `ConversationView` is `h-full` flex with its own internal scroll region, so the modal wraps it in a fixed `h-[70vh]` box - otherwise the thread has no definite height to scroll within. Modal title is "Conversation".
- TOOLING: deleting the messages layout made `tsc` fail with `Cannot find module '../../app/(app)/messages/layout.js'` - the known STALE `.next/types` artifact. Fixed by stopping the dev server, `rm -rf .next`, then tsc/build (also avoids the Turbopack font-cache corruption). Build went from 20 to 19 pages after the layout delete.
- ALIGNMENT (user follow-up): the list was first centred with `mx-auto max-w-[760px]`; the user wants it LEFT-ALIGNED like the other pages. `MessagesClient` now uses `w-full px-4` with no max-width, matching Explore. The POPUP stays centred - that is the shared `Modal`'s own `justify-center`, so do not "left-align" the modal when changing the page.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (19 pages; `/messages` + `/messages/[id]` present; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - Sidebar avatar opens a menu with Sign out

- USER: there is no Sign out link; add it as a dropdown when the profile image is clicked.
- NEW `components/navigation/ProfileMenu.tsx` (client): the sidebar's bottom avatar is now a BUTTON that opens a dropdown with "View profile" and "Sign out". The menu opens UPWARD (`bottom-full`) because the avatar is pinned to the bottom of the rail, and closes on outside-click or Escape. Shows name + subtitle in a header row.
- SIGN OUT reuses the same logic as the old `SignOutButton`: `createClient().auth.signOut()`, then `router.push('/auth/login')` and `router.refresh()` so server components drop the stale session. Uses the existing `@/lib/supabase/client` - no new API route.
- `components/navigation/Sidebar.tsx`: the profile `Link` was replaced with `<ProfileMenu />`; removed the now-unused `initialsOf` import. Desktop only (`lg+`) - the sidebar is `hidden ... lg:flex`. MOBILE (`MobileBottomNav`) was NOT changed: it still has a Profile tab that links to the profile. If mobile needs Sign out too, that is a separate addition.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (20 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - Messages moved into the sidebar shell + restyled

- USER: make Messages the same design as the other pages. It was on its own `TopNav` shell with legacy styling (`card`, `text-gray-*`, `bg-gray-50`).
- ROUTE MOVED to `app/(app)/messages/` (`layout.tsx`, `page.tsx`, `[id]/page.tsx`); old `app/messages/` DELETED. `/messages` now renders inside the sidebar shell like Settings. NOTE: this is the same kind of move that was reverted on 2026-11-06, but the user now wants consistency (Settings was already moved and approved), so Messages follows.
- LAYOUT HEIGHT GOTCHA: the `(app)` shell is WINDOW-scroll (`min-h-screen`), but a two-pane inbox needs a definite height so the list and thread scroll independently. `app/(app)/messages/layout.tsx` pins `h-[calc(100dvh-56px-64px)]` on mobile (top bar 56 + bottom nav 64) and `lg:h-[100dvh]` on desktop, with `min-h-0` on both panes so their inner `overflow-y-auto` scrolls instead of stretching.
- RESTYLED: `MessagesList` rows are flat `border-b border-line` rows with `hover:bg-surface-sunken` (was `card` + shadow), unread uses `bg-brand-light/40` + a `bg-brand` count badge; text is `ink`/`ink-muted`/`ink-subtle`. Empty/error states use `text-ink-subtle`. `ConversationView` header border `#e5e5e5` -> `border-line`, card `rounded-xl` -> `rounded-2xl`, gray text -> tokens. The two-pane structure and reply form are unchanged.
- TOOLING GOTCHA THAT COST TIME: after `rm -rf .next` the build failed with `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` (8 errors on `app/layout.tsx`'s `next/font/google` DM Sans). This is NOT a code error - it is a CORRUPT TURBOPACK FONT CACHE held by the RUNNING dev server. Wiping `.next` while the dev server runs leaves the font module unresolved. FIX: STOP the dev server, `rm -rf .next`, then build. tsc was clean throughout and the code was fine.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED after the cache clear - 20 pages, `/messages` and `/messages/[id]` present, only the pre-existing middleware->proxy warning. NOT verified in a browser.

### 2026-11-17 - Settings moved into the sidebar shell and restyled (APPROVED - supersedes the 2026-11-06 rule)

- The Settings page was restyled to the new token vocabulary AND moved from its own `TopNav` shell into the `(app)` sidebar shell: `app/(app)/settings/page.tsx` + `loading.tsx` created, old `app/settings/` (page, layout, loading) DELETED. `/settings` now renders inside the left sidebar shell like Feed/Explore/List/Saves.
- THIS OVERRIDES THE 2026-11-06 RULE ("do not move routes into `(app)` unless the shell itself is wanted"). That rule was recorded after a prior move was reverted. On 2026-11-17 the user reviewed the moved+restyled result and said "settings is currently perfect" - so the move is now the INTENDED state. Do NOT move `/settings` back to a `TopNav` layout.
- Body restyled: left-aligned `w-full px-4` header (`text-[26px] font-bold tracking-tight text-ink`), body capped `max-w-[720px]`, sections are `rounded-2xl bg-white` cards (no legacy `.card`/`.btn-secondary`), toggles/select use the `ink`/`surface-sunken`/`line` tokens. The Account / Notifications / Privacy / Appearance sections and all `/api/settings` behaviour are unchanged.
- `/messages` was NOT touched - it still uses the `TopNav` layout. So `/settings` and `/messages` now have DIFFERENT shells by design.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED with `/settings` resolving from the `(app)` group (only the pre-existing middleware->proxy warning). User confirmed it is "perfect".

### 2026-11-17 - Saves gets its OWN reel + returns you to the tile you clicked

- USER SPEC: clicking a post on Saves should open a reel you can scroll through the OTHER SAVED posts, and going Back to the grid should land you on the post you were on before clicking.
- NEW ROUTE `app/(app)/profile/saved-work/reels/page.tsx`: reuses the SAME `ReelFeed` component, scoped to the viewer's SAVED posts (not the author's whole reel, not the global feed). Ordered by when each post was SAVED (newest save first), so the reel order mirrors the grid. `?post=` focuses the clicked one. Not-found when the viewer has saved nothing.
- `components/explore/PostTileGrid.tsx`: added a THIRD `hrefKind`, `savedReel` -> `/profile/saved-work/reels?post=<id>`. Still a serializable STRING mode - do NOT convert it back to a callback (see the RSC bug in the Saves entry below; a server component renders this).
- NEW `components/profile/SavedWorkGrid.tsx` (client): the Saves grid + return-to-position. Because the Saves page is a SERVER component, the tile `onTileClick` and the scroll restore had to move into this client wrapper. On tile click it writes `saves:grid:returning = '1'` and the current `scrollY`; on mount it reads the flag ONCE, removes it, and restores `scrollY` in a `requestAnimationFrame` so the grid has laid out first. Same round-trip idea as Explore, minus pagination.
- `app/(app)/profile/saved-work/page.tsx`: now renders `<SavedWorkGrid items={items} />` instead of `PostTileGrid` directly. Query and `GridItem` mapping unchanged.
- WHY THIS COULD NOT BE DONE IN THE PAGE: a server component cannot pass an `onClick` to the client grid (same function-prop restriction that broke the first Saves attempt). Hence the wrapper.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED - 20 pages, `/profile/saved-work/reels` present in the route list, only the pre-existing middleware->proxy warning. Dev server logged a clean `GET /profile/saved-work 200` with no runtime error. NOT verified in a browser - the scroll-through-the-reel and the Back-to-grid restore are unexercised.

### 2026-11-17 - Saves is now a grid of saved posts, same as Explore

- USER: Saves (`/profile/saved-work`) should be a GRID of the saved posts, like Explore. It was a vertical list of old-style `card` rows.
- NEW `components/explore/PostTileGrid.tsx`: the Explore masonry tile grid EXTRACTED into a reusable presentational component (`GridItem` type lives here now). It renders tiles only - no pagination, filtering or scroll restore. Link destination is a SERIALIZABLE `hrefKind: 'exploreReel' | 'authorReel'` prop (see the bug below), and `onTileClick` is an optional hook used ONLY by client callers (do not pass it from a server component).
- `components/explore/ExploreGrid.tsx` now REUSES `PostTileGrid` for its tiles and re-exports `GridItem` for compatibility. Its infinite-scroll/cursor/filter/scroll-restore logic is unchanged - only the tile markup moved out.
- `app/(app)/profile/saved-work/page.tsx` REWRITTEN: same Prisma saved-work query, mapped onto `GridItem[]` and rendered through `PostTileGrid`. Header is now the Explore style (`text-[26px] font-bold tracking-tight text-ink` + `text-ink-muted` subtitle), left-aligned `px-4`. Empty state gets an "Explore work" button.
- CRITICAL: the saved-work query now includes `mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 }`. Without it every tile would silently fall back to the gradient placeholder - the SAME silent-break class flagged for the feed and the old all-posts page.
- TILE DESTINATION: a saved tile opens `/[username]/reels?post=<id>` - the author's OWN reel, matching the recorded post-open rule (profile-style tile -> person's reel; only a SHARED link goes to `/feed`). Not `/feed`.
- NOT DONE HERE: the grid is a single server-rendered batch (no infinite scroll) - the user asked for a grid, not pagination. If saves grow large, it can adopt Explore's cursor pattern later.
- BUG FOUND BY THE USER ("something went wrong" error boundary): the FIRST version passed a `hrefFor(item)` FUNCTION prop from the SERVER-COMPONENT Saves page into the CLIENT `PostTileGrid`. React throws at render: "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'." CRITICALLY, `npx tsc --noEmit` AND `npx next build` BOTH PASSED - this is a runtime RSC boundary rule, invisible to the type checker and the build. FIX: replaced the function prop with `hrefKind` (a plain string); the component computes the href itself. Both callers updated. THE LESSON: never pass a callback from a server component to a client component, and treat tsc/build green as NOT proof a page renders - hit the URL and read the dev-server log.
- Verified: `npx tsc --noEmit` CLEAN, `npx next build` SUCCEEDED, AND the dev server logged a clean `GET /profile/saved-work 200` with NO function-prop error after the fix. Grid appearance itself not eyeballed in a browser.

### 2026-11-17 - My List page brought in line with the redesigned pages

- USER: the My List page did not match the new page styling. It was still on the PRE-REDESIGN vocabulary - `.page-header`, `.card`, `.btn-primary`, `text-gray-*`, `bg-gray-100` - never swept when Explore/Profile were redone.
- `app/(app)/list/page.tsx`: container is now `w-full px-4 pb-6 pt-2 lg:pt-6` - LEFT-ALIGNED and full-width like EXPLORE, NOT the profile's centred `max-w-[980px]`. A first pass used the centred column and the user asked for Explore's left alignment instead; Explore itself has no max-width cap, just `px-4` gutters. Heading is `text-[26px] font-bold tracking-tight text-ink` with a `text-[14px] text-ink-muted` subtitle, matching Explore. Empty state uses `text-ink-subtle` and a real `rounded-xl bg-brand ... hover:bg-brand-dark` button instead of `btn-primary`. List spacing `space-y-2` -> `space-y-1` for the flatter row style.
- `components/contact/ListRow.tsx`: row is now `rounded-2xl bg-white ... hover:bg-surface-sunken` (no `.card`), avatar is `rounded-full bg-brand-light text-brand` (no `bg-gray-100`), and text uses `text-ink` / `text-ink-subtle` / `text-ink-muted` (no `gray-*`). The `FollowPostsButton` action is unchanged.
- LEFT ALONE DELIBERATELY: `page-header`, `.card`, `.btn-primary` still exist in `globals.css` and are still used by other legacy pages (`profile/saved-work` among them). This change only restyled List; do not delete those globals until every consumer is migrated.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (20 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - Explore is now TRUE infinite scroll: first 48, then pages until the end

- USER SPEC: Explore should show 48 first, then infinite-scroll more, until it reaches the END of all posts.
- BEFORE: `/api/explore-grid` had no pagination - one fixed `take=48`, clamped at 60 - and `ExploreGrid` only REVEALED 20 at a time from that capped pool. So the grid could never go past 48; it was reveal-only, not load-more.
- `app/api/explore-grid/route.ts` NOW PAGINATES. Cursor-based: `?cursor=<lastPostId>` returns the next page, response is `{ items, nextCursor }`. Ordering is `createdAt desc, id desc` and the cursor condition is `createdAt < anchor.createdAt OR (createdAt = anchor.createdAt AND id < anchor.id)` - the id tiebreak is REQUIRED because `createdAt` is not unique and two same-millisecond posts would otherwise be skipped/duplicated across a page boundary. It fetches `take + 1` rows to decide `hasMore` without a count query. `take` is clamped to 1..60.
- `components/explore/ExploreGrid.tsx` REWRITTEN to own the data. The page now hands in `initialItems` + `initialCursor` (first 48 only); the grid appends pages by calling `/api/explore-grid?take=48&cursor=<cursor>` whenever the revealed count catches up with what is loaded. It stops only when `nextCursor` is null. `loadingRef` guards against overlapping fetches; returned items are de-duped by id.
- Two reveal rules are kept from the profile-grid lessons: the observer only fires after a REAL scroll (`hasScrolled`), and `rootMargin` is 50px. A follow-up effect re-reveals when a new page lands while the sentinel is still on screen (the observer will not re-fire because the sentinel never left view).
- FILTER RESET: `ExploreGrid` keys on `${query}\u0000${category}` in a ref and resets items/cursor/visible when the filter signature changes, so pages fetched under a previous search do not linger. While a filter is active (`filtering`), auto-paging is DISABLED - search/category are still client-side text matches over the first 48 only, so silently crawling every page to satisfy a text filter would be wasteful and slow. If Explore needs true server-side search, that is a separate change.
- SCROLL RESTORE: unchanged mechanism (`explore:grid` + `:returning` in sessionStorage), still re-applied in a rAF after the restored count renders.
- END STATE: when `nextCursor` is null and everything is revealed, a "You're all caught up." line shows and the sentinel unmounts.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (20 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser - the actual page-through-the-end behaviour is unexercised. Note: with only the current DB content there may be fewer than 48 matching posts, so infinite scroll will not visibly trigger until there are more than 48.

### 2026-11-17 - Explore gets its OWN reel + 20-at-a-time grid loading

- USER SPEC: the same treatment the profile got, applied to Explore. A tile clicked on Explore must open EXPLORE'S reel (not the home feed), and the grid must load 20 at a time on scroll.
- NEW ROUTE `app/(app)/explore/reels/page.tsx`: reuses the SAME `ReelFeed` component, scoped to the same post set Explore's grid shows (published, professional-owned, has media), newest first, `?post=` focuses the clicked one. NOT the global feed - `/explore/reels`, parallel to `/[username]/reels`.
- NEW `components/explore/ExploreGrid.tsx` (client): the masonry grid moved out of the page. Reveals `PAGE = 20`, and an `IntersectionObserver` adds 20 more. Same two guards as the profile grid, both learned from bugs there: `hasScrolled` stops it firing at mount, and `rootMargin` is 50px. The revealed count and scroll offset are kept in `sessionStorage` under `explore:grid`, with the same `:returning` flag written on tile click, so a round trip through a post comes back to the same place with the grid still expanded.
- TILES NOW OPEN `/explore/reels?post=<id>`. Before this they went to `/feed?post=<id>` (the global feed) - that was wrong for Explore.
- THE PAGE'S OLD `explore:scroll` EFFECT WAS DELETED. It restored on mount BEFORE the grid had re-expanded and fought the new restore. Do not add a second scroll-restore to the page.
- FETCH CAP: `/api/explore-grid?take=48` is deliberately unchanged (user said leave it at 48). 20-at-a-time is how many are REVEALED, not how many are fetched - with 48 loaded, scrolling reveals 20, then 20, then the remaining 8. Raise `take` if Explore should have a deeper pool.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED - 20 pages, `/explore/reels` present in the route list, only the pre-existing middleware->proxy warning. NOT verified in a browser.

### 2026-11-17 - Profile gets Published/Experience tabs; posts load 9-at-a-time; all-posts page DELETED

- USER SPEC: add an Experience tab after Published; remove "All posts"; the Published tab shows 9 posts and loads more ON SCROLL; there is no all-posts page any more; and a post opens AS A FEED POST.
- NEW `components/profile/ProfilePosts.tsx` (client). Renders the two tabs and both panels. PUBLISHED is a **3-COLUMN** tile grid (`grid-cols-3`, `aspect-square`), so the first 9 posts form a 3x3 block, and an `IntersectionObserver` on a sentinel `div` raises the visible count by 9 (another 3x3) each time it comes into view. A first version used `lg:grid-cols-5` - WRONG, the user wants 3x3; do not widen it back to 5.
- NEW `components/work/ReelFeed.tsx` - the snap reel extracted so the GLOBAL FEED and a PROFILE'S REEL share ONE implementation instead of two copies. Props: `posts` (entries of `{id, item}`), viewer id/role, `followingIds`, `pendingByPost`, `fulfilledPostIds`, `focusPostId`, `emptyMessage`. It owns the snap container AND the one-time deep-link scroll, which is why the feed page no longer has its own scroll effect or `scrollRef`. If the reel layout needs changing, change it HERE and both surfaces follow.
- BUG FOUND BY THE USER: a profile with 10 posts showed ALL 10 immediately instead of 9 then 1 on scroll. CAUSE: the first version of the persistence restored `visible` from `sessionStorage` on EVERY mount, so a previously-visited profile started above 9. FIX: a separate `RETURN_KEY` (`profile:<handle>:returning`) is written ONLY when a tile is CLICKED (`markReturning`), and read+deleted ONCE at the top of the component into a `returning` state. `visible` restores only when `returning` is true; a FRESH visit always starts at exactly PAGE (9). The scroll re-assert is gated on `returning` too, so a fresh visit does not jump to a stale offset.
  - ORDERING MATTERS: `returning` must be read BEFORE the `visible` initializer, because reading it consumes the key. Both initializers run in declaration order, so `returning` is declared first.
- LOAD-MORE GATING, also user-reported: the observer fired at mount because `rootMargin: '200px'` counted the sentinel as visible straight away, loading a second batch before any scroll. Now `hasScrolled` (set by a real scroll listener) gates the increment and the margin is 50px. A fresh profile shows exactly 9 and nothing more until the user scrolls.
- SCROLL + PROGRESS SURVIVE THE ROUND TRIP (user-requested). Tapping a tile and coming Back must land where you were, with the grid still expanded. `ProfilePosts` keeps a per-profile record in `sessionStorage` under `profile:<handle>` holding `{ visible, tab, scrollY }`. The initializers READ IT so `visible` starts at the previously-revealed count instead of resetting to 9 - that is the important part, because Next restores scroll against a SHORTER page otherwise and the offset gets clamped to the bottom. `scrollY` is saved on scroll (passive) and again on unmount, and re-applied in a `requestAnimationFrame` after the restored count renders. If this ever misbehaves, check the ORDER first: tiles must render before the scroll is re-asserted.
- INFINITE SCROLL IMPLEMENTATION NOTE: the posts are already fully loaded by the server component - the observer only REVEALS more. There is no paginated API, no extra request, and no loading spinner. If the post count ever gets large enough that loading them all server-side is a problem, this needs a real paginated endpoint instead.
- TILES OPEN `/[username]/reels?post=<id>`. USER CORRECTED TWICE here, final answer: a post clicked inside a profile must open that PERSON'S OWN posts in feed/reel style, and it must be ITS OWN ROUTE under the profile - NOT `/feed`. An intermediate attempt used `/feed?author=...`; that was rejected and the `author` param has been REMOVED from `/feed` entirely.
- NEW ROUTE `app/(app)/[username]/reels/page.tsx`: server component, fetches that professional's PUBLISHED posts (with `mediaAssets` take 1 and the `professional.user` shape WorkCard needs), newest first, and renders the reel. No ad splicing, no boost reordering, no demo fallback - it is one person's work. `?post=` opens on that post.
- A post still opens AS A FEED REEL and the feed cards are still not clickable - that rule is unchanged. Do not point the tiles at `/[username]/work/[id]`.
- TWO ENTRY POINTS, DELIBERATELY DIFFERENT - do not merge them:
  - PROFILE TILE  -> `/[username]/reels?post=<id>` (that person's own reel).
  - SHARED LINK   -> `/feed?post=<id>` (the GLOBAL home feed, landing on that post).
  `WorkCard` now has a separate `shareHref = /feed?post=<id>` used by the share/send handler; `href` (the old `/[username]/work/[id]`) is retained only for internal links. Before this fix the shared URL was the old detail page, which was wrong.
- EXPERIENCE moved INTO the tab; the standalone `ExperienceSection` under the posts is gone. The Experience panel reuses `ExperienceSection` and shows "No experience added yet." when empty.
- `app/(app)/[username]/posts/` WAS DELETED ENTIRELY (the all-posts page and its grid work from the previous entry). The profile's "All posts" link is gone with it. Nothing links to that route now.
- THE PROFILE'S 3-IMAGE SECTION IS REPLACED by the Published tab grid - it is no longer 3 images plus a link, it is 9 tiles plus scroll. (This is different from the previous entry, which preserved the 3-image block; the user has now asked for the tabbed grid instead.)
- RECRUITER profiles: the Roles tab now also renders as tiles (title on a gradient), not the old single-card + "All roles" link, since that link pointed at the deleted page.
- TOOLING: `rm -rf .next` failed with "Directory not empty" while the dev server ran. Stopping the dev server first fixed it - same class of lock as the `prisma generate` EPERM.
- Verified: `npx next build` SUCCEEDED, 20 pages, `/[username]/posts` ABSENT from the route list, only the pre-existing middleware->proxy warning. NOT verified in a browser - the tabs, the scroll behaviour and the feed deep link are all unexercised.

### 2026-11-17 - Profile width/border; the ALL-POSTS page became a 5-wide grid

- PROFILE (`components/profile/ProfileBody.tsx`, `app/(app)/[username]/page.tsx`): the card was too wide, then a first cap was too tight. Settled on `max-w-[980px]` centred with page gutters `px-4 lg:px-6`, and the `border border-line` was REMOVED (user request); it keeps `bg-white` + `lg:rounded-2xl`.
- THE PROFILE'S OWN POSTS SECTION IS UNCHANGED: 3 square images + an "All posts" link. A first attempt replaced it with a full grid and deleted the link - the user rejected that ("the profile was perfect as it was") and it was REVERTED. Do not turn the profile into the grid again.
- THE GRID BELONGS TO `app/(app)/[username]/posts/page.tsx` - the page you reach by clicking "All posts". Its professional-posts branch was a vertical list of text cards and is now a tile grid: `grid grid-cols-3 gap-1 lg:grid-cols-5`, each tile `aspect-square` with the first image, falling back to a gradient with the title.
- THAT PAGE'S QUERY did not include `mediaAssets`, so every tile would have shown the gradient fallback. Added `include: { mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 } }`. Same silent-break class as the feed notes from 2026-11-10/11.
- The RECRUITER branch of that page is UNCHANGED - roles still render as a list of cards, not tiles, because a role has no image. If recruiters should get a grid too, it needs its own tile design.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (20 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - My Work removed; Saves added; My List icon changed

- USER DECISION: the My Work page is redundant - the profile page already lists posts and links to them. Removed entirely.
- DELETED `app/(app)/profile/work/page.tsx` and `app/(app)/profile/work/loading.tsx`. KEPT everything else in that folder: `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx` and `actions.ts` are the post CREATE/EDIT routes and are still in use. Do not delete the whole folder.
- `components/navigation/Sidebar.tsx`: removed the `My Work` nav item and the now-unused `BriefcaseIcon` import. Added `{ name: 'Saves', href: '/profile/saved-work', icon: BookmarkIcon }`. CHANGED the `My List` icon from `BookmarkIcon` to `UsersIcon` (the two-profile-faces glyph) - per the user, My List is a people list, so the faces icon fits and frees the bookmark for Saves.
- `app/api/my-work/route.ts` STILL EXISTS and is now unreferenced by any page. Left in place; safe to delete later.
- TOOLING NOTE, will recur: after deleting a page, `npx tsc --noEmit` failed with `Cannot find module '../../app/(app)/profile/work/page.js'`. That is a STALE `.next/types/validator.ts` artifact, not a real error. `rm -rf .next` then rebuilding fixed it. Do not go hunting the source for a missing import when the path in the error points into `.next/`.
- Verified: after clearing `.next`, `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED - 20 pages, and `/profile/work` is absent from the route list. NOT verified in a browser.

### 2026-11-17 - Recruitment TEAM MODE removed

- USER DECISION: posting a job is now like any other post, so the "Individual role / Recruit a team" switch is unnecessary. A recruiter writes multiple roles into the description of ONE post. Team mode is gone from the UI.
- `components/recruitments/RecruitmentForm.tsx`: removed the `Mode` type, the `mode` state and switch, the `TeamRole` type, `emptyRole()`, the `roles` state, `updateRole()`, the `teamRoles` hidden input, the entire roles editor, and the `createTeamRoles` import and action branch. The action is now simply `isEdit ? updateRecruitment : createRecruitment`. The `salaryHidden` hidden input is no longer conditional on mode (it was only gated because team roles carried their own flag). The submit label no longer branches on team mode.
- The description placeholder now reads "What the role involves. For several roles, list them here." so the multi-role intent is discoverable.
- `components/recruitments/RecruitmentComposerModal.tsx`: `initialMode` prop removed; the form `key` is now just the employment type.
- `createTeamRoles` STILL EXISTS in `app/(app)/profile/recruitments/actions.ts` but is now UNREFERENCED by any component. It is dead code - safe to delete when convenient, and worth removing before Phase 4 so nothing depends on it.
- Nothing in the database changed. Previously created team postings are just ordinary Recruitment rows and are unaffected.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - Recruitment posts gain image/video; publish gated until complete

- USER REQUEST: recruiters must be able to add EITHER an image OR a video, like professionals can, and Publish must stay inactive until the post is complete. Also: the recruiter composer got the subtitle "Share a recruitment post, then choose how you'd like people to respond to you" (mirrors the professional one).
- DECISION MADE EXPLICITLY: this went on the `Recruitment` table (option A), NOT through the `WorkPost` composer (option B). Recruitment is still marked DEPRECATED and still slated for Phase 4 - this adds to what Phase 4 must remove or migrate. Recorded so that is not a surprise later.
- MIGRATION `supabase/031_recruitment_media.sql` adds `imageUrl`, `videoUrl`, `mediaType` (all TEXT NULL) to `Recruitment`. APPLIED with `npx prisma db execute --file ... --schema prisma/schema.prisma` - raw SQL, NOT `db push`, for the standing `User_username_key` drift reason. Media is NOT `MediaAsset`: that model is hard-wired to `workPostId` and reusing it would need a polymorphic owner.
- Prisma model updated to match; client regenerated. NOTE THE TOOLING GOTCHA HIT AGAIN: `prisma generate` failed with `EPERM ... query_engine-windows.dll.node` because the dev server held the DLL. Stopping `npm run dev` first fixed it - same lesson as 2026-11-16.
- `components/recruitments/RecruitmentForm.tsx`: added the same media block as `NewWorkForm` - image upload via `/api/upload` OR a YouTube URL, mutually exclusive (picking one clears the other), with preview, Remove, and an invalid-link warning. Hidden inputs `imageUrl`/`videoUrl` submit it. THE PUBLISH BUTTON is now `disabled={pending || !hasMedia || videoInvalid}`, matching the professional rule.
- `app/(app)/profile/recruitments/actions.ts`: `extract()` and `rawValues()` carry `imageUrl`/`videoUrl`, and `createRecruitment` writes `imageUrl`, `videoUrl`, and `mediaType` (`IMAGE` / `YOUTUBE` / null).
- `components/recruitments/RecruitmentCard.tsx`: renders the YouTube embed or the image above the title. Type gained the three media fields.
- KNOWN GAPS: (a) `updateRecruitment` does NOT yet write the media fields - editing a role will not change its media; (b) TEAM MODE creates several roles but media is not yet threaded into `createTeamRoles`; (c) `RecruitmentDetailBody` does not render media yet; (d) media is required by the FORM but NOT validated server-side, so a direct POST could still create a medialess role.
- Verified: migration applied ("Script executed successfully"), `prisma generate` succeeded, `npx tsc --noEmit` CLEAN, `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.

### 2026-11-17 - Explore now shows REAL professional posts (was: one row per profile)

- USER-REPORTED: Explore looked like "random usernames". CAUSE, two of them: (1) `/api/explore-grid` returned ONE ROW PER PROFESSIONAL PROFILE, not per post, so anyone without a published post came back with `image: null` and rendered as an initials tile; (2) the page fell back to the DEMO_PEOPLE sets whenever there were fewer than 6 live items, so invented people appeared on top of that.
- `app/api/explore-grid/route.ts` REWRITTEN to query `WorkPost` directly. Filters: `status: PUBLISHED`, `professionalId: { not: null }`, `recruiterProfileId: null`, `mediaAssets: { some: {} }`, and the author's profile visible. RECRUITMENTS ARE EXCLUDED BY CONSTRUCTION - a post with a `recruiterProfileId` never matches. Ordered newest-first. Each item is now keyed by the POST id (`id` and `postId` are both the post id).
- RECRUITMENTS IN THE UI: the user's rule is they may appear ONLY inside the feed reels (the existing ad-style interleaving). Explore, and anything else, must not show them. This endpoint enforces that for Explore.
- `app/(app)/explore/page.tsx`: the DEMO_PEOPLE / DEMO_PEOPLE_2 fallback and their imports were REMOVED. Explore is now real posts only; when there are none it shows the existing "Nothing to show yet." message rather than fabricated tiles.
- Posts WITHOUT media are skipped by the query rather than rendered as empty tiles. If Explore ever looks sparse, the reason is missing media on posts, not a filter bug.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.
- FOLLOW-UP RISK: with the demo data cleaned out, Explore may look EMPTY until real posts with images exist. The placeholder seed script (`node scripts/seed-placeholder-posts.js`) adds demo posts; if those are used for a demo they will appear here as real tiles, so remember `--clean` before shipping.

### 2026-11-17 - Feed cards no longer navigate; Explore opens a post IN the feed

- USER RULE: clicking a feed post must NOT open anything. The ONLY place a post opens as a link is Explore, and it must present exactly as the feed does. Back from that post returns to Explore at the same scroll position.
- `components/work/WorkCard.tsx`: ALL navigation removed from the card. The media gradient fallback was a `<Link>` to the post - now a `<div>`. The author avatar and name were `<Link>`s to the profile - now `<div>`/`<span>`. The comment icon was a `<Link href={post}>` - now a `<span>`. `FollowPostsButton`, like/save/send, the CTA and the read-more toggle are UNCHANGED and still interactive. The card still computes `href` for the follow/share text but does not navigate with it.
- Explore tile (`app/(app)/explore/page.tsx`): now links to `/feed?post=<postId>` when the grid item has a `postId`, falling back to the profile only when it has none. Previously it linked to the PROFILE, never the post.
- Feed deep link (`app/(app)/feed/page.tsx`): reads `?post=`, each card carries `id={`post-${id}`}`, and a `useEffect` scrolls the matching card into view ONCE (guarded by `deepLinkDone` so re-renders do not yank the user back). The feed is a snap scroller, so the user can continue scrolling to other posts from there, which was the requirement.
- Explore scroll restoration: Explore scrolls the WINDOW (no inner scroll container), so a `useEffect` saves `window.scrollY` to `sessionStorage` on scroll and on unmount, and restores it once on mount then clears it. This is what makes Back land at the same place.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser - the deep-link scroll, the snap positioning, and the Back restoration have not been exercised.
- KNOWN GAPS: (a) the deep link uses `scrollIntoView`, which in a snap container can land close-but-not-exact; if it looks off, compute the offset from the container instead; (b) demo posts in the feed are not database rows, so a `?post=` id belonging to a DEMO post will not match and simply will not scroll; (c) Explore's demo fallback tiles have no real `postId` in some cases and fall back to the profile.

### 2026-11-17 - Reel caption: TWO layout states - full-bleed overlay, then shrunk media + panel

- USER CORRECTION, the final spec after several attempts (all earlier ones recorded below and REJECTED - do not rebuild them): the card has TWO LAYOUT STATES, not one layout that grows.
  - COLLAPSED (default): the media fills the WHOLE frame. There is NO dark caption panel. The caption is OVERLAID at the bottom over a soft gradient, ONE line with an ellipsis, and the CTA is already visible.
  - EXPANDED (after clicking more): the layout becomes a vertical flex column. The media region SHRINKS on top (`object-contain`, so it scales and is never cropped) and a SOLID dark caption panel appears BELOW it in normal flow with the full text, `Show less`, and the CTA.
- `components/work/WorkCard.tsx`: `expanded` state switches between two return branches. Shared pieces were extracted so there is no duplication: `mediaVisual` (iframe / contained image over a blurred copy / gradient fallback), `header` (author, overlaid on the media in BOTH states), `actionRail` (docked bottom-right in both states), and `cta()`.
- The `… more` button only exists in the collapsed branch and switches to `expanded`; `Show less` only exists in the expanded branch. Collapsed has no `Show less` and expanded always has one, so the two cannot disagree.
- Toggle visibility is still a HEURISTIC (`caption.length > 60`) - line count cannot be measured without a layout pass.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.
- FINAL BEHAVIOUR, refined twice more with the user. (1) The caption panel being `shrink-0` let long text eat the frame and squeeze the media to zero - capped it, then (2) the user clarified it must look like INSTAGRAM's read-more: on expand the WHOLE media shrinks to roughly 1/3 of the card, keeping its TRUE aspect ratio (smaller in BOTH width and height, centred, never stretched or cropped), and the text panel takes the other ~2/3.
- IMPLEMENTATION: the two return branches were replaced with ONE transitioning layout. The MEDIA region is a flex child whose ratio animates `flex-[3_1_0%]` (collapsed) -> `flex-[1_1_0%]` (expanded); the image is always `object-contain`, so it scales in both dimensions as the region shrinks. The CAPTION PANEL animates `flex-[0_0_0%] opacity-0` -> `flex-[2_1_0%] opacity-100`. Both use `transition-[flex-grow] duration-300 ease-out`, so the change is SMOOTH rather than a jump. The collapsed overlaid caption fades and collapses its own height (`h-0 opacity-0`) so it does not linger over the shrunken media. `Show less` and the expanded panel content are gated on `expanded` because the panel has zero size when collapsed.
- FINAL REFINEMENT, user-requested: a FIXED 1/3 : 2/3 split left dead space under a SHORT caption. The panel is now CONTENT-SIZED. The media region is plain `flex-1`, and the caption panel is `shrink-0 max-h-[75%]` with natural height, so it takes exactly the height its text needs and the media only shrinks by that much. A very long caption scrolls inside the capped panel. The panel animates `h-0 opacity-0` -> `opacity-100` with `transition-all duration-300`.
- NOTE: because the panel's height is now content-driven, the two states are no longer a fixed ratio - do not "restore" a 3:1/2:1 flex split, that was the version that left empty space.
- CTA MOVED ABOVE THE TEXT, user-requested, in BOTH states. In the COLLAPSED overlay the CTA renders before the one-line caption. In the EXPANDED panel the layout is a `flex flex-col`: a `shrink-0` header holds ONLY the CTA (it does NOT scroll), and the caption text sits in the `min-h-0 flex-1 overflow-y-auto` region below it. So the CTA is always reachable whether the text scrolls or not. Do not move the CTA back into the scroll container.
- `Show less` SITS BENEATH THE TEXT, matching `… more` which sits beneath the collapsed caption (user-requested). It lives INSIDE the scroll region, directly after the caption paragraph, not in the fixed CTA header. The CTA stays pinned; only the toggle moves with the text.
- EARLIER FOLLOW-UP FIX, superseded by the above: with a long caption the media region collapsed to nothing instead of visibly SHRINKING, so media and text could be cut off. Cause: the expanded panel was `shrink-0` with no height limit, so a long caption could consume the whole frame and the `flex-1 min-h-0` media region was squeezed to zero. FIX: the expanded panel is now `max-h-[60%] ... overflow-y-auto`, so very long text SCROLLS inside the panel and can never take more than 60% of the frame; the media region keeps the remaining height and `object-contain` scales the image into it. Neither is clipped now.
- IF IT READS WRONG: likely tweaks are the 60-char threshold, the collapsed gradient strength, the panel's 60% cap (raise/lower if media or text need more room), and the panel colour `#0b0b10`.

### 2026-11-17 - Reel caption: one line + read-more, media SHRINKS above it (YouTube-shorts pattern)

- USER REQUEST, settled after TWO rejected attempts, recorded so neither is rebuilt: (1) a caption panel that GROWS and shrinks the media - rejected; (2) text overlaid on the media with a dark scrim over it - also rejected. THE FINAL PATTERN, named by the user as the YouTube-shorts read-more: the media and the caption are STACKED, not overlaid. Clicking more grows the caption and the MEDIA SHRINKS above it, keeping its own proportions.
- `components/work/WorkCard.tsx` (final): the frame is a VERTICAL FLEX COLUMN (`flex flex-col`). The MEDIA region is `relative min-h-0 flex-1 overflow-hidden bg-black` - a flex child that yields height. The CAPTION BLOCK is `shrink-0` in NORMAL FLOW below it - never an overlay, and it cannot be pushed out of the frame. The only thing overlaid on the media is the AUTHOR HEADER.
- THE MEDIA KEEPS ITS SIZE IN THE SENSE THAT IT IS NEVER CROPPED: the image is `object-contain`, so as its region shortens it SCALES DOWN and stays fully visible. That is what "shrinks but keeps its size" meant.
- THE CTA IS VISIBLE WHEN COLLAPSED. It sits below the caption in normal flow and is always rendered (for a non-author viewer), so expanding only reveals more TEXT - the CTA just moves down with it.
- CAPTION is `line-clamp-1` collapsed, unclamped when expanded, with a `… more` / `Show less` toggle. Toggle visibility is a HEURISTIC (`caption.length > 60`) because line count cannot be measured without a layout pass.
- The action rail is docked `bottom-3 right-3` inside the caption block, with `pr-12` on the text column so expanded text never runs under the icons.
- The caption block uses an opaque `bg-[#0b0b10]` (not a gradient) because it is a real panel now, not a scrim over the image.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy warning). NOT verified in a browser.
- IF IT READS WRONG: likely tweaks are the 60-char toggle threshold, how much of the media remains when a long caption is fully expanded, and the caption panel's solid background colour.

### 2026-11-17 - Feed is a full-screen 9:16 reel (both breakpoints), CTA inside the frame

- SPEC, confirmed with the user after a first wrong attempt: each card is a 9:16 portrait frame filling the screen top-to-bottom; a VISIBLE BORDER shows it is 9:16; media is CONTAINED (nothing cropped) over a blurred copy of itself; header, action rail and caption+CTA are OVERLAID inside the frame; on desktop the frame is sized by HEIGHT (fills viewport, width derived from 9/16). Mobile was already close to right - the one fix was putting the CTA inside the frame so it needs no extra scroll.
- `app/(app)/feed/page.tsx`: ONE reel at every breakpoint. Container `h-[calc(100dvh-56px-64px)] ... lg:h-[100dvh] lg:flex lg:justify-center` (mobile subtracts top bar 56px + bottom nav 64px; desktop has neither). The old centred `mx-auto max-w-[560px]` desktop column and its skeleton/empty branches were DELETED.
- `components/work/WorkCard.tsx` was REWRITTEN CLEANLY. An intermediate patch had left the frame `<div>` unclosed plus duplicated legacy desktop blocks; rather than keep patching, the whole file was rewritten so the structure is simply `article -> frame div -> (media, overlay) -> close`. The frame div: `relative h-full w-full overflow-hidden lg:mx-auto lg:h-full lg:w-auto lg:aspect-[9/16] lg:rounded-2xl lg:border-2 lg:border-white/25`. Media is `absolute inset-0` contained over a blurred backdrop; the overlay is `absolute inset-0` with header top, action rail `bottom-24 right-3`, caption+CTA in a bottom scrim.
- THE CTA IS NOW ONE FUNCTION (`cta()`) used only by the overlay, so there is exactly one implementation and it sits INSIDE the frame on both mobile and desktop. The old separate desktop CTA and the duplicate standalone mobile CTA block are gone. A no-media non-recruiting post falls back to a brand gradient so the frame is never empty.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 pages; only the pre-existing middleware->proxy deprecation warning). NOT verified in a browser - the 9:16 frame, border, contained media and in-frame CTA have never been looked at rendered.
- IF IT READS WRONG: the most likely adjustments are the desktop frame width (height-driven 9:16 can feel narrow or tall next to the left nav rail) and the action rail's `bottom-24` offset against the caption. Both are single class changes.

### 2026-11-17 - Feed 9:16 attempt: built, rejected, fully REVERTED (no net code change)

- USER REQUEST: "the feed is now centred. I want it to be a full 9:16 frame like instagram." This was acted on WITHOUT first confirming which 9:16 the user meant.
- WHAT WAS BUILT (and then thrown away): the centred `max-w-[560px]` desktop column in `app/(app)/feed/page.tsx` was replaced with a single full-height snap reel at every breakpoint (`lg:h-[100dvh]`, `lg:aspect-[9/16]` items), and `components/work/WorkCard.tsx` had every desktop gate inverted so the MOBILE overlay reel rendered on desktop too (legacy desktop markup left in place but `hidden`).
- WHY IT WAS WRONG: that is the REELS/TikTok shape - one post per screen, snapping, full-viewport, caption overlaid on the media. Instagram's FEED is a continuous scroll with header above, natural-aspect media, and actions/caption below. The user meant the feed. This is exactly the mistake the notes warn about: restructuring a page the user has called "perfect" without confirming the target first.
- REVERTED IN FULL. `app/(app)/feed/page.tsx` is back to the two branches (mobile-only reel `lg:hidden` + centred desktop column `mx-auto max-w-[560px] lg:block`). `components/work/WorkCard.tsx` gates are back to their original `lg:` split. `npx tsc --noEmit` CLEAN after the revert. No net code change from this task.
- LESSON, recorded for the next chat: "9:16 frame like Instagram" is AMBIGUOUS - ask which surface (feed list vs reels) before editing. Do not infer an interaction model from a ratio.
- STILL PENDING: the original request (the feed layout the user actually wants) has NOT been implemented. Awaiting a clear description of the target.

### 2026-11-16 - Supplier/requester fix, mobile Requests, edit-later, de-duplication

- PENDING STATE NOW DIFFERS BY WHO OWES THE DOCUMENTS. The CTA took a new `isSupplier` prop, computed in `WorkCard` as `(viewerSide ?? 'PROFESSIONAL') === authorSide` - the supplier is the side that OWNS the post.
  - SUPPLIER + pending -> a button that opens the fulfil modal.
  - REQUESTER + pending -> a static "Waiting for CV / portfolio / CV and portfolio" pill, NO action. Before this, a recruiter who had already requested a CV was offered a form to SUPPLY one.
- MOBILE `/requests` ENTRY. Added a Requests tab to `MobileBottomNav` with `FolderIcon`. NOTE: the bottom bar now has SIX slots (Home, Explore, Create, Messages, Requests, Profile) instead of the reference's five. It fits but is denser than the design - worth a phone-width look.
- EDIT-LATER FOR FULFILLED REQUESTS. `/requests/[id]` no longer passes `alreadyFulfilled`, which used to render a dead "Shared" confirmation with no way to correct a wrong URL. The form stays editable and pre-filled. `FulfilForm` still ACCEPTS `alreadyFulfilled` for other callers.
- DE-DUPLICATED THE RESPONSE LISTS. `app/(app)/profile/work/actions.ts` now IMPORTS `PROFESSIONAL_RESPONSES` / `RECRUITER_RESPONSES` from `lib/posts/response-types.ts` instead of keeping its own copy. They had already drifted once (MESSAGE was added to one and not the other), which is exactly how a dropdown value gets silently coerced away by validation. ONE list now. If you add a response type, change it in `response-types.ts` and the Prisma enum - nowhere else.
- RETIRED THE `Recruitment` QUERY FROM `/api/home`. The feed stopped rendering recruitments a while ago but the API still queried them. All of it is gone, INCLUDING the unauthenticated branch - **the response NO LONGER HAS A `recruitments` KEY AT ALL**. Any caller still reading `data.recruitments` gets undefined. The table and its satellite models still EXIST in the database and Prisma schema, marked deprecated; dropping them is still Phase 4 and has NOT been done.
- A MISTAKE MADE HERE, recorded: removing the query with `Promise.resolve([])` first produced four `never` type errors, and an intermediate edit left `recruitments` referenced in the unauth branch. Both were fixed, but the lesson repeats from earlier in the day - multi-edit batches need the FILE re-read afterwards, not just a green type-check.
- `db push` DRIFT IS UNCHANGED AND STILL UNRESOLVED. The `User_username_key` partial index conflict from the Phase 1 entry still applies; every schema change since has been applied as raw SQL in `supabase/NNN_*.sql` to avoid it. Nothing is broken today, but the next `db push` will hit it. Two known ways out, neither taken: drop and recreate the partial index as Prisma expects (briefly loses a uniqueness guarantee), or write a migration Prisma recognises (needs its snapshot inspected first). DECISION DEFERRED deliberately rather than risked.
- Verified: `npx tsc --noEmit` CLEAN. NOT verified in a browser: the Waiting/Submit states, the mobile six-tab bar, and the edit-later form have never been rendered.

### 2026-11-16 - Publish in place, request state split, fulfil modal, Message on both sides

- PUBLISH NO LONGER REDIRECTS. `createWorkPost` used to end with `redirect('/profile/work/<id>')`, which navigated away from the feed where the composer modal lives. It now returns `{ ok: true, createdId }`. `NewWorkForm` takes an `onPublished` callback, fires it from a `useEffect` when `state.ok` on a CREATE (not an edit), and `WorkComposerModal` responds by calling `clearCached('/api/home')` and closing.
  - WHY THE CACHE CALL IS NEEDED: `useCached` prefers its module-level copy over fresh SWR data, so a server `revalidateTag` alone leaves the client showing stale data. `clearCached(key)` was ADDED to `lib/client/use-cached.ts` (deletes the key and emits). Without it a new post does not appear until a hard reload.
- MESSAGE IS NOW ON BOTH SIDES. `RECRUITER_RESPONSES` gained `'MESSAGE'` as a fifth option, so a recruiter's post can ask for a conversation as well as Apply / Submit CV / Submit Portfolio / Submit CV & Portfolio. NOTE THE DUPLICATION: these lists exist TWICE - `lib/posts/response-types.ts` for the UI and `app/(app)/profile/work/actions.ts` for server validation. Change both or the action silently coerces the value back to the first entry.
- CONTACT GATE RELAXED. `sendContactRequest` no longer requires `role === 'RECRUITER'`. Either side can open a conversation, which is required for a professional to message from a recruiter's post. Verification STILL applies to recruiters (they need a profile and `isVerified`); a professional needs none. The self-contact guard, the recipient's `allowRecruiterMessages` preference and the 10/day limit are unchanged. The preference name is now slightly misleading - it still only gates RECRUITER-initiated messages.
- REQUEST STATE SPLIT, fixing a real bug the user hit: click Submit CV, add nothing, refresh -> the CTA said "Submitted - view" although no link existed. Cause: `/api/home` returned `requestedPostIds` built from ANY DocumentRequest row, ignoring status. It now returns `pendingRequestByPost` (postId -> PENDING request id) and `fulfilledPostIds`. The CTA has THREE states: no row -> action button; PENDING -> a button that opens the form; FULFILLED -> "Submitted - view". Because the id is returned, a refresh can reopen the correct pending form instead of creating a duplicate.
- FULFIL FORM IS A MODAL, not an inline box in the card (user instruction). `RequestDocumentsCta` wraps `FulfilForm` in the shared `Modal`.
- PENDING BUTTON WORDING: uses the post's own `label` ("Submit CV" / "Submit Portfolio" / "Submit CV & Portfolio") instead of a hand-built "Add your …".
- A MISTAKE MADE AND CORRECTED MID-EDIT, recorded so it is not repeated: `FulfilForm` was first written to call `onDone()` during render, which React forbids. It was moved into a `useEffect` keyed on `state.ok`. Also, an early version of the CTA declared `isPending?: boolean` and passed `state.requestId ?? ''` - on a refresh that id is empty, so the modal would have opened with nothing to submit to. The final version takes `pendingRequestId` from the server.
- KNOWN REMAINING ISSUE, NOT FIXED: on a PROFESSIONAL's post the pending state means the REQUESTER is waiting on the author, yet the button still offers the form to the requester - who is not the supplier. It should be a status ("Waiting for CV") with no action, and a button only when the viewer IS the supplier. Reported and awaiting a decision.
- ALSO NOTED: `askedFor` in `RequestDocumentsCta` is now DEAD CODE - nothing reads it after the label change. Safe to delete.
- Verified: `npx tsc --noEmit` CLEAN throughout. NOT verified in a browser at any point: publishing in place, the pending modal, the submitted state, and the Message CTA on both sides have never been rendered.

### 2026-11-16 - Response labels fixed, two-direction submit flow, APPLY links, MESSAGE CTA removed

- LABEL BUG FOUND BY THE USER AND FIXED. A recruiter viewing a professional's post saw "Submit CV", which reads as the professional demanding the recruiter submit something TO them. THE RULE, now encoded in `lib/posts/response-types.ts`: the AUTHOR'S SIDE alone decides the wording, because the author chose the ask.
  - PROFESSIONAL's post -> a recruiter responds -> "Request CV" / "Request Portfolio" / "Request CV & Portfolio".
  - RECRUITER's post -> a professional responds -> "Submit CV" / "Submit Portfolio" / "Submit CV & Portfolio".
  - Implemented as `AUTHOR_SIDE_LABEL: Record<PostSide, Record<ResponseType, string>>`. `COMPOSER_LABEL`/`VIEWER_LABEL` are GONE. The old `responseLabel` flipped the verb when the viewer was on the opposite side - that inversion WAS the bug. `viewerSide` is still a parameter but deliberately unused; do not reintroduce the flip.
  - The composer uses the same table via `composerLabel(opt, side)`, so what you pick and what the button says cannot disagree.
- TWO-DIRECTION DOCUMENT FLOW. The same `DocumentRequest` row serves both, and `ownerId` means THE SUPPLIER:
  - On a PROFESSIONAL's post the clicker is a recruiter REQUESTING. `ownerId` = the post author. Row starts PENDING, the author is notified, they fill the links later at `/requests/[id]`.
  - On a RECRUITER's post the clicker is a professional SUBMITTING. `ownerId` = THE CLICKER. `requestDocuments` returns `needsForm: true` and `RequestDocumentsCta` renders the `FulfilForm` INLINE on the card. No notification is owed to anyone.
  - "Requested - view" was renamed "Submitted - view" on the CTA, with a solid-brand + white-text hover (the old pale-on-pale hover lost contrast).
- APPLY GETS ITS OWN LINK (migration `supabase/030_post_apply_url.sql`). `WorkPost.applyUrl` TEXT NULL. Apply is neither a document handover nor a message: it sends the applicant somewhere. The composer shows an "Application link" field when APPLY is selected; both create and update REQUIRE a valid http(s) URL for APPLY and store null otherwise. The card renders it as a new-tab link with an arrow.
- MESSAGE CTA REMOVED FROM THE CARD. Messaging is a PROFILE-LEVEL action - `ContactButton` already exists on the profile and on `WorkDetailBody`. The feed CTA pointing at `/messages` was wrong: it is not a conversation starter from a post. A MESSAGE post now renders NO cta on the card.
- A SILENT FAILURE WORTH REMEMBERING: an `edit_file` batch aborted with "Found 2 matches for edit oldText" and the rest of that batch did NOT apply. The card change landed, so it LOOKED done, `tsc` stayed green because the form still sent a field the action simply ignored. Caught only by grepping `applyUrl` in `actions.ts`. LESSON: a green type-check does not prove an edit landed - verify the file, especially after a multi-edit batch.
- Verified: `npx tsc --noEmit` CLEAN. Migration 030 applied and confirmed by query: `WorkPost.applyUrl` exists and is nullable. There are currently ZERO APPLY posts, so no backfill was needed.
- NOT verified in a browser: the Apply link, the inline submit form, and "Submitted - view" have never been rendered.
- STILL OUTSTANDING: (a) fulfilling is one-shot with no edit-later path; (b) the CTA shows "Submitted - view" from `alreadyRequested` even if the row is still PENDING after a reload - it should distinguish pending from fulfilled; (c) `/requests` is desktop-sidebar only; (d) `db push` bookkeeping drift remains unresolved - avoided throughout by applying raw SQL via supabase/NNN migrations.

### 2026-11-16 - Document requests: full flow built (CTA -> notification -> fulfil -> sheet)

- THE WHOLE LOOP NOW WORKS, end to end:
  1. A viewer clicks the CTA on a post whose author asked for CV / portfolio / both.
  2. `RequestDocumentsCta` posts a server action, which creates a `DocumentRequest` OR REUSES the existing one for that (post, requester).
  3. The author sees it in Notifications (derived, third branch in `/api/notifications`).
  4. Clicking it opens `/requests/[id]`, a form with ONLY the fields that were asked for.
  5. Submitting stores the links and flips the row to FULFILLED; the notification disappears (it only lists PENDING).
  6. The requester sees it on `/requests` as a sheet: professional, title, which post, and labelled "CV ↗" / "Portfolio ↗" links opening in a new tab. Pending ones show a Pending badge.
- FILES CREATED: `app/(app)/profile/requests/actions.ts` (requestDocuments + fulfilDocumentRequest), `components/work/RequestDocumentsCta.tsx`, `components/requests/FulfilForm.tsx`, `app/(app)/requests/page.tsx`, `app/(app)/requests/[id]/page.tsx`.
- BUG FOUND BY THE USER AND FIXED: after clicking the CTA, REFRESHING made the button look unclicked again, because the "requested" state lived in component `useState` and a reload throws it away. The request is a database fact, so it is now SERVER-DERIVED: `/api/home` returns `requestedPostIds`, the feed passes `alreadyRequested`, and the CTA renders "Requested - view" from that. Do not move this back into local state.
- SELF-POST CTA (user instruction): on YOUR OWN post the CTA still shows but is INACTIVE, and hovering explains "Authors can't respond to themselves". Implemented with a wrapping span because a disabled button receives no hover events. A duplicate native `title` was removed - inside a JSX STRING ATTRIBUTE `&apos;` is NOT decoded and would render literally; entities only decode in text nodes.
- GUARD ASYMMETRY, deliberate: `requestDocuments` does NOT reuse the `sendContactRequest` gates (recruiter-only + verified). Under the one-post model either side can ask the other for documents. It does have its own daily rate limit (20/24h), mirroring the contact action's abuse guard.
- ONE COMPOSER FOR EVERYONE: the feed's `isRecruiter ? RecruitmentComposerModal : WorkComposerModal` branch is GONE. The composer derives the response options from the user's role instead. `ProfileBody`'s two create links and the Sidebar/MobileNav create buttons all open `CreatePostTrigger` (the modal) rather than navigating to `/profile/work/new`.
- NAV: added a `Requests` item to the Sidebar using `FolderIcon` (there is no document icon in components/icons.tsx - the first attempt referenced a `DocumentIcon` that does not exist and was corrected before it compiled).
- KNOWN GAPS, stated plainly: (a) `/requests` is in the DESKTOP sidebar only - not the mobile bottom nav; (b) fulfilling is one-shot, there is no "edit the links later" path; (c) the CTA for MESSAGE/APPLY still just links to `/messages`, so APPLY has no distinct application flow; (d) the `db push` bookkeeping drift from the `User_username_key` partial index is STILL unresolved - avoided here by applying raw SQL via migration 029; (e) the recruiter-owned post surface still does not exist, so a recruiter's posts render nowhere yet.
- Verified: `npx tsc --noEmit` CLEAN after every step. NOT verified in a browser: the notification entry, the fulfil form, and the /requests sheet have never been looked at rendered.

### 2026-11-16 - Document requests: schema + migration 029 (CV/portfolio handover)

- PRODUCT DESIGN (user-stated). Each person gets a page listing every CV and portfolio they have REQUESTED, as a list of links. Clicking a link opens it. If both were asked for, they appear as TWO labelled links - "CV" and "Portfolio". The page reads like a sheet: the professional's details, then the links.
- THE REQUEST FLOW. Clicking a post CTA (Request CV / Request Portfolio / CV & Portfolio) IMMEDIATELY notifies the post's author. The author opens the notification and gets a form to paste the CV and/or portfolio links, depending on what was asked. Submitting stores the links.
- REUSE, NOT DUPLICATE (explicit user instruction). If the same person requests the same post again, the EXISTING pending row is reused - no second row, no second notification. Enforced by a UNIQUE index on (postId, requesterId), so a double-click race cannot create duplicates either.
- LINKS, NOT FILES. `cvUrl` and `portfolioUrl` are plain text. No upload, no bucket, no parsing. Deliberate: public/uploads is LOCAL-only and a deploy blocker (028), so document handover must not depend on it.
- NEW TABLE `DocumentRequest` (supabase/029_document_requests.sql + the Prisma model): postId, requesterId (nullable, ON DELETE SET NULL), ownerId (the author who must fulfil), `response` REUSING the existing `ResponseType` enum (so the CTA and the request it creates can never disagree), `status` (PENDING/FULFILLED/DECLINED), cvUrl, portfolioUrl, createdAt, fulfilledAt. Indexes on (ownerId, status) for the author's notification query and on requesterId for the /requests list.
- RLS enabled in the same file: requester may SELECT and INSERT their own request, owner may SELECT and UPDATE (fill the links). Prisma connects as owner and bypasses RLS, so the app is unaffected; this only closes the Supabase anon-key path. Same pattern as 015 and 022.
- DELIBERATELY NOT A GENERIC NOTIFICATION TABLE. `/api/notifications` is DERIVED at read time (it scans unread ContactRequest rows and Like rows and builds the list). There is no notifications table and this change does not add one - the pending DocumentRequest rows will become a THIRD branch in that same derived query. Kept consistent with how the codebase already works.
- DELIBERATELY SEPARATE FROM `ContactRequest`. ContactRequest already has workPostId/subject/message/status, so folding document handover into it was considered and rejected: its purpose is messaging, and mixing in document exchange would muddy both.
- MIGRATION NUMBERING. This project applies DB changes as hand-written SQL in `supabase/NNN_description.sql`, NOT as Prisma migrations. There is no `prisma/migrations/` folder and there should not be one. 029 is the next number after 028. Applied with `npx prisma db execute --file supabase/029_document_requests.sql`.
- A MISTAKE MADE AND CLEANED UP: an attempt to baseline Prisma migrations generated `prisma/migrations/000000000000_baseline/migration.sql` using `migrate diff --from-empty --to-schema-datamodel`. That produces a full from-scratch script, not a baseline, and would NOT have resolved the standing `User_username_key` drift. The folder was DELETED. Do not reintroduce prisma/migrations/ - follow the supabase/ numbering.
- STILL OUTSTANDING, unchanged: the `db push` bookkeeping drift from the `User_username_key` partial index is STILL unresolved. This change avoided it entirely by applying raw SQL instead of pushing. That drift will resurface whenever someone runs `db push`.
- Verified: `prisma validate` PASSES, `prisma generate` succeeded (v5.22.0), the SQL applied, and a real Prisma query confirmed the table EXISTS and is queryable (0 rows). `npx tsc --noEmit` CLEAN. NOT verified in a browser - there is no UI for any of this yet.
- NEXT (not started): the CTA server action that creates the row, the notifications third branch, `/requests/[id]` fulfil form, and `/requests` list page.

### 2026-11-16 - Phase 1: WorkPost becomes the single post model (schema only)

- PRODUCT DIRECTION (user-stated, the whole point of this work): the platform is two-sided - recruiters find professionals, professionals find opportunities. There is ONE post style, no template picker. A post is media (image OR a YouTube embed link, rendered inline) + a caption + a chosen RESPONSE TYPE. The role switch changes only two things: which response options you can pick, and what the response action does. Nothing else about posting differs between roles.
- RESPONSE TYPES (five canonical values, four offered per side). Professional-side post options: Message / Request CV / Request Portfolio / CV & Portfolio. Recruiter-side post options: Apply / Submit CV / Submit Portfolio / CV & Portfolio. `CV_AND_PORTFOLIO` is ONE combined ask (do both). `MESSAGE` is professional-side only and `APPLY` is recruiter-side only. If more are needed later, add to the enum AND the label map - do not fork a second list.
- USER INSTRUCTION ON SCOPE, stated twice: the separate `Recruitment` model must go. A recruiter vacancy is just a post with `desiredResponse` APPLY/CV/PORTFOLIO/CV_AND_PORTFOLIO. There is no second post system. Do NOT propose keeping Recruitment "for now" - that was explicitly rejected.
- THE MIGRATION IS PHASED so each step leaves a working state: (1) schema, (2) composer, (3) card/feed, (4) retire Recruitment. Each phase gets its own entry. Phase 1 is this entry.
- PHASE 1 - SCHEMA (`prisma/schema.prisma`). `WorkPost` is now the single post table:
  - `professionalId` is OPTIONAL and `recruiterProfileId` was ADDED, so a post is owned by exactly one of the two. This mirrors the pattern the `Experience` model already uses ("Exactly one of professionalId / recruiterProfileId is set") - follow that precedent, it is proven in this codebase.
  - Added `desiredResponse ResponseType @default(MESSAGE)`, `mediaType PostMediaType?` (IMAGE | YOUTUBE), `videoUrl String?`. Media is an image upload OR a YouTube link, never both.
  - `template` is now `WorkTemplate?` (nullable). The enum itself is KEPT and marked DEPRECATED only so existing rows still validate until the user deletes the old posts themselves. He said he will delete them - do not write a migration script for them.
  - New enums: `ResponseType` (MESSAGE, CV, PORTFOLIO, CV_AND_PORTFOLIO, APPLY) and `PostMediaType` (IMAGE, YOUTUBE).
  - `RecruiterProfile` gained a `workPosts WorkPost[]` relation.
  - `Recruitment`, `RecruitmentLike`, `SavedRecruitment`, `RecruitmentView`, `RecruiterProfile` are all marked DEPRECATED in comments but LEFT INTACT. Nothing new should write to them. They are deleted in Phase 4.
- TYPE ERRORS THIS SURFACED, and the fixes (all null-safety, no behaviour change): making `professionalId` nullable broke 8 spots. Fixed in `app/(app)/[username]/work/[id]/page.tsx` (notFound when no professional; `template` fallback to 'PROJECT_SHOWCASE' at the WorkDetailBody boundary), `app/(app)/profile/work/[id]/page.tsx` (notFound when no professional), and `app/api/home/route.ts` (optional-chain `p.professional?.userId` in the boost-ownership check). These guards assume the PROFESSIONAL work page; recruiter-owned posts need their own surface in Phase 3.
- TOOLING GOTCHA, will recur on Windows: `prisma generate` failed with `EPERM ... query_engine-windows.dll.node` because a running `next dev` held the engine DLL open. Killing the Node process (~1.3GB RSS identified it) released the lock. If generate fails with EPERM, stop the dev server FIRST - it is not a schema problem. `prisma validate` passes even when generate cannot write.
- DATABASE PUSH - what actually happened, because the first report of this was wrong. `npx prisma db push` was run. It FAILED on `relation "User_username_key" already exists`, but it had ALREADY APPLIED the WorkPost changes before failing: `prisma` confirmed `recruiterProfileId`, `desiredResponse` (default MESSAGE on all existing rows), `mediaType`, `videoUrl` exist, `professionalId`/`template` are nullable, and both new enums exist with the right values. A direct query selecting all the new columns returns rows cleanly - the P2022 that broke `/api/home` is GONE and the feed loads.
  - WHY THE PUSH FAILED: the DB already has a PARTIAL unique index `CREATE UNIQUE INDEX "User_username_key" ON "User" (username) WHERE username IS NOT NULL`, which was applied by hand via `supabase/003_add_username.sql`. Prisma's snapshot does not recognise it as matching the schema's `@unique`, so it tries to create it again and Postgres refuses. This is a BOOKKEEPING mismatch, not a real constraint problem - verified there are only 3 users and ZERO duplicate usernames, so the constraint is legitimate.
  - CONSEQUENCE, for whoever runs schema commands next: the DB is correct but Prisma's migration snapshot is out of step. Running `db push` again will hit the SAME `User_username_key` error. The clean fix is to BASELINE (mark the current schema as the starting migration) rather than pushing repeatedly. NOT done yet - deferred so it does not get mixed into feature work.
- Verified: `prisma validate` PASSES, `prisma generate` succeeded (client v5.22.0), `npx tsc --noEmit` CLEAN, direct Prisma query on all new columns returns rows, dev server log clean with no P2022. NOT verified in a browser by the assistant - the user was asked to confirm the feed renders.
- NEXT (Phase 2, not started): replace the template picker in `components/work/NewWorkForm.tsx` with media (image upload OR YouTube URL) + caption + a response selector filtered by the user's current role. Note for that phase: `WorkComposerModal` is only a thin wrapper - the real form and the template buttons live in `NewWorkForm`.

### 2026-11-15 - Explore desktop padding, Settings nav item, and a fully reverted feed detour

- EXPLORE - DESKTOP-ONLY TOP PADDING (surviving change). `app/(app)/explore/page.tsx`, header block: `px-4 pt-2` -> `px-4 pt-2 lg:pt-6`. USER SAID: mobile is perfect and must not change; desktop Explore sat too high. The base value is untouched, so MOBILE IS UNCHANGED; only `lg`+ gains 24px. The value (pt-6) was a judgement call, not measured against the feed - adjust if it reads wrong. NOT verified in a browser.
- SIDEBAR - SETTINGS ITEM (surviving change). `components/navigation/Sidebar.tsx`: imported the already-existing `SettingsIcon` from `@/components/icons` (no new icon authored) and appended `{ name: 'Settings', href: '/settings', icon: SettingsIcon }` to the nav `items` array. It inherits the rail's existing icons-only + hover-tooltip + active-state behavior automatically. Placed last in the list, above the pinned profile block. NOT verified in a browser.
- A note on an earlier same-day failed attempt, recorded so it is not repeated: an attempt was made to move Explore up on mobile to match the feed's first post. Reading the code showed Explore's title already starts at the same `pt-2` offset as the feed container, so the edit was a NO-OP and was reverted. Do not "fix" Explore's mobile offset without first looking at it rendered - the padding values already match.
- FEED DETOUR - ADDED, ITERATED, FULLY REVERTED (no net code change). Sequence, so a future chat does not rebuild any of it: (1) a feed-page-local `TrendingGrid` was built using `/api/trending?take=12` as a masonry image grid, mounted as a sibling column in a flex row on the feed page only; (2) several sticky/scroll variants were tried - `sticky top-0` + `self-start`, then a `max-h-[100vh]` + `overflow-y-auto` internal scroller, then a `window` `wheel` listener mirroring `deltaY` into the column so one gesture moved both sides; (3) that was abandoned in favour of removing trending entirely and making the feed `grid grid-cols-1 xl:grid-cols-3`; (4) finally REVERTED TO THE ORIGINAL. `app/(app)/feed/page.tsx` is back to: container `w-full max-w-[560px] pb-4 pt-2 sm:pl-4` and a bare `feed.map(...)` with NO grid wrapper. `TrendingGrid`, the `TrendingPost` type, the `useSWR` import, the wheel `useEffect`, and the `Link` import are all gone. DO NOT reintroduce a right rail or multi-column feed without an explicit new request.
- ALSO REVERTED: `app/(app)/layout.tsx` was briefly given a `RightRail` mount plus `justify-center`; both were removed and the file is back to the original two-column shell (`Sidebar` + `main`, `items-start`, no justify-center). USER CONSTRAINT RECORDED: anything added goes on the FEED PAGE ONLY, not the shared layout, so Explore, profiles, messages and settings are untouched.
- LESSON (mine, not the code's): several rounds were spent guessing at layout intent and then reverting. Before restructuring a page that the user has called "perfect", confirm the exact target structure first, and do not treat a user's thinking-out-loud as an instruction to edit.
- Verified: `npx tsc --noEmit` CLEAN after the final revert. NOT verified in a browser: the Explore desktop padding and the Settings nav item have not been looked at rendered.
- No feed/Explore/Settings change was recorded in the notes before this entry - this one exists to close that gap.

### 2026-11-15 - Confirmed: sidebar is icons-only at all widths (design is correct as-is)

- USER CONFIRMATION: the current design is exactly what was requested and is CORRECT, including the fact that the mobile view looks DIFFERENT from desktop. This is the plan, not drift. Do not "unify" the mobile and desktop layouts.
- READ THE LIVE CODE (`components/navigation/Sidebar.tsx`) rather than trusting the notes. What it actually does now:
  - Root: `hidden ... w-[68px] ... lg:flex` - a FIXED 68px rail, shown from `lg` up. It is ICONS-ONLY AT EVERY BREAKPOINT. There is no wider `xl` variant and no `xl:w-[248px]` anywhere.
  - Nav items render only the 21px icon, centered. The item NAME appears as a hover tooltip (`role="tooltip"`, dark bubble, fades in on `group-hover`, positioned `left-full`). Labels are never rendered inline.
  - "Create Post" is icon-only (`PlusIcon`) with a hover tooltip.
  - The search shortcut is icon-only and `xl:hidden`.
  - The bottom profile block is the only text: name + subtitle are `hidden ... xl:block`, so they appear at `xl` and up; the avatar is always shown.
- CORRECTED A STALE NOTE: the 2026-11-12 entry claimed the rail was "`w-[68px]` icons-only below xl, `w-[248px]` with labels at xl". That is NOT what the code does. Fixed in place with a pointer to this entry.
- WHY THIS ENTRY EXISTS: the icons-only-with-tooltips behavior was never recorded, and the stale 248px/labels-at-xl line would have sent a future chat to "fix" a rail that is already correct.
- Verified: read from source only. NOT verified in a browser (layout/tooltip/hover behavior unconfirmed visually).
- No component code was changed by this task - documentation only.

### 2026-11-12 - Placeholder posts and images so the redesign can be looked at

- USER REQUEST: dummy posts in addition to the real ones, with images, including images on the real ones - "just add as placeholders, I want to see how it looks." This is VISUAL FODDER for judging the new layout. It is not content and must not ship.
- New `scripts/seed-placeholder-posts.js`, with a `--clean` flag. Created 6 demo posts across 2 existing profiles (Viral Rated, Annie Taylor) and added a placeholder image to 3 real posts that had none.
- IMAGES ARE GENERATED SVGs, not photographs: an angled two-stop gradient, two soft circles and a "Placeholder N" label, written by the script into `public/uploads`. No stock photos, no external URLs, no dependency added.
- WHY SVGs RATHER THAN SOMETHING PRETTIER: no image library is installed and this codebase does not need one added for throwaway fixtures. An SVG is text, so the script writes it with `fs.writeFile` and nothing else.
- DUMMY POSTS ARE TAGGED. Every demo post title starts with `[demo]` and every generated file starts with `placeholder-`, so `--clean` can remove exactly what it created. Verified that path is tag-based, not name-based guessing.
- REAL POSTS WERE TOUCHED, and the limit is stated plainly: 3 real posts now have an image row whose picture has NOTHING to do with what the post says. It is a gradient with the word "Placeholder" on it. `--clean` removes those media rows and files but never the posts themselves.
- Verified: script ran clean (6 created, 3 filled), 9 `placeholder-*.svg` files on disk, and `curl` on one returns `200 image/svg+xml` from the running dev server, so the files really are served.
- NOT VERIFIED: how any of it looks in the browser. Nobody has opened the feed.
- RISKS ACCEPTED, recorded rather than hidden: (a) these are real rows in the real database and appear in the feed, Explore and trending for every user; (b) `public/uploads` is LOCAL-ONLY, so every placeholder vanishes on a clean build or a deploy - same blocker as real uploads; (c) placeholder images are SVGs while real uploads are JPEG/PNG/WebP/GIF, so if image handling is ever tightened the seed data will be the odd one out.
- REMEMBER TO RUN `node scripts/seed-placeholder-posts.js --clean` before any deploy or demo with real users.

### 2026-11-12 - UI rebuilt to the reference design (new-interface.jpeg)

- USER INSTRUCTION: "do exactly what you see in the new-interface file", and when the reference could not be built from existing data, "even if it means some existing features in the current feed is missing". That authorises removing feed features; it does not authorise inventing placeholder content.
- THE REFERENCE, read off the image: DESKTOP is THREE columns - left nav rail (wordmark, Home, Explore, My List, Messages, My Work, Notifications, purple Create Post, profile at bottom), middle feed (composer row, then posts with full-bleed media, caption, a "I'd like to work with you" pill and four bare icons), right rail ("Discover professionals" with three Follow rows + See all, then "Trending work" as a 2x2 image grid). MOBILE is a separate layout: brand top bar with search/bell/message icons, and a five-slot bottom tab bar with a raised centre button.
- `components/navigation/Sidebar.tsx` REWRITTEN: full-height rail, wordmark, icon nav, purple Create Post, profile pinned to the bottom. SUPERSEDED/NOT ACCURATE: this originally claimed "`w-[68px]` icons-only below xl, `w-[248px]` with labels at xl" - the live component is a FIXED 68px icons-only rail at all widths with hover-tooltip labels (see the 2026-11-15 entry). Boost Visibility was added afterwards on request (EyeIcon -> /profile/visibility).
- `components/navigation/MobileNav.tsx` NEW: `MobileTopBar` (sticky brand bar + search/bell/message) and `MobileBottomNav` (Home, Explore, raised Create, Messages, Profile). Both `lg:hidden`.
- `app/(app)/layout.tsx` REWRITTEN: three columns inside `max-w-[1440px]`, main column with `border-x`, right rail `sticky top-0` and `xl`-only, plus the mobile bars. `ScrollBridge`, `TopNav` and the old 1560px shell are GONE from this layout.
- `app/(app)/feed/page.tsx` REWRITTEN: composer row (avatar, prompt, image button), then a single chronological stream. The four tabs (For You / List / Recruiter Feed / Recent) are REMOVED - the reference has no tabs. All the matching/shuffle/industry logic went with them. Boosting still pins to position 1.
- `components/work/WorkCard.tsx` REWRITTEN to the reference: header (avatar, name, role · time, Follow or a more-dots), full-bleed `aspect-[4/3]` media, caption, the "I'd like to work with you" pill, and a row of four bare icons (heart, comment, send, bookmark). NO counts, NO "see more", NO structured field sections - per the user's explicit "even if it means some existing features in the current feed is missing". The long-form fields remain on the post detail page.
- `components/icons.tsx`: added `SendIcon` (paper plane). The existing `ShareIcon` is a three-node network glyph and does not read as send.
- `app/api/explore-grid/route.ts` NEW: the reference's Explore grid needs IMAGES, and `/api/professionals` returns none. This endpoint returns each professional plus the first image of their latest published post, with image-havers sorted first. Profiles with no image return `image: null` and render as an initials tile - NO stock or generated placeholder imagery anywhere.
- `app/(app)/explore/page.tsx` REWRITTEN: title, subtitle, Filters button, search field, category chips, and a CSS `columns-*` masonry grid with a name/role gradient overlay on each tile. Category filtering is a CLIENT-SIDE text match on the job title - there is no taxonomy column, so it is a search, not a real facet. Said so in the code.
- `components/navigation/RightRail.tsx` REWRITTEN: "Discover professionals" (three rows, real Follow buttons, See all) above "Trending work" (2x2 grid of the top four trending posts, falling back to the post title on a gradient when a post has no image).
- MISTAKES MADE AND CORRECTED IN THIS PASS, recorded so the pattern is visible:
  1. I built a TWO-column desktop shell after inferring "Instagram-like" from a comment, deleting the right rail. The reference clearly shows three columns. Rebuilt.
  2. I asked the user whether to add the third column back, having already been told to build what was in the image. That question should not have been asked.
  3. First `WorkCard` rewrite kept counts, a "see more" and relabelled the save slot "Send" while leaving the bookmark pinned right - a relabel, not a rebuild. Replaced.
  4. First `explore-grid` query nested `workPosts` under `user`. `workPosts` is a relation on **ProfessionalProfile**, not `User`; it did not compile. Fixed, and the schema fact is noted in the route's header comment.
- Verified: `npx tsc --noEmit` CLEAN and `npx next build` SUCCEEDED (21 static pages, `/api/explore-grid` in the route list). The only stderr was the pre-existing Next 16 `middleware` -> `proxy` deprecation warning, unrelated to this work.
- NOT VERIFIED IN A BROWSER: nothing here was looked at rendered. The layout at lg/xl breakpoints, the mobile bottom bar, the masonry columns, the right rail, and every image tile are all unconfirmed visually.
- KNOWN GAPS, not fixed: (a) recruiters see a Boost Visibility nav item that their account cannot use - long-standing, now more visible; (b) `RecruitmentCard` was NOT redesigned and will look out of place in the new stream; (c) `/home`, `/profile/feed`, `/trending`, `/list`, `/messages` and the profile pages still use the OLD card and rail styling; (d) `TopNav` and `ScrollBridge` still exist as files but are no longer mounted by the app layout - `TopNav` is still imported by other routes if any; (e) `LOCAL` upload storage is still a deploy blocker.

### 2026-11-11 - Verified: feed DOES deliver mediaAssets (the flagged gap is closed)

- Closed the "likely next failure" flagged in the 2026-11-10 entry. Read the code instead of assuming.
- `app/api/home/route.ts:26` selects `mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 }` inside the MAIN `workPost.findMany`, with an inline comment (lines 24-25) explicitly warning that omitting it makes the card render a post with no image. `app/api/feed/route.ts:10` does the same. So the `/api/home` gap the notes predicted does NOT exist.
- `components/work/WorkCard.tsx:123` reads `post.mediaAssets?.[0]`, and the prop type (line 19) declares `mediaAssets?: { id, provider, providerAssetId }[] | null`. Type and query agree.
- CHECKED the src-building path, which is where a silent break could still hide: `WorkCard.tsx:124` builds `/uploads/${media.providerAssetId}`, and `app/api/upload/route.ts` returns `providerAssetId: filename` (`<uuid>.<ext>`) with `url: '/uploads/<filename>'`. Those two agree, so the feed image URL is correct for LOCAL uploads. The same pattern in `WorkDetailBody.tsx:110` is also correct for the same reason.
- CONCLUSION: the image posting chain is wired end to end in code - upload writes the file, the action writes the MediaAsset row, the feed query selects it, the card builds a working `/uploads/...` URL.
- STILL NOT verified by hand: pick a file, upload succeeds, image appears in the feed. Nothing here was exercised in a browser - this entry is code inspection only and must not be read as a live test.
- STILL A DEPLOY BLOCKER, unchanged: `LOCAL` storage writes to `public/uploads`, which does not work on Vercel. S3 swap required before shipping.

### 2026-11-11 - Process: notes are updated on EVERY task; dev server running

- STANDING INSTRUCTION REAFFIRMED by the user: `PROJECT_NOTES.md` must be updated as part of every task, the same way the existing entries are - a Change Log entry per task, newest at the top, written so a future chat has full context (what, where, why, how verified, and what is explicitly NOT done).
- This applies to read-only investigation too, not only to code changes. A verification result that closes a previously flagged risk is worth an entry, because the next chat would otherwise re-investigate it.
- Dev server started for live checking: `npm run dev` (Next.js 16.3.0, Turbopack), `http://localhost:3000`, network `http://192.168.0.162:3000`. Env loaded: `.env.local`, `.env`. Ready in 3.1s. `GET /` returns 200.
- NOTE for whoever reads this next: an unauthenticated `curl` on app routes returns 307 (middleware redirect), and only `/` returns 200 without a session. That is expected and says nothing about whether a page renders for a signed-in user - the notes have been caught by this reading twice.

### 2026-11-10 - Image posting: caption, local upload, feed rendering

- FIRST STEP toward the social work-showcase redesign: a post can now carry an IMAGE and a CAPTION alongside (not instead of) the existing templates.
- `supabase/028_post_caption_local_media.sql` + `scripts/apply-post-caption.js`: adds `WorkPost.caption TEXT NULL` and `StorageProvider.LOCAL`. Applied and verified: BEFORE columns `[]` and provider had 4 values; AFTER caption exists and provider has 5. `ALTER TYPE ... ADD VALUE` was run OUTSIDE a transaction because older Postgres refuses it inside one.
- `app/api/upload/route.ts`: NEW. Accepts one `file` per multipart request, validates JPEG/PNG/WebP/GIF and an 8MB cap, writes to `public/uploads/<uuid>.<ext>` with a RANDOM name (no user filename - avoids traversal, collisions, and leaking anything about the uploader's disk), returns `{ url, provider, providerAssetId, type }`.
- LOCAL IS DEVELOPMENT-ONLY AND THIS IS A REAL LIMIT, NOT A NOTE. `public/` is baked at build time and Vercel's filesystem is read-only, so uploads will fail on deploy. The route's header comment says so, and the schema comment on `LOCAL` says so. Swapping to S3 is required before shipping.
- `components/work/NewWorkForm.tsx`: image picker plus caption, placed ABOVE the template choice - free posting is meant to be the primary path, so the template should not be the first thing asked for. Upload happens IMMEDIATELY on file selection and only the resulting URL travels with the form, so a failed upload cannot leave a half-written post. Preview with a Remove button.
- `app/(app)/profile/work/actions.ts`: `caption` and `mediaUrl` added to `extractFormData` and `rawValues` (so a failed save still repopulates the caption). Create uses a nested `mediaAssets: { create: mediaRows(...) }`. Update does DELETE-THEN-CREATE rather than a nested write, because the form holds at most one image and removing it must actually remove the row.
- `components/work/WorkCard.tsx`: renders the image between the title and the excerpt, and `excerpt` now prefers `caption` over `purpose`/`challenge`/`result`. A post can have both a caption and structured fields; the image wins the top slot and the fields still expand under "see more".
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: selecting a file, the upload succeeding, and the image appearing in the feed.
- NOT DONE, and it is the likely next failure: the feed's `/api/home` query may not select `mediaAssets`, in which case `WorkCard` receives nothing and silently renders no image. Needs checking against a real post.

### 2026-11-09 - Buy boosts popup copy finally matches the model

- The stale copy flagged in the previous three entries is now fixed. `components/profile/BuyBoostsButton.tsx` no longer says "1 boost = 1 day" or "N boosts = N days of visibility" - both described the OLD duration model and had been wrong since the weighted change.
- USER DECISION on scope, asked before writing: the popup explains HOW BOOSTS WORK, not the days x boosts price rule in detail. The popup's job is selling credits; the boost form is where a run's cost is shown.
- New explanation, five points: boosts are spent to be seen and are not used until you start one; a boosted post is lifted to the top of recruiters' feeds and the profile is featured in Explore; when you start a boost you choose the days and the boosts behind it and a run costs days x boosts; more boosts means a bigger share against everyone else boosting at that time; you can run more than one boost and add to one already running.
- The last two points are new information the old copy actively contradicted - it claimed "only one boost runs at a time", which stopped being true when the one-at-a-time refusal was removed.
- The total line under the price now reads "N boosts added to your balance" instead of "N boosts = N days of visibility". Buying credits no longer implies any duration.
- The file header comment was corrected too: the deleted duration bundles were described as "a property of the BOOST FORM", which is now also false - the form prices days x boosts, it does not offer bundles.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the popup rendering with the new copy.
- FOLLOW-UP: user reworded the days/boosts sentence - added the comma after "boost" ("When you start a boost, you choose..."). Applied verbatim; the user's phrasing read better than mine.

### 2026-11-09 - Custom duration restored on the boost form

- USER CORRECTION: the days picker offered only the 7/14/30 presets. The user wants to choose their own day count, as the old form allowed. Added a fourth "Custom" tile with a day input.
- `components/profile/BoostForm.tsx`: `days: number` became `dayChoice: string` plus `customDays: string`. 'custom' is a MODE, not a sentinel number - storing it as a number would collide with a legitimate custom value and make the selected-tile highlight wrong. `days` is now DERIVED from the two.
- Custom is validated 1-365, matching `startBoost`. An inline error appears only while Custom is selected and the value is invalid, so the presets are not nagged.
- The hidden `days` input sends an EMPTY string when invalid, so `startBoost`'s own validation fires rather than receiving NaN. The submit button is also disabled on `!validDays` - both guards, because the button is cosmetic and the server check is the real one.
- Grid is `grid-cols-2 sm:grid-cols-4` for the four tiles.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- STILL STALE, flagged not fixed: `components/profile/BuyBoostsButton.tsx` copy still says "1 boost = 1 day" and "N boosts = N days of visibility". Still wrong.
- NOT verified by hand: selecting Custom and entering a day count.

### 2026-11-09 - Boost form: DAYS and BOOSTS are separate choices again

- USER CORRECTION, third time on this screen. A1 was read by me as "fixed window, user does not choose duration" and I DELETED the duration picker. That was wrong: the intent is that the user picks BOTH how many days AND how many boosts, then sees a short note explaining the effect.
- COST RULE: `credits = days x boosts`. Chosen because it is the only variant that cannot be gamed - duration-free pricing would let someone take 365 days for 1 credit, and a multiplier without a base would let weight be bought for free.
- `lib/pricing/boosts.ts`: `BOOST_WINDOW_DAYS` deleted (there is no single window any more). Added `BOOST_DAY_OPTIONS = [7, 14, 30]` and `boostCost(days, boosts)`. `weightForCredits` kept.
- `app/(app)/profile/visibility/actions.ts`: reads BOTH `days` and `boosts`. `days` validated 1-365, `boosts` 1-1000. `credits` is computed SERVER-SIDE from the two raw inputs, so a tampered form cannot claim a cheaper total. `expiresAt` is derived from the chosen `days`. WEIGHT COMES FROM THE BOOST COUNT, NOT THE TOTAL SPEND - paying for more days buys a longer run, not a bigger share, which is what keeps the two choices independent.
- `components/profile/BoostForm.tsx`: days picker restored (7/14/30 buttons), boosts number input kept, summary shows "N days x M boosts" and the total credit cost, and an impact note explains what the buyer gets.
- The impact note is deliberately specific rather than marketing: "Your posts stay near the top of recruiters' feeds for N days, and M boosts means you take a larger share of that slot than someone spending fewer."
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- STILL STALE, flagged not fixed: `components/profile/BuyBoostsButton.tsx` copy still says "1 boost = 1 day" and "N boosts = N days of visibility". That is now doubly wrong - credits do not buy days at all, and the popup sells credits, not durations.
- NOT verified by hand: picking days and boosts and starting a boost.

### 2026-11-09 - BOOSTS ARE NOW WEIGHTED (model change, option A1)

- PRODUCT CHANGE, user-decided after a long back-and-forth: a boost is no longer "N days of visibility". It is a WEIGHTED STAKE over a fixed window. Spending 5 boosts gives weight 5, and assignment picks proportionally to weight, so spending more in the SAME period buys a bigger share of it. This is what makes "spend more boosts within one day" mean anything.
- OPTIONS PUT TO THE USER, recorded so nobody re-litigates them: (A) pay more to go higher/more often, (B) buy an impression budget, (C) buy more surfaces. Facebook Ads was used as the reference model - budget separate from duration, auction weight rather than a fixed slot. User chose A, then A1 (fixed window, no separate duration purchase).
- `supabase/027_boost_weight.sql` + `scripts/apply-boost-weight.js`: adds `Boost.weight INTEGER NOT NULL DEFAULT 1`. Existing rows get weight 1, which reproduces the OLD equal-share behaviour exactly for them. Verified applied: `BEFORE: []` -> column present, default 1.
- `prisma/schema.prisma`: `Boost.weight Int @default(1)`. `days` KEPT but now legacy - new boosts write the window constant into it so nothing reading it sees garbage. Prisma client regenerated (had to stop the dev server first for the usual EPERM on the query engine).
- `lib/pricing/boosts.ts`: REWRITTEN. `BOOST_TIERS`, `boostCost`, `customBoostCost`, `BOOST_CREDITS_PER_DAY` all DELETED - they priced DURATION, which no longer exists. Replaced with `WEIGHT_PER_CREDIT = 1`, `BOOST_WINDOW_DAYS = 7`, `weightForCredits()`.
- `services/boosts/schedule.ts`: `pickIndex(seed, hour, count)` -> `pickWeighted(seed, hour, boosts)`. Builds a cumulative weight line and maps the hash into it, integer-only so there is no floating-point drift between identical calls. `getActiveBoosts` now returns `weight`; `ActiveBoost` gained the field.
- `app/(app)/profile/visibility/actions.ts`: reads `credits` instead of `days`/`customDays`; writes `weight`; window comes from `BOOST_WINDOW_DAYS`. The "You already have a boost running" refusal is REMOVED - it was the single thing that made a second purchase in the same window impossible, so it could not survive this model. Still one transaction, still a guarded `updateMany` debit.
- `components/profile/BoostForm.tsx`: the "How long" section and its 7/14/30/Custom tier grid are GONE. Replaced by "How many boosts to spend" with a number input and a summary line showing weight and the 7-day window.
- PROVEN, NOT ASSERTED: new `scripts/verify-weights.js` measures actual assignment share against the share each weight entitles. 500 viewers x 168 hours: 1v1 50/50 (0.00% dev), 5v1 83.4/16.6 (0.20%), 3v2v1 50.0/33.4/16.6 (0.21%), 10v1v1 83.3/8.4/8.3 (0.16%). Determinism holds; 9-vs-1 gives the heavy boost 89.4% of viewer-hours; different viewers still land on different boosts in the same hour. Output: ALL CHECKS PASSED.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- STILL STALE, needs a follow-up: `components/profile/BuyBoostsButton.tsx` copy still says "N boosts = N days of visibility" and "1 boost = 1 day". That is the OLD model and is now WRONG. Not fixed in this pass - flagging rather than leaving it to be discovered.
- NOT verified by hand: starting a weighted boost through the form.

### 2026-11-09 - Buy boosts popup: WIDER not longer, and shows the PRICE

- USER REQUEST, two parts: make the popup wider rather than longer, and show how much the user is paying before they click pay.
- WIDTH: `maxWidth` 440px -> 760px, and the body is now a two-column grid (`md:grid-cols-2`, collapsing to one column on narrow screens). Rules on the left, amount + price on the right. Stacking everything vertically had turned a two-field task into a long scroll.
- PRICE, the substantive addition: a `USD_PER_BOOST = 1` constant, an `usd()` formatter (`Intl.NumberFormat`, en-US), a "$1 per boost" line under the input, a large live **Total** (`$10.00`), and the pay button now reads "Pay $10.00" rather than "Pay for 10 boosts". The days-of-visibility explanation moved under the total, where it supports the number instead of competing with it.
- PRICE SOURCE, stated so nobody has to guess: `$1 per boost` comes from the rule written in `supabase/026_boost_credits.sql` - "$1 buys 1 boost". It is a DISPLAY constant in this component, NOT in `lib/pricing/`, because there is no real checkout yet. When payments land, per-currency pricing, discounts and tax belong in `lib/pricing/`, and this constant should be deleted rather than extended.
- The "-" placeholder is kept for empty/invalid input so the total never shows a confident $0.00 before anything is typed.
- Buttons are now right-aligned at the end of the row (Close, then Pay) - they were two equal halves stretching the full width, which read as two competing primary actions.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the two-column layout at the md breakpoint, and whether the popup now feels wide rather than tall.

### 2026-11-09 - FIX: cursor lost on every keystroke in a modal input (shared Modal bug)

- Report: "for each figure typed, the cursor disappears" in the Buy boosts amount field.
- CAUSE, and it was mine: `components/ui/Modal.tsx` had `useEffect(..., [open, onClose])`. `onClose` is an inline function from the parent, so its IDENTITY changes on every parent render. Typing calls `setAmount` -> parent re-renders -> new `onClose` -> the effect's CLEANUP runs (`lastFocused.current?.focus?.()`, pulling focus back to the trigger) and the effect RE-RUNS (`panelRef.current?.focus()`, pulling focus to the panel). The caret was yanked off the input on every single keystroke.
- FIX: `onClose` is now held in a ref (`onCloseRef`, reassigned every render) and the effect dependency is `[open]` alone. The handler reads `onCloseRef.current()`. Opening/closing behaviour is unchanged; the effect simply no longer re-runs because a callback identity changed.
- SCOPE, important: this was a SHARED component bug, not a Buy boosts bug. It would have hit ANY controlled input inside ANY modal in this app - the composer modals, the post picker search box, anything. Fixing it here fixes them all.
- GENERAL RULE for this codebase: an effect that takes a callback prop must NOT list that callback in its dependencies unless re-running on every parent render is genuinely wanted. Use a ref. Lists of dependencies containing inline handlers are a focus-loss generator.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: that the caret now stays put. Needs one live type into the field.

### 2026-11-09 - Buy boosts popup explains boosts and shows the live amount

- `components/profile/BuyBoostsButton.tsx`, two additions:
  - "How boosts work" block ABOVE the input, so the rule is read before a number is typed: 1 boost = 1 day; a boosted post is lifted to the top of recruiters' feeds and the profile is featured in Explore for the same period; one boost period covers every post selected; only ONE boost runs at a time, so buying more extends duration rather than concurrency.
  - Live totals under the field: "You are buying - N boosts = N days" and, on the balance line, "after this purchase: balance + N". Wrapped in `aria-live="polite"` so the amount is announced as it changes instead of requiring the field to be re-read.
- The "-" placeholder when the field is empty or invalid avoids showing a confident "0 boosts = 0 days" for an untouched form.
- Copy uses plain ASCII hyphens, not bullets or em dashes - matching the rest of the codebase's escaping habits and avoiding JSX entity issues.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the popup rendering and the live amount updating per keystroke.

### 2026-11-09 - Buy boosts popup is a CUSTOM AMOUNT, not a tier list

- USER CORRECTION, second time on this popup. The requested design was "input your amount and go to pay" - NOT a breakdown of boost categories. I built a tier list (7/12/20 with per-day maths and savings labels), which turned a wallet top-up into a product catalogue. Superseded and replaced.
- `components/profile/BuyBoostsButton.tsx`: REWRITTEN. The popup is now one labelled number input ("How many boosts?"), the current balance, and a Pay button. Nothing else.
- REMOVED with it: the `BOOST_TIERS` import and all per-tier rendering. This component no longer reads `lib/pricing/boosts.ts` at all - which is CORRECT, because those tiers describe DISCOUNTED DURATIONS on the boost form, not credit packages. Conflating the two is what produced the wrong UI twice.
- Validation, so a bad value cannot reach a future checkout call: whole numbers only, 1 to 1000. An inline error appears only once something has been typed, so the empty field is not pre-emptively scolded.
- The Pay button label reflects the entered amount ("Pay for 10 boosts") so the user sees what they are buying before the provider exists to confirm it.
- STILL HONEST about payments: the amber note stating checkout is unavailable stays, and Pay is disabled with a `title`. That part of the earlier entry was right and is unchanged.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the popup, the number input, and the validation message.

### 2026-11-09 - "Buy boosts" is a real pricing POPUP

- USER CORRECTION, and I was wrong before: the header "Buy boosts" button was left `disabled` on the reasoning that checkout does not exist. That conflated two things - a payment GATEWAY being unbuilt does not mean the pricing SURFACE cannot work. The popup is real UI and belongs now.
- Supersedes the "Buy boosts moved to the page header" entry only in that the button is no longer disabled - its POSITION at the top of the middle column was right and is unchanged.
- New `components/profile/BuyBoostsButton.tsx` (client - the visibility page is a server component and cannot hold open state): header button + `<Modal>` popup, reusing the shared `Modal` so Escape, click-outside, scroll lock and the focus trap all come for free.
- Popup contents: the three real `BOOST_TIERS` read straight from `lib/pricing/boosts.ts` (7/7, 14/12, 30/20) each showing boosts/day and "save N boosts" where the bundle is discounted; a Custom row stating 1 boost/day; the current balance; and a Close / "Continue to payment" pair.
- TIERS ARE NOT DUPLICATED - they are imported. Hardcoding 7/12/20 here would have been a fourth copy of the pricing rule to drift.
- HONEST FAILURE: selecting a tier shows an amber note that checkout is unavailable and support can add the boosts; "Continue to payment" is disabled with a `title` explaining why. The popup never pretends to take payment, and it never silently does nothing when a tier is clicked - the click has a visible consequence.
- "Custom" is deliberately NOT selectable: it has no fixed total to purchase, it is a length chosen on the boost form, which is where it already lives.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: opening the popup, keyboard focus behaviour, and the selected-tier state.

### 2026-11-09 - "Buy boosts" moved to the page header; boost form only spends

- USER CORRECTION: the "Buy boosts" button was wrong INSIDE the boost form. That form exists to SPEND credits on visibility; buying credits is a different action and belongs at the top of the page. Having a buy button where the start-boost button should be made the two read as the same thing.
- `components/profile/BoostForm.tsx`: removed the `boostCredits === 0 ? <Buy boosts> : <Start boost>` branch entirely. The submit button is ALWAYS "Start boost (N boosts)", disabled when pending, nothing selected, or balance < cost. Zero balance is now just the insufficient-credit case - the form never offers to sell anything.
- Feedback split so the disabled state is never unexplained: "Select at least one post." when nothing is ticked; "You need N boosts for this and have M. Buy more boosts at the top of this page." when short - the second half points at the new location instead of leaving the user stuck.
- `app/(app)/profile/visibility/page.tsx`: header is now a flex row - heading + subtitle on the left, "Buy boosts" button with an "N boosts available" line beneath it on the right.
- HONEST STATE, not hidden: the header Buy button is `disabled` with a code comment saying purchase is not built. It is deliberately NOT wired to a fake route or a dead link. When checkout exists it gets a real destination.
- Balance is now shown TWICE by design: in the header line and inside the form's "Your balance" row. The header one is the global account state; the form one is the number you are about to spend against. If that reads as duplication, drop the form row, not the header.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the header layout at narrow widths with a long subtitle alongside the button.

### 2026-11-09 - OUTAGE FIXED: migration 026 was never applied; site 404'd everywhere

- Report: "my website is returning 404 not found." Root `/` returned 200, so it was not a total outage - but `/profile/visibility` and `/api/settings` were 404ing.
- READ THE SERVER LOG FIRST. The dev output named the cause exactly:
  `The column User.boostCredits does not exist in the current database.` (Prisma `P2022`, `meta.column: 'User.boostCredits'`).
- CAUSE CHAIN: `schema.prisma` declared `User.boostCredits` and the Prisma client had been regenerated, but `supabase/026_boost_credits.sql` had never been run against the database. Every `prisma.user.findUnique` threw. `getCurrentUser` catches DB errors and returns `null` BY DESIGN (so the site does not crash), so the app treated a signed-in user as signed out - the middleware/layout then redirected, and the result read as 404. A swallowed error turned a schema problem into a routing symptom.
- THIS IS THE THIRD TIME this exact class of bug has bitten: 020 (orphaned BoostTurn), 022 (missing RLS), 024 (text columns declared as enums). The log already says it - `prisma validate` and `prisma generate` only read `schema.prisma` and NEVER inspect the database. Regenerating the client makes it query a column that may not exist.
- FIX: new `scripts/apply-boost-credits.js` applies both ALTERs and prints the column state before and after, so the result is verified rather than assumed. Idempotent (`ADD COLUMN IF NOT EXISTS`). Ran it: `BEFORE: []` (genuinely absent) -> `AFTER:` both columns present, `integer NOT NULL DEFAULT 0`.
- WHY A SCRIPT rather than `prisma migrate`: this project has no migrations folder and applies SQL in `supabase/` by hand. The script reuses the same plain `PrismaClient` + `$executeRawUnsafe` pattern as the existing check scripts.
- PROCESS NOTE: after any `schema.prisma` change in this project, the SQL in `supabase/` MUST be run before the feature is used. "tsc passes and next build passes" proves NOTHING about the database - both passed here while the site was broken.
- VERIFIED AFTER THE FIX (against the live database, not assumed): a Prisma `findMany` on both models returns cleanly: all three users show `boostCredits: 0` (fresh default), and the one pre-existing boost shows `days: 1, creditsSpent: 0` - which is CORRECT per the 026 header (granted before the wallet existed).
- SECOND CAUSE, found only after the migration still left the page 404ing: STALE TURBOPACK CACHE. The running dev server kept serving the pre-migration compiled chunk (the error trace still pointed at `.next/dev/.../[root-of-the-server]__1ymcya0`, an old chunk hash). Fixing the database did not fix the running server. Resolved by stopping the dev server, deleting `.next`, and restarting.
- CORRECTION TO MY OWN CLAIM: my first verification here used `curl` against a route that was already 404ing for an unrelated reason and I read `307` as proof the page worked. A 307 from an UNAUTHENTICATED curl only proves middleware redirects - it says nothing about whether the page renders for a signed-in user. The real proof is the authenticated dev-log line `GET /profile/visibility 200`.
- LESSON: when a route 404s, check BOTH the database column AND whether the running server is serving a stale build. `tsc`/`next build` passing does not recompile a dev server that is already running with a bad chunk.

### 2026-11-09 - Boost form is now CREDITS-ONLY and actually spends them

- SPLIT-BRAIN FIXED. The backend (`app/(app)/profile/visibility/actions.ts` `startBoost`) already priced boosts in CREDITS, but `BoostForm.tsx` still imported `TIERS`/`TIER_PRICES`/`customPrice`/`formatPrice` from `lib/pricing/currency.ts` and rendered MONEY. The two spoke different languages and nothing connected them: the form was a display-only `<div>` with a hardcoded disabled "Checkout coming soon" button, never calling the action, never submitting `postIds` or `days`.
- USER DECISION (asked, not assumed): credits only, no money shown in the boost UI. Money only enters the picture when credits are BOUGHT, which is not built.
- `components/profile/BoostForm.tsx`: REWRITTEN.
  - Now imports `BOOST_TIERS`, `boostCost`, `customBoostCost` from `lib/pricing/boosts.ts`. Tier cards read "7 boosts" / "12 boosts" / "20 boosts"; Custom reads "1 boost/day".
  - Props are now `{ posts, boostCredits }` - `currency` and the unused `hasActiveBoost` are gone (the page never passed the latter meaningfully; the active-boost case is rendered by the PAGE, not the form).
  - Renders the balance at the top: "Your balance - N boosts".
  - Is a real `<form action={formAction}>` using `useActionState(startBoost, {})`. Selection travels as repeated hidden `postIds` inputs, plus hidden `days` and (custom only) `customDays` - matching exactly what `startBoost` reads via `formData.getAll('postIds')` and `formData.get('days')`.
  - Submit button shows the cost and disables when: pending, nothing selected, or balance < cost. `state.error` renders in a red banner (reuses the red-50/red-700 pattern from the settings forms).
  - ZERO-BALANCE CASE handled explicitly: with `boostCredits === 0` the button reads "Buy boosts" and stays disabled with the honest note that purchasing is not live and support grants them. Deliberate - a user with no credits should not get a button whose only outcome is an error.
- `app/(app)/profile/visibility/page.tsx`:
  - Removed the entire currency-resolution block (dev override header, `x-vercel-ip-country`, profile-country fallback) and the `currencyForCountry` import. Boost costs are in credits; there is nothing to convert.
  - Passes `boostCredits={user.boostCredits ?? 0}`.
- VERIFIED `getCurrentUser` returns `boostCredits`: `lib/auth/get-current-user.ts` uses `findUnique` with `include` and NO `select`, so every `User` scalar is present. Checked rather than assumed - a `select` there would have silently shown a 0 balance to everyone.
- `lib/pricing/currency.ts` is now UNUSED BY BOOSTS but deliberately kept: credit top-ups will need money-to-credit conversion. Left in place, flagged so nobody "cleans it up" and then has to rebuild it.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded (20 static pages).
- NOT verified by hand: submitting a real boost and watching credits drop and the active-boost panel appear. Also untested: `startBoost` redirects to `/profile/visibility`, and `useActionState` + `redirect` together in Next 16 is worth one live click to confirm no state warning appears.

### 2026-11-09 - Dead content-validator code removed

- CORRECTION to the 2026-11-08 entry that said the validator was "imported nowhere in work actions": the CALL was removed but the import survived. `app/(app)/profile/work/actions.ts:8` still had `import { validateWorkPost } from '@/services/ai/contentValidation'` while neither create nor update called it. TypeScript does not flag unused imports here, so the build stayed green and it looked as though the gate was still in play.
- Deleted `services/ai/contentValidation.ts` (`MockAIContentValidator`, the `AIContentValidator` interface, and the module-level `validateWorkPost` wrapper). Nothing imported it after the stale import was removed.
- `types/index.ts`: deleted the `AIValidationResult` interface. Its only consumer was the deleted module; `suggestedTemplate` went with it. `WorkTemplate` is still used by the WorkPost type, so the import stays.
- `README.md`: dropped the "AI content validation" feature bullet - it advertised a gate that no longer exists.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded (20 static pages, unchanged).
- Not touched: `.next/` and `tsconfig.tsbuildinfo` still contain the old module name as build cache. That is stale output, not source; it clears on the next clean build.

### 2026-11-09 - Boost post selection: short list + "Search more posts" popup

- REVERTED the inline search added earlier today. `components/profile/BoostForm.tsx` is back to a plain checkbox list, now capped at the first 5 posts.
- New `components/profile/PostPickerModal.tsx`: opens from a "Search more posts ->" link (only rendered when the user has more than the 5 shown). Contains the search box and the full list.
- Paging is CLIENT-SIDE and incremental: `visibleCount` starts at 20 and grows by 20 when the list is scrolled near the bottom. All posts are already loaded by the visibility page, so nothing is refetched.
- The loader has a deliberate 250ms delay so it is perceivable rather than a flicker. It is simulated, not a real fetch. Remove the timeout if it feels artificial - paging still works.
- Search resets `visibleCount` to 20, so a new query always starts from the top of its results.
- Selection state lives in `BoostForm` and is passed down, so checking a box in the popup updates the form's summary and price immediately.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: the popup, scrolling, and the loader in a browser.

### 2026-11-09 - FIX: middleware made every request ~1.1s slower

- Report: "this website is extremely slow, clicks take almost 10 seconds".
- MEASURED FIRST, did not guess. Dev log showed: `GET /viral41682 200 in 7.6s (next.js: 56ms, proxy.ts: 1153ms, application-code: 6.4s)`. Even `/favicon.ico` took ~950ms.
- CAUSE 1 (fixed): `middleware.ts` called `supabase.auth.getUser()` - a NETWORK round-trip to Supabase Auth on EVERY request. Changed to `getSession()`, which decodes the JWT from the cookie locally. Measured after: an unauthenticated request that previously took ~1150ms now completes in 8ms.
- Same tradeoff already documented in `get-current-user.ts`: the cookie is trusted until JWT expiry. Acceptable because middleware is a UX gate, not the data boundary (RLS handles that).
- CAUSE 2 (NOT fixed): `application-code: 6.4s` is Prisma. The profile page runs ~7 SEQUENTIAL queries to a remote database; each costs a full internet round-trip from a local dev machine. This is why it is slow LOCALLY and will be much faster on Vercel, where the server sits in the same region as the database. User agreed to confirm this after deploying.
- Note: unauthenticated `curl` timings are meaningless here - they 307 before rendering. Real timings only appear in the dev log for authenticated requests.

### 2026-11-09 - Boost: post selector gets a search filter

- `components/profile/BoostForm.tsx`: the post list rendered EVERY post as a checkbox with no way to narrow it. `getVisibilityAnalytics` has no `take`, so an account with 100 posts would render 100 checkbox rows inside an already-scrolling modal.
- Added a client-side title search above the list: `visiblePosts` filters `posts` by lowercase substring on title. No refetch per keystroke - the data is already loaded.
- The search box only renders when there are MORE THAN 5 posts, so small accounts are not given useless UI.
- Shows "N of M match" while a query is active, and a separate empty state ("No posts match \"...\"") distinct from "you have no posts".
- DECISION: search rather than a cap. Capping at 20 would hide the post someone specifically wants to boost.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-09 - REVERTED: route interception removed entirely

- ALL intercepted modal routes deleted: `app/(app)/@modal/` (posts, roles, profiles). `components/ui/DetailModal.tsx` deleted. The `modal` slot was removed from `app/(app)/layout.tsx`. `.next` cleared so the old routes stopped being served.
- WHY: the request was "clicks should WORK LIKE popups" - meaning they should FEEL instant, not that every destination should BECOME a modal. I read it as the latter and built route interception, then extended it to profiles on my own initiative. Clicking your own profile opening in a dialog is the visible symptom.
- The speed problem that prompted this was real, and its actual fixes are KEPT: middleware auth boundary, `getSessionRole()` reading the role from session metadata (no Prisma query to render the shell), and route-level skeletons (app-level neutral, profile-shaped for `[username]`).
- Route list after the change confirms no intercepted routes remain: `/(.)[username]` etc are gone; `/[username]`, `/[username]/posts`, `/[username]/work/[id]`, `/[username]/recruitments/[id]` all still resolve as normal pages.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Supersedes the Phase 1/2/3 modal entries. Those describe how the overlay was built; it no longer exists.

### 2026-11-09 - FIX: profile showed a feed skeleton first

- Report: the profile route flashed an "older screen" before the real page.
- Cause was two things stacked:
  1. `app/(app)/loading.tsx` rendered its OWN three-column layout - left rail, composer, tab row, post cards, right rail - even though `layout.tsx` already provides the rails. On any non-feed route the middle column showed a fake FEED while the real page loaded, so a profile visibly morphed out of a feed.
  2. Only `profile/work`, `messages/[id]` and `settings` had their own `loading.tsx`. `/[username]` and everything else fell back to that feed skeleton.
- `app/(app)/loading.tsx`: REWRITTEN as a neutral middle-column placeholder - a header card plus three generic card rows, no rails (the layout owns those), no composer, no tabs.
- New `app/(app)/[username]/loading.tsx`: profile-shaped skeleton - cover banner, overlapping avatar, name/handle/title/stat lines, bio lines, section heading, one post card. Matches ProfileBody so the swap is shape-to-shape.
- General rule: a route-level `loading.tsx` should mirror THAT page, and the app-level one must never assume a particular page type. Drawing the rails in the skeleton duplicates the layout.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- NOT verified by hand: whether the flash is gone on navigation.

### 2026-11-08 - "All posts" link: inline right arrow, no count

- `components/profile/ProfileBody.tsx`: both variants changed again. The label and `→` are now on ONE centred line (`flex items-center justify-center gap-1.5`) instead of the two-line stack with `▼`.
- The item COUNT is REMOVED - reads "All posts" / "All roles", not "All posts (3)".
- Supersedes the `▼` stacked version from minutes earlier.
- Condition is still `posts.length > 1` / `roles.length > 1`, so the link only appears when there is a fuller list to open.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - "All posts" link centred with a downward arrow

- `components/profile/ProfileBody.tsx`: both the posts and roles variants changed from a left-aligned line ending in `→` to a centred stack: label on top, `▼` centred beneath it. `block` -> `flex flex-col items-center gap-1`; the arrow is its own `<span className="text-[12px] leading-none">` so it centres under the label rather than trailing it.
- Applies to "All posts (N)" and "All roles (N)" - both are the same component pattern.
- Note: two stacked lines make the link taller than the single line it replaced. `py-3` retained; reduce to `py-2` if it reads heavy.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Recruitment form no longer wipes on error

- Same fix as the work post form, applied to `RecruitmentForm`.
- `app/(app)/profile/recruitments/actions.ts`: `RecruitmentFormState` gained `values?: Record<string, string>` plus a `rawValues(formData)` helper. Echoed from all SEVEN early returns in `createRecruitment` and `updateRecruitment`.
- `components/recruitments/RecruitmentForm.tsx`: added `dv(field, fallback)` and every input now reads `dv('field', initial?.field)`. Patched: title, organization, location, country, employmentType, salaryRange, description, responsibilities, requirements, applyInstructions, applyUrl (both the LINK and EMAIL variants share the `applyUrl` name), closingDate. Verified by search that no `defaultValue={initial` remains.
- NOT covered: `createTeamRoles`. Its team-roles repeater is controlled React state submitted as JSON, so a failure there loses the rows on remount. Separate fix if it matters.
- Why it mattered more here than on the work form: this form has ~12 fields plus the repeater, so an error cost far more typing.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Content gate REMOVED; failed saves no longer wipe the form

- `app/(app)/profile/work/actions.ts`: removed the `validateWorkPost` gate from BOTH create and update. The template now comes straight from the user (`d.template`) instead of `validation.suggestedTemplate`.
- WHY: `services/ai/contentValidation.ts` is `MockAIContentValidator` - NOT AI, a hardcoded keyword check. It concatenated only title + purpose + result and required one of 13 action verbs. Anything written into the other eight fields (challenge, goal, approach, solution, contribution, metrics, situation, action) counted for nothing, and any verb outside the list (crafted, shipped, authored) failed. It rejected legitimate work and told the user "we need to see evidence of your professional work", which was often simply untrue.
- User's reasoning, recorded: people should post what they want. If a claim is false, a recruiter judges it - a platform string-match cannot verify truth anyway, and the gate drives users away.
- SECOND FIX, the more damaging one: `WorkFormState` gained `values?: Record<string, string>` and a `rawValues(formData)` helper. Every early return in create and update now echoes the submitted values. `WorkForm` reads them via `dv(field, initial?.field)`, so a failed save REPOPULATES every field instead of wiping it.
- Root cause of the wipe: the form uses uncontrolled inputs (`defaultValue`), and React resets an uncontrolled form after EVERY server action, success or failure. Returning a bare `{ error }` therefore erased everything typed.
- NOTE: the old validator file `services/ai/contentValidation.ts` still exists and is still imported nowhere in work actions. Left in place rather than deleted - if it stays unused it should be removed.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- STILL TO DO: `RecruitmentForm` has the identical uncontrolled-input pattern and still wipes on error. Not yet fixed.

### 2026-11-08 - "Posts" renamed to "Published"; button says "Publish Work"

- `components/profile/ProfileBody.tsx`: section heading "Posts" -> **Published**; owner button "+ Create Post" -> **"+ Publish Work"**.
- `app/(app)/[username]/posts/page.tsx`: page heading "Posts" -> **Published**.
- Recruiters are UNCHANGED - still "Roles" / "+ Create Role". The request was about posts only.
- STILL SAYS "All posts (N)" on the profile (line 224), pointing at a page now headed "Published". Left alone because it was not part of the request; flagged for the user to decide.
- Terminology caveat: the list can contain posts whose `status` is not PUBLISHED (the row shows a lowercase amber status for those). A heading of "Published" is slightly inaccurate for a draft. Not changed - noted in case it matters.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - "+ Create Post" button on the profile posts heading

- `components/profile/ProfileBody.tsx`: the posts/roles heading is now a flex row with a `+ Create Post` (or `+ Create Role` for recruiters) button on the right, linking to `/profile/work/new` or `/profile/recruitments/new`.
- OWNER ONLY: gated on the existing `isOwn` prop, so visitors never see a create action on someone else's profile.
- Uses `.btn-primary` at `text-[13px] px-3 py-1.5` - deliberately smaller than a standard primary button because it sits inline with a heading.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - In-app 404 and error boundaries

- Reported: every page showed a 404 on first navigation, resolved by refresh.
- Server check first: `curl` on /viral41682, /recruitments, /feed, /trending, /list all returned **307** (middleware redirect to login for an unauthenticated request) - NOT 404. So the server was healthy and the 404 was client-side.
- Root cause of the VISIBLE problem: there was no `not-found.tsx` or `error.tsx` anywhere. Any `notFound()` - including `[username]/page.tsx` when a profile lookup misses - rendered Next's bare default page with no nav, sidebar or styling, which reads as "the site is broken".
- New `app/(app)/not-found.tsx`: styled 404 inside the app shell with links to feed and explore.
- New `app/(app)/error.tsx`: real error boundary with a Try again button and a feed link, and a console log for the error.
- NOT CONFIRMED: whether the underlying `notFound()` was a genuine missing user or a timing race on cold navigation. The boundaries fix how it LOOKS; they do not prove the lookup succeeds. Needs re-testing.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Profile shows one post + "All posts" page; Experience moved below posts

- `components/profile/ProfileBody.tsx`: the profile now renders only the FIRST post (`posts[0]`) or role (`roles[0]`), followed by an "All posts (N) ->" / "All roles (N) ->" link. The link only renders when there is more than one item - linking to a page that shows a single item is pointless.
- The tab strip is gone. It was a single-item strip labelled "Posts" / "Roles", so it read as a tab that did nothing. Replaced by a plain section heading with the same underline treatment.
- `ExperienceSection` MOVED: it was in the identity block under the bio, now it renders BELOW the posts list. Order is now: cover -> identity -> about -> skills -> posts heading -> one post -> Experience.
- New `app/(app)/[username]/posts/page.tsx`: full list of the user's posts or roles, newest first, with a back link to the profile. Uses the same summary card markup as the profile list, NOT the feed's `WorkCard` - the user asked for "posts and their summaries like feeds page", which this satisfies without importing feed behaviour (no like/save actions here).
- EDIT SEQUENCE NOTE: the batch edit reported an error on its FIRST hunk (a stale `oldText`), but still applied the remaining hunks. Verified afterwards by reading the file and searching for `ExperienceSection`: it renders exactly once, at the bottom. The error message was about one hunk, not the whole edit.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded; `/[username]/posts` appears in the route list.
- Not verified by hand: the one-post profile and the All posts page in a browser.

### 2026-11-08 - Save feedback FINAL position: directly above the button

- Both `ProfessionalSettingsForm` and `RecruiterSettingsForm`: `state.error` / `state.ok` render immediately ABOVE the Save button.
- HISTORY, so nobody chases a ghost: this message has moved three times today - top of the form, then above the button, then below it, now back to above. Earlier entries describing other positions are superseded; THIS is the current one.
- Why above rather than below: the eye is already at the button when it is clicked, so a validation failure is seen without scrolling, and the message reads as part of the action rather than trailing after it.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Sidebar Bio line: 2 lines, 50 chars, ellipsis

- `components/navigation/Sidebar.tsx`: the Bio line (stored as `title`) now cuts at **50** characters and appends `...` ONLY when it was actually cut. Supersedes the 40-character/no-ellipsis version from minutes earlier.
- Implementation: an inline IIFE builds the string (`bio.length > 50 ? bio.slice(0, 50) + '...' : bio`) rather than a nested ternary in JSX. `line-clamp-2` still wraps and caps at two lines.
- Possible visual issue, not observed yet: 50 characters plus `...` may exceed two lines on a narrow card, in which case `line-clamp-2` clips before the dots are visible. If that happens the fix is a smaller cut, not removing the clamp.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Sidebar Bio line wraps to 2 lines at 40 characters

- `components/navigation/Sidebar.tsx`: the line under the name (stored as `title`, labelled "Bio" in the form) no longer uses `truncate`. It now uses `line-clamp-2` and `.slice(0, 40)`, so it WRAPS to a maximum of two lines and is hard-cut at 40 characters.
- Why: `truncate` = overflow hidden + nowrap + ellipsis, which forces ONE line and cuts by PIXEL width, not character count. The user wanted a predictable 2-line wrap instead.
- TRADEOFF: `.slice(0, 40)` cuts with NO ellipsis - a 41+ character value just stops mid-word. `line-clamp-2` remains as a safety net if 40 characters still overflow two lines in a narrow card.
- The status line below it still uses `truncate` (single line) - unchanged.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Sidebar bio removed; Bio/About relabelled; About clamps; feedback moved to Save

- `components/navigation/Sidebar.tsx`: the short bio added earlier is REMOVED. The card now shows name, title/organization, and status only. User decided the bio made it too long.
- LABEL SWAP, forms only: `ProfessionalSettingsForm` now labels the `title` field "Bio" and the `bio` field "About". `RecruiterSettingsForm` labels its `bio` field "About". A comment in the professional form warns that `name="title"` is the Bio box, because the UI labels and the DB columns now disagree. Existing users' title text will appear under a "Bio" heading - confusing but reversible.
- New `components/profile/AboutSection.tsx` (client): the profile About text clamps to 4 lines with a More/Less toggle. Client because the toggle needs state; ProfileBody is otherwise server-rendered.
- `components/profile/ProfileBody.tsx`: renders `<AboutSection>` instead of a plain paragraph.
- BOTH forms: save feedback moved from the TOP back to directly ABOVE the Save button. The user's reasoning is sound - the eye is already there when clicking Save, so a validation error cannot be missed. This supersedes the earlier "move it to the top" entry for these two forms.
- NAMING DEBT: UI label "Bio" = DB `title`; UI label "About" = DB `bio`. If this sticks, the columns should eventually be renamed in a migration to stop the mismatch.
- Verified: `npx tsc --noEmit` clean and `npx next build` run.

### 2026-11-08 - Work history (experience) for both roles

- `prisma/schema.prisma`: `Experience` is now SHARED. `professionalId` became nullable, `recruiterProfileId` added, both with onDelete Cascade. Exactly one is set per row. The model already existed for professionals but was NEVER used in the UI; recruiters had no equivalent.
- `supabase/025_shared_experience.sql`: makes professionalId nullable, adds recruiterProfileId + FK + indexes. REQUIRED - the Prisma client was regenerated but the DATABASE was not altered until this runs.
- New `components/settings/ExperienceFields.tsx` (client): repeater with title, company, start month, end month, "I currently work here", description. Add/remove rows. Entries are mirrored into a hidden JSON field so the action receives one string rather than indexed inputs.
- New `components/profile/ExperienceSection.tsx`: renders work history on the profile. Current roles first, then previous by end date (newest first). Returns null when empty.
- Both settings forms gained the repeater; both actions gained `parseExperiences()` and a REPLACE-ALL write (delete then recreate) inside the existing transaction. Rows without a title+company, or without a valid start month, are dropped.
- `app/api/me/route.ts`, `app/(app)/[username]/page.tsx` and `app/(app)/@modal/(.)[username]/page.tsx` all now load experiences for both profile types. Without the explicit `include`, `recruiterProfile: true` returns scalars only and experiences would silently be missing.
- `components/profile/ProfileEditModal.tsx` passes existing rows back in, converting dates to `YYYY-MM` for the month inputs.
- DATES ARE MONTH PRECISION: stored as the first of the month. That is what people actually enter for employment history, but it means exact days are not recorded.
- Verified: `npx prisma generate` succeeded (after stopping the dev server - the usual EPERM), `npx tsc --noEmit` clean, `npx next build` run.
- VERIFIED against the live database with `scripts/check-experience-schema.js`: `professionalId` is nullable, `recruiterProfileId` exists and is nullable, and BOTH foreign keys are present (`Experience_professionalId_fkey`, `Experience_recruiterProfileId_fkey`). Table was empty, so no data migration concerns.
- NOT verified by hand: adding a role, saving, and seeing it on the profile.

### 2026-11-08 - FIX: profile saves looked like they silently failed

- Report: bio and title did not appear after saving, in the edit form OR on the profile page.
- DIAGNOSIS FIRST, before any code: `scripts/check-profile-data.js` dumped the actual rows. Annie had a title but no bio; the other two accounts had neither. So SOME saves had worked - it was not a blanket save failure.
- ROOT CAUSE: the professional form requires at least one social link and returns its error BEFORE any write. With title+bio filled but no link, the whole save was rejected - and the error message rendered BELOW a long form, out of view. It read as "nothing happened".
- This was NOT a bug in the save action or the form fields. The validation was working as designed; the feedback was invisible.
- Fix: `state.error` and `state.ok` moved to the TOP of both forms (`ProfessionalSettingsForm`, `RecruiterSettingsForm`) as tinted banners (red-50 / green-50), so a blocked save cannot be missed.
- OPEN QUESTION, user's call, NOT changed: whether "at least one social link" should block every save at all. Options discussed: keep as-is (now visible), warn but still save, or require only on first profile completion. Blocking a bio edit because a link is missing is heavier than the rule probably intends.
- METHOD NOTE: running the data check first avoided fixing the wrong thing. Two previous attempts at similar display problems were caused by guessing instead of querying.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Sidebar profile card shows a short bio

- `components/navigation/Sidebar.tsx`: added a `line-clamp-2` bio under the status line, above the View Profile button. Uses `recruiterProfile.bio` or `professionalProfile.bio` by role. Renders nothing when the bio is empty, so the card gains no blank gap.
- Deliberately short: the user asked for "a few sentences" and explicitly NOT the company or other metadata. `line-clamp-2` guarantees the card never grows regardless of bio length.
- `relative` on the paragraph keeps it above the decorative background circle in the card.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded. Visual confirmation pending.

### 2026-11-08 - FIX: recruiters saw "Professional" in the sidebar card

- Report: a recruiter's profile card showed "Professional" under their name.
- Cause: `components/navigation/Sidebar.tsx` used a role-BLIND fallback chain: `professionalProfile.title || recruiterProfile.organization || 'Professional'`. A recruiter with no organization set - or whose profile had not loaded yet - fell through to the literal string "Professional".
- Fix: role-aware. Recruiter -> `recruiterProfile.organization || 'Recruiter'`. Professional -> `professionalProfile.title || 'Professional'`.
- SAME CLASS OF BUG as the earlier sidebar status line, which was also a role-blind hardcoded string. Worth checking for further instances when touching this component.
- NOT changed: `components/work/WorkDetailBody.tsx:78` uses `{prof.title || 'Professional'}` - correct there, because that card only ever renders for a professional author.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-08 - Profile cover gradient matched to the brand cards

- The LAST remaining non-brand indigo in the app. Every indigo surface now runs `#5B3DF5 -> #8B5CF6`.
- `components/profile/ProfileBody.tsx`: the cover was a THREE-stop gradient `from-brand via-[#8B5CF6] to-[#A855F7]`, ending on a brighter violet (#A855F7) used nowhere else. Now a TWO-stop `from-brand to-[#8B5CF6]`, identical to `.card-gradient`.
- First attempt used `via-[#8B5CF6] to-[#8B5CF6]` - identical last two stops, which renders the same but is not what the other cards do. Corrected to two stops.
- AUDIT RESULT: searched every purple in the codebase. All `bg-brand` uses are #5B3DF5. All `bg-brand-light` uses (#EDE9FE) are tints - avatars, badges, pills, active nav - not mismatched buttons. `.card-gradient` and this cover both run #5B3DF5 -> #8B5CF6. There is no third indigo left.
- Verified: `npx next build` succeeded; the only remaining `#A855F7` string is inside the explanatory comment.

### 2026-11-08 - Gradient cards now use the brand indigo

- Report: the "Discover professionals" / "Stand out to professionals" cards looked like a DIFFERENT colour from the logo.
- Cause: `.card-gradient` in `app/globals.css` hardcoded `#6D4AFF -> #A855F7`, which is not the brand indigo (`#5B3DF5`). It had always been a separate purple, so the cards never matched the logo no matter what the brand token was.
- Fix: `linear-gradient(135deg, #5B3DF5 0%, #8B5CF6 100%)` - starts exactly on the brand indigo and lifts to the `purple` token.
- The two box-shadows were ALREADY correct (`rgba(91, 61, 245, ...)` = #5B3DF5), so the shadow and the background disagreed before this. Left unchanged.
- RECURRING PATTERN, third instance today: a hardcoded colour drifting from its token. Earlier it was the brand hex sweep and the `tint-*` classes; now the gradient. Shadows, gradients and ring colours do not follow colour tokens and must be checked whenever the palette changes.
- Verified: `npx next build` succeeded. Visual confirmation pending.

### 2026-11-08 - Brand colour REVERTED to the original indigo

- Restores `brand` #4C3585/#3A2868/#EAE5F5 -> #5B3DF5/#4A2FD9/#EDE9FE and the `purple` scale -> #8B5CF6/#7C3AED/#A78BFA.
- Also reverted: profile cover gradient, `.card-gradient` background AND its two box-shadows, and the dark-mode CTA hover colour.
- Reverts the 2026-11-07 plum change. That change was made because the user felt the indigo read as "AI generic" - a genuine concern, but the plum did not resolve it to the user's satisfaction, so the original is restored.
- The concern itself is NOT resolved: #5B3DF5 still sits in the Stripe-indigo family that reads as generic tech. If this comes up again, the honest options remain (own green, or a distinctly different purple), and the reasoning is preserved in the 2026-11-07 entry above.
- Verified: no plum hex remains in `components/` or `app/` source; `npx tsc --noEmit` and `npx next build` run after the revert.

### 2026-11-07 - Boost Visibility dropdown icon is now an eye

- `components/navigation/TopNav.tsx`: the `Boost Visibility` menu item uses `EyeIcon` instead of `TrendingIcon`. An eye reads literally as visibility; a trend arrow did not.
- `TrendingIcon` stays imported - the top nav's Trending item still uses it. Only the dropdown entry changed.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-07 - Brand colour moved off Stripe-indigo to a deeper plum

- Reason: the user reported the old indigo reading as "AI generic build". That is accurate - #5B3DF5 sits in the same family as Stripe's #635BFF, the most imitated brand colour in SaaS, and a wave of AI/dev tools have copied it. The problem is not purple as a colour, it is that THIS purple is everyone's purple.
- CONSIDERED AND REJECTED: Facebook blue (generic SaaS, and Twitter's blue was just retired so blue is now doubly unremarkable) and Upwork green (visually adjacent to the closest competitor). Also rejected a TikTok/Instagram-style spectrum - gradients are the single most generic "AI" signal right now, and a spectrum signals playful, not employable, which is wrong for a hiring platform.
- `tailwind.config.js`: `brand` #5B3DF5 -> #4C3585, `brand-dark` #4A2FD9 -> #3A2868, `brand-light` #EDE9FE -> #EAE5F5. The `purple` scale was retuned (8B5CF6/7C3AED/A78BFA -> 7A5AAF/63478F/9B85C4) so it sits with the new plum instead of clashing.
- Hardcoded hexes that do NOT follow tokens, all updated:
  - `components/profile/ProfileBody.tsx` cover gradient -> from-brand via-[#63478F] to-[#7A5AAF].
  - `app/globals.css` `.card-gradient` -> #4C3585 to #7A5AAF.
  - `app/globals.css` dark-mode CTA override -> #4c3585.
- Verified by search that no old brand hex remains in `components/` or `app/` source (the earlier search was polluted by `.next` build output - worth excluding that path in future).
- User confirmed visually: "Better, I like it."
- NOT audited: `text-brand` on white (links, skill pills) may read heavier at the deeper value. Tunable if it becomes an issue.
- FOLLOW-UP: `.card-gradient` still glowed with the OLD indigo (`rgba(91,61,245,...)`) after the token change - a shadow does not follow a colour token, so the promo cards glowed purple-blue against a plum background. Retuned to `rgba(76,53,133,...)` with alpha nudged up (0.24 -> 0.28, 0.3 -> 0.34) because the plum is darker and would otherwise cast a weaker glow than the old indigo. Worth remembering when the brand changes again: shadows, gradients and ring colours are hardcoded and do not move with the token.

### 2026-11-07 - Boost step 7: the boost UI

- New `components/profile/BoostForm.tsx` (client): post selection with checkboxes, duration choice (7 / 14 / 30 / Custom with a day input), live running total in the viewer's currency, and a DISABLED "Checkout coming soon" button with an honest note that boosts are granted manually.
- `app/(app)/profile/visibility/page.tsx`: static tier cards replaced with the real form. If a boost is ACTIVE the form is replaced by a status panel: end date, "Seen by N recruiters so far", and the list of boosted posts. One boost at a time, so the form never shows while one is running.
- `services/queries/analytics.ts`: now returns `activeBoost` (id, days, expiresAt, posts, impression count) alongside the totals.
- Page copy rewritten for the recruiter-only product: "Professionals already see your work by you posting; a boost reaches the audience you cannot reach organically."
- `lib/pricing/currency.ts`: NGN is a DELIBERATE rate set by the user - $1 = NGN 1,000 (7,000 / 12,000 / 20,000). Documented as deliberate so a future reader does not "correct" it to an FX rate. Other currencies are USD converted at approximate rates, rounded to whole units, and labelled INDICATIVE in the file.
- `customPrice` now rounds to whole units and derives the daily rate from the 7-day tier, so Custom stays consistent with the tiers within a currency. Custom remains the most expensive per-day option by design - that is what makes the bundles worth buying.
- `components/navigation/TopNav.tsx`: "Boost Visibility" added to the profile dropdown, between My list and Settings.
- KNOWN GAP: the page is reachable by RECRUITERS, who cannot boost. They see analytics (empty) and a boost form they cannot use. Either hide the section for recruiters or show a "not available for your account" note.
- NOT DONE: actual purchase. No payment provider is integrated. The button is disabled on purpose rather than pretending checkout exists.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the form rendering and the pricing display in the browser.

### 2026-11-07 - Boosts are now RECRUITER-ONLY

- PRODUCT DECISION, user's reasoning: a boost buys access to the HIRING audience, not more eyeballs. Professionals already see each other's work simply by posting more; boosting is for reaching recruiters, the audience you cannot reach organically. Both sides stay engaged.
- `services/boosts/schedule.ts`: `boostedPostForViewer` and `boostedProfileForViewer` now take `viewerRole` and return `null` unless it is `RECRUITER`. Returning null does NOT hide the post - it only stops it being LIFTED. A professional still sees the boosted post in Recent at its natural position, and in For You if it matches their skills.
- Callers updated: `app/api/home/route.ts` and `app/api/explore-boost/route.ts` both pass `me?.role`.
- Explore is gated the same way: a professional browsing Explore sees the normal directory with no paid placements.
- `services/queries/analytics.ts`: new `seenByRecruiters` total, counting `BoostImpression` rows where `viewerRole = 'RECRUITER'` for that user's boosts. Since the boost only ever shows to recruiters now, this is the real reach number.
- `app/(app)/profile/visibility/page.tsx`: headline row is now Views / Recruiter views / **Seen by recruiters** / Likes. Saves was moved out of the headline (still tracked, still shown per post). Reversible if the user prefers the old row.
- CONSEQUENCE: the existing test boost on Annie Taylor no longer pins for a professional viewer. That is correct, not a regression. Verifying the gate needs a RECRUITER account.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- VERIFIED both ways by `scripts/verify-recruiter-gate.js` against the live database: a RECRUITER viewer gets a pick, a PROFESSIONAL viewer gets null, a null role gets null, and the boosted post is still retrievable as a normal post (the gate suppresses the PIN, never the post). Output: `{activeBoosts:1, recruiter:"PICKED 853a2bf1", professional:null, nullRole:null}` -> GATE VERIFIED.
- Still not verified in a browser: an actual recruiter account seeing the pin rendered in the feed. The logic is proven; the render is not.

### 2026-11-07 - Boost pipeline verified in the browser

- User confirmed in the running app: on the **Recent** tab, Annie Taylor's boosted post appears at position 1, ABOVE a recruiter post that is older by date. That is the pin overriding chronological order as designed.
- This closes the last unverified link. The whole chain is now proven: boost row in DB -> assignment picks it -> `/api/home` returns `boostedPostId` -> the feed renders it first.
- RESOLVED as INTENTIONAL: "For You" filters by skill match and is meant to stay that way. A boosted post only appears there if it genuinely matches the viewer - For You must never show an irrelevant post just because someone paid. If it does not match, `findIndex` returns -1 and the pin does nothing, which is the correct outcome.
  - COMMERCIAL CONSEQUENCE, accepted: a buyer's For You exposure depends on how well their work overlaps each viewer's skills. Recent is where the boost is guaranteed. This is a pricing/value consideration, not a defect - do not "fix" it by forcing boosted posts into For You.
- Deleted `scripts/check-boost-tables.js` - it referenced `prisma.boostTurn`, which was removed in step 3, so it failed on run. The raw-SQL count used instead is immune to schema drift.

### 2026-11-07 - FIX: boost columns were text, schema declared enums

- The inspect script failed on first run with `42883 operator does not exist: text = "BoostStatus"`. THREE columns were mismatched: `Boost.status` (text vs BoostStatus), `BoostImpression.surface` (text vs BoostSurface), `BoostImpression.viewerRole` (text vs UserRole). The `BoostStatus` enum type existed but the column never used it; `BoostSurface` did not exist at all.
- IMPACT: every query touching those columns failed. The entire boost system was broken, not just the script.
- New `supabase/024_boost_enum_columns.sql`: creates `BoostSurface` and converts all three columns with USING casts. Verified all three tables were EMPTY first (`{boosts:0,posts:0,impressions:0}`), so no cast could fail on existing values.
- ROOT CAUSE, and the reason this went unnoticed for hours: `prisma validate` and `prisma generate` only read `schema.prisma`. They never inspect the database. A schema declaring enums over text columns passes every check while being broken at runtime. Three separate bugs today came from this gap - the orphaned BoostTurn table, missing RLS, and these enum mismatches. The only thing that catches any of them is running a query against the real database.

### 2026-11-07 - Boost step 6: grant and inspect scripts (verified end to end)

- New `scripts/grant-boost.js`: grants a boost without payment, for testing. Refuses recruiters with an explicit message (recruiter boosting is a paused, unbuilt product), refuses a second active boost, resolves published posts if none are named.
- New `scripts/inspect-boosts.js`: makes rotation OBSERVABLE. Lists active boosts with end times and impression counts, samples 8 viewer ids and shows which boost each would see this hour, and totals impressions by surface plus recruiter impressions. Without this, correct rotation with one booster is indistinguishable from a permanent pin.
- New `scripts/test-assignment-live.js`: exercises the real query shape and assignment against the live database, and confirms the boosted post is PUBLISHED.
- New `scripts/find-test-user.js`: lists professional accounts and their post counts, so a test target can be found.
- END-TO-END VERIFIED with a real 1-day boost on iamannietaylor24@gmail.com: boost row created, query returns it as active with the correct expiry, assignment resolves all sample viewers to it (expected with a single booster - there is nothing to rotate to), and the resolved post exists and is PUBLISHED.
- STILL UNVERIFIED: the feed page rendering the pin in a browser. The API and assignment are proven; the visual result is not.
- NOTE: the stale `scripts/check-boost-tables.js` still references `prisma.boostTurn`, which no longer exists. It fails if run. Delete or update it.

### 2026-11-07 - Boost step 5: Explore pins the boosted profile

- New `app/api/explore-boost/route.ts`: returns the boosted professional for THIS viewer. Separate from `/api/professionals` on purpose - search results must not be affected by boosts. If someone searches "designers in Lagos", a boosted profile that does not match must not be pushed to the top.
- Self-exclusion: a user is never shown their own profile as a boost.
- Records an impression with `surface: 'EXPLORE'` and the viewer's role.
- Graceful failure: any error returns `{ profile: null }` - a boost must never break Explore.
- `app/(app)/explore/page.tsx`: fetches `/api/explore-boost` and renders the profile above the DEFAULT list only, in the same card style as the rest of the list so it does not read as an ad.
- PIN SCOPE FIXED (the known issue from step 4): the feed pin is now skipped on `List` and `Recruiter Feed`. "List" promises only people you follow and "Recruiter Feed" promises roles only - a stranger's boosted post at the top of either contradicts the tab. Pinning applies to For You and Recent.
- KNOWN GAP, deliberately not solved: a RECRUITER's boost currently does nothing. Recruiters have no work posts, so `BoostPost` is empty, and they have no `professionalProfile` so the Explore endpoint returns null. They would pay and receive no placement. Recruiter boosting is a different product (user raised location-targeted job boosts) and was explicitly PAUSED to avoid designing it mid-build. Until it is built, the boost UI must not be offered to recruiters.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded; `/api/explore-boost` appears in the route list.
- Not verified by hand: a real boost appearing at the top of Explore.

### 2026-11-07 - Boost step 4: feed pins the boosted post per viewer

- `app/api/home/route.ts`: calls `boostedPostForViewer(sbUser.id)`, records an impression via `recordImpression` with the viewer's role, and returns `boostedPostId`. The whole block is wrapped in try/catch - a boost failure must never break the feed.
- Self-view excluded: a user is never shown their own boosted post. It would waste the impression and looks broken to them.
- `app/(app)/feed/page.tsx`: after the per-tab sort, the boosted post is lifted to position 1 by splice + unshift. It is MOVED, not duplicated, so Recent/List ordering still contains it.
- BOOSTED BADGE REMOVED from `components/work/WorkCard.tsx`, and `boosted` dropped from its Post type. User's call: boosting must not be visible to viewers. A badge would mark some posts as "paid to be here", which is exactly what a showcase should not signal.
- DELIBERATE ASYMMETRY: the badge is gone from public surfaces but KEPT on the owner's own `/profile/visibility` page, where knowing which post is boosted is the point. `services/queries/analytics.ts` now derives that flag from `BoostPost` joined to an active `Boost` instead of the legacy `WorkPost.boosted` column, which nothing writes any more.
- KNOWN ISSUE, not fixed: the pin currently applies to EVERY tab including "List", which is supposed to show only people you follow. A stranger's boosted post appearing there contradicts what that tab promises. Should be scoped to For You / Recent.
- Legacy columns `WorkPost.boosted` and `WorkPost.boostExpiresAt` are now fully dead - nothing reads them after this change. Still in the schema; a migration can drop them.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: a real boost appearing at the top of a real feed.

### 2026-11-07 - FIX: boost tables had no RLS

- User spotted that `Boost`, `BoostPost` and `BoostImpression` were unrestricted. Verified against `pg_class`: rls_enabled was FALSE for all three (`Payment` was already TRUE).
- IMPACT if left: with the public anon key, anyone could read every boost purchase and every impression - revealing who boosted what, when, and how much - or insert fake impressions to inflate someone's numbers. This is the same class of hole 015 closed for Follow and RecruitmentView.
- New `supabase/022_rls_boost_tables.sql`:
  - `Boost` - owner may SELECT / INSERT / UPDATE their own.
  - `BoostPost` - access gated through the parent boost's owner.
  - `BoostImpression` - the boost OWNER may read impressions their boost received; the VIEWER may insert a row for themselves. Those are deliberately different principals: the row records that a viewer was shown something, but the analytics belong to the person who paid.
- CORRECTION: I claimed `BoostTurn` "no longer exists (removed in step 3)". It DID still exist. Removing a model from `schema.prisma` only stops Prisma using it - the physical table survives until a migration drops it, and 020 created it. Verified against `pg_class`: BoostTurn was present with rls_enabled = FALSE. User caught this after the first RLS migration shipped.
- New `supabase/023_drop_boost_turn.sql`: drops the orphaned `BoostTurn` table and the `BoostSurface` enum. It is dead - the model is gone, so nothing reads or writes it.
- LESSON: schema edits and database migrations are separate actions in this project. Deleting a model from schema.prisma leaves the table behind. Always check `pg_class` after a model removal, not just `prisma validate`.
- Prisma is unaffected: it connects with the direct database URL as the table owner and bypasses RLS, so app behaviour is unchanged. This only closes the Supabase REST / anon-key path, exactly as 015 did.
- REQUIRED: run `supabase/022_rls_boost_tables.sql`.
- NOT audited: the remaining tables (User, WorkPost, Recruitment, Like, SavedWork, etc.) may still be unrestricted. 015 noted the same gap and it was never closed.

### 2026-11-07 - Boost step 3: per-viewer assignment + impressions

- CORRECTION of the previous attempt in this same session: the first scheduler divided the hours by participant count, which meant a 3-booster week gave each person 56 hours instead of the 84 they paid for. `scripts/verify-schedule.js` caught it - 36 of 48 scenarios failed. That model was WRONG and was replaced, not patched.
- The user clarified the actual model: there is NO single global boosted slot. Each VIEWER gets their own boosted post, and different viewers see different boosters at the same moment. That is what lets many boosts run concurrently without competing for the same hour.
- `services/boosts/schedule.ts`: REWRITTEN around computed assignment.
  - `hash(seed)` - FNV-1a, stable per (viewer, hour).
  - `pickIndex(viewerSeed, hour, count)` - deterministic choice of which active boost fills this viewer's slot this hour.
  - `boostedPostForViewer` / `boostedProfileForViewer` - return `{ boostId, ... }` so the caller can record an impression.
  - `recordImpression` - fire-and-forget insert; a failed impression must never break the feed.
- `BoostTurn` REMOVED from the schema. It encoded the single-global-slot assumption. A per-viewer schedule would need a row per viewer per hour; a per-hour global schedule cannot express "different viewers see different posts".
- `supabase/021_boost_impressions.sql`: new `BoostImpression` table (boostId, workPostId?, viewerId, viewerRole, surface, shownAt) with indexes on (boostId, shownAt) and workPostId. REQUIRED - run it.
- `scripts/verify-assignment.js` PROVES the distribution rather than asserting it: across 500 viewers x 168 hours, deviation from an even split is <= 1.07% even at 10 boosters; assignment is deterministic; one viewer sees all 4 boosters over a week; different viewers in the same hour land on different boosters (`[2,2,2,3,1]`).
- ANALYTICS PLAN, user-requested: "times I was at the top" and "recruiters who saw my work" both need impressions, which did not exist before this. Four metrics are now distinct and must stay labelled separately: impressions, recruiter impressions (from BoostImpression), detail views, recruiter detail views (from WorkView). Conflating impressions with detail views was the trap - a recruiter scrolling past a boosted card previously contributed nothing to any number.
- Verified: `npx prisma validate` clean, `prisma generate` succeeded, `npx tsc --noEmit` clean, `npx next build` succeeded, assignment distribution verified by script.
- NOT YET WIRED: the feed and Explore do not call these functions yet. That is step 4/5. Nothing writes impressions until then.

### 2026-11-07 - Boost step 2: campaign + turns schema

- Verified the old tables were EMPTY before touching them: `{boosts:0, slots:0, payments:0}` via `scripts/count-boost-rows.js`. Nothing was lost.
- `prisma/schema.prisma`: REMOVED `VisibilityBoost`, `VisibilitySlot`, `SlotStatus`. They modelled per-day inventory (`slotId` was required) which cannot express hourly rotation across two surfaces.
- ADDED:
  - `Boost` - one purchase: userId, amount, currency, days, startsAt, expiresAt, status. Covers MANY posts.
  - `BoostPost` - which posts were selected, unique per (boostId, workPostId).
  - `BoostTurn` - the PRE-COMPUTED rotation. One row per hour: boostId, surface (FEED|EXPLORE), workPostId (nullable for EXPLORE), startsAt, endsAt. Indexed on (surface, startsAt, endsAt) so the feed can ask "which turn covers now?" with one lookup instead of computing fairness per request.
- Relations rewired: `User.boosts`, `WorkPost.boostPosts`, `WorkPost.boostTurns`, `Payment.boost` -> `Boost`.
- New `supabase/020_boost_model.sql`: drops the old tables, creates the new ones, re-points the Payment FK with ON DELETE SET NULL (a deleted boost must not destroy its payment record). REQUIRED - run before step 3.
- Dead code removed after the model change broke the type check: `prisma.visibilityBoost.deleteMany` in `profile/work/actions.ts`, `getAvailableSlots()` in `lib/db/index.ts`, and the `VisibilityBoost`/`VisibilitySlot`/`BoostStatus`/`SlotStatus` types in `types/index.ts`.
- NOT removed: `WorkPost.boosted` and `WorkPost.boostExpiresAt`. They are the OLD mechanism and the current feed still reads them. Step 4 switches the feed to `BoostTurn`; only then are those columns dead.
- Verified: `npx prisma validate` clean, `npx prisma generate` succeeded (after stopping the dev server - EPERM on the query engine again), `npx tsc --noEmit` clean, `npx next build` succeeded.

### 2026-11-07 - Boost step 1: real analytics on /profile/visibility

- `app/(app)/profile/visibility/page.tsx`: REWRITTEN as a server component. The old page was a pure mockup - hardcoded 47 views / 12 recruiter views / 8 profile visits / 4 saves, two invented work posts, three dead `Select` buttons and a link to `/profile/visibility/boost` which DOES NOT EXIST (it 404s). All of that is gone.
- New `services/queries/analytics.ts`: `getVisibilityAnalytics(userId)`.
  - views / likes / saves read from the denormalised counters on WorkPost - those ARE maintained by the view and like routes.
  - recruiterViews is DERIVED from `WorkView` rows joined to `User.role === 'RECRUITER'`. The `WorkPost.recruiterViews` column is NEVER WRITTEN anywhere in the codebase and is permanently 0, so reading it would have reproduced the fake-data problem in a new form.
  - Per-post breakdown, with `boosted` shown only when `boostExpiresAt` is null or in the future.
- New `lib/pricing/currency.ts`: country -> currency map with USD fallback, driven by Vercel's `x-vercel-ip-country` header (free, no API key, no third-party service). `localhost` and bots return no country and fall back to USD, which is why dev always shows USD.
- Pricing model captured: Custom is $1/day flat; the 7/14/30 day tiers are separately DISCOUNTED bundles ($7/$12/$20). Custom does not interpolate between tiers - this was explicitly decided.
- PRICING IS DISPLAY ONLY. No purchase is possible; the page says so. The three `Select` buttons are gone rather than left dead.
- TWO OPEN ITEMS: (1) the per-currency prices in `TIER_PRICES` are PLACEHOLDERS (NGN 7000 is not equivalent to $7) and need real figures before going live - a conversion is not a price. (2) The 7-day tier at $7 is identical to Custom at 7 days, so it is redundant as specified.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the page rendering with real posts, and the geo currency lookup on Vercel (impossible to test on localhost).

### 2026-11-07 - Trending added to the top bar

- `components/icons.tsx`: new `TrendingIcon` - a rising line (`M3 17L9 11L13 15L21 7`) with an arrow head (`M15 7H21V13`). Chose a trend arrow over a flame: at 16px a flame reads as a blob, and a flame says "hot" rather than "rising".
- `components/navigation/TopNav.tsx`: `Trending` added to `primaryNav` after Explore, pointing at `/trending`.
- The primary nav is now SIX items (Home, Jobs, Professionals, Recruiters, Explore, Trending) alongside the search field and the icon cluster. Not measured, but this is dense - watch for wrapping or crowding on narrower viewports. If it looks cramped the fallback is moving Trending into the avatar dropdown.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded; /trending still in the route list.
- Not verified by hand: how the nav looks with six items.

### 2026-11-07 - Trending subtitle is result-driven, not explanatory

- `app/(app)/trending/page.tsx`: subtitle changed from "Ranked by likes. Posts from the last 5 hours come first." to "See the work making waves today."
- Reason: the ranking formula is implementation detail. Telling users how the list is ordered invites them to game it and explains mechanics nobody asked about. The page should sell the RESULT.
- Same applies to the `new` badge still on in-window posts - left in place, but it is the last piece of ranking detail shown to users. Flagged in case it should go too.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-07 - Trending page + recent-first ranking

- `app/api/trending/route.ts`: REWRITTEN. Now accepts `take` (default 5, max 50) and ranks in TWO passes.
  1. Posts published within the last 5 HOURS, ordered by likes desc, views desc.
  2. If those do not fill `take`, backfill with the best OLDER posts (likes desc).
  Response now also returns `recentCount` so the client knows where the recent block ends.
- `app/(app)/trending/page.tsx`: NEW page. Same ranking via `/api/trending?take=50`. Shows rank, title, "N likes · N views · <age>", and a `new` badge on posts inside the 5-hour window so the ordering is not mysterious. Has a skeleton and a real empty state.
- `components/navigation/RightRail.tsx`: "See all →" now points at `/trending` instead of `/explore`.
- DESIGN RULE, user-decided: recent-first, not unified. A 3-like post from the last 5 hours outranks a 200-like post from last week. Rationale: raw totals favour age over quality and turn trending into a hall of fame. The 5-hour window decides PRIORITY, not eligibility.
- CORRECTION to my own earlier reasoning: I predicted a 5-hour window would leave the list usually empty. That was wrong for two reasons the user pointed out - (1) in a small community 3 likes vs 1 IS a trend, and (2) older posts are meant to stay until displaced, not age out. A naive `createdAt >= now-5h` filter would have produced exactly the empty list I predicted, because the SQL would not have matched the intent. The backfill pass is what makes the rule work.
- Not done: pagination. 50 is the cap; there is no "load more".
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded, with /trending in the route list (page count 19 -> 20).
- Not verified by hand: the page rendering and the 5-hour cutoff with real data.

### 2026-11-07 - Trending sparkline removed

- `components/navigation/RightRail.tsx`: removed `<Sparkline />` from each trending row AND deleted the now-unused `Sparkline` function.
- It was DECORATIVE: every row rendered the same hardcoded SVG path (`M1 14 L8 11 ... L43 2`), identical regardless of the post's likes or views. It has never been connected to data - this was already noted in an earlier entry, and it was still misleading.
- Why remove rather than wire up: a sparkline implies a time series, and trending is a snapshot of the current top 5. Anything trending is going UP by definition - a descending curve next to it is self-contradictory. There is also no likes-over-time data: likes store a total, while views do have per-row timestamps (`WorkView`), so only views could be plotted and only with a schema-free query.
- Rows now show: rank, title, "N likes · N views". Nothing fake.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded, and no `Sparkline` reference remains in the file.

### 2026-11-07 - Trending shows likes AND views, ranks on likes

- `components/navigation/RightRail.tsx`: the meta line under each trending title now reads "N likes · N views" instead of likes only.
- RANKING UNCHANGED: `app/api/trending/route.ts` already ordered by `likes desc, views desc`. A comment was added explaining why: likes are a deliberate response, views are a proxy for exposure and are handed out unevenly by the shuffled feed. Views only break ties.
- Rationale, per the discussion: a showcase platform should surface work that LANDED, not work that happened to be shown the most. Displaying views gives reach context without letting it drive the list.
- Known weakness, not addressed: with a small user base likes are sparse, so a post with 3 likes can outrank a better post with 2. A blended score (e.g. likes + views*0.01) would be more robust later.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-07 - Recruiter status badge uppercased to match VERIFIED

- `app/(app)/profile/recruiters/page.tsx`: the recruiting status badge went back to `.toUpperCase()`, so it reads CURRENTLY RECRUITING / NOT RECRUITING next to the VERIFIED badge.
- This REVERSES the earlier "Recruiter status badges lowercase" entry for this one surface. The history is: lowercase -> uppercase, both at the user's request. The two entries contradict each other on purpose; this one is current.
- SCOPE: only the recruiters directory. Still lowercase: the sidebar status line, the ProfileBody status pill, and the professional badges on explore and the professionals directory. Flagged to the user rather than changed silently.
- Verified: change confirmed on disk and recompiled.

### 2026-11-07 - FIX: white flash in dark mode on navigation

- Report: opening pages in dark mode showed a brief flash of the light theme.
- Cause: the theme was applied in a `useEffect` inside `ThemeProvider`. React effects run AFTER the browser paints, so the first frame was always unstyled (light) and the class was added a moment later. Every navigation repeated this.
- Fix: `app/layout.tsx` now renders a blocking inline script in `<head>` that reads `localStorage['positioned-theme']` and adds `.dark` to `<html>` during head parsing, before anything paints. `ThemeProvider` still runs and keeps the value in sync, but no longer owns the initial state.
- Uses `dangerouslySetInnerHTML` - required because React escapes script content. The payload is a fixed string with no user input, so there is no injection risk.
- The script duplicates the storage key (`positioned-theme`) and the system-preference check from `ThemeProvider`. A comment flags that the two must stay in sync. If the key is ever renamed, both places need updating.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: navigating in dark mode and confirming the flash is gone.

### 2026-11-07 - Skeleton screens swept to the current UI

- `components/ui/Skeleton.tsx`: primitive now uses `bg-surface-sunken` instead of `bg-gray-200`, so every skeleton built on it inverts with the theme. `CardSkeleton` restyled to the current card shape (rounded-xl avatar tile, `p-5`).
- REMOVED `StatsSkeleton` - it described a 4-column stat grid that exists nowhere; /profile is now a redirect, not a dashboard.
- `app/messages/[id]/loading.tsx`: REWRITTEN. It was `max-w-3xl` centred stacked cards, which did not match the two-column messages layout at all. It now mirrors the fixed frame: pinned header, scrolling middle with alternating bubble placeholders, pinned reply block.
- `app/settings/loading.tsx`: REWRITTEN. It was one `max-w-2xl p-8` form. It now matches the real page - `max-w-[720px] p-6` with four separate card sections (Account, Notifications, Privacy, Appearance).
- DELETED `app/(app)/profile/loading.tsx` (obsolete dashboard skeleton, /profile redirects now) and `app/(app)/profile/feed/loading.tsx` (returned null - did nothing).
- `app/(app)/loading.tsx` left alone - already correct for the shell.
- About 11 files still hand-roll skeletons as inline `bg-gray-200` divs rather than using the primitive (explore, professionals, recruiters, recruitments, WorkDetailBody, professionals/[id]). Rather than rewrite them all, added a dark rule for `animate-pulse.bg-gray-200` so they stop glowing in dark mode. NOTE: they remain inconsistent with the primitive - worth converting to `<Skeleton>` if that area is worked on again.
- Not touched: `app/(app)/profile/notifications/page.tsx`, `profile/work/page.tsx` and `ConversationView` inline skeletons - they already use the primitive, so they pick up the new colour automatically.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded. Deletions confirmed, no StatsSkeleton references remain.

### 2026-11-07 - Conversation scrolls to the newest message

- `components/messages/ConversationView.tsx`: added `scrollRef` on the scrolling message region and an effect that sets `scrollTop = scrollHeight`.
- Depends on `[id, itemCount]`, so it fires when the thread loads, when switching conversations, and again after a reply is sent (the count changes when SWR refetches).
- Behaviour is unconditional: if you scroll up to read history and a reply arrives, it snaps back to the bottom. Standard for chat. If it becomes annoying the refinement is to only auto-scroll when the user is already near the bottom.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: opening a long thread and landing at the newest message.

### 2026-11-07 - FIX: messages list column did not actually scroll

- Question raised: is the left conversation list scrollable as more conversations arrive?
- Answer: NO. The column had `overflow-y-auto` but no definite height. It was a `flex-shrink-0` child of a flex row, so it got width but no height constraint - `overflow-y-auto` had nothing to scroll against, the list grew to full content height, and the page wrapper's `overflow-hidden` CLIPPED the older conversations instead of scrolling them.
- Fix: added `h-full` to the column: `h-full w-[360px] flex-shrink-0 overflow-y-auto scroll-hidden`.
- This was introduced during the fixed-frame work: setting the right column to `h-full min-h-0` left the left column without a height, and its pre-existing `overflow-y-auto` never worked. It looked correct in code.
- GENERAL RULE for this codebase: `overflow-y-auto` does nothing without a definite height. Inside a flex ROW, width is distributed by `flex-1` but height is not - a scrolling column needs explicit `h-full` (and `min-h-0` where it is also a flex child).
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: scrolling the list with enough conversations to overflow.

### 2026-11-07 - Conversation scrollbar hidden

- `components/messages/ConversationView.tsx`: added `scroll-hidden` to the message region - the existing utility (`scrollbar-width: none` + webkit display none). Scrolling still works, the bar is just invisible.
- Consistent with the sidebar and message list columns, which already use this class.
- Tradeoff, accepted: no visual cue that more messages exist beyond the viewport.
- Verified: confirmed on disk and recompiled.

### 2026-11-07 - FIX: Reply was clipped after the messages frame change

- Report: after making the conversation a fixed frame, the Reply form / Send reply button was cut off at the bottom.
- Cause: a broken height chain. The conversation column was `flex-1` inside a flex ROW. `flex-1` distributes WIDTH in a row, not height, so the column had no definite height. The card's `h-full` then resolved against an indefinite height and grew to fit its content instead of fitting the viewport - pushing the pinned Reply past the visible area.
- Fix: `app/messages/layout.tsx` - the conversation column is now `flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`. An explicit `h-full` plus `min-h-0` gives it a definite height, so the card inside can size to the available space and keep the Reply visible.
- NOTE: if this still clips, the next suspect is the card's own `h-full` not resolving through the extra flex layer - the fix would be `flex-1` on the card instead of `h-full`. Not applied pre-emptively; wait for confirmation.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the full frame with Reply visible in the browser.

### 2026-11-07 - Messages: fixed frame, only the conversation scrolls

- `app/messages/layout.tsx`: the right column was `overflow-y-auto`, so the entire conversation card scrolled - header and reply included. It is now `overflow-hidden`, letting the card own its own scrolling.
- `components/messages/ConversationView.tsx`: the card is now `flex h-full flex-col overflow-hidden` with three regions:
  - header: `flex-shrink-0` - stays at the top.
  - messages: `min-h-0 flex-1 overflow-y-auto` - the only scrolling region. `min-h-0` is required, otherwise a flex child refuses to shrink below its content and the whole page scrolls instead.
  - reply: `flex-shrink-0` - pinned at the bottom.
- Padding moved from the card onto the individual regions (`px-5`) so the scrolling area is flush and the header/reply do not pick up double padding.
- Not addressed: the message list does not auto-scroll to the newest message on load. With a fixed frame and a long thread the view opens at the top. Worth adding a scroll-to-bottom on mount if that becomes annoying.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the fixed frame in the browser with a long conversation.

### 2026-11-07 - FIX: sidebar status needed a reload after editing

- Report: changing availability / recruiting status updated the profile page instantly but the left sidebar card only changed after a refresh.
- Cause: two different data sources.
  - The profile page is a server component, so the action's `revalidatePath('/settings')` refreshed it.
  - The sidebar renders from `useUser()` -> `/api/me`, which lives in SWR's CLIENT cache. `revalidatePath` does not touch the SWR cache, so that copy stayed stale until a full reload.
- Fix: both settings forms now call `mutate('/api/me')` from `useSWRConfig()` inside the existing `state.ok` effect. That invalidates the cached user, the sidebar re-fetches, and the status line updates without a reload.
- Pattern to reuse: after any server action that changes the current user, call `mutate('/api/me')`. `revalidatePath` handles server components; it does NOT handle SWR-cached client reads. `ContactButton` already used this pattern for `/api/messages`.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: editing availability and watching the sidebar update without a refresh.

### 2026-11-07 - FIX: capital C still shown in two more places

- Report: `currently recruiting` still started with a capital C after the directory fix.
- Cause: `Sidebar.tsx` and `ProfileBody.tsx` each had their OWN hardcoded `'Currently recruiting'` string rather than using the shared helper. I had only fixed the recruiters directory, which was the third copy.
- Fix: both now call `recruitingLabel(...).toLowerCase()` from `lib/client/status.ts`, with the import added.
- Verified by search that no hardcoded capitalised status string remains in any component that RENDERS a status. The only remaining occurrences are the option labels inside `RecruiterSettingsForm` - those are form dropdown labels, not badges, and were deliberately left capitalised.
- LESSON: the same status string existed in four places. Introducing a helper is only useful if every call site is switched to it; partial adoption keeps the bug alive and makes it look fixed.
- Verified: `npx tsc --noEmit` clean and `npx next build` succeeded.

### 2026-11-07 - Recruiter status badges lowercase

- `app/(app)/profile/recruiters/page.tsx`: the recruiting status badge used `.toUpperCase()`, so it read `CURRENTLY RECRUITING` while professional badges read `open to work`. Changed to `.toLowerCase()` for consistency.
- Professional badges were already lowercase and are untouched.
- NOT changed: the adjacent `VERIFIED` badge is still uppercase. Not mentioned in the request; flagged to the user instead of silently changing it.
- Verified: change confirmed on disk and recompiled. Visual confirmation pending.

### 2026-11-07 - Status everywhere now reads the real selection (no hardcoded badges)

- New `lib/client/status.ts`: two formatters so every surface renders the same way.
  - `availabilityLabel(value)` - `NOT_AVAILABLE` -> "Not available", otherwise the enum lowercased with underscores to spaces (`OPEN_TO_FULL_TIME` -> "open to full time"). Returns null when missing.
  - `recruitingLabel(value)` - CURRENTLY_RECRUITING / NOT_RECRUITING, null otherwise.
- Replaced three hardcoded `OPEN TO WORK` strings that ignored the person's actual selection:
  - `app/(app)/explore/page.tsx` - card badge.
  - `app/(app)/profile/professionals/page.tsx` - directory card badge. The old `available` flag only checked `!== NOT_AVAILABLE`, so everyone who was not "not available" showed as open to work.
  - `app/(app)/profile/professionals/[id]/page.tsx` - detail page line. It previously rendered only when availability was exactly OPEN_TO_WORK, so anyone on any other setting showed NO status at all.
- Recruiters had no status in either directory:
  - `app/api/recruiters/route.ts`: added `recruitingStatus: true` to the select. Without it there was no data to render.
  - `app/(app)/profile/recruiters/page.tsx`: added a status badge next to VERIFIED (emerald for currently recruiting, grey for not recruiting) and declared `recruitingStatus` on the `Recruiter` type - the first type check failed on that missing field.
- `components/navigation/Sidebar.tsx`: the professional branch also stopped being the literal "| Open to opportunities" and now reads `professionalProfile.availability`.
- Everything now reflects what the user picked in Edit profile. Nothing invents a status.
- Verified: `npx tsc --noEmit` clean, `npx next build` succeeded, and `/api/professionals` confirmed to return `availability` (line 71) so the badges have data. Visual confirmation pending.

### 2026-11-07 - Sidebar card shows recruiting status for recruiters

- `components/navigation/Sidebar.tsx`: the profile card's status line was the hardcoded string `| Open to opportunities` for everyone. It now switches by role:
  - Recruiter -> `| Currently recruiting`, or `| Not recruiting` when `recruiterProfile.recruitingStatus === 'NOT_RECRUITING'`.
  - Professional -> `| Open to opportunities`, unchanged.
- Reads the real `recruitingStatus` set in the profile form rather than a fixed string, so it stays in sync.
- Data check: `/api/me` selects `recruiterProfile: true`, which returns every column including `recruitingStatus`, so no API change was needed. Verified before relying on it.
- Verified: change confirmed on disk by search; CSS recompiled. Visual confirmation pending.

### 2026-11-07 - Promo CTA text fixed in dark mode; settings select cursor

- `app/globals.css`: new scoped rule `html.dark .rounded-full.bg-white.text-brand` sets the text to `#ffffff`, with `:hover` returning it to `#5b3df5`.
  - What was actually wrong: in dark mode the pill background was ALREADY correct (dark, via the `.bg-white` override). Only the TEXT was wrong - brand purple on a near-black pill, which is unreadable. The background was never the problem, which is why every earlier attempt that changed the background was wrong.
  - Light mode is untouched. The selector matches only elements carrying all three classes.
  - SIDE EFFECT: `Find Professionals` (recruiter variant, same card, same class string) gets the same treatment. The three CTAs are indistinguishable by class. If that one should stay purple in dark mode it needs a distinguishing marker.
- `app/settings/page.tsx`: added `cursor-pointer` to the theme select so it shows a hand on hover. Note: the popup options are drawn by the OS and cannot be cursor-styled - the hand appears on the box only.
- PROCESS NOTE: this button request took far longer than it should have. The user said "text white, hover purple"; I changed the BACKGROUND, then applied white-on-white, then argued about contrast. The user's final explanation - "dark mode already has a near-black button, only the text is purple" - made the whole thing a two-line CSS rule. The lesson: ask what the CURRENT state looks like before changing anything.
- Verified: both changes confirmed on disk by search, CSS recompiled without errors. Visual confirmation pending from the user.

### 2026-11-07 - CTA button hover: attempted, reverted, STILL OPEN

- User clarified the request: "only button text changes from white on hover" - i.e. text white at rest, brand purple on hover, background untouched.
- I applied `text-white ... hover:text-brand` on the existing `bg-white` pill. That made the text INVISIBLE at rest - white on white. Reverted immediately.
- Current state of all three CTAs (Browse Jobs, Find Professionals, Boost Visibility): the ORIGINAL `bg-white text-brand hover:bg-white/90`. Verified by search that no `text-white`/`hover:text-brand` variant remains.
- UNRESOLVED and blocked on one answer: white text needs a background to sit on. Asked the user what the pill background should be at rest (brand purple being the obvious candidate). No further edits until that is answered.
- PROCESS NOTE, third failure on this one request: I twice applied a change I already knew produced an invisible button instead of stopping to confirm the background. Knowing a result is broken and shipping it anyway is worse than asking. For any styling request, resolve the CONTRAST question first: what is the text colour, what is it sitting on.

### 2026-11-07 - REVERTED: hero CTA buttons restyled without being asked

- Request was about the BUTTON TEXT on the hero CTAs (Browse Jobs / Find Professionals / Boost Visibility): "text white, hover changes it to brand purple".
- What I did instead: changed the button BACKGROUND from `bg-white` to `bg-brand` and inverted the hover. That is a restyle of the button, not a change to its text, and it was not requested.
- Reverted all three back to the original `bg-white text-brand hover:bg-white/90`. Verified by search: no `hover:bg-white hover:text-brand` remains and all three `hover:bg-white/90` occurrences are back.
- NOT RESOLVED: the actual request. On the original button the text is already `text-brand` on a white pill, so "text white" is ambiguous - white text on a white pill would be invisible. Options raised for the user to pick: (a) leave as is since hover already turns text purple, (b) white text at rest with a different background, (c) the request referred to text on the card rather than the button. Waiting on a decision rather than guessing a second time.
- PROCESS NOTE: this is the second time in this session I delivered more than was asked. Read the request literally; if the literal reading is impossible (white text on white), ask instead of substituting my own interpretation.

### 2026-11-07 - Dark mode: border, sidebar gradient and rings fixed

- `app/globals.css`: `.card`, `.feed-post` and `.page-header` had TWO definitions - one inside `@layer components` using `var(--line)`, and a second UNLAYERED copy further down with hardcoded `#ffffff` / `#EEEDF3`. Unlayered beats layered, so the hardcoded copy won and those surfaces kept a light border and white fill in dark mode. The unlayered block now uses `var(--surface)` / `var(--line)`, with a comment warning against reintroducing literal colours there.
- `components/navigation/Sidebar.tsx`:
  - The profile card gradient used `from-brand-light via-white to-white`. It now reads `from-brand/25 via-surface to-surface`, so it follows the theme and is less washed out.
  - The avatar ring and the green status dot ring changed from `border-white` to `border-surface`; on a dark card the white rings read as halos.
- RULES WORTH REMEMBERING, learned the hard way across three rounds of this:
  1. `.bg-white` overrides do NOT cover gradient stops. `from-`/`via-`/`to-white` are separate utilities and must be changed in the markup or given their own override.
  2. `.tint-*` classes are literal `#ffffff` and needed their own dark rule - they are what paints the feed cards, not `.card` or `bg-white`.
  3. `globals.css` contains duplicate definitions. The unlayered copy always wins over the `@layer` one. Check for a second block before editing the first.
- PROCESS NOTE: the white cards took three attempts because I assumed the background came from `.card` or `bg-white` instead of checking what actually painted the element. Inspecting `WorkCard`/`RecruitmentCard` for `bg-` classes would have found `feed-post tint-N` immediately.
- Verified: `npx tsc --noEmit` clean, `npx next build` succeeded, each CSS change confirmed on disk with a search after writing, and the dev server recompiled without errors. Visually confirmed by the user.

### 2026-11-07 - FIX: feed cards stayed white in dark mode (.tint-* were hardcoded white)

- Report: after switching to dark, the feed cards were still white while the page background and nav were dark.
- ACTUAL CAUSE: `WorkCard` and `RecruitmentCard` render `<article className="feed-post tint-N">` and set NO background of their own. The five `.tint-*` classes were flattened to literal `#ffffff` back in UI-2 (see the UI-2 entry). None of the dark rules covered them, so the cards stayed white while `bg-white`, `.card` and the page background all flipped correctly.
- Fix: `.tint-0` through `.tint-4` added to the `html.dark` override in `app/globals.css`, sharing the `#1a1a22` surface colour with `bg-white`.
- PROCESS FAILURE, worth recording: I assumed the white came from `.card` or `bg-white` and rewrote the override block twice without checking what actually painted the cards. One `search_code` for `bg-` in `RecruitmentCard` would have shown immediately that there was no background class and pointed at the wrapper. Check the element, then change the CSS.
- Two earlier attempts in this thread are superseded, not reverted: the dark override block was moved to the END of globals.css and given `html.dark` specificity so it beats Tailwind utilities. That was a genuine fix, it just was not the thing making the cards white.
- Verified: `app/globals.css` contains the tint overrides (checked on disk, not just assumed from the write result) and the dev server recompiled the CSS without errors.
- Not verified by hand: the cards actually rendering dark. Pending the user's reload.

### 2026-11-07 - FIX: theme applied too late (cards stayed white)

- Report: after switching to dark, cards were still white.
- Diagnosis: the first ThemeProvider read the theme from `/api/settings` only. Until that request resolved, it applied 'light', and if the request failed it silently stayed light. There was also no request for `/api/settings` in the dev log at all during the reported session, which is consistent with the theme never being applied.
- Confirmed the API is not broken: `curl http://localhost:3000/api/settings` returns 307 to /auth/login, which is CORRECT - it is the middleware auth boundary and curl has no session. That redirect was a red herring, not the bug.
- `components/providers/ThemeProvider.tsx`: REWRITTEN.
  - The initial theme now comes from `localStorage` (`positioned-theme`), applied in a mount effect, so the correct theme is set without waiting for any network request.
  - When the DB value arrives it is adopted AND written to localStorage, so the next load is instant and works offline.
  - "system" mode keeps a `prefers-color-scheme` listener.
- `app/settings/page.tsx`: on a successful theme save it also writes localStorage and toggles the `dark` class immediately, so the change is visible before the next navigation.
- Root cause of my earlier miss: I treated the theme as "a setting to store" and let the UI read it asynchronously. A theme must be known BEFORE first paint; storage-first with the DB as the durable copy is the correct shape.
- Still true from the previous entry: the dark overrides only cover the shared surfaces and common Tailwind greys. Gradient banners, status pills and any pre-UI-2 pages are not swept.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: reloading with dark selected and confirming there is no flash of light and the cards are dark.

### 2026-11-07 - Settings step 3: light/dark theme (token inversion)

- `tailwind.config.js`: `darkMode: 'class'`. `ink`, `surface` and `line` no longer hold literal hex values - they now read CSS variables (`var(--ink)`, `var(--surface)`, ...). The LIGHT values are unchanged, so nothing shifts until `.dark` is applied.
- `app/globals.css`: `:root` defines the light token values; `.dark` defines the inverted set (surface #1a1a22, ink #f4f4f8, line #2f2f3b, page background #121218). `.card` and `.feed-post` now use `var(--surface)` / `var(--line)` instead of hardcoded white and #EEEDF3.
- NEW DARK-ONLY OVERRIDES in globals.css: `bg-white`, `bg-gray-50/100`, `hover:bg-gray-*`, `border-[#e5e5e5]`, `text-near-black`, `text-gray-600/700`, `text-gray-400/500`, and input/textarea/select all get remapped inside `.dark`. Scoped to `.dark` on purpose - these are Tailwind built-ins and literal hex values, not tokens, so they cannot follow `var(--surface)` on their own.
- New `components/providers/ThemeProvider.tsx`: reads `/api/settings` and toggles the `dark` class on `<html>`. Supports light / dark / system; in system mode it listens to `prefers-color-scheme` and follows the OS.
- `app/layout.tsx`: mounts ThemeProvider inside SWRProvider.
- `prisma/schema.prisma`: `UserSettings.themeMode String @default("light")`.
- `supabase/019_user_theme_mode.sql`: additive column with a default, no backfill needed.
- REQUIRED: run `supabase/019_user_theme_mode.sql`.
- `app/api/settings/route.ts`: accepts `themeMode`, validated against exactly light / dark / system - an arbitrary string cannot reach the DB.
- `app/settings/page.tsx`: the Appearance select is now real (Light / Dark / System) instead of a disabled placeholder.
- KNOWN LIMIT, stated in the UI too: this inverts the shared surfaces and the common Tailwind greys. It does NOT audit every page. Places that use colours outside the override list - notably `bg-gradient-*` cover banners, the emerald/amber status pills, `bg-brand-light` tints, and any page still on the pre-UI-2 palette - will look wrong in dark mode until swept. The toggle works; full coverage does not yet exist.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: actually toggling to Dark in the browser and reading the result.

### 2026-11-07 - Settings step 2: privacy flags actually enforce

- `app/api/professionals/route.ts` and `app/api/recruiters/route.ts`: the `where` clause now requires the owner to be visible. Expressed as `user: { OR: [{ settings: { is: null } }, { settings: { is: { profileVisible: true } } }] }` - a user with NO settings row counts as visible, so existing accounts do not disappear from search the moment this ships.
- `app/(app)/profile/contact/actions.ts`: `sendContactRequest` checks the RECIPIENT's `allowRecruiterMessages` and returns "This person is not accepting messages from recruiters right now." when it is false. Enforced server-side deliberately - hiding the button alone would be cosmetic and bypassable by calling the action directly. A missing settings row means allowed.
- `/explore` needed no change: it reads `/api/professionals`, so it inherits the filter.
- SCOPE DECISION: `profileVisible` hides a person from DISCOVERY (the two directory endpoints and everything built on them). It does NOT block direct profile URLs, their posts in the feed, or trending. Blocking direct access would break saved lists, existing links and ongoing conversations, and that is a different feature ("invisible") - not something to slip in silently.
- STILL DECORATIVE: the three `notify*` flags are stored and loaded but nothing sends notifications, so nothing obeys them. Unchanged from step 1.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: turning profileVisible off and confirming the person vanishes from /explore and the directories; turning allowRecruiterMessages off and confirming Contact is refused.

### 2026-11-07 - Settings step 1: real persistence (notifications + privacy)

- `prisma/schema.prisma`: new `UserSettings` model, one-to-one with `User` (`settings UserSettings?`). Fields: `notifyMessages`, `notifyList`, `notifyRoles`, `profileVisible`, `allowRecruiterMessages` - all Boolean, all default true. Separate table rather than columns on `User` so ordinary user queries stay lean.
- New `supabase/018_user_settings.sql`: creates the table, an index on userId, ENABLE ROW LEVEL SECURITY, and SELECT/INSERT/UPDATE policies scoped to `auth.uid()::text = "userId"`. The `::text` cast is used for the same reason as 015 and 016 - User ids are TEXT, auth ids are UUID.
- REQUIRED: run `supabase/018_user_settings.sql`. Until it runs, /api/settings will fail.
- New `app/api/settings/route.ts`:
  - GET upserts on read, so callers never have to handle a missing row.
  - PATCH accepts ONLY the five known boolean keys. Unknown keys are ignored and a non-boolean value returns 400 rather than being written blindly.
- `app/settings/page.tsx`: the notification and privacy toggles are now real switches (role="switch", aria-checked) wired to /api/settings with optimistic updates and rollback on failure. A failed save shows an inline error.
- HONEST STATUS: the five flags now SAVE and LOAD, but none of them change behaviour yet. Notification flags have no sender to obey, and the privacy flags are not yet checked by the search APIs or the Contact button. The page labels both sections accordingly instead of implying they work.
- Appearance/theme is still disabled and labelled as not built. Storing a theme nothing applies would be worse than showing it as unavailable.
- Stopped the dev server before `npx prisma generate` to avoid the EPERM engine lock. Generate succeeded; the server needs restarting.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded, with /api/settings in the route list.
- Not verified by hand: toggling a switch and reloading to confirm it persisted.

### 2026-11-07 - FIX: migration 016 failed with text/uuid mismatch

- Reported error: `42883: operator does not exist: text = uuid` on `WHERE p.id = u.id`.
- Cause: `public."User".id` is TEXT (Prisma declares `id String @id`), while `auth.users.id` is UUID. Postgres will not compare the two directly.
- Fix: `WHERE p.id = u.id::text` in `supabase/016_backfill_role_metadata.sql`.
- This is the SAME rule already recorded for 015, which casts `auth.uid()::text` for the same reason. I wrote 016 without applying it - a real oversight, not a Postgres quirk.
- Impact of not running 016: none functionally. Existing users resolve their role through the Prisma fallback in `getSessionRole()`; they just miss the no-DB-query fast path.
- Verified: SQL reviewed against the Prisma schema types. Not yet executed by the user.

### 2026-11-07 - Recruiter profile: bio + recruiting status, "Your Role" removed

- `prisma/schema.prisma`: `RecruiterProfile` gained `bio String?` and `recruitingStatus RecruitingStatus @default(CURRENTLY_RECRUITING)`. New enum `RecruitingStatus { CURRENTLY_RECRUITING, NOT_RECRUITING }`.
- New `supabase/017_recruiter_bio_status.sql`: adds the `bio` column, creates the `RecruitingStatus` enum if absent, and adds `recruitingStatus` with a default. Written defensively (`IF NOT EXISTS`) so it is safe to re-run.
- REQUIRED: run `supabase/017_recruiter_bio_status.sql`. Until it runs, recruiter profile reads/writes referencing the new fields will fail.
- `role` column NOT dropped. It is only removed from the FORM, so existing values stay readable. Dropping a column is destructive and was not asked for.
- `components/settings/RecruiterSettingsForm.tsx`: "Your Role" replaced by a **Bio** textarea and a **Status** select (Currently recruiting / Not recruiting). `role` removed from `Props`.
- `app/(app)/profile/settings/actions.ts`: `updateRecruiterProfile` reads `bio` and `recruitingStatus`, validates the status against the two allowed values, and persists both. It no longer reads `role`.
- `components/profile/ProfileEditModal.tsx`: passes `bio` and `recruitingStatus` instead of `role`.
- `components/profile/ProfileBody.tsx`: recruiters now show a status pill (emerald "Currently recruiting" / grey "Not recruiting") under the organization, and the bio line falls back to `recruiter.bio` when there is no professional bio.
- `npx prisma generate` had to be re-run. It first failed with `EPERM` renaming the query-engine DLL because the dev server held the file - the dev server was stopped, generate succeeded, and it needs restarting.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the form in the browser, and the status pill on a profile.

### 2026-11-06 - Settings sign-out removed; duplicate profile page deleted

- `app/settings/page.tsx`: the Danger zone / Sign out section is REMOVED. Sign out already exists in the TopNav avatar dropdown, and the settings one was only a placeholder that navigated to /auth/login without calling `supabase.auth.signOut()`. Nothing of value was lost.
- DELETED `app/(app)/profile/profile/page.tsx` - the third, simpler profile renderer. Profile viewing now has exactly ONE implementation: `ProfileBody`, used by `/[username]` and its intercepted modal. The old page was dead once its Edit button moved to the popup.
  - Verified nothing linked to it: the nav "Profile" entry points at `/profile`, which redirects to `/[username]`.
  - `.next` was deleted before rebuilding because generated route validators still referenced the removed page. The first `rm` failed on a locked file in `.next/dev`; a retry succeeded.
- Dead revalidation cleaned up - `revalidatePath('/profile/profile')` calls removed from `app/(app)/profile/settings/actions.ts` (2) and `app/(app)/profile/work/actions.ts` (3). Revalidating a route that no longer exists does nothing.
- Build confirms the removal: the route list no longer contains /profile/profile and the static page count went 20 -> 19.
- Still in place: `/profile` (redirect to /[username]), `/[username]`, and the intercepted profile overlay.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-06 - /settings is system settings; profile editing is a popup

- `app/settings/page.tsx`: REWRITTEN. It used to BE the profile editor. It is now a system settings page: Account (email, plus an Edit profile button), Notifications, Privacy, Appearance, and a Danger zone with Sign out. Heading is just "Settings".
  - HONEST STATUS: the notification / privacy / appearance controls are UI-only. They render disabled and are not wired to any backend or persisted. They exist to show intent, not to work.
  - The Danger zone Sign out is a placeholder that navigates to /auth/login. It does not call supabase.auth.signOut() - the real sign-out lives in TopNav. Flagged as incomplete.
- New `components/profile/ProfileEditModal.tsx`: the profile edit form as a popup. It reuses `ProfessionalSettingsForm` / `RecruiterSettingsForm` unchanged - no form logic duplicated.
  - PERSISTENCE: the forms take saved values as props, so the modal reads them from `useUser()` (/api/me) and passes the same props the settings page used to. After a save the server action revalidates, /api/me returns the new row, the props change, and the form is keyed on those values so it remounts with the saved data. Reopening shows what was saved.
- New `components/profile/EditProfileButton.tsx` (client): needed because `ProfileBody` and `WorkDetailBody` are SERVER components and cannot hold open state. The button owns the state and renders the modal.
- `components/profile/ProfileBody.tsx`: the owner's "Edit profile" now opens the popup for BOTH roles. It previously linked to /settings (recruiter) or /profile/profile (professional), which is why the old link is gone.
- `components/work/WorkDetailBody.tsx`: the owner's "Manage profile" also opened /settings; it now opens the popup as well.
- `app/(app)/profile/profile/page.tsx`: the Edit Profile button opens the popup instead of linking out.
- `app/settings/layout.tsx`: switched from `getCurrentUser()` to `getSessionRole()` so this route matches the non-blocking shell.
- KNOWN DUPLICATION, not addressed: `/profile/profile` is still a separate, simpler profile view that duplicates `/[username]` + `ProfileBody`. Editing now works from both, but there are still two profile renderers. Worth retiring one.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded, with /settings still registered.
- Not verified by hand: opening the popup, saving, closing, reopening and seeing the saved values.

### 2026-11-06 - Feed composer chips pick the posting type

- `app/(app)/feed/page.tsx`: the recruiter composer chips changed from Full-time / Contract / Freelance / Internship to **Individual role** and **Team recruitment**.
  - Those two values now select the FORM MODE, not the employment type. The chip click sets the existing `preset` state to `'individual'` or `'team'`.
  - The modal call changed from `initialEmploymentType={preset}` to `initialMode={preset as ...}`.
  - Professional chips are untouched (Project / Case study / Achievement / Work sample).
- `components/recruitments/RecruitmentComposerModal.tsx`: accepts `initialMode`, passes it to the form. The form `key` now combines mode and employment type so switching chips remounts the form and the chosen mode actually takes effect.
- `components/recruitments/RecruitmentForm.tsx`: accepts `initialMode` and seeds `useState<Mode>(initialMode ?? 'individual')`. It is ignored when editing, since editing is always a single role.
- Consequence worth noting: the feed no longer has a shortcut for pre-selecting an employment type on a new posting. The field is still in the form, just no longer preset from a chip. The old `initialEmploymentType` prop is still supported for other callers (`/profile/recruitments/new`).
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: clicking a chip and seeing the form open in the right mode.

### 2026-11-06 - Team roles: employment type and salary are per role

- `components/recruitments/RecruitmentForm.tsx`: in TEAM mode, Employment Type and Salary Range moved out of the shared block and into each role row, each with its own "Prefer not to say" toggle.
  - The shared employment-type select and salary input now render only when `mode === 'individual'`.
  - The shared `salaryHidden` hidden input also only submits in individual mode. Team mode carries `salaryHidden` per role inside the `teamRoles` JSON instead.
  - `TeamRole` gained `employmentType`, `salaryRange` and `salaryHidden`.
  - Individual mode is unchanged.
- `app/(app)/profile/recruitments/actions.ts`: `createTeamRoles` now reads `employmentType`, `salaryRange` and `salaryHidden` from each role rather than the shared form fields. `salaryRange` is nulled per role when that role is hidden.
- Why: salary varies by role in a real team posting, and so does full-time vs contract. Sharing them forced the wrong value onto most roles.
- Still shared across a team: organization, location, country, how to apply, apply link/email, apply instructions, closing date. Those are properties of the posting, not the role.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded. Also confirmed by search that the only `name="employmentType"` in the form sits inside the individual-mode block, so it cannot leak into a team submit.
- Not verified by hand: the per-role controls in the browser.

### 2026-11-06 - Post a role: Individual role vs Recruit a team

- `components/recruitments/RecruitmentForm.tsx`: REWRITTEN with a mode switch at the top - "Individual role" (the previous form, unchanged) and "Recruit a team".
  - Team mode collects a repeater of roles, each with a title and a short description, plus an "Add another role" action and per-role Remove (hidden when only one row).
  - Shared fields (organization, location, country, employment type, salary, how to apply, closing date) are filled once and applied to every role.
  - Team mode hides Description / Responsibilities / Requirements - those belong to a full single-role posting. A team role carries its short description instead.
  - The submit label counts the filled roles, e.g. "Publish 3 roles".
  - The mode switch only renders on CREATE. Editing an existing role is always the individual form, because a team is not a stored object.
- `app/(app)/profile/recruitments/actions.ts`: new `createTeamRoles`.
  - Roles travel as a JSON string in a hidden `teamRoles` field; malformed JSON returns an error instead of throwing.
  - Blank titles are dropped; if none remain it returns "Add at least one role with a title."
  - All roles are created inside `prisma.$transaction`, so a failure cannot leave a half-published team.
  - Redirects to the first created role.
- DESIGN DECISION, worth revisiting: a team is NOT a stored entity. It creates N independent `Recruitment` rows. No schema change, no migration. Consequence: the roles are not linked to each other anywhere - there is no "team" page and no grouping marker, and editing/deleting them is per role. If a team should render as one listing with sub-roles, that needs a new model and a migration.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the repeater in the browser (add/remove rows, publish).

### 2026-11-06 - BUG: role detail had no Apply button

- Report: a professional opening a job role saw no way to apply.
- Cause: `ApplyAction` was a PRIVATE function inside `components/recruitments/RecruitmentCard.tsx` and was only rendered by the feed card. `RecruitmentDetailBody` never included it, so both the full page and the modal were missing it - the overlay was not the problem.
- New `components/recruitments/ApplyAction.tsx`: the component extracted and exported, together with the `applyBtn` class string. Behaviour unchanged - LINK opens the URL (falling back to the role page), DM opens messages addressed to the recruiter, EMAIL is a `mailto:`.
- `components/recruitments/RecruitmentCard.tsx`: local copy and `applyBtn` removed; now imports the shared component. One implementation instead of two.
- `components/recruitments/RecruitmentDetailBody.tsx`: renders `<ApplyAction>` at the bottom of the body, in a bordered section, only when `!isOwner` (the owner gets Edit/Delete instead). Its type gained `applyMethod` / `applyUrl`.
- No query change needed: both the page and the modal `include` the full recruitment record, so `applyMethod` and `applyUrl` were already loaded.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.
- Not verified by hand: the button rendering in the browser. Note the Apply section sits BELOW the closing date; if it needs to be higher up the body, that is a layout tweak.

### 2026-11-06 - Phase 4: auth moved to middleware, layout no longer blocks on Prisma

- `middleware.ts`: REWRITTEN. It was a deliberate no-op (the layout was the only auth gate). It now creates a Supabase server client, refreshes the session, and redirects unauthenticated requests to `/auth/login?next=...`.
  - Public: `/`, `/auth*`, `/api/auth*`. Everything else is protected.
  - This is the security fix the modal work depended on: without it, making the layout non-blocking would have rendered the shell to logged-out users.
  - Note: it reintroduces the Supabase round-trip the old comment removed. That cost is paid once at the edge, not on every component render.
- `lib/auth/get-session-role.ts` (new): returns `{ userId, role, name }` for the shell. Fast path reads `role` from Supabase user metadata (local JWT decode, no DB). Falls back to one Prisma read when metadata has no role yet. `role` is narrowed to the `'PROFESSIONAL' | 'RECRUITER' | 'ADMIN'` union that `TopNav` expects.
- `lib/auth/ensure-user.ts`: new signups mirror the role into Supabase metadata via `supabase.auth.updateUser({ data: { role } })`. Wrapped in try/catch - a failure is logged and the layout falls back to Prisma, so signup never breaks over this.
- `app/(app)/layout.tsx`: now calls `getSessionRole()` instead of `getCurrentUser()`. For accounts with metadata, no Prisma query runs, so the shell streams without waiting on the DB. The redirect stays as a cheap backstop behind middleware.
- New `supabase/016_backfill_role_metadata.sql`: copies `public."User".role` into `auth.users.raw_user_meta_data.role` for users that do not have it yet. Safe to re-run (only touches rows where the key is empty).
- REQUIRED: run `supabase/016_backfill_role_metadata.sql` in Supabase. Until it runs, existing users keep working through the Prisma fallback - just not as fast.
- Behaviour change to be aware of: `TopNav` now receives `name` from session metadata rather than the DB row. If a user changes their display name in the DB only, the top bar can show the stale metadata name until metadata is updated too.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded; middleware shows as `ƒ Proxy (Middleware)` and all three intercepted routes still register.
- Not verified by hand: logged-out redirect and logged-in navigation in the browser.

### 2026-11-06 - Phase 3: profiles open as an overlay

- New `components/profile/ProfileBody.tsx` - the whole profile markup extracted (cover, identity, action buttons, stats, bio, skills, tab strip, posts/roles list, empty states). Page and overlay now render identical content.
- `app/(app)/[username]/page.tsx`: thinned to fetch + validate + `<ProfileBody>`. Same queries, same `onList` lookup, same post/role fetches.
- New `app/(app)/@modal/(.)[username]/page.tsx`: intercepted profile route. Because profiles are tall, the body is wrapped in `max-h-[70vh] overflow-y-auto` so the modal scrolls internally rather than growing past the viewport.
- `ProfileBody` takes a `canFollow` flag - the Add-to-list button renders only when a viewer is signed in, replacing the old `currentUser &&` check that lived in the page.
- Build confirms all three intercepted routes with no conflicts: `ƒ /(.)[username]`, `ƒ /(.)[username]/recruitments/[id]`, `ƒ /(.)[username]/work/[id]` - each alongside its full-page counterpart.
- LINKS UNCHANGED: cards and author names still point at `/[username]`.
- KNOWN ISSUE, pre-existing, NOT introduced here: the profile's role list links to `/recruitments/${r.id}`, the legacy route that redirects, instead of the canonical `/{username}/recruitments/{id}`. Left as-is to keep this change focused; worth fixing separately.
- Note: the work list inside the profile links to `/{handle}/work/{id}`, so opening a post from inside a profile overlay opens another intercepted route over it. Nesting behaviour is Next's default; not tested by hand.
- Not verified by hand: click-through in the browser. Verified by type-check and production build.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-06 - Phase 2: role detail opens as an overlay

- New `components/recruitments/RecruitmentDetailBody.tsx` - role detail markup extracted, same pattern as `WorkDetailBody`. Takes `recruitment`/`recruiter`/`isOwner`/`inModal`.
- `app/(app)/[username]/recruitments/[id]/page.tsx`: thinned to fetch + validate + `<RecruitmentDetailBody>`. Same query, same handle check, same `recordRecruitmentView`.
- New `app/(app)/@modal/(.)[username]/recruitments/[id]/page.tsx`: intercepted route with the same fetch and view recording.
- New `components/ui/DetailModal.tsx` replaces `components/work/WorkDetailModal.tsx` (deleted). The wrapper is not work-specific now that roles use it. Same behaviour: `router.back()` to close, `/feed` fallback when there is no history.
- Both intercepted routes updated to import `DetailModal`.
- LINKS UNCHANGED: `RecruitmentCard` still points at `/{username}/recruitments/{id}`; `/[username]/recruitments/[id]` and `/recruitments/[id]` still resolve normally.
- The owner-only Edit/Delete controls moved INTO the shared body, so they appear in the overlay too. The Delete form posts the existing `deleteRecruitment` server action - unchanged.
- View recording runs once per render in each route (page or modal), not both, because only one of them renders for any given request.
- Build confirms both intercepted routes: `ƒ /(.)[username]/recruitments/[id]` and `ƒ /(.)[username]/work/[id]`.
- Not verified by hand: click-through in the browser. Verified by type-check and production build.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-06 - Phase 1: post detail opens as an overlay, URL unchanged

- New `components/work/WorkDetailBody.tsx` - the post detail markup extracted from the page so the full page and the overlay render IDENTICAL content. Takes `post`/`author`/`prof`/`isOwner`/`isRecruiter` plus `inModal` (modal drops the `.card` wrapper and uses `space-y-6`, since the Modal already provides the panel and padding).
- `app/(app)/[username]/work/[id]/page.tsx`: now a thin wrapper - same Prisma query, same author-handle validation, same `recordWorkView`, same `notFound()` - then renders the back bar + `<WorkDetailBody>`. Behaviour of the full page is unchanged.
- New `app/(app)/@modal/(.)[username]/work/[id]/page.tsx`: the intercepted route. Same data fetch and view recording, rendered through `<WorkDetailModal>` instead of a page shell.
- New `components/work/WorkDetailModal.tsx` (client): wraps the body in the shared `Modal`. Close does `router.back()` so it returns to the feed with scroll restored; falls back to `router.push('/feed')` when there is no history (e.g. the modal URL was opened directly).
- LINKS UNCHANGED: `WorkCard` still points at `/{username}/work/{id}`. That is what makes interception work - in-app clicks render the overlay and the address bar still shows the real post URL; a refresh or a shared link renders the normal full page.
- Confirmed the build registers BOTH routes: `ƒ /(.)[username]/work/[id]` (intercepted) and `ƒ /[username]/work/[id]` (full page).
- Verified nothing else depended on the old inline markup: no imports of the page module, `DeleteWorkButton` still resolves from `components/work/DeleteWorkButton.tsx`, and the legacy `profile/work/[id]` route is still a pure redirect.
- Caveat: the layout still blocks on `getCurrentUser()` (deferred in Phase 0), so the overlay appears after that cost rather than instantly. Phase 4 addresses it.
- Not verified by hand: actual click-through in the browser. Verified by type-check and a successful production build.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded.

### 2026-11-06 - Phase 0: shared Modal + @modal slot (click-to-popup groundwork)

- New `components/ui/Modal.tsx` - the shared modal shell everything will build on.
  - Carries BOTH `role="dialog"` and `.modal-overlay`. ScrollBridge bails out on either; without them wheel events over a modal get preventDefault'ed and the panel cannot scroll. This is the bug that bit the composers twice in earlier entries.
  - Esc to close, click-outside to close, body scroll lock, focus moved into the panel, focus restored to the trigger on close, and a Tab focus trap.
  - `title` renders the header + close button; omit it for a headerless panel. `maxWidth` is overridable (default `max-w-[640px]`).
- `components/work/WorkComposerModal.tsx` and `components/recruitments/RecruitmentComposerModal.tsx`: REWRITTEN as thin wrappers around `Modal`. Each dropped its own duplicated overlay, Escape handler and scroll lock. Same look, same behaviour, one implementation.
- New `app/(app)/@modal/default.tsx` returning null - the empty state for the parallel route slot.
- `app/(app)/layout.tsx`: accepts a `modal` prop and renders `{modal}` after the shell. The existing auth redirect is UNCHANGED - the layout still awaits `getCurrentUser()`.
- CORRECTION to my own earlier claim in this session: `/api/me` DOES exist (it appears in the build route list). I said it was missing because a file-name search for "api/me" found nothing. `useUser()` is not broken.
- DELIBERATELY DEFERRED: making the layout non-blocking (moving `getCurrentUser()` off the render path). It is the highest-risk change in the plan and the modal work does not depend on it. Until it is done, an intercepted route still pays the auth cost before the overlay appears.
- Known warning, unrelated: the build reports the `middleware` file convention is deprecated in Next 16 in favour of `proxy`. Not touched.
- Verified: `npx tsc --noEmit` clean AND `npx next build` succeeded (all 20 static pages generated, no errors).

### 2026-11-06 - Middle column aligned to the feed on every page

- Problem: the feed's content started level with the top of the left and right rails, but other pages sat 24px lower and some were narrower, so the columns did not line up.
- Cause: the layout row in `app/(app)/layout.tsx` already applies `pt-6`. The feed root has NO `pt-6`; every other page added its own `pt-6` on top, giving 48px total. Some pages also capped width (`max-w-[800px]` / `max-w-[880px]`), which the feed does not.
- Fix: page roots changed to `flex-1 min-w-0 w-full pb-4` (feed's pattern) - dropped `pt-6` and dropped the width caps.
  - `app/(app)/explore/page.tsx`
  - `app/(app)/list/page.tsx`
  - `app/(app)/profile/professionals/page.tsx`
  - `app/(app)/profile/recruiters/page.tsx`
  - `app/(app)/recruitments/page.tsx`
  - `app/(app)/[username]/page.tsx`
  - `app/(app)/[username]/work/[id]/page.tsx`
  - `app/(app)/[username]/recruitments/[id]/page.tsx`
- Note: dropping the width caps means these pages now use the full middle width. Readability on wide screens is reduced for the text-heavy ones (profile, job detail). Acceptable per user request for consistent alignment.
- NOT touched: the `/profile/*` pages (billing, notifications, work, recruitments, saved-*, visibility, professionals/[id], profile) still use `min-h-screen p-4` - a third layout convention that also does not match the feed. Flagging in case those need the same treatment.
- Verified: `npx tsc --noEmit` passed with zero errors.

### 2026-11-06 - Left-rail hero card retargeted per role

- `components/navigation/Sidebar.tsx`, bottom `card-gradient` card only.
  - Recruiter: "Discover professionals" with the UserIcon, body "Find the right people for your open roles.", CTA "Find Professionals ->" to `/profile/professionals`.
  - Professional: "Discover opportunities" with the BriefcaseIcon, body "Explore the latest jobs and career opportunities.", CTA "Browse Jobs ->" to `/recruitments`.
- Both variants are now about DISCOVERY, not boosting. The old "Get seen fast" / Boost Visibility variant no longer renders anywhere.
- Note: this is the card moved from the right rail earlier today - the right rail still holds the "Stand out to ..." promo with the Boost Visibility CTA, so boosting is still reachable from the app.
- Icons: `UserIcon` and `BriefcaseIcon` were already imported in Sidebar for the tools list - no import change.
- Body copy under "Discover professionals" was written here, not supplied - easy to change.
- Verified: `npx tsc --noEmit` passed with zero errors.

### 2026-11-06 - Gradient cards swapped between the rails

- `components/navigation/Sidebar.tsx`: the promo card ("Stand out to professionals" / "Stand out to recruiters") is REMOVED. Its slot now holds the hero card moved from the right rail - "Discover opportunities" (recruiter, Browse Jobs -> /recruitments) / "Get seen fast" (professional, Boost Visibility -> /profile/visibility).
- `components/navigation/RightRail.tsx`: the hero card is REMOVED. Its slot now holds the promo card - "Stand out to professionals" / "Stand out to recruiters" with the role-aware body copy and the Boost Visibility CTA.
- Both cards keep the same `card-gradient` treatment; only their position changed. Card order in each rail is otherwise untouched: left = profile -> tools -> hero, right = promo -> Trending.
- `BriefcaseIcon` import removed from RightRail - it was only used by the moved hero card. Sidebar already imported it for its tools list, so no new import was needed there.
- Note: both rails are role-aware, so the swap is consistent for recruiters and professionals.
- Note: the earlier flag that "Stand out to ..." heading duplicates its body copy still applies - the card just lives on the right now.
- Verified: `npx tsc --noEmit` passed with zero errors.

### 2026-11-06 - List page rows get an "On list" toggle on the right

- `app/(app)/list/page.tsx`: each row now shows an "On list" pill button on the right. Clicking it removes the person (DELETE) and the row disappears immediately.
- New `components/contact/ListRow.tsx` (client): owns the row markup and a local `removed` flag. The list page stays a server component; it just maps follows to `<ListRow>`. Row hides itself on successful removal, so no refresh or router.refresh() is needed.
- `components/contact/FollowPostsButton.tsx`: new optional `onRemoved?: () => void` prop, fired only after a successful DELETE (`res.ok` and `!next`). No behaviour change for existing callers.
- STRUCTURAL NOTE: the row used to be one `<Link>` wrapping the whole card. A `<button>` cannot live inside an `<a>`, so the markup is now `<div class="card">` > `<Link>` (avatar + text, `flex-1`) + `<div>` holding the button. The card styling moved from the link to the wrapper div, so the hover shadow still covers the whole row.
- Note: the empty state ("Your list is empty") only renders when the server fetch returns zero follows. Removing the last row client-side leaves an empty `<ul>` until the next load - acceptable for now, flag if the empty state should appear instantly.
- Verified: `npx tsc --noEmit` passed with zero errors.

### 2026-11-06 - "Add to list" is a real two-way toggle

- REVERSES the earlier "Add to list is one-way" decision. User asked to be able to click it back off.
- `components/contact/FollowPostsButton.tsx`:
  - Removed the `if (following) return` short-circuit and `disabled={pending || following}` -> `disabled={pending}`. The button is now clickable in both states.
  - `toggle()` flips `next = !following` and sends POST (add) or DELETE (remove), so `following` state, label ("Add to list" / "On list") and the request all stay in sync.
  - Rollback now also covers non-2xx responses: added `if (!res.ok) setFollowing(!next)` in addition to the existing catch. Previously a failed request left the optimistic state wrong.
  - Added a guard `if (pending) return` so a double-click during flight cannot fire two opposite requests.
  - `aria-disabled={following}` replaced with `aria-pressed={following}` - it is a toggle, not a disabled control.
  - Added a hover state for the added state (`hover:bg-brand/20`) so it reads as clickable.
- `app/api/follow/[id]/route.ts` needed no change - DELETE already existed and returns `{ following: false }`; POST upserts.
- Note: the DELETE path is `prisma.follow.deleteMany`, so removing someone who is not on the list is a no-op, not an error.
- Note: the pill on feed cards and the profile button share this component, so both can now toggle off.
- Verified: `npx tsc --noEmit` passed with zero errors.

### 2026-11-06 - Sidebar promo copy updated

- `components/navigation/Sidebar.tsx`: CTA `Complete Profile ->` -> `Boost Visibility ->`.
- Body copy `Complete your profile and increase your visibility.` replaced with role-aware text, then lengthened to two sentences:
  - Recruiter: "Get seen by more professionals. Boost your roles to reach the right candidates first."
  - Professional: "Get seen by more recruiters. Boost your work so the right people find you first."
- Heading still reads "Stand out to professionals" / "Stand out to recruiters" - it now says much the same thing as the body. Flagged in case the heading should change.
- Verified: copy-only change.

### 2026-11-06 - "Find others" button on the empty list

- `app/(app)/list/page.tsx`: added a primary button below the empty-state copy, labelled "Find others", linking to `/explore`.
- `app/(app)/feed/page.tsx`: same button added to the **List tab** empty state. Two separate places - the tab and the page. The tab had no CTA at all before this.
- List tab copy set to: "Your list is empty. Open a profile and \"Add to list\" for their content to show here." The `/list` page keeps its own longer copy.
- Uses the existing `.btn-primary` component class.
- Verified: type check run.

### 2026-11-06 - "press" removed from list empty-state copy

- `app/(app)/feed/page.tsx` (List tab) and `app/(app)/list/page.tsx`: the word "press" was REMOVED (not replaced with a synonym). Now reads "Open a profile and \"Add to list\"...". Both places match.

### 2026-11-06 - Add to list is one-way; Following wording removed

- `components/contact/FollowPostsButton.tsx`: once a person is on the list the button is `disabled` and `aria-disabled`, with `disabled:cursor-default` and no hover state. The POST can no longer be fired twice, and there is no DELETE path from the button - removal belongs on the list page.
- `app/(app)/feed/page.tsx`: removed an orphaned `active === 'Following'` empty-state CTA left behind by the tab rename; comment updated.
- `app/(app)/list/page.tsx`: component renamed `FollowingPage` -> `ListPage`.
- Remaining `following` occurrences are internal identifiers only (`followingIds`, `initialFollowing`, `followerId_followingId`, the Prisma relation) - no user-facing text.
- Verified: type check + grep for remaining UI text.

### 2026-11-06 - Feed tabs: List replaces Following, Most Relevant removed

- `app/(app)/feed/page.tsx`: tab order is now For You / List / Recruiter Feed / Recent.
- `List` is the rename of `Following` - it filters posts to authors in `followingIds`, i.e. only people the viewer has added to their list. Recruitment posts filter on `recruiter.id` the same way.
- `Most Relevant` removed along with its matchScore ranking branch.
- DESYNC FIX: after the rename, `filters` still contained a `Following` entry that no switch case handled, so that tab would have rendered an empty feed. Removed.
- Verified: type check run.

### 2026-11-06 - Sidebar tools: new icons, no title icon

- `components/icons.tsx`: added `TieIcon` (knot + blade shape). Redrawn once because the first version only filled the middle of the 24px viewBox and read smaller than neighbouring icons - knot widened to 7 units, blade widened to 8 and extended to y=21.5 so it fills the box.
- `components/navigation/Sidebar.tsx`: Recruiter tools now use `TieIcon` for "Post a Job" and `BriefcaseIcon` for "Manage Jobs" (previously both used Briefcase/User).
- Section heading no longer renders an icon - it is just "Recruiter Tools" / "Professional Tools" in bold text.
- Tie icon renders at `h-5 w-5` instead of `h-3.5 w-3.5` because it still read small even after redrawing; other tool icons stay at 14px.
- Verified: type check run.

### 2026-11-06 - Empty feed states use the right CTA

- BUG: every empty tab rendered the same CTA ("Post a role" / "Create a post") linking to the composer. On "For You" that made no sense - the tab is empty because the viewer's hiring interests or skills match nothing, and posting does not fix that.
- `app/(app)/feed/page.tsx`: CTA is now per-tab.
  - For You -> /settings, labelled "Add interests" (recruiter) or "Add skills" (professional). Both shortened to avoid repeating the notice text above them ("hiring interests" / "skills").
  - Following -> /profile/professionals, "Find professionals".
  - Recruiter Feed / Recent -> composer, "Post a role" or "Create a post".
- Note: Most Relevant has no CTA now (it falls through) - acceptable since it ranks existing posts rather than filtering.
- Verified: type check run.

### 2026-11-06 - Messages and Settings get the app shell; conversation backgrounds

- CORRECTION: my first attempt moved `/messages` and `/settings` into the `(app)` group, which put them inside the three-column shell and changed the messages layout. That was NOT requested - only the top menu was. Reverted: both are back at `app/messages/*` and `app/settings/*` with their own `layout.tsx`, which now render `TopNav` at the top and keep their original page structure (messages stays a two-pane list + thread).
- Rule: when the ask is "add the top menu", render TopNav in the existing layout. Do not move routes into `(app)` unless the shell itself is wanted.
- `components/messages/ConversationView.tsx`: each thread item is now its own card.
  - FIRST ATTEMPT WAS WRONG: I wrapped each item in a full-width rounded card, so short messages sat inside large coloured slabs. That is the card idiom, not the chat idiom. User called it out.
  - REBUILT as proper bubbles: `w-fit`, the bubble itself carries the background. Width cap set to `max-w-[50%]` (was 75%, then 50% by request - long messages were stretching too wide). Mine = `bg-brand text-white` with `rounded-br-md`; theirs = `border border-line bg-white` with `rounded-bl-md`. Unread gets a brand ring plus a "New" label. Consecutive messages from the same sender group with `mt-1` instead of `mt-4`, and the name/time header only renders on the first of a group.
  - Lesson: chat bubbles hug content; cards span containers. Check the existing component's idiom before restyling it.
  - Unread uses a brand ring on the bubble plus a "New" label.
  - Reply form is a plain bordered section, not its own panel.
  - BUG FIX: grouping was `prev.isMine === item.isMine` only, so a message sent much later still rendered with no header and appeared to reuse the previous timestamp. Grouping now requires same sender AND under 5 minutes between messages.
- Note: `/messages` and `/settings` now have the full three-column shell, which is a layout change from the previous edge-to-edge view.
- Verified: type check run.

### 2026-11-06 - Darker secondary text, nav matches headings

- `tailwind.config.js`: `ink.muted` `#6B7280` -> `#374151`; `ink.subtle` `#9CA3AF` -> `#6B7280`. Secondary and tertiary text are now noticeably darker across every page that uses these tokens.
- `components/navigation/TopNav.tsx`: inactive primary nav links changed from `text-ink-muted` to `text-ink`, matching heading black (`#111827`). The `hover:text-ink` was dropped since it is already that colour.
- Active nav items keep the brand-tinted pill.
- Note: this is a global token change, so other places using `text-ink-muted` / `text-ink-subtle` also darkened - cards, forms, directory rows, search pages.
- Verified: class/token changes only; not type-checked (no type surface).

### 2026-11-06 - RLS enabled on Follow and RecruitmentView

- New `supabase/015_rls_follow_recruitment_view.sql`.
- `Follow`: RLS on. Policies allow SELECT / INSERT / DELETE only where `auth.uid() = followerId`. No UPDATE policy. This is what makes follow relationships private - without it the anon key could read the whole table.
- `RecruitmentView`: RLS on. Policies allow SELECT / INSERT only where `auth.uid() = viewerId`.
- Why the app keeps working: Prisma connects with the direct database URL as the table owner, which bypasses RLS. These policies only close the Supabase REST/anon-key path.
- Note: `auth.uid()::text` cast is used because the id columns are TEXT, not UUID.
- NOT audited: other tables (User, WorkPost, Recruitment, Like, etc.) may still be unrestricted.
- REQUIRED: run the SQL in Supabase.

### 2026-11-06 - Country added to roles; Jobs filters by country

- `prisma/schema.prisma`: `Recruitment` gained `country String?`.
- Migration: `supabase/014_recruitment_country.sql` (additive ALTER TABLE).
- `components/recruitments/RecruitmentForm.tsx`: new Country input under the Organization/Location row, placeholder "e.g. Nigeria".
- `app/(app)/profile/recruitments/actions.ts`: `country` read in `extract()` and persisted on both create and update.
- `app/api/recruitments/route.ts`: selects `country` and accepts a `country` filter param.
- `app/(app)/recruitments/page.tsx`: Jobs filter now Role / Country / Employment type (Location replaced by Country). Card meta line includes country.
- REQUIRED: run the SQL, then prisma generate was run here.
- Verified: prisma generate completed.

### 2026-11-06 - Jobs filters: Role replaces Organization

- `app/(app)/recruitments/page.tsx`: filter order is now Role, Location, Employment type. The Organization input was replaced by Role, placeholder "e.g. Product Designer".
- `app/api/recruitments/route.ts`: new `role` param mapped to `where.title contains role` (case-insensitive). The `organization` param is still supported for other callers.
- Verified: type check run.

### 2026-11-06 - Search added to the Jobs page

- `app/(app)/recruitments/page.tsx`: REWRITTEN from a server component with a static list into a client page with a search bar and collapsible filters (employment type, location, organization).
- Uses the existing filter-aware `/api/recruitments` endpoint via a derived SWR key, so results refetch as filters change.
- Visual language matches the Professionals and Recruiters directories: search bar + Filters button with an active-count badge, loading skeletons, empty state, card list.
- Page heading reads "Jobs" to match the top-nav label, while the route stays `/recruitments`.
- Note: the previous version read straight from Prisma on the server; this one goes through the API, which is slightly slower but enables live filtering.
- Verified: type check run.

### 2026-11-06 - Search moved onto the directories, explore randomised

- New `app/api/recruiters/route.ts`: lists `RecruiterProfile` with `q`, `organization`, `location`, `verified`, `take` filters. `q` searches organization, role, hiring interests and user name.
- `app/(app)/profile/professionals/page.tsx`: search bar + collapsible filters (skill, location, availability). Results refetch as filters change via a derived SWR key.
- `app/(app)/profile/recruiters/page.tsx`: REWRITTEN from a "coming soon" placeholder into a real directory with search bar + filters (organization, location, verified only).
- `app/(app)/explore/page.tsx`: REWRITTEN as a randomised suggestion list of professionals. Fetches up to 100 and Fisher-Yates shuffles client-side, showing 20. A Shuffle button reseeds without refetching.
- Note: `/explore` no longer has tabs or search - search now lives on the two directory pages, which is where the filters belong.
- Note: `/explore` ignores `?q=` now. The top-bar search still routes to `/explore?q=`, so typing there lands on explore without applying the query. Should point at the professionals page instead.
- Verified: type check run.

- `app/api/professionals/route.ts`: now accepts `q`, `skill`, `location`, `availability`, `take` query params. `q` searches title, bio, user name and skill names; `skill` filters to a matching skill; `location` matches location or country; `availability` accepts `ANY`, `AVAILABLE` (= not NOT_AVAILABLE) or an exact enum value. Default take raised to 50, capped at 100.
- `app/api/recruitments/route.ts`: now accepts `q`, `location`, `type`, `organization`, `take`. Previously it hard-coded `take: 5`, which is why the explore Recruiters tab only ever showed 5 roles.
- Both still return the same shape for unfiltered calls, so existing consumers are unaffected.
- `app/(app)/explore/page.tsx`: REWRITTEN as a real search page. Search bar with debounce-free SWR keys, a Professionals / Recruiters & Roles toggle, and a collapsible filter panel.
  - Professionals filters: skill, location, availability.
  - Roles filters: employment type, location, organization.
  - Active-filter count badge, and a Clear filters action.
  - Reads `?q=` from the URL on mount and writes it back on submit, so searches are shareable.
  - Typing in filters refetches automatically because the SWR key is derived from them.
- Removed the old Trending/Professionals/Recruiters tabs from this page.
- Note: `/explore` no longer shows trending posts - that content still lives in the right rail's Trending card.
- Verified: type check run.
- Verified: type check run.

### 2026-11-06 - /home renamed to /feed

- Moved `app/(app)/home/page.tsx` -> `app/(app)/feed/page.tsx`.
- The nav label stays "Home"; only the href changed to `/feed`.
- Updated every reference: TopNav (nav item + logo), `app/page.tsx` root redirect, `app/auth/complete-profile`, `LoginForm`, `SignUpForm`, `profile/professionals/[id]` back link, legacy `TopBar`, and the `profile/feed` redirect target.
- The API route stays `/api/home` - only the page URL changed.
- `app/(app)/profile/feed/page.tsx` is a DIFFERENT route (redirects to the timeline) and keeps its path.
- `app/(app)/home/page.tsx` re-created as a `permanentRedirect('/feed')` so old /home links (bookmarks, external) keep working instead of 404-ing.
- Verified: type check + stale-reference grep.

### 2026-11-06 - Feed API made ~2x faster

- Measured `/api/home` at ~1.9-2.1s per request before the change.
- `app/api/home/route.ts` REWRITTEN:
  - `supabase.auth.getUser()` -> `getSession()`: removes a Supabase auth HTTP round-trip per feed load.
  - The viewer-scoped reads (user, follows, likes, saves, recruitmentLikes, recruitmentSaves) now run in a single `Promise.all` instead of chained awaits.
  - Response shape unchanged, plus `viewerTitle` / `viewerBio` / `viewerId` are still returned.
- Same `getSession()` security tradeoff as getCurrentUser: cookie trusted until JWT expiry.
- Verified: re-timed with curl after the change.

### 2026-11-06 - Top nav: Recruiters added, More removed, compass icon

- `components/navigation/TopNav.tsx`: primary nav is now Home / Jobs / Professionals / Recruiters / Explore.
- `Recruiters` links to `/profile/recruiters`.
- Explore icon changed from `SearchIcon` to a new `CompassIcon`.
- The "More" button was removed from the nav. The avatar dropdown is still reachable from the avatar button on the right, so nothing was lost - but the nav no longer has a More entry point.
- `components/icons.tsx`: added `CompassIcon` (circle + needle).
- Verified: type check run.

### 2026-11-06 - Talent route moved to /profile/professionals

- Moved `app/(app)/profile/talent/page.tsx` -> `app/(app)/profile/professionals/page.tsx`; the old `talent` folder was removed.
- Safe because `profile/professionals/` previously held only `[id]/page.tsx`, so an index `page.tsx` sits beside the dynamic route without conflict.
- `components/navigation/TopNav.tsx` and `components/navigation/Sidebar.tsx`: both `/profile/talent` links updated to `/profile/professionals`.
- `lib/matching/industries.ts` keywords untouched.
- Note: old `/profile/talent` URLs now 404 - no redirect added.
- The moved page was only a "coming soon" placeholder, so `app/(app)/profile/professionals/page.tsx` was REWRITTEN as a real directory: header, loading skeleton, empty state, and one card per professional (avatar tile, name, OPEN TO WORK pill, title, location, 2-line bio, up to 5 skill chips) linking to `/<username>`.
- Uses the existing `/api/professionals` endpoint - no backend change.
- `app/(app)/profile/saved-professionals/page.tsx`: heading "Saved Talent" -> "Saved Professionals".
- `.next` was deleted to clear a stale generated route validator referencing the old talent path.
- Verified: type check + stale-reference grep.

### 2026-11-06 - "Talent" renamed to "Professionals" in UI text

- `components/navigation/TopNav.tsx`: primary nav item `Talent` -> `Professionals`.
- `components/navigation/Sidebar.tsx`: tool `Search Talent` -> `Search Professionals`; description `Reach top talent` -> `Reach top professionals`; promo copy `Stand out to talent` -> `Stand out to professionals`.
- NOT changed: `lib/matching/industries.ts` entries `'talent'` and `'talent acquisition'` - those are matching keywords, not UI copy, and removing them would weaken industry matching.
- NOT changed: the route stays `/profile/talent`. Renaming the path would break existing links.
- Verified: edits confirmed by tool results; copy-only.

### 2026-11-06 - Instant feedback on navigation

- New `app/(app)/loading.tsx`: a full shell skeleton (left rail, composer, tab row, three card placeholders, right rail) matching the real layout dimensions.
- Why: the `(app)` layout awaits `getCurrentUser()` (Supabase auth HTTP call + Prisma query) before rendering anything, so every navigation showed a blank hang. Next now streams this skeleton immediately and swaps in the real page when data resolves.
- This makes navigation *feel* instant; it does not reduce actual data time.
- `lib/auth/get-current-user.ts`: swapped `supabase.auth.getUser()` for `getSession()`. getUser() makes an HTTP call to Supabase's auth server on every navigation; getSession() decodes the JWT from the cookie locally, removing one network hop per page transition.
- SECURITY TRADEOFF: getSession() trusts the cookie without server-side revalidation. A revoked or signed-out-elsewhere session remains valid until the JWT expires. Acceptable here because route protection is a UX concern, not the security boundary - data access is still gated by RLS and per-action auth checks. If that assumption is wrong, revert to getUser().
- Verified: file written; not type-checked.

### 2026-11-05 - Modal overlay scrolling fixed for both roles

- The earlier `[role="dialog"]` guard only covered the panel itself. The scrollable element is the overlay that WRAPS the dialog, so wheel events over the overlay's padding still hit `ScrollBridge` and got cancelled - most visible on the long recruitment form.
- Added a `modal-overlay` class to both modals' outer overlay and a matching `closest('.modal-overlay')` bail-out in ScrollBridge.
- Both composer modals (professional and recruiter) now scroll natively.
- Verified: edits confirmed by tool results; not re-type-checked (class/attribute only).

### 2026-11-05 - Modals scroll again

- BUG: opening the composer modal and scrolling did nothing. `ScrollBridge` listens for `wheel` at the document level and calls `preventDefault()` when the target sits inside a `[data-scroll-bridge]`, which the overlay inherits via the column row - so the modal's own `overflow-y-auto` was being cancelled.
- Fix: `ScrollBridge` now bails out early when the event target is inside `[role="dialog"]`, leaving the modal's native scrolling intact.
- Also worth noting: both modals set `document.body.style.overflow = 'hidden'`, which no longer affects anything since `<main>` is the scroll container. Harmless, but no longer doing what it was written for.
- Verified: edits confirmed by tool results; not re-type-checked.

### 2026-11-05 - Trending shows likes, not post count

- `components/navigation/RightRail.tsx`: meta line under each trending title changed from `compactCount(likes + views)` + "posts" to `compactCount(likes)` + "likes".
- The old label was misleading - it summed likes and views, then called the result "posts".
- Verified: edit confirmed by tool result; not re-type-checked (copy only).

### 2026-11-05 - Wheel scrolling works in the column gaps

- `app/(app)/layout.tsx`: the three-column row now carries `data-scroll-bridge`.
- Previously `ScrollBridge` only forwarded wheel events whose target was inside a tagged rail, so the `gap-5` gutters between columns dead-ended. Tagging the row covers the gaps too.
- Behaviour: wheel anywhere in the column area now scrolls the feed; wheel over `<main>` scrolls it natively.
- Verified: edit confirmed by tool result; not re-type-checked (attribute only).

### 2026-11-05 - List page moved to /list

- Moved `app/(app)/profile/following/page.tsx` -> `app/(app)/list/page.tsx`; the old folder was removed.
- `components/navigation/TopNav.tsx`: the "My list" dropdown item now points at `/list` instead of `/profile/following`.
- `/list` is a top-level route inside the `(app)` group, so it keeps the shell.
- Note: old `/profile/following` links (bookmarks, any external) will now 404 - no redirect was added.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - Composer chips are now functional presets

- Replaced the decorative Photo / Video / Poll chips with real form presets.
- Professionals: Project / Case study / Achievement / Sample -> `initialTemplate` (PROJECT_SHOWCASE, CASE_STUDY, ACHIEVEMENT, WORK_SAMPLE).
- Recruiters: Full-time / Contract / Freelance / Internship -> `initialEmploymentType`.
- Plumbing added: `WorkForm` accepts `initialTemplate`; `RecruitmentForm` accepts `initialEmploymentType`; both modals pass them through and use `key` so the form remounts with the new preset.
- Clicking a chip opens the modal with that value preselected.
- Fourth professional chip label changed from "Sample" to "Work sample"; the underlying value was already WORK_SAMPLE.
- Verified: edits confirmed by tool results; type check pending.

### 2026-11-05 - Tools card removed from the right rail

- `components/navigation/RightRail.tsx`: the duplicate Professional/Recruiter Tools card is gone, so Trending Now can grow without competing for vertical space.
- Removed the `recruiterTools` / `professionalTools` arrays and the `tools` selector; icon imports reduced to `BriefcaseIcon` only.
- Right column is now: hero card -> Trending Now.
- `role` prop is still accepted but only used for the hero card copy.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - Trending and tools cards swapped between rails

- `components/navigation/Sidebar.tsx`: Trending Now removed; the role-aware tools card (Professional Tools / Recruiter Tools) took its place. Left column is now profile card -> tools -> promo.
- `components/navigation/RightRail.tsx`: People you may know removed; Trending Now moved in, with rank, title, like+view count and sparkline. Right column is now hero card -> Trending Now -> tools.
- Both components now define their own tools arrays - the right rail still shows tools too, so BOTH rails have a tools card. Flag if that is unintended.
- `compactCount` moved to RightRail; `useCached` import dropped from Sidebar.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - Feed tabs: no scroll, thicker underline

- `app/(app)/home/page.tsx`: removed `overflow-x-auto` from the tab row so the five tabs never scroll.
- Active underline is now `h-[3px]` at `-bottom-[2px]` (was 2px at `-bottom-px`), so it sits over the row's 1px border and reads as a solid bar.
- Tradeoff: with no scroll container, five tabs could clip on very narrow viewports.
- Verified: edits confirmed by tool results; not re-type-checked (class only).

### 2026-11-05 - Hero card copy by role

- `components/navigation/RightRail.tsx`: the top gradient card now switches copy by role.
  - Recruiter: "Discover opportunities" / "Explore the latest jobs and career opportunities." / CTA "Browse Jobs" -> /recruitments.
  - Professional: "Get seen fast" / "Boost your work so the right recruiters find you first." / CTA "Boost Visibility" -> /profile/visibility.
- Both variants keep the same gradient card, sparkle/briefcase glyph and white pill CTA.
- Verified: edits confirmed by tool results; not re-type-checked (class/copy only).

### 2026-11-05 - Professional tools trimmed

- `components/navigation/RightRail.tsx`: professional tools are now Find Jobs / Discover Recruiters / Create a Post. "Discover Talent" renamed to "Discover Recruiters" and repointed from `/profile/talent` to `/profile/recruiters`. "Saved Work" removed.
- `BookmarkIcon` import dropped since nothing else used it.
- Note: `/profile/recruiters` currently renders a "coming soon" placeholder page.
- Verified: edits confirmed by tool results; not re-type-checked.

### 2026-11-05 - UI-3: tools card moved to the right rail, role-aware

- `components/navigation/RightRail.tsx`: now takes a `role` prop. The bottom card renders Recruiter Tools for `RECRUITER`, and Professional Tools (Find Jobs / Discover Talent / Saved Work / Create a Post) for everyone else.
- `app/(app)/layout.tsx`: passes `role={user.role}` into RightRail.
- `components/navigation/Sidebar.tsx`: Quick Links card removed entirely along with its `quickLinks` array and the icon imports only it used. The left column is now profile card + Trending + promo, so content sits closer to the top.
- Section heading and icon swap by role: briefcase for recruiters, lightning bolt for professionals.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - UI-3: columns aligned at the top

- `app/(app)/layout.tsx`: the three-column row now owns the top spacing (`pt-1` -> `pt-6`), so the left rail, feed and right rail all begin on the same line.
- `app/(app)/home/page.tsx`: removed the feed column's own `pt-6` so it does not double up.
- Note: other pages still supply their own top padding and will sit 24px lower inside the aligned row - a one-off adjustment per page if it looks off.
- Verified: edits confirmed by tool results; not re-type-checked (class-only changes).

### 2026-11-05 - UI-3: white top bar

- `components/navigation/TopNav.tsx`: header background `bg-surface-muted` -> `bg-white`, with a `border-b border-line` rule so it separates from the lavender page behind it.
- Verified: edit confirmed by tool result; type check was clean before this single class change.

### 2026-11-05 - UI-3: post card action bar

- `components/work/WorkCard.tsx`: added a reaction-summary row (three overlapping emoji chips + total, then view/save counts on the right) above a four-action bar.
- Actions are now Like / Comment / Share / Send, matching the reference. Comment links to the post detail page (no inline composer exists).
- "Send" reuses the existing save handler - it is NOT a send-to-someone action yet.
- Note: reaction emojis are decorative; only the Like count is real.
- Note: `CommentIcon` must exist in components/icons - not verified.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - UI-3: feed tabs

- `app/(app)/home/page.tsx`: tabs are now For You / Following / Recruiter Feed / Recent / Most Relevant, rendered as an underline strip (`border-b border-line`, 2px brand bar on the active tab) instead of the segmented control.
- Behaviour: For You = industry-matched + shuffled; Following = list members + shuffled; Recruiter Feed = recruitment roles only, newest first (work posts suppressed); Recent = newest first; Most Relevant = all posts ranked by `matchScore`, no shuffle.
- Empty messages added for Recruiter Feed and Most Relevant.
- Note: `Recruiter Feed` is a guess at intent - it currently shows only recruitments. Confirm if it should instead mean posts from recruiters.
- Note: `Most Relevant` overlaps with `For You` (both use matchScore); the difference is that For You filters to matches and shuffles, Most Relevant ranks everything.
- Verified: edits confirmed by tool results; not yet type-checked.

### 2026-11-05 - UI-3: right column

- `components/navigation/RightRail.tsx`: REWRITTEN with three cards.
- Discover opportunities: gradient card, briefcase heading, CTA to /recruitments.
- People you may know: up to 4 from `/api/professionals`, avatar, name, professional title, View button.
- Recruiter Tools: Post a Job / Search Talent / Manage Jobs rows with icon tiles, descriptions and chevrons.
- Column is 320px, shown only at `xl`.
- Note: Recruiter Tools is shown to ALL users, not just recruiters. Per the brief this is intentional for now - trim later.
- Verified: file written; not yet type-checked.

### 2026-11-05 - UI-3: left column content cards

- `components/navigation/Sidebar.tsx`: REWRITTEN. Nav rail is gone; the column is now four stacked cards.
- Profile card: lavender gradient, 14px avatar tile with a green online dot, name, title/organization, "| Open to opportunities", and a View Profile pill.
- Trending Now: rank, title, `likes + views` as a post count, decorative sparkline.
- Promo gradient card: copy switches for recruiters ("Stand out to talent") vs professionals ("Stand out to recruiters"), CTA to /profile/visibility.
- Quick Links: role-aware list (Find Jobs, Discover Talent, Saved Work or Post a Job, Create a Post).
- Column is `w-[264px]` (xl `w-[280px]`), hidden below `lg`.
- Note: "Open to opportunities" is hardcoded copy, not read from `professionalProfile.availability`.
- Verified: file written; not yet type-checked.

### 2026-11-05 - UI-3: top bar with horizontal nav

- New reference image replaces UI-2's shell. `components/navigation/TopNav.tsx` rebuilt.
- Brand is now a mark tile + "Positioned" wordmark.
- Horizontal primary nav: Home / Jobs (/recruitments) / Talent (/profile/talent) / Explore, plus a More button that opens the avatar dropdown.
- Search moved to the right of the nav (`Search people, jobs, or skills...`).
- Notification bell shows a live unread badge from `/api/unread`; messages icon beside it; avatar last.
- Navigation is therefore back in the TOP BAR, not the left rail - the left column becomes content cards next.
- Verified: file written; not yet type-checked.

### 2026-11-05 - UI-2: type-check fixes

- `npx tsc --noEmit` surfaced 5 real errors; fixed:
  - `lib/client/use-user.ts`: `CurrentUser` gained `username` (Sidebar read it but the type did not declare it).
  - `components/navigation/ScrollBridge.tsx`: listener typed as `Event` then cast to `WheelEvent`, since the DOM overload rejects a bare `WheelEvent` handler.
  - `app/(app)/profile/work/actions.ts`: all three `revalidateTag('feed')` calls now pass the second argument required by this Next version.
  - `app/(app)/[username]/page.tsx`: `SaveProfessionalButton` was missing its required `initialSaved` prop; passed `false`.
  - `app/(app)/profile/saved-work/page.tsx`: query now selects `username`.
- `npx tsc --noEmit` now passes with zero errors after all fixes above.
- Note: `initialSaved={false}` on the profile page is a placeholder - it does not reflect whether the viewer already saved that professional. The list-pill equivalent does fetch real state; this button does not.

### 2026-11-05 - UI-2: list and detail page sweep

- `app/(app)/profile/recruitments/page.tsx` and `app/(app)/profile/work/page.tsx`: CTAs still had `bg-brand text-near-black` from the yellow era - unreadable on indigo. Now white text on indigo with the glow shadow.
- `app/(app)/[username]/work/[id]/page.tsx`: back arrow became a rounded icon button, Edit link is brand, dividers use `border-line`, section labels are uppercase micro-headings, skills are brand pills, links are brand.
- STILL OLD: `app/(app)/[username]/recruitments/[id]/page.tsx`, `app/(app)/explore/page.tsx` tabs, `app/(app)/recruitments/page.tsx`, `app/(app)/profile/notifications/page.tsx`, `profile/saved-*`, `profile/professionals/[id]`, `profile/profile`, the auth pages, and the marketing page at `app/page.tsx`. These still use `text-near-black` / `border-[#e5e5e5]` and will look off-brand until swept.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: profile page

- `app/(app)/[username]/page.tsx`: cover is now an indigo->violet gradient; avatar is a 24px rounded-2xl brand-tinted tile with a white ring and card shadow.
- Name `text-[22px] text-ink`; @handle `text-ink-subtle`; title/organization `text-brand`.
- Stats row `text-[13px] text-ink-muted`; availability is an emerald pill instead of plain green text.
- Skill chips are `bg-brand-light text-brand` pills.
- Tab strip: single brand-coloured tab with a 2px brand underline, on a `border-line` rule.
- Post and role rows restyled to `text-ink` titles with brand meta.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: composer modals

- `components/work/WorkComposerModal.tsx` and `components/recruitments/RecruitmentComposerModal.tsx`: backdrop is now `bg-ink/30 backdrop-blur-sm` instead of flat black/40.
- Panel: `rounded-[1.5rem] border border-line shadow-pop`, matching cards.
- Header title `text-[17px] font-bold text-ink`; close button is a proper 32px square with a sunken hover state instead of a bare "×".
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: list pill restyled

- `components/contact/FollowPostsButton.tsx`: un-added state is solid indigo with white text; added state is `bg-brand-light text-brand`. `rounded-md`, `font-semibold`.
- Pill padding bumped to `px-2.5 py-1` so it reads as a proper control rather than a micro-badge.
- Default size is now `px-5 py-2 text-sm` to match `.btn-primary`.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: recruitment card contrast fixes

- `components/recruitments/RecruitmentCard.tsx`: `applyBtn` still carried `text-near-black` from the yellow-brand era, which was unreadable on indigo. Now `text-white` with the indigo glow shadow.
- Collapsed description and apply-instructions preview: `text-[16px] text-near-black` -> `text-[15px] text-ink`.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: recruitment card styling

- `components/recruitments/RecruitmentCard.tsx`: avatar tile, author name, timestamp, handle and HIRING badge all restyled to match WorkCard (brand-tinted rounded-xl avatar, `text-ink` name, brand-light badge).
- `applyBtn`: now `rounded-xl bg-brand px-5 py-2` with the indigo glow shadow, matching `.btn-primary`.
- Organization/location line is `text-[14px] font-medium text-brand` to read as a role summary.
- Expanded section headings became small uppercase labels (`text-[13px] uppercase tracking-wide text-ink-subtle`), body `text-[15px] text-ink`.
- Title is `text-ink` with `group-hover:text-brand`; org line `text-[14px] font-medium text-brand`; see-more `text-[14px] font-semibold text-brand`.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: work card styling

- `components/work/WorkCard.tsx`: avatar is now a rounded-xl brand-tinted tile (was a grey circle).
- Author name `text-ink hover:text-brand`; timestamp and separator use `text-ink-subtle`.
- BOOSTED badge is now a brand-tinted pill instead of grey.
- "see more / see less" is `text-[14px] font-semibold text-brand`.
- Skill tags became rounded pills on `bg-surface-sunken` instead of plain `#hashtags`.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: composer and feed tabs

- `app/(app)/home/page.tsx`: composer rebuilt as a white card with a brand-tinted avatar tile, a sunken prompt field, an action row (Photo / Video / Poll) and an indigo Post button on the right.
- Tabs changed from an underline row to a segmented control: `bg-surface-sunken` track, active pill `bg-white text-brand shadow-sm`.
- The Photo / Video / Poll buttons all open the same composer modal - they are affordances, not separate flows.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: right discovery rail

- `components/navigation/RightRail.tsx`: REWRITTEN with three stacked cards.
- Trending Now: numbered list from `/api/trending`, rank, title, like+view count, and a decorative sparkline SVG. "See all" links to `/explore`.
- People you may know: from `/api/professionals`, avatar tile, name, @handle, "View" button linking to the profile.
- Upgrade to Premium: gradient card with the sparkle badge and a white pill CTA to `/profile/visibility`.
- Rail width 320px, shown only at `xl`.
- Note: the sparkline is purely decorative - it does not plot real data.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: left navigation rail

- `components/navigation/Sidebar.tsx`: REWRITTEN as a floating white rail card (`rounded-[1.5rem] border-line shadow-card`).
- Nav: Home, Explore, Notifications (unread badge), Messages, Bookmarks, Lists, Profile, More. Active item is `bg-brand-light text-brand` with a brand icon.
- Create Post button is a full-width indigo CTA; href depends on role (recruitment form for recruiters, work form otherwise).
- Footer holds a compact profile row plus a light/dark toggle.
- REMOVED from this component: the Trending and Recruitments lists. Those belong in the right rail per the reference layout - not yet re-added there.
- Theme toggle is visual only; it does not yet switch a theme.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: top navigation

- `app/(app)/layout.tsx`: shell rebuilt - `bg-surface-muted` page, `max-w-[1560px]`, `gap-5 px-5`, height calc changed to `100vh-72px`.
- `components/navigation/TopNav.tsx`: REWRITTEN. Rounded indigo logo tile, centred pill search field (`bg-surface-sunken`, focus ring), icon cluster (explore/messages/notifications/settings) with brand-tinted active state, divider, then avatar + dropdown.
- Search now actually navigates to `/explore?q=`.
- Note: the top-nav centre nav (Home/Explore/Search) was dropped; navigation now lives in the left rail per the reference layout.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - UI-2: design tokens and component layer

- `tailwind.config.js`: brand is now indigo `#5B3DF5` (dark `#4A2FD9`, light `#EDE9FE`). Added `ink` (text scale), `surface` (backgrounds), `line` (#EEEDF3 border), card/pop shadows, and an `xl2` radius.
- Neutral greys retinted slightly cooler/violet to sit with the indigo accent.
- `app/globals.css`: `.card` and `.feed-post` are now 1.25rem radius, 1px `line` border, soft two-layer shadow. `.feed-post` padding 1.25rem, margin 1rem.
- `.feed-actions` gained a top border separator; `.feed-action` is now `rounded-xl` with `hover:bg-surface-sunken text-brand`.
- `.card-gradient` switched from sky-to-purple to indigo `#6D4AFF` -> violet `#A855F7` with an indigo glow shadow.
- Page background `#F6F5FB` (light lavender-grey).
- All five `.tint-*` classes flattened to white so cards read as one clean surface.
- `.page-header` matched to card styling.
- `.btn-primary` is indigo with a soft indigo glow; `.btn-secondary` is lavender.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Near-black text on brand yellow fills

- Swapped `text-white` -> `text-near-black` everywhere text sits on `bg-brand`, since white on `#FBC91B` is unreadable.
- `components/contact/FollowPostsButton.tsx`: pill text.
- `components/recruitments/RecruitmentCard.tsx`: `applyBtn` constant (Apply / Send DM / Send Email) and the HIRING badge.
- `app/(app)/home/page.tsx`: composer Post button.
- `app/(app)/profile/recruitments/page.tsx` and `app/(app)/profile/work/page.tsx`: list CTAs.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Brand yellow set to #FBC91B

- `tailwind.config.js`: brand DEFAULT `#E1AD01` -> `#FBC91B`; dark derived as `#E0B000`; light as `#FDDF6B`.
- Dark and light were picked by eye from the requested base, not supplied by the user - easy to adjust.
- Still a global swap across every brand usage.
- Contrast note stands: `#FBC91B` is a bright yellow, so white text on `bg-brand` will be unreadable. Near-black text is the correct pairing.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Brand colour trialled as mustard yellow

- `tailwind.config.js`: brand tokens changed from sky blue to mustard - `#E1AD01` (DEFAULT), `#C49500` (dark), `#F2CC4A` (light).
- This is a global swap: every `bg-brand`, `text-brand-dark`, `border-brand/40`, `ring-brand/30` etc. across the app follows automatically.
- Watch for contrast problems: mustard is much lighter than sky blue, so white text on `bg-brand` (the list pill, Apply buttons, Post button) will be low contrast. May need near-black text on brand fills instead.
- Previous values: `#38BDF8` / `#0EA5E9` / `#7DD3FC`, easy to revert.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - List pill is solid brand blue

- `components/contact/FollowPostsButton.tsx`: `bg-brand/20` -> `bg-brand`, `hover:bg-brand/30` -> `hover:bg-brand-dark`. Text stays white.
- This restores readable contrast; white on a 20% tint was nearly invisible.
- Pill is still `rounded` (not `rounded-full`) with badge sizing, so it keeps the badge shape but reads as a solid button.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - List pill text is white

- `components/contact/FollowPostsButton.tsx`: pill text `text-brand-dark` -> `text-white`. Background stays `bg-brand/20`.
- Note: white on a 20%-opacity brand tint has low contrast and may be hard to read, especially on the light page background.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - List pill matches the Recruitments badge exactly

- CORRECTION: the previous change only matched the pill's size, not its look. The user wanted an exact match.
- `components/contact/FollowPostsButton.tsx`: pill now uses `rounded` (was `rounded-full`) and `bg-brand/20 text-brand-dark font-bold`, identical to the sidebar Recruitments badge.
- Both states share the same visual treatment; only the label differs ("Add to list" vs "On list"), so it reads as a badge that toggles rather than a button.
- Note: this removes the solid-blue call to action the user originally asked for - the badge look won out.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - List pill matches the sidebar badges

- `components/contact/FollowPostsButton.tsx`: pill sizing changed from `px-2 py-[1px] text-[11px]` to `px-1.5 py-[1px] text-[12px]`, matching the Trending / Recruitments badges in the sidebar (`text-[12px] font-bold px-1.5 py-[1px] rounded`).
- Background is still `bg-brand` when not added and a brand-tinted outline when added, so it reads as a badge but keeps its toggle affordance.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - List pill moved to the right of the author row

- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: the author row is now `flex items-start gap-2` holding an inner flex-1 name/time/badge group plus the pill on the right. The pill no longer sits inline with the name, so it cannot wrap into the middle of the meta text.
- Pill height matches the HIRING/BOOSTED badges: `py-[1px] text-[11px]`, same vertical rhythm as the 10px badges.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Add to list is brand blue, plus a feed pill

- `components/contact/FollowPostsButton.tsx`: un-added state is now `bg-brand` / `hover:bg-brand-dark` (was near-black); added state is a brand-tinted outline. New `size` prop (`default` | `pill`); pill uses `px-2 py-[1px] text-[11px]`.
- `app/api/home/route.ts`: returns `viewerId` so cards can hide the button on the viewer's own posts.
- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: accept `viewerId` and `followingIds`, and render the pill beside the author name. Hidden when the author is the viewer.
- `app/(app)/home/page.tsx`: passes both props into every card.
- Pill state is seeded from `followingIds`, so an already-added person shows "On list" on first render.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Follow renamed to List in the UI

- Users now speak of a "list", not following. Only user-facing strings changed; the `Follow` model, `/api/follow/[id]` route and `FollowPostsButton` component keep their names to avoid a pointless migration.
- Button label: "Add to list" / "On list".
- Profile page: visitors now see the Add-to-list button alongside Save and Contact; it also renders for recruiters, who have no professional profile.
- `app/(app)/[username]/page.tsx`: fetches whether the viewer already has this person on their list.
- Page at `/profile/following` retitled "My list"; dropdown entry renamed "My list"; empty states on both pages reworded.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Following tab fix + Following list page

- BUG: recruitments were appended to every feed regardless of tab, so Following showed roles from recruiters the user does not follow. Now recruitments are filtered per tab: For you (matched), Following (only followed recruiters), Recent (all, newest first), Boosted (none).
- New page `app/(app)/profile/following/page.tsx`: lists everyone the current user follows, newest follow first, with avatar, name, @handle and title/organization. Empty state explains how to follow.
- `components/navigation/TopNav.tsx`: added a "Following" item to the avatar dropdown.
- Note: no follower counts and no way to see who follows you - consistent with the requirement that follow relationships stay private.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Industry taxonomy for matching

- New `lib/matching/industries.ts`: 15 broad industries (design, engineering, data, product, marketing, writing, sales, finance, operations, people, support, legal, education, health), each with a phrase list covering titles, skills and tools.
- `resolveIndustries(terms)` maps free text to industries plus bare tokens; phrase matching is bidirectional contains, so "senior product designer" still resolves to design.
- `matchScore(viewer, postTerms)` weights a shared industry at 10x a shared bare token, so industry overlap dominates while unknown terms still connect loosely.
- Title is the strongest signal: "Product Designer", "Web Designer" and "Web Builder" all resolve to design, so they match each other through the industry rather than literal strings.
- `app/api/home/route.ts`: now also returns `viewerTitle` and `viewerBio`.
- `app/(app)/home/page.tsx`: For you builds a viewer fingerprint from title + bio + skills (recruiters use hiring interests) and scores each post on skills + title.
- Tradeoff: matching is client-side over the 60 posts returned; a larger corpus would need server-side scoring.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Home API returns matching context

- `app/api/home/route.ts`: REWRITTEN. Now returns `followingIds`, `viewerSkills`, `viewerInterests`, and `viewerRole` alongside posts, so the client can implement the four tabs without extra round-trips.
- `viewerSkills` = `ProfessionalProfile.skills` names; `viewerInterests` = `RecruiterProfile.hiringInterests` split on commas, lowercased.
- Ordering changed from `[boosted desc, createdAt desc]` to `createdAt desc`, take raised 30 -> 60, so the client can sort by tab.
- Tab rules (per user):
  - For you: professionals matched by skill overlap; recruiters matched by `hiringInterests` vs post skills. Random order. Empty if nothing matches.
  - Recent: everything, newest first.
  - Following: only `followingIds`, random.
  - Boosted: unchanged filter.
- DONE: client-side tab logic in `app/(app)/home/page.tsx`.
  - `For you`: filters posts by `matchesViewer`, then Fisher-Yates shuffles. Matching now runs through `lib/matching/industries.ts` (superseded by the entry above).
  - `Following`: filters by `followingIds` against `post.professional.user.id`, then shuffles.
  - `Recent`: sorts by `createdAt` descending.
  - `Boosted`: existing filter.
- Added a per-tab empty message (`emptyMessage`), including a distinct one for recruiters vs professionals on "For you".
- Note: recruits posts are still appended into the same feed regardless of tab; only work posts are filtered. Recruitment rows are unaffected by tab choice.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Follow system (foundation)

- `prisma/schema.prisma`: new `Follow` model (`followerId`, `followingId`, unique pair, index on `followingId`); `User` gained `following` and `followers` relations.
- Migration: `supabase/013_follows.sql`.
- New `app/api/follow/[id]/route.ts`: POST upserts a follow, DELETE removes it. Rejects self-follow and unauthenticated requests.
- New `components/contact/FollowPostsButton.tsx`: optimistic toggle labelled "Follow posts" / "Following". No counts are shown or returned, per the requirement that follow relationships stay private.
- NOT DONE: feed algorithm (For you / Following / Recent), button placement on profiles, `npx prisma generate`, running the SQL.
- Design note: "For you" needs the viewer's skills, which only exist on `ProfessionalProfile`. Recruiters have none, so their "For you" falls back to boosted+random.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Tabs divided into four equal columns

- `app/(app)/home/page.tsx`: tab row is now `grid grid-cols-4` instead of a centred flex row, so the underline is split into four equal parts.
- Each tab is `flex items-center justify-center` with `py-2.5`, so its label sits centred inside its own quarter.
- The active highlight is `absolute inset-x-0 bottom-0 h-[2px] bg-near-black` - it spans the full column width rather than just the text.
- Removed the fixed `gap-12` spacing, which no longer applies in a grid.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Right rail background lightened

- `components/navigation/RightRail.tsx`: `bg-gray-100` -> `bg-[#FAFAFA]`, matching the page background.
- The rail had its own darker grey from when it was meant to read as a distinct panel; at `bg-gray-100` it was noticeably heavier than the `#FAFAFA` page.
- The "People to discover" gradient card still provides the visual separation.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - Page background lightened

- `app/(app)/layout.tsx` and the unlayered `body` rule in `app/globals.css`: `#F4F4F4` -> `#FAFAFA`.
- Cards stay pure white, so the step between card and background is now subtler.
- If it needs to go further, `#FCFCFC` or plain white are the next steps.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - More space between composer and tabs

- `app/(app)/home/page.tsx`: composer card `mb-3` -> `mb-6` (12px -> 24px), matching the gap below the tab line.
- Feed column now reads: composer -> 24px -> tabs -> 24px -> feed.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - More space below the tab line

- `app/(app)/home/page.tsx`: tab row `mb-3` -> `mb-6` (12px -> 24px), adding breathing room between the underline and the first card.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - Right rail gap tightened to 6px

- `components/navigation/RightRail.tsx`: `pl-[10px]` -> `pl-[6px]`.
- Both rails are now 6px from the feed column.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - Left rail gap tightened to 6px

- `components/navigation/Sidebar.tsx`: `pr-[10px]` -> `pr-[6px]`.
- Reason: with both at 10px the right side still read tighter, because the right rail's grey (`bg-gray-100`) blends into the `#F4F4F4` page background while the left rail's white edge creates a visible step. Matching by eye, not by pixels.
- Left is now 6px, right stays 10px.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - Rail-to-feed gaps set to 10px

- `components/navigation/Sidebar.tsx`: `pr-4` (16px) -> `pr-[10px]`.
- `components/navigation/RightRail.tsx`: `pl-4` (16px) -> `pl-[10px]`.
- Both gaps are now 10px, per explicit request.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Rail-to-feed gaps equalized

- `components/navigation/RightRail.tsx`: `pl-[5px]` -> `pl-4` (16px), matching the left sidebar's `pr-4`.
- Both rails now sit 16px from the feed column.
- Note: the right rail is grey (`bg-gray-100`) and the feed background is `#F4F4F4`, so the right gap reads as grey-on-grey and may still look tighter than the left's white-on-grey gap despite identical measurements.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Right rail top aligned with other columns

- `components/navigation/RightRail.tsx`: aside `pt-12` -> `pt-6`, matching the sidebar and feed columns.
- Removed the leftover `h-[40px]` spacer div that was holding space for the search box removed earlier; it had been pushing the card down an extra 40px.
- Net: "People to discover" card now starts at the same vertical position as the profile card and the composer.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Tab row no longer scrolls

- `app/(app)/home/page.tsx`: removed `overflow-x-auto no-scrollbar` from the tab row, so the four tabs always fit and never scroll horizontally.
- Tradeoff: on very narrow viewports the tabs could overflow and be clipped rather than scrollable.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - Tabs moved below composer, underline indicator

- `app/(app)/home/page.tsx`: order is now composer -> tabs -> feed (tabs previously sat above the composer).
- Tab row gained a faint full-width track (`border-b border-[#e5e5e5]`), and the active tab renders a `h-[2px] bg-near-black` bar positioned `-bottom-px` so it sits on top of the track.
- Active state still also carries `font-bold text-near-black`; the underline is the primary cue.
- Explore page tabs untouched.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Recruiter name and avatar link to profile

- `components/recruitments/RecruitmentCard.tsx`: the author avatar was a bare `<div>` and the name a bare `<span>`, so neither was clickable. Both are now `<Link href="/{username || id}">`, matching `WorkCard`. The handle line is also a link.
- Hover underlines the name and handle, consistent with the work card.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Recruitment URLs are /{username}/recruitments/{id}

- New route: `app/(app)/[username]/recruitments/[id]/page.tsx` - validates the handle against the recruiter, else `notFound()`. Author name in the meta line links to their profile; back arrow goes to the profile too.
- `app/(app)/recruitments/[id]/page.tsx`: REWRITTEN as a redirect to the canonical URL.
- `components/recruitments/RecruitmentCard.tsx`: title link, eye/views link, share URL, and the `ApplyAction` fallback link all use the nested path. `Recruitment` type gained `recruiter.id`.
- `components/navigation/Sidebar.tsx`: recruitment list links updated; `RecruitmentItem` type gained `recruiter`.
- DONE: `RecruitmentCard` type + all four links (title, views, share, Apply fallback) now use `/{username}/recruitments/{id}`.
- STILL OLD: `app/(app)/[username]/page.tsx:165` role list, `app/(app)/profile/recruitments/page.tsx:40`, `app/(app)/recruitments/page.tsx:30`, and `profile/recruitments/actions.ts` redirects after create/update. Those still resolve because the legacy route redirects.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Real view tracking for recruitments

- Decision: logged-in views only, for BOTH work posts and recruitments. Anonymous traffic is not counted, because without an identity it cannot be deduped and inflates the number without limit.
- Deleted `app/api/work-view/[id]` (a duplicate I had added); `app/api/view/[id]` is now the single work-view endpoint and delegates to `recordWorkView`.
- `prisma/schema.prisma`: new `RecruitmentView` model with `@@unique([recruitmentId, viewerId])`, plus back-relations on `Recruitment` (`viewsList`) and `User` (`recruitmentViews`).
- New `lib/views/record-recruitment-view.ts`: mirrors `record-view.ts` - returns current count for a null viewer, dedupes by unique key, increments inside a transaction.
- New `app/api/recruitment-view/[id]/route.ts`.
- Migration: `supabase/012_recruitment_views.sql` (table + unique index + lookup index).
- REQUIRED: run the SQL, then `npx prisma generate`.
- Wired: `app/(app)/recruitments/[id]/page.tsx` calls `recordRecruitmentView` on load when the viewer is not the owner; `components/recruitments/RecruitmentCard.tsx` fires the view on "see more" (once per mount) and updates its own `viewCount` state.
- Note: `RecruitmentCard` displays `compactCount(viewCount)` in the feed actions bar.
- Migration `supabase/012_recruitment_views.sql` was applied by the user; `prisma generate` still needed for the types.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Trending simplified to plain title links

- `components/navigation/Sidebar.tsx`: removed the expandable dropdown (chevron, section list, skills chips, likes/views footer, "View post" link). Trending is now a plain list of title links to `/{username}/work/{id}`.
- Removed `expandedId` state, the `useState` import, and the `ChevronIcon` import, which were only used by that dropdown.
- Rationale: trending is a discovery list of other people's posts, not a reader. The dropdown duplicated the post detail page.
- `compactCount` is still imported for the Recruitments block.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Trending links fixed, legacy post URLs redirect

- `app/api/trending/route.ts`: select now includes `professional.user.{id,username}`, so the sidebar can build canonical post URLs.
- `components/navigation/Sidebar.tsx`: `TrendingPost` type gained `professional`; the "View post" link is now `/{username || id}/work/{postId}` instead of the broken `/work/{id}` placeholder.
- `app/(app)/profile/work/[id]/page.tsx`: REWRITTEN as a redirect - looks up the post's author and 308s to `/{username || id}/work/{id}`. Old bookmarks and share links keep working; the old URL no longer renders the post itself.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Post URLs are /{username}/work/{id}

- New route: `app/(app)/[username]/work/[id]/page.tsx` - full post detail, kept inside the `(app)` group so it has the app chrome. Validates that the handle in the URL matches the author, else `notFound()`.
- `components/work/WorkCard.tsx`: title link, eye/views link, and share URL all now `/{username || id}/work/{postId}`.
- `app/(app)/[username]/page.tsx`: post list links updated.
- `app/(app)/profile/saved-work/page.tsx`: updated, depends on `post.professional.user.username` being selected.
- `components/navigation/Sidebar.tsx`: trending items now link to `/work/{id}` - INCOMPLETE, needs the author handle to be a proper `/{username}/work/{id}`.
- STILL OLD: `app/api/notifications/route.ts:87` builds `/profile/work/{id}`; `app/(app)/profile/work/actions.ts` redirects to `/profile/work/{id}` after create/update; `app/(app)/profile/work/page.tsx` list links; `app/(app)/profile/work/[id]/edit/page.tsx` back link.
- The old `app/(app)/profile/work/[id]/page.tsx` route still exists and still works.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Fix inflated view counts

- `lib/views/record-view.ts`: the dedupe check was wrapped in `if (viewerId)`, so a null viewer skipped it entirely and inserted a new row on every call. Anonymous hits inflated the counter without limit.
- Now returns early with the current count when `viewerId` is null - anonymous views are not counted at all, since they cannot be deduped.
- Structural fix, not a patch: an undefined viewer has no identity to compare against, so refusing to count is the only correct behaviour short of adding a cookie/IP hash.
- Existing inflated counts are NOT corrected by this change; affected rows keep their current `views` value.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - See more no longer underlines the title

- Root cause: the see-more `<button>` lived INSIDE the title `<Link className="group">`, and the title had `group-hover:underline`. Hovering the button therefore underlined the headline.
- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: the `<Link>` now closes before the button, making the button a sibling.
- Side effect: `e.preventDefault()` / `e.stopPropagation()` on the button are now redundant but harmless, left in place.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Suppressed html-level hydration warning

- `app/layout.tsx`: added `suppressHydrationWarning` to the `<html>` element.
- Cause was NOT app code: a browser extension injects `data-mbtss-nonce` into `<html>` after SSR, so React reported an attribute mismatch on every page.
- Scoped to the `html` element's own attributes only - mismatches in children still report.
- If hydration errors appear again elsewhere, this is not hiding them.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-05 - See more counts as a view

- New `app/api/work-view/[id]/route.ts`: POST reads the Supabase session and calls `recordWorkView(id, userId)`.
- `components/work/WorkCard.tsx`: pressing "see more" fires the view once per mount (`viewed` guard) and updates the displayed count from the response. Added `viewCount` state so the number updates without a refetch.
- Uniqueness is handled by the existing `recordWorkView` logic: it checks `workView.findFirst({ workPostId, viewerId })` and returns the current count without incrementing if the viewer already has a row. Repeated clicks from the same user do not add views.
- Logged-out viewers pass `viewerId: null`, so each click creates a row - those are NOT deduped by the current implementation.
- Only WorkCard wired up; RecruitmentCard see-more does not record a view.
- First attempt failed because the edit used 18-space indentation while the file has 16; matched exactly on retry.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - See more restyled

- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: the see-more/see-less button dropped `font-semibold` and `text-gray-500`, now `text-[15px] text-brand-dark hover:underline`. Size unchanged.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Rails forward wheel to the feed

- New `components/navigation/ScrollBridge.tsx`: a document-level `wheel` listener that finds the nearest `[data-scroll-bridge]` ancestor of the event target and adds `deltaY` to `<main>.scrollTop`.
- Mounted in `app/(app)/layout.tsx`.
- Both rails tagged `data-scroll-bridge`.
- Rails stay `overflow-hidden`; content is still clipped if taller than the viewport.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Feed headings are black

- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: card titles `text-brand-dark` -> `text-near-black`.
- `app/(app)/[username]/page.tsx`: role titles on the profile page likewise.
- `app/(app)/recruitments/page.tsx`: recruitment list titles likewise.
- Untouched (still brand-coloured): the Recruitments sidebar badge, the "See all recruitments" link, saved-work/profile-recruitments titles, and small accent links. Those are not feed headings.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Profile post list matches feed typography

- `app/(app)/[username]/page.tsx`: post title 15->17px, post body 14->16px `text-near-black`, meta row 13->14px. Role title 15->17px, role meta 14->16px `text-near-black`.
- Now consistent with `WorkCard` / `RecruitmentCard`.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - BUGFIX: username route was outside the app layout

- The route was created at `app/[username]/page.tsx`, OUTSIDE the `(app)` route group, so it never rendered `app/(app)/layout.tsx` - no TopNav, no sidebar, no right rail, no grey background. That is why it looked like a bare unstyled page.
- Moved to `app/(app)/[username]/page.tsx`.
- Lesson: route groups `(name)` only apply to pages nested INSIDE them. Any new page that should have chrome must live under `app/(app)/`.
- Verified: file moved; no build/lint run.

### 2026-11-05 - Username page uses the old profile dashboard design

- `app/[username]/page.tsx`: REWRITTEN. Ported the previous `/profile` dashboard layout - cover banner, overlapping 24px avatar, name + @username, title/organization, location + counts + availability stats row, bio, skill chips, tab strip with underline, then the posts (professional) or roles (recruiter) list.
- Wrapped in a single `.card` with `overflow-hidden` so the cover clips to the rounded corners; adds `pt-6 pb-4` to match the feed column rhythm.
- Owner sees "Edit profile"; visitors see Save + Contact buttons.
- Empty states now differ for owner vs visitor ("You haven't posted..." vs "No work posted yet.").
- Verified: file written; no build/lint run.

### 2026-11-05 - Auto usernames + /profile redirects per person

- `lib/auth/ensure-user.ts`: new `generateUsername(name)` builds first-word-lowercase + 3-5 random digits, retries up to 10 times against the unique index, falls back to a timestamp suffix. Called during user creation and stored on the row.
- `app/(app)/profile/page.tsx`: REWRITTEN as a redirect - `/profile` now sends the visitor to `/${username || id}`, so it resolves per person instead of showing one shared page. The old dashboard content (cover, identity block, own posts/roles list) was replaced.
- `components/navigation/Sidebar.tsx`: profile card links to `/${username}` when known, else `/profile`.
- `/profile/*` sub-routes (feed, work, settings, notifications, saved-*) are untouched and still resolve statically ahead of `app/[username]`.
- LOST: the old `/profile` dashboard view (cover image, stats, post list). It was the previous "my profile" page; profile viewing now happens on the username route.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Profile URLs are now /username

- New route: `app/[username]/page.tsx` resolves by `username` OR `id`, so it works for users without a handle.
- Deleted the short-lived `app/profile-[handle]/page.tsx` route.
- `components/work/WorkCard.tsx` and `app/(app)/explore/page.tsx`: profile links now `/${username || id}`.
- STILL OLD (`/profile/professionals/<id>`): `components/messages/MessagesList.tsx:72`, `app/(app)/profile/saved-professionals/page.tsx:44`, `app/(app)/profile/work/[id]/page.tsx:160`. These only carry an id and need their queries widened to select `username`.
- RISK: a root-level dynamic route catches any unmatched single-segment path; static routes still win, but typos now 404 from this route instead of a generic not-found.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Stop fabricating usernames

- Root cause: `username` was never stored at registration (confirmed null in the DB). The apparent "hardcoded username" was `handleOf()` in `WorkCard`, which built a fake handle from the email local-part.
- `components/work/WorkCard.tsx`: `handleOf` reduced to `username ? '@' + username : ''`; the meta line now renders only when a real username or a professional title exists.
- `components/navigation/Sidebar.tsx`: profile card no longer prints the literal `@username` fallback; the handle line renders only when `user.username` is set.
- Profile links already used user IDs (`/profile/professionals/<id>`), so nothing depended on a username for routing.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Settings username: edit gating and instant sync

- `components/settings/ProfessionalSettingsForm.tsx` and `RecruiterSettingsForm.tsx`:
  - Removed `onFocus={() => setEditingUsername(true)}` - clicking the field no longer starts editing. Only the Edit button does.
  - Username input changed from uncontrolled (`defaultValue={props.username}`) to controlled (`value` + `onChange` with a local `usernameValue` state).
  - Added `useEffect` syncing `usernameValue` from `props.username`, so a saved value shows immediately without a refresh.
- Root cause of the stale display: `defaultValue` only applies on mount; React does not rewrite an uncontrolled input when props change.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Body text darkened to near-black

- `components/work/WorkCard.tsx`, `components/recruitments/RecruitmentCard.tsx`, `app/(app)/recruitments/[id]/page.tsx`: all 16px body copy changed from `text-gray-600` to `text-near-black`.
- Covers collapsed summaries, expanded section bodies, and detail-page sections.
- Headings unchanged (already near-black by default).
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Unified body text at 16px

- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: expanded section headings 14->15px, section body 14->16px `text-gray-600`. Body text no longer shrinks when "see more" is pressed.
- `app/(app)/recruitments/[id]/page.tsx`: meta 14->15px, section headings 14->15px, body 14->16px `text-gray-600`, closing date 14->15px.
- Result: collapsed summary, expanded sections, and detail page all render body copy at 16px.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Card typography restored, page background #F4F4F4

- Reverted the earlier downsizing: both cards back to avatar/meta/handle 15px, title 17px, body 16px gray-600, see-more and Apply 15px, skills 15px.
- `app/(app)/layout.tsx`: page bg `#f4f5f7` -> `#F4F4F4`.
- `app/globals.css`: unlayered `body` background `#ffffff` -> `#F4F4F4` (this is the rule that actually wins - remember the duplicate-rule gotcha).
- Note: the layered `body` rule inside `@layer base` may still say white; the unlayered one overrides it.
- The Apply/Send DM/Send Email button style lives in a `const applyBtn` near the top of `RecruitmentCard.tsx`, NOT inline - an inline-match edit failed because of this.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - How to apply field

- `prisma/schema.prisma`: `Recruitment` gains `applyInstructions String?`.
- `components/recruitments/RecruitmentForm.tsx`: new "How to apply" textarea placed immediately before the apply-method selector.
- `app/(app)/profile/recruitments/actions.ts`: extract + create + update persist `applyInstructions`.
- `components/recruitments/RecruitmentCard.tsx`: "How to apply" added to the expanded sections; also shown clamped to 2 lines when collapsed, above the apply button.
- `app/(app)/recruitments/[id]/page.tsx`: new "How to apply" block before the closing date.
- Migration: `supabase/011_recruitment_apply_instructions.sql`.
- REQUIRED: run the SQL, then `npx prisma generate` (previous generate attempt failed on a Windows file lock).
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Recruiter composer restored

- BUG: when the layout was rebuilt for the HelpBnk reference, the home composer became a button that always opened `WorkComposerModal`. Recruiters clicking "Post a role" got the work-post form, and `/profile/recruitments/new` became unreachable from the feed.
- New file: `components/recruitments/RecruitmentComposerModal.tsx` - same modal pattern as `WorkComposerModal`, wrapping `RecruitmentForm`.
- `app/(app)/home/page.tsx`: added `isRecruiter`; composer now renders `RecruitmentComposerModal` for recruiters and `WorkComposerModal` otherwise.
- `/profile/recruitments/new` page still exists and still works.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Salary opt-out and three apply methods

- `prisma/schema.prisma`: `Recruitment` gains `salaryHidden Boolean @default(false)` and `applyMethod String @default("LINK")`.
- `components/recruitments/RecruitmentForm.tsx`: REWRITTEN. Salary field has a "Prefer not to say" toggle that replaces the input with a placeholder; apply section is now three selectable cards - Apply to link (url input), Send DM (no input), Send Email (email input). Hidden inputs carry `salaryHidden` and `applyMethod`.
- `app/(app)/profile/recruitments/actions.ts`: extract() reads `salaryHidden` / `applyMethod`; create and update persist them; `salaryRange` is nulled when hidden.
- `components/recruitments/RecruitmentCard.tsx`: new `ApplyAction` component - LINK renders "Apply" (new tab, falls back to detail page), DM renders "Send DM" linking to `/messages?to=<username>`, EMAIL renders "Send Email" as a `mailto:`.
- `app/(app)/recruitments/[id]/page.tsx`: salary omitted from the meta line when `salaryHidden`.
- Migration written: `supabase/010_recruitment_salary_hidden_apply_method.sql` (adds `salaryHidden` boolean default false, `applyMethod` text default 'LINK'). Matches the style of `007_add_apply_url.sql`.
- REQUIRED: run that SQL in Supabase, then `npx prisma generate`. Until both are done, recruitment queries will fail.
- Verified: edits confirmed by tool results; NO build, NO prisma generate, NO migration run.

### 2026-11-05 - Feed cards scaled down to detail-page size

- IMPORTANT: an earlier attempt to match collapsed text size did NOT apply - `search_code` showed the excerpt still at `text-[16px]`. Redone here.
- `components/work/WorkCard.tsx`: avatar initials 15->14, meta row 15->14, handle line 15->14, title 17->15, excerpt 16->14 gray-700, see-more button 15->14, skills 15->14.
- `components/recruitments/RecruitmentCard.tsx`: same scale, plus Apply button 15->14.
- Net: whole card now 14px body / 15px title, matching `recruitments/[id]/page.tsx`. Text no longer changes size when "see more" is pressed.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - Card expanded typography matched to detail page

- `components/work/WorkCard.tsx` and `components/recruitments/RecruitmentCard.tsx`: section labels changed from small uppercase grey (`text-[12px] font-bold uppercase tracking-wide text-gray-400`) to `text-[14px] font-semibold` near-black headings, matching `app/(app)/recruitments/[id]/page.tsx`.
- Body text in sections changed from `text-[16px] text-gray-600 whitespace-pre-line` to `text-[14px] text-gray-700 whitespace-pre-wrap`, also matching the detail page.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-05 - RecruitmentCard see more shows all fields

- `components/recruitments/RecruitmentCard.tsx`: expanded state now renders Description / Responsibilities / Requirements / Salary / Closing date as labelled sections instead of unclamping one paragraph.
- `Recruitment` type extended with `responsibilities`, `requirements`, `salaryRange`, `closingDate`.
- Toggle only renders when at least one section has content.
- Note: `/api/home` uses `include` on recruitments, so these fields should already be present - not verified against a live response.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - WorkCard see more shows all fields

- `components/work/WorkCard.tsx`: expanded state no longer just unclamps one excerpt. It renders every populated field as a labelled section (Purpose / Challenge / Goal / Situation / Approach / Action / Solution / Contribution / Result / Metrics), same pattern as the Trending dropdown.
- No API change needed - `/api/home` already returns full work posts via `include` (verified in `app/api/home/route.ts`).
- `Post` type extended with the additional fields.
- The toggle now renders only when at least one section exists, so posts with no prose get no button.
- RecruitmentCard NOT yet upgraded the same way - still unclamps description only.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed cards get see more / see less

- `components/work/WorkCard.tsx`: excerpt unclamps when expanded; "see more" / "see less" button added under it. New `expanded` state.
- `components/recruitments/RecruitmentCard.tsx`: same treatment for the description block.
- The button sits INSIDE the wrapping `<Link>`, so it calls `preventDefault()` and `stopPropagation()` to avoid navigating when toggling.
- "see more" is shown whenever an excerpt/description exists, not only when text actually overflows the clamp. Simple and predictable, but short posts will show a useless toggle.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Trending dropdown shows full post content

- `app/api/trending/route.ts`: select widened to include `goal`, `approach`, `solution`, `contribution`, `metrics`, `situation`, `action`, `skills`, `createdAt`.
- `components/navigation/Sidebar.tsx`: expanded state now renders every populated field as a labelled section (Purpose / Challenge / Goal / Situation / Approach / Action / Solution / Contribution / Result / Metrics), plus skill chips and a footer with likes + views.
- Added a "View post →" link in the footer with `stopPropagation` so it navigates without toggling the dropdown.
- `TrendingPost` type extended to match the new API payload.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Trending dropdown affordance

- `components/navigation/Sidebar.tsx`: added a `ChevronIcon` to each trending row, pointing down when collapsed and up when expanded, so the item reads as a dropdown. Title now in a flex row with the chevron on the right.
- Behavior unchanged: click anywhere on the row to toggle; content (full title, excerpt, likes) drops open in place.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Trending items expand in place instead of navigating

- `components/navigation/Sidebar.tsx`: trending items are now `<button>`s, not links. Clicking expands the item to show the full title (clamp removed), the excerpt, and the like count; clicking again collapses it.
- Added `expandedId` state (`string | null`); only one item expands at a time.
- `compactCount` is used again, so the earlier unused-import concern is resolved.
- Tradeoff: there is now NO way to open the actual post from Trending. If navigation is needed, add a "View post" link inside the expanded state.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Trending list simplified to titles only

- `components/navigation/Sidebar.tsx`: Trending items reduced to just the post title - removed rank number, excerpt, and like count. List spacing `space-y-3` -> `space-y-2`.
- `compactCount` may now be unused in this file - remove the import if lint flags it.
- Recruitments block untouched (still shows org/location and type/time).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed tabs: tighter spread

- `app/(app)/home/page.tsx`: inner wrapper `flex w-full justify-between` -> `flex justify-between gap-12`. Tabs no longer stretch to the column edges; they keep a fixed 48px gap between them and stay centered as a group.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed tabs: centered spread

- `app/(app)/home/page.tsx`: tab row wrapped in an inner `flex w-full justify-between` so tabs spread across the feed width while the outer row stays centered.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Trending + Recruitments moved to left column

- `components/navigation/Sidebar.tsx`: REWRITTEN. Promo cards replaced with Trending (lime tint `#effadb`, badge `#D4F77B`, rank numbers and likes in `#7a9c3a`) and Recruitments (sky tint `#e8f2fe`, brand-dark accents). Profile card kept on top.
- Both blocks pull from `/api/trending` and `/api/recruitments` via `useCached`, same endpoints as before.
- `components/navigation/RightRail.tsx`: REWRITTEN. Trending and Recruitments blocks removed; only the "People to discover" gradient card remains. `relativeTime`/`compactCount` imports dropped.
- Font sizes in the left column reduced to 13/12px to fit the narrower 240-300px rail.
- Verified: files written; no build/lint run; NOT visually verified.

### 2026-11-04 - Only the feed scrolls

- `app/(app)/layout.tsx`: outer wrapper `overflow-y-auto` -> `overflow-hidden`; inner flex row gets `h-full`; `<main>` becomes the sole scroll container (`h-full overflow-y-auto scroll-hidden`).
- `components/navigation/Sidebar.tsx`: `overflow-y-auto` -> `overflow-hidden`.
- `components/navigation/RightRail.tsx`: `overflow-y-auto` -> `overflow-hidden`.
- Result: rails are pinned; only the center feed scrolls.
- Tradeoff: if a rail's content is taller than the viewport it will now be clipped rather than scrollable. The right rail's spacer + 3 cards should fit, but worth checking on short screens.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed tabs centered

- `app/(app)/home/page.tsx`: tab row `flex justify-between` -> `flex justify-center`. Tabs now cluster in the middle of the feed column instead of spreading to the edges.
- Supersedes the previous full-width spread.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed tabs spread full width

- `app/(app)/home/page.tsx`: tab row `flex justify-end` -> `flex justify-between` so tabs distribute across the feed column width.
- Each tab keeps its own horizontal padding (`px-3`), so spacing between labels is now even rather than clustered right.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Full layout rebuild to match reference screenshot

Reference: `Screenshot 2026-11-04 155409.png` (HelpBnk).

- `components/navigation/Sidebar.tsx`: REWRITTEN. No longer a nav rail - now a left column with a profile card (avatar, name, @username) and two gradient promo cards (purple competition, blue mentorship). Nav moved to TopNav.
- `app/(app)/layout.tsx`: REWRITTEN. Grey page bg `#f4f5f7`, TopNav on top, scroll container `h-[calc(100vh-57px)]`, 3-column flex with `gap-4 px-4`, shell `max-w-[1360px]`.
- `app/globals.css`: `.feed-post` regained a soft shadow, `rounded-2xl` (1rem), `p-4` padding.
- `app/(app)/home/page.tsx`: feed column now `pt-6 pb-4` with no grey background (page bg supplies grey).
- LOST: the sidebar Search popup and Profile dropdown lived in the old Sidebar.tsx and were removed with it. Search nav item in TopNav currently links to /explore instead.
- LOST: sidebar "Boost visibility" button and Sign out (now only in TopNav avatar menu).
- Verified: files written; NO build run; NOT visually verified.

### 2026-11-04 - TopNav rebuilt: logo, centered nav, right icons

- `components/navigation/TopNav.tsx`: restructured to match the HelpBnk reference screenshot (`Screenshot 2026-11-04 155409.png`).
- Left: `POSITIONED.PRO` logo. Center (absolutely centered): Home / Explore / Search with icons; active item gets `bg-gray-100` pill. Right: messages + notifications icons, then avatar menu.
- Settings stays inside the Profile avatar dropdown (existing `menuItems`), per user instruction.
- Added `usePathname` for active state; imported `HomeIcon`, `SearchIcon`.
- Note: Explore and Search both point at `/explore` for now - Search should probably open the search popup instead.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Layout restored to TopNav shell (PARTIAL)

- `app/(app)/layout.tsx`: rewritten to match the original recovered from build source maps - `TopNav` at top, shell `max-w-[1360px] h-[calc(100vh-53px)]`, no outer gutter.
- RESTORED WITH CONFIDENCE: TopNav placement, shell max width, height calc.
- NOT RESTORED - still needs original design: the left Sidebar was originally a grey panel holding colored Trending and Recruitments cards, NOT the nav rail that exists today. Current Sidebar.tsx is a nav rail and was not rewritten.
- NOT RESTORED: original RightRail spacing and the removed Search / People to discover / Visibility cards (Visibility was deleted this session).
- WARNING: the app now has BOTH TopNav and the left nav rail, which is likely not the intended design.
- Verified: file written; NOT visually verified; no build run.

### 2026-11-04 - Right rail gap set to 5px

- `components/navigation/RightRail.tsx`: `pl-[7px]` -> `pl-[5px]`.
- Third reduction; 41 -> 10 -> 7 -> 5px.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail gap set to 7px

- `components/navigation/RightRail.tsx`: `pl-[10px]` -> `pl-[7px]`.
- Second reduction after 10px still read wider than the left rail's gap.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail gap set to 10px

- `components/navigation/RightRail.tsx`: `pl-[41px]` -> `pl-[10px]`.
- User measured the left rail's visible feed gap at ~10px and wants the right to match.
- Note: the two are not equivalent measurements - left is padding inside a white rail, right is padding inside a grey rail - so a pixel match may still read differently.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Root cause: nav links were not full width

- `components/navigation/Sidebar.tsx`: primary nav links and the Settings link gained `w-full` (Profile and Search already had it).
- Why the padding never showed: the nav `<Link>`s had no `w-full`, so they shrank to content width instead of spanning the aside's content box. The sidebar's `pr-[41px]` was therefore never visible as a gap - the pills ended early, leaving only a few px. This is why the user saw ~10px while the CSS said 41px.
- Now pills span `240 - 16 - 41 = 183px` and the 41px right gap is real.
- Verified: edits confirmed by tool results; NOT visually verified.

### 2026-11-04 - Rail-to-feed gaps equalized at 41px

- `components/navigation/RightRail.tsx`: `pl-2` -> `pl-[41px]` to match the left rail's `pr-[41px]`.
- Both feed-facing gaps are now 41px.
- Side effect: the rail's cards are 33px narrower than at `pl-2`; width stays 360px.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail pulled toward the feed

- CORRECTION: an earlier edit set `pl-8` (32px), which moved content AWAY from the feed. Wrong direction.
- Final: `components/navigation/RightRail.tsx` `pl-4` -> `pl-2` (16px -> 8px), moving the rail's content closer to the feed.
- Rule: increasing the right rail's LEFT padding pushes content away from the feed; decreasing it pulls content toward the feed. The `<aside>` box itself never moves because its width is fixed and it is a flex sibling.
- Rail width unchanged at 360px; grey background still spans the full box.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Right outer gutter removed

- `app/(app)/layout.tsx`: centering wrapper `px-6` -> `pl-6` (left gutter kept, right removed).
- The white strip on the far right was the page background showing through the 24px gutter beyond the grey right rail.
- Layout is now asymmetric at the outer edges: 24px left, 0 right.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail widened to 360px

- `components/navigation/RightRail.tsx`: `w-[300px]` -> `w-[360px]`.
- Feed flexes down 60px automatically (1520 - 240 - 360 = 920px).
- Rail cards have no fixed width, so they widen with the rail.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - +5px more right padding in left sidebar

- `components/navigation/Sidebar.tsx`: aside `pr-9` (36px) -> `pr-[41px]`.
- Running total right inset: 41px vs 16px left.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Extra 20px right gap in left sidebar

- `components/navigation/Sidebar.tsx`: aside `px-4` -> `pl-4 pr-9` (16px left, 36px right).
- Purpose: user wanted 20px more space between the pill's right edge and the sidebar's right edge; widening the rail alone did not do this because pills are `w-full`.
- Note: this also applies below `xl` to the 88px icon rail (36px right padding there is a lot).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Left sidebar +20px

- `components/navigation/Sidebar.tsx`: `xl:w-[220px]` -> `xl:w-[240px]`.
- Right rail stays 300px; feed flexes down by 20px (1520 - 240 - 300 = 980px).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Sidebar padding made symmetric at all breakpoints

- `components/navigation/Sidebar.tsx`: aside `px-2 xl:pl-4 xl:pr-4` -> `px-4`.
- Removes the mixed base/override pair so neither side can win at a given breakpoint.
- Note: this also widens the 88px icon rail's horizontal padding from 8px to 16px below `xl`.
- Verified: edit confirmed by tool result; NOT visually verified.

### 2026-11-04 - Sidebar horizontal padding equalized

- `components/navigation/Sidebar.tsx`: all nav items `px-3` -> `px-4` (4 occurrences, replaceAll). Logo `px-2` -> `px-4` to match.
- Total horizontal inset per item: aside `xl:pl-4/pr-4` (16px) + item `px-4` (16px) = 32px each side.
- Rationale: items looked left-heavy because labels are left-aligned and did not fill the pill width; padding was already technically symmetric.
- Verified: edits confirmed by tool results; NOT visually verified.

### 2026-11-04 - Left rail widened

- `components/navigation/Sidebar.tsx`: `xl:w-[180px]` -> `xl:w-[220px]`.
- Right rail stays `w-[300px]`, so right is still 80px wider than left.
- Feed at xl: 1520 - 220 - 300 = 1000px.
- Labels are `hidden xl:inline`, so they show at this width with more room than at 180px.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail wider than left

- `components/navigation/RightRail.tsx`: `w-[240px]` -> `w-[300px]`.
- Left rail stays `xl:w-[180px]`, so the rails are intentionally unequal: right is 120px wider.
- Feed column is `flex-1 w-full`, so it loses 60px automatically at xl (1520 - 180 - 300 = 1040px feed).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Fix feed column overflow

- Symptom: right rail appeared very wide and covered the page after the feed cap was raised to 1100px.
- Cause: both rails are `flex-shrink-0` (180px + 240px) while the feed was capped at `max-w-[1100px]`; when the viewport is under 1520px the row cannot fit, so overflow pushed the rail over the content.
- Fix: `app/(app)/home/page.tsx` and `app/(app)/explore/page.tsx` feed column `max-w-[1100px]` -> `w-full` (no cap). The column now flexes and shrinks normally.
- Verified: edits confirmed by tool results; NOT visually verified.

### 2026-11-04 - Narrow left rail, grey right rail, wider feed

- `components/navigation/Sidebar.tsx`: `xl:w-[360px]` -> `xl:w-[180px]` (half). Labels use `hidden xl:inline` and now get cramped - may need to hide them.
- `components/navigation/RightRail.tsx`: `w-[360px]` -> `w-[240px]`, added `bg-gray-100`. Inner `.card` / `.card-gradient` blocks stay white.
- `app/(app)/home/page.tsx`: feed `max-w-[800px]` -> `max-w-[1100px]`.
- `app/(app)/explore/page.tsx`: feed `max-w-[800px]` -> `max-w-[1100px]`.
- Math at xl: 180 + 1100 + 240 = 1520 = shell max width, exact fit.
- Open: left sidebar labels likely overlap/cramp at 180px; needs visual check.
- Open: right rail inner spacing not tuned for 240px (was designed at 360px).
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed tabs as sticky white top bar (REVERTED)

> Reverted by user request. The layout below is no longer in effect; tabs are back inline and right-aligned in the grey column. Kept for history only.

- `app/(app)/home/page.tsx`: tabs moved out of the padded column into a `sticky top-0 z-10 bg-white` bar spanning the feed column, with `border-b border-[#e5e5e5]`.
- White bar meets the white left/right rails; feed content below keeps `bg-gray-100`.
- Column div lost `px-4 pt-12`; those moved to an inner `px-4 pb-4 pt-4` wrapper so the bar can sit flush.
- Sticky requires a scroll container: the actual scroller is `<main>` in `app/(app)/layout.tsx`, so this should pin correctly.
- Explore page tabs NOT changed - still inline in the column.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Work composer as a popup

- New file: `components/work/WorkComposerModal.tsx` - backdrop modal wrapping `NewWorkForm`, closes on backdrop click and Escape, locks body scroll while open.
- `app/(app)/home/page.tsx`: composer is now a `<button>` opening the modal, no longer a link to `/profile/work/new`. Added `composerOpen` state.
- `NewWorkForm` unchanged; on success its server action still `redirect(`/profile/work/<id>`, 'push')` (actions.ts:110), which navigates away and unmounts the modal.
- `/profile/work/new` page left intact so existing links (profile, empty states) still work.
- Open: `composeHref` is still used by the empty-state button; composer label still switches on role.
- Open: recruiter flow (`/profile/recruitments/new`) still navigates as a page - not converted.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Tints back to white, grey feed background

- `app/globals.css`: `.tint-0` and `.tint-1` back to `#ffffff` (sky blue / peach reverted).
- `app/(app)/home/page.tsx`: feed column gained `bg-gray-100 min-h-full` - grey behind the feed only, not the whole page.
- Shadows remain removed from `.feed-post`.
- Open: Explore page feed column not given the grey background; ask if it should match.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed cards: no shadow, colored tints

- `app/globals.css`: `.feed-post` lost its box-shadow and hover box-shadow; cards are now flat color blocks.
- IMPORTANT: there are TWO `.feed-post` rules (line ~71 in `@layer components`, line ~130 unlayered). Unlayered wins, so BOTH had to be changed; changing only the layered one had no visual effect.
- `.tint-0`: `#ffffff` -> `#dbeafe` (sky blue) - this is the first card.
- `.tint-1`: `#fdf6e8` -> `#ffe8d6` (light peach).
- `tint-2..4` unchanged; cards still cycle `tint-${i % 5}`.
- "light pitch" was a typo for "light peach" - confirmed by the user. `#ffe8d6` is correct, no further change needed.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Right rail search box removed (position preserved)

- `components/navigation/RightRail.tsx`: removed the search input + SearchIcon block at the top of the rail.
- Replaced with an equivalent-height spacer (`h-[40px]`, aria-hidden) so the cards below keep their exact vertical position instead of jumping up.
- `SearchIcon` import may now be unused in this file - remove if lint complains.
- Search now lives only in the left sidebar (popup).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Sidebar Search item with popup

- `components/navigation/Sidebar.tsx`: new Search nav button directly below the primary items (after Explore), styled like the other nav rows.
- Clicking opens a centered modal overlay (`fixed inset-0 z-50`) with an autofocused input; backdrop click or Escape target closes via `onClick` on the backdrop.
- Typing shows a "Search for ..." row linking to `/explore?q=<term>`.
- New state: `searchOpen`, `searchTerm`.
- Open: `/explore` does not yet read the `?q=` param - search does not actually filter anything.
- Open: no Escape-key handler; only backdrop click closes it.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Right rail pushed down, Boost card removed

- `components/navigation/RightRail.tsx`: aside `py-4` -> `pb-4 pt-12` (top 16px -> 48px, matching the feed column's `pt-12`).
- Removed the "Get seen / Boost visibility" `card-gradient` block (was lines 139-150).
- The sidebar still has its own "Boost visibility" button (Sidebar.tsx ~line 199) - left in place, not part of this request.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed nudged down

- `app/(app)/home/page.tsx`: feed column `pt-6` (24px) -> `pt-12` (48px).
- Small correction after the feed was pulled too far up.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed pulled up (top padding reduced)

- `app/(app)/home/page.tsx`: feed column `pt-[110px]` -> `pt-6` (24px).
- Supersedes the 110px alignment attempt, which was over-corrected.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Align feed top with Home pill

- `app/(app)/home/page.tsx`: feed column `pt-8` -> `pt-[110px]` to line the tabs up with the Home pill.
- Pill offset estimate: aside `py-4` (16) + logo line (~28) + logo `mb-4` (16) + nav `mt-[50px]` (50) = ~110px from viewport top.
- This is an estimate from class values, not a measurement. Verify visually.
- Fragile: if logo size, nav margin, or sidebar padding changes, this 110px must be re-derived.
- Verified: edit confirmed by tool result; NOT visually verified.

### 2026-11-04 - More top padding on home feed column

- `app/(app)/home/page.tsx`: feed column `p-4` -> `px-4 pb-4 pt-8` (top 16px -> 32px, sides/bottom unchanged).
- Explore page untouched; apply same if wanted.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed tabs: bold text, no active pill

- `app/(app)/home/page.tsx`: tab buttons dropped `bg-gray-200 rounded-full` pill on active state.
- Active: `font-bold text-near-black`. Inactive: `font-semibold text-gray-400 hover:text-gray-600`.
- Bolder overall (font-medium -> semibold/bold).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Feed tabs right-aligned

- `app/(app)/home/page.tsx`: tabs no longer wrapped in `.page-header` (lost sticky + card background); now in a plain `flex justify-end` row sitting on the page background.
- The card that was removed is the `.page-header` wrapper around the tabs, NOT the composer.
- Correction: the composer card was mistakenly deleted along with it and has been restored (card + avatar + composeLabel + Post button).
- Side effect: tabs are no longer sticky.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Feed tabs moved above composer

- `app/(app)/home/page.tsx`: swapped the sticky filter-tab header and the composer card so order is tabs -> composer -> feed.
- Tabs keep `.page-header` sticky styling and `-` it now sticks above the composer.
- Explore page untouched (its tabs were already the first element).
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Larger feed card typography

- `components/work/WorkCard.tsx`: meta row & handle 14 -> 15px, title 14 -> 17px, excerpt 14 -> 16px, skills 14 -> 15px, avatar initials 14 -> 15px.
- `components/recruitments/RecruitmentCard.tsx`: same scale; Apply button 14 -> 15px.
- `app/globals.css`: `.feed-action` text 13px -> 14px.
- Badges (BOOSTED / HIRING) left at 10px intentionally.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Outer page gutter on app layout

- `app/(app)/layout.tsx`: centering wrapper `flex justify-center h-full` -> `flex justify-center h-full px-6`.
- Effect: whole 3-column block inset 24px from left and right viewport edges.
- This is the outer gutter the user was asking about (previous change only adjusted padding inside the rails).
- Interaction: shell is `max-w-[1520px] w-full`, so the gutter eats into available width on narrower screens rather than widening the page.
- Verified: edit confirmed by tool result; no build/lint run.

### 2026-11-04 - Side rails inset from outer edges

- `components/navigation/Sidebar.tsx`: aside `xl:pl-2` -> `xl:pl-4` (8px -> 16px left inset).
- `components/navigation/RightRail.tsx`: aside `pr-2` -> `pr-4` (8px -> 16px right inset).
- Effect: 8px more breathing room on each outer edge (user asked for >= 5px).
- Note: inner paddings (`xl:pr-4` on sidebar, `pl-4` on right rail) unchanged, so the gap between rails and feed is the same.
- At `xl`: 360 + 800 + 360 still fits in 1520 since padding is inside the 360px boxes.
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Wider feed column, equal side rails

- `app/(app)/layout.tsx`: shell `max-w-[1360px]` -> `max-w-[1520px]`.
- `app/(app)/home/page.tsx`: feed column `max-w-[640px]` -> `max-w-[800px]`.
- `app/(app)/explore/page.tsx`: feed column `max-w-[640px]` -> `max-w-[800px]`.
- Rails unchanged: left Sidebar `xl:w-[360px]`, right RightRail `w-[360px]` - already equal.
- Math at xl: 360 + 800 + 360 = 1520, exact fit.
- Below `xl` the left rail is `w-[88px]`, so the layout is NOT symmetric there (unchanged behavior).
- Verified: edits confirmed by tool results; no build/lint run.

### 2026-11-04 - Explore page with three tabs

- New file: `app/(app)/explore/page.tsx` - tabs Trending / Professionals / Recruiters.
- New file: `app/api/professionals/route.ts` - lists `ProfessionalProfile` (name, title, location, availability, top 5 skills).
- Changed: `components/navigation/Sidebar.tsx` - Explore `href` `/home` -> `/explore`.
- Data: Trending uses `/api/trending` (top 5 by likes/views), Recruiters uses `/api/recruitments` (5 newest open roles), Professionals uses new `/api/professionals`.
- UI: reuses `WorkCard`, `RecruitmentCard`, `Skeleton`; tab pills styled like home filters.
- Verified: files written and diff confirmed; no build/lint run yet.
- Open: Professionals list is unpaginated (take 50); no search/filter yet.

### 2026-11-04 - Sidebar nav gaps removed

- File: `components/navigation/Sidebar.tsx`
- Change: `<nav>` class `space-y-5 mt-[50px] mb-4` -> `mt-[50px] mb-4` (dropped `space-y-5`).
- Result: nav items stack flush; adjacent active pills touch. Pill height unchanged at 56px (`py-[17px]`).
- Side effect: nav block ~60px shorter (3 x 20px gaps removed); content below shifts up.
- Open: `rounded-[10px]` corners may show a notch where touching pills meet; not yet addressed.
- Verified: diff confirmed by tool result; no build/lint run.

### 2026-11-04 - Auto-update policy for this file

- File: `PROJECT_NOTES.md`
- Change: added a standing instruction section; this file is now updated on every task automatically.
- Why: user requested no prompting be needed to keep notes current.
- Verified: edit confirmed by tool result.

### 2026-11-04 - Sidebar active pill height

- File: `components/navigation/Sidebar.tsx`
- Change: active nav pill vertical padding `py-3` -> `py-[13px]` -> `py-[17px]`.
- Result: pill height 48px -> 50px -> 56px (current).
- Applies to: primary nav items, Profile button, Settings link (shared class string).
- Verified: class-string search only; no build/lint run.

### 2026-11-04 - Created working notes

- File: `PROJECT_NOTES.md` (this file).
- Purpose: persistent context for ongoing website work across chats.

---

## Conventions

- Prefer editing existing Tailwind classes over adding new CSS.
- Keep sidebar pill styling consistent across all active elements; they share one class string.
- Colors: active pill is `bg-near-black text-white`; inactive `text-gray-700 hover:bg-gray-100`.
- Border/neutral tone commonly `#e5e5e5`; brand accent via `brand` / `brand-dark` tokens.

---

## Problem Log / Gotchas

- `npx prisma generate` while the dev server is running writes the files but the running Node process keeps the OLD client in memory. Symptom: `Unknown field X for select statement on model Y` at runtime, even though the schema and generated client are correct. Hit this twice (Follow model, then Recruitment.country). Correct order: STOP the dev server -> `npx prisma generate` -> restart. Verify with `grep -c '<field>' node_modules/.prisma/client/index.d.ts` before restarting.

- NEVER delete `.next` while the dev server is running. Doing so leaves the live process serving from a half-deleted build tree and every request returns 500 with `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'` and `ENOENT ... routes-manifest.json`. Correct order: stop the server, delete `.next`, restart.

- `npx prisma generate` on Windows fails with `EPERM ... rename query_engine-windows.dll.node` when a Node process holds the DLL. Working fix: delete the locked engine file first, then regenerate.
- `taskkill` does not work from the bundled Git Bash; every flag form is rejected. Deleting the locked file is the reliable route.

- Several `edit_file` calls in this session reported success but the file was unchanged on the next read (and some notes writes failed with "Could not find exact match"). Always re-read or `search_code` after a critical edit instead of trusting the success status.

- `app/globals.css` duplicates several rules: `.card`, `.feed-post`, `body`, and the tints appear BOTH inside `@layer components` and again unlayered at the bottom ("unlayered so they are never tree-shaken"). Unlayered rules beat layered ones, so edits to the layered copy can silently do nothing. Always check for a second definition before trusting a style change.

- `edit_file` with multiple separate multi-line `oldText` blocks can silently fail to apply;
  re-verify with `search_code` afterwards. `replaceAll` on a short unique substring is more reliable.
- `search_code` / `search_files` surface a lot of `node_modules/` and `.next/` noise; scope to a
  folder (e.g. `components/`) or pass `include` globs.
- `.next/` holds stale compiled copies; never treat it as source of truth for styling values.
- Sidebar heights: pill height = content + 2 x `py`; 1px of pill height = 0.5px of `py` per side.

---

## Open questions / TODO

- Sidebar pill target height: currently 56px (TBD if this is final).
- No automated checks run recently; consider `npm run build` and lint before shipping.

## CORRECTED: RLS is complete

- Older entries in this log (015, and the boost-table entries) warn that "User, WorkPost, Recruitment, Like, SavedWork etc. may still be unrestricted". Those warnings are STALE and were repeated as current fact in conversation. Do not act on them.
- Verified against the live database with `scripts/check-all-rls.js`: **25 public tables, 0 with RLS disabled.** Every table has row-level security enabled.
- The gap those entries described was closed at some point outside this log. Ignore the old warnings; this section supersedes them.
- LESSON: a note saying "may be unrestricted" is a snapshot of a past state, not a standing fact. Re-check before repeating it as a current risk - otherwise the log starts producing false alarms, which is worse than having no log.
