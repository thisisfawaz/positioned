'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { youtubeVideoId } from '@/lib/client/youtube'

/**
 * In-feed YouTube player with NO YouTube chrome.
 *
 * The video surface is a YouTube IFrame (controls hidden). ALL controls are our
 * own DOM so a horizontal drag on the timeline never fights the reel's vertical
 * scroll-snap. Playback is muted-autoplay when the card is >60% in view and
 * pauses when it leaves, so the feed behaves like a reel.
 *
 * The timeline is NOT drawn here: `VideoPlayer` exposes a handle and the caller
 * places `<VideoTimeline playerRef={...} />` wherever it wants (WorkCard puts it
 * in the caption block above the CTA). This keeps the bar in the normal flow of
 * the text/CTA section instead of floating over the media.
 */

// Minimal shape of the YouTube IFrame API bits we use.
type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (e: { data: number }) => void
      }
    }
  ) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const PLAYING = 1

let apiPromise: Promise<YTNamespace> | null = null

/** Loads the IFrame API exactly once, resolving with the YT namespace. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YTNamespace>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }
    if (!document.getElementById('youtube-iframe-api')) {
      const s = document.createElement('script')
      s.id = 'youtube-iframe-api'
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    } else if (window.YT?.Player) {
      resolve(window.YT)
    }
  })

  return apiPromise
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** What VideoPlayer hands to the caller so a timeline can drive it. */
export type VideoPlayerHandle = {
  seekTo: (seconds: number) => void
  /** Subscribe to position changes; returns an unsubscribe fn. */
  subscribe: (fn: (state: { current: number; duration: number }) => void) => () => void
  getDuration: () => number
}

export const VideoPlayer = forwardRef<
  VideoPlayerHandle,
  { videoUrl: string | null | undefined }
>(function VideoPlayer({ videoUrl }, ref) {
  const videoId = youtubeVideoId(videoUrl)
  // YouTube REPLACES the mount div with an iframe, so the mount node becomes
  // detached. Observe this STABLE wrapper instead - it is never replaced.
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  // Subscribers for the timeline(s).
  const listenersRef = useRef(
    new Set<(s: { current: number; duration: number }) => void>()
  )
  const emit = (current: number, duration: number) => {
    listenersRef.current.forEach((fn) => fn({ current, duration }))
  }

  // Create the player once the API is available.
  useEffect(() => {
    if (!videoId || !containerRef.current) return
    let cancelled = false

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !containerRef.current) return
        playerRef.current = new YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            playsinline: 1,
            disablekb: 1,
            iv_load_policy: 3,
            mute: 1,
            autoplay: 1,
          },
          events: {
            onReady: () => {
              if (cancelled || !playerRef.current) return
              playerRef.current.mute()
              setMuted(true)
              setReady(true)
              emit(playerRef.current.getCurrentTime(), playerRef.current.getDuration())
            },
            onStateChange: (e) => {
              if (!playerRef.current) return
              const YTs = window.YT?.PlayerState
              if (!YTs) return
              if (e.data === YTs.PLAYING) {
                setPlaying(true)
                emit(playerRef.current.getCurrentTime(), playerRef.current.getDuration())
              } else if (e.data === YTs.PAUSED || e.data === YTs.ENDED) {
                setPlaying(false)
              }
            },
          },
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy()
      } catch {
        // player may already be gone
      }
      playerRef.current = null
    }
  }, [videoId])

  // Autoplay (muted) when in view; pause when out of view.
  // NOTE: observe wrapperRef, NOT containerRef. YouTube replaces the mount div
  // with an iframe, so containerRef is detached and an observer on it never
  // fires - that was why nothing autoplayed on desktop OR mobile.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el || !ready) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const p = playerRef.current
        if (!p) return
        // Play as soon as the card is essentially on screen (10%), not only
        // once it is 60% in view - waiting for 60% made the video sit on the
        // thumbnail while the user was already looking at it.
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          p.mute()
          p.playVideo()
        } else {
          p.pauseVideo()
        }
      },
      { threshold: [0, 0.1, 0.6, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ready])

  // While playing, push position to subscribers so the timeline advances.
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const p = playerRef.current
      if (p) emit(p.getCurrentTime(), p.getDuration())
    }, 250)
    return () => clearInterval(id)
  }, [playing])

  // Expose seek + subscription to the caller (the timeline).
  useImperativeHandle(
    ref,
    () => ({
      seekTo: (seconds: number) => {
        const p = playerRef.current
        if (!p) return
        p.seekTo(seconds, true)
        emit(seconds, p.getDuration())
      },
      subscribe: (fn) => {
        listenersRef.current.add(fn)
        const p = playerRef.current
        if (p) fn({ current: p.getCurrentTime(), duration: p.getDuration() })
        return () => listenersRef.current.delete(fn)
      },
      getDuration: () => playerRef.current?.getDuration() ?? 0,
    }),
    []
  )

  if (!videoId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-[13px] text-white/60">
        Invalid video link
      </div>
    )
  }

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    if (p.getPlayerState() === PLAYING) p.pauseVideo()
    else p.playVideo()
  }

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    if (muted) {
      p.unMute()
      setMuted(false)
    } else {
      p.mute()
      setMuted(true)
    }
  }

  return (
    <div className="absolute inset-0">
      {/* The iframe mounts here, behind our tap layer. */}
      <div ref={wrapperRef} className="absolute inset-0">
        {/* Thumbnail poster: shown until the video actually starts, so the
            frame is never blank (e.g. muted autoplay blocked on iOS, or before
            the player initialises). YouTube serves this from its image CDN. */}
        {videoId && !ready && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Tap layer: toggles play/pause. */}
      <button
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={togglePlay}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        className="absolute inset-0 flex items-center justify-center"
      >
        {!playing && ready && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </button>

      {/* Mute toggle, top-right (out of the caption's way). */}
      <div className="absolute right-3 top-16 z-30">
        <button
          type="button"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/65"
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" opacity="0.5" />
              <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
})

