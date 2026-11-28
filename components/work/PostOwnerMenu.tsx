'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { updatePostText, deleteWorkPost } from '@/app/(app)/profile/work/actions'
import { BoostPostMenuItem } from '@/components/work/BoostPostMenuItem'

type AspectRatio = '9:16' | '16:9'

/**
 * Owner-only 3-dots menu on a post. Opens a small dropdown with Edit and
 * Delete. Edit opens the edit Modal (caption + orientation); Delete opens the
 * confirm Modal.
 *
 * THE DROPDOWN IS PORTALED TO document.body. The author bar it sits in has an
 * inline `transform`, and a transformed ancestor becomes the containing block
 * for `position: fixed` children - which made an in-tree dropdown position
 * itself against the little header strip instead of the viewport, so it
 * appeared behind the post. Portalling restores viewport positioning.
 */
export function PostOwnerMenu({
  postId,
  initialCaption,
  initialAspect,
}: {
  postId: string
  initialCaption: string
  initialAspect: AspectRatio
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [caption, setCaption] = useState(initialCaption)
  const [aspect, setAspect] = useState<AspectRatio>(initialAspect)
  const [pending, start] = useTransition()
  const router = useRouter()
  const [err, setErr] = useState<string | null>(null)
  const [menuMsg, setMenuMsg] = useState<string | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // Auto-dismiss the boost toast so it does not linger.
  useEffect(() => {
    if (!menuMsg) return
    const t = setTimeout(() => setMenuMsg(null), 2500)
    return () => clearTimeout(t)
  }, [menuMsg])
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  // Anchor the dropdown under the dots, measured from the button's rect.
  const openMenu = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if ((t as HTMLElement).closest?.('[data-owner-menu]')) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        ⋯
      </button>

      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-owner-menu
            role="menu"
            style={{ position: 'fixed', top: pos.top, right: pos.right }}
            className="z-[45] w-36 overflow-hidden rounded-xl border border-line bg-[var(--modal)] shadow-lg"
          >
            <BoostPostMenuItem
              postId={postId}
              onDone={() => setOpen(false)}
              onError={(m) => { setMenuMsg(m); setOpen(false) }}
              onInfo={(m) => { setMenuMsg(m); setOpen(false) }}
            />
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); setTimeout(() => setEditing(true), 0) }}
              className="block w-full border-t border-line px-3 py-2 text-left text-[13px] text-ink hover:bg-surface-sunken"
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); setTimeout(() => setConfirmDel(true), 0) }}
              className="block w-full border-t border-line px-3 py-2 text-left text-[13px] text-rose-500 hover:bg-surface-sunken"
            >
              Delete
            </button>
          </div>,
          document.body
        )}

      {menuMsg &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-x-4 bottom-24 z-[130] mx-auto max-w-sm rounded-xl bg-[var(--modal)] px-4 py-3 text-center text-[13px] text-ink shadow-lg">
            {menuMsg}
            <button type="button" onClick={() => setMenuMsg(null)} className="ml-2 font-semibold text-brand">
              OK
            </button>
          </div>,
          document.body
        )}

      {typeof document !== 'undefined' &&
        createPortal(
          <>
          <Modal
            open={editing}
            onClose={() => setEditing(false)}
            title="Edit post"
            ariaLabel="Edit post"
            maxWidth="max-w-[520px]"
          >
            <div className="w-full flex-shrink-0 space-y-3 bg-[var(--modal)] text-ink" style={{minHeight: '40vh'}}>
              <label className="block text-[13px] font-medium text-ink">
                Caption
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-line bg-[var(--modal)] px-3 py-2 text-[14px] text-ink"
                />
              </label>

              <div>
                <span className="block text-[13px] font-medium text-ink">Orientation</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['9:16', '16:9'] as AspectRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspect(r)}
                      className={`rounded-xl border p-2 text-center text-[13px] ${aspect === r ? 'border-brand bg-brand-light text-ink' : 'border-line'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-ink-subtle">Media itself can't be changed here.</p>
              </div>

              {err && <p className="text-[13px] text-rose-500">{err}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const fd = new FormData()
                      fd.set('postId', postId)
                      fd.set('caption', caption)
                      fd.set('aspect', aspect)
                      const res: any = await updatePostText({}, fd)
                      if (res?.error) setErr(res.error)
                      else setEditing(false)
                    })
                  }
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
                >
                  {pending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            open={confirmDel}
            onClose={() => setConfirmDel(false)}
            title="Delete post"
            ariaLabel="Delete post"
            maxWidth="max-w-[420px]"
            fullScreenOnMobile={false}
          >
            <p className="text-[14px] text-ink">Delete this post? This can't be undone.</p>
            {err && <p className="mt-2 text-[13px] text-rose-500">{err}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const fd = new FormData()
                    fd.set('postId', postId)
                    const res: any = await deleteWorkPost(fd)
                    if (res?.error) {
                      setErr(res.error)
                    } else {
                      setConfirmDel(false)
                      // Stay on this page; re-fetch server data so the deleted
                      // card disappears from wherever it was rendered.
                      router.refresh()
                    }
                  })
                }
                className="rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {pending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </Modal>

          </>,
          document.body
        )}
    </>
  )
}
