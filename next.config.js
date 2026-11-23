const path = require('path')

// Loud media-storage sanity check. The upload route SILENTLY falls back to the
// LOCAL provider when Cloudinary is not configured, which is the right behaviour
// for a fresh checkout but a nasty surprise on deploy - images would vanish on
// the next build. So: warn when the config is empty (fallback is intentional),
// and FAIL LOUDLY when it is HALF-set (a typo'd or partially-pasted key), since
// that state means someone intended Cloudinary and it will not work.
function checkMediaStorageEnv() {
  const vars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]
  const set = vars.filter((k) => Boolean(process.env[k]))

  if (set.length === 0) {
    console.warn(
      '[media] Cloudinary is NOT configured - /api/upload will fall back to ' +
        'LOCAL disk (images only, development only). Set CLOUDINARY_CLOUD_NAME, ' +
        'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to store media properly.'
    )
    return
  }

  if (set.length < vars.length) {
    const missing = vars.filter((k) => !process.env[k])
    throw new Error(
      '[media] Cloudinary is PARTIALLY configured. Missing: ' +
        missing.join(', ') +
        '. Set all three or none - a partial config silently disables uploads.'
    )
  }
}

checkMediaStorageEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Cloudinary delivery host. Media is rendered with plain <img> today, but
      // allowlisting it prevents a future next/image migration from throwing.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

module.exports = nextConfig