/**
 * Scrub bar + time readout. Rendered by the CALLER in normal flow (WorkCard
 * puts it in the caption block, above the CTA). Because it is ordinary DOM and
 * stops pointer propagation, a horizontal drag seeks without the reel reading
 * it as a tap/scroll.
 */
export function VideoTimeline({ playerRef }: { playerRef: React.RefObject<VideoPlayerHandle | null> }) {
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const trackRef = useRef<HTMLDivElement | null>(null)

  // Subscribe to the player's position updates.
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    return player.subscribe(({ current, duration }) => {
      if (!scrubbing) setCurrent(current)
      if (duration && duration !== durationRef.current) {
        durationRef.current = duration
        setDuration(duration)
      }
    })
  }, [playerRef, scrubbing])

  const durationRef = useRef(0)

  const seekFromEvent = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const d = durationRef.current
    if (d) setCurrent(fraction * d)
    playerRef.current?.seekTo(fraction * d)
  }

  const progress = duration ? current / duration : 0

  return (
    <div className="flex items-center gap-2 text-white">
      <div
        ref={trackRef}
        className="relative h-6 flex-1 cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.stopPropagation()
          setScrubbing(true)
          e.currentTarget.setPointerCapture(e.pointerId)
          seekFromEvent(e.clientX)
        }}
        onPointerMove={(e) => {
          if (!scrubbing) return
          e.stopPropagation()
          seekFromEvent(e.clientX)
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          setScrubbing(false)
          seekFromEvent(e.clientX)
        }}
        onPointerCancel={(e) => {
          e.stopPropagation()
          setScrubbing(false)
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${progress * 100}%` }} />
        </div>
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <span className="flex-shrink-0 text-[11px] tabular-nums text-white/90">
        {formatTime(current)} / {formatTime(duration)}
      </span>
    </div>
  )
}
