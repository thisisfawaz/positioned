'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Modal } from '@/components/ui/Modal'
import { updatePostText, deleteWorkPost } from '@/app/(app)/profile/work/actions'

type AspectRatio = '9:16' | '16:9'

/**
 * Owner-only 3-dots menu on a post. Opens a popup to EDIT the caption and the
 * orientation, or DELETE the post. Media links are NOT editable - the edit
 * action (updatePostText) only touches caption + the media asset's aspect, so
 * an existing image/video is never replaced or removed.
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
  const [err, setErr] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Post options"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-40 w-36 overflow-hidden rounded-xl border border-line bg-[var(--modal)] shadow-lg">
          <button
            type="button"
            onClick={() => { setOpen(false); setEditing(true) }}
            className="block w-full px-3 py-2 text-left text-[13px] text-ink hover:bg-surface-sunken"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setConfirmDel(true) }}
            className="block w-full px-3 py-2 text-left text-[13px] text-rose-500 hover:bg-surface-sunken"
          >
            Delete
          </button>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit post" ariaLabel="Edit post">
        <div className="space-y-3">
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
            <p className="mt-1 text-[11px] text-ink-subtle">Media itself can’t be changed here.</p>
          </div>

          {err && <p className="text-[13px] text-rose-500">{err}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setEditing(false)} className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted">Cancel</button>
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

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete post" ariaLabel="Delete post">
        <p className="text-[14px] text-ink">Delete this post? This can’t be undone.</p>
        {err && <p className="mt-2 text-[13px] text-rose-500">{err}</p>}
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDel(false)} className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted">Cancel</button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const fd = new FormData()
                fd.set('postId', postId)
                const res: any = await deleteWorkPost(fd)
                if (res?.error) setErr(res.error)
              })
            }
            className="rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
