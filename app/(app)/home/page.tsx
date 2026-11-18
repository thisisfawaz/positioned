import { permanentRedirect } from 'next/navigation'

// The timeline moved to /feed. This keeps old /home links working.
export default function HomeRedirect() {
  permanentRedirect('/feed')
}
