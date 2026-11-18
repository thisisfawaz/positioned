'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<'professional' | 'recruiter' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)
    try {
      // TODO: Save role to DB and create the appropriate profile
      // await fetch('/api/auth/set-role', { method: 'POST', body: JSON.stringify({ role: selected }) })
      router.push('/feed')
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">One last step</h1>
          <p className="text-gray-600">How do you want to use Positioned.pro?</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelected('professional')}
            className={`w-full p-6 border rounded-lg text-left transition-colors ${
              selected === 'professional' ? 'border-near-black bg-gray-50' : 'border-[#e5e5e5] hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold text-lg">I'm a Professional</div>
            <div className="text-sm text-gray-600 mt-1">
              Showcase your work and get discovered by recruiters
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected('recruiter')}
            className={`w-full p-6 border rounded-lg text-left transition-colors ${
              selected === 'recruiter' ? 'border-near-black bg-gray-50' : 'border-[#e5e5e5] hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold text-lg">I'm a Recruiter</div>
            <div className="text-sm text-gray-600 mt-1">
              Find talented professionals based on demonstrated ability
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full btn-primary mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </div>
    </main>
  )
}
