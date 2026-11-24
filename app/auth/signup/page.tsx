'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SignUpForm from '@/components/auth/SignUpForm'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { BackIcon } from '@/components/icons'

type UserType = 'professional' | 'recruiter'

function SignUpContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialType: UserType | null =
    typeParam === 'professional' || typeParam === 'recruiter'
      ? typeParam
      : null

  const [userType, setUserType] = useState<UserType | null>(initialType)

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-md w-full">
        {!userType ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600">Choose how you want to use Positioned.pro</p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setUserType('professional')}
                className="w-full p-6 border border-[#e5e5e5] rounded-lg text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-lg">I&apos;m a Professional</div>
                <div className="text-sm text-gray-600 mt-1">
                  Showcase your work and get discovered by recruiters
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('recruiter')}
                className="w-full p-6 border border-[#e5e5e5] rounded-lg text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-lg">I&apos;m a Recruiter</div>
                <div className="text-sm text-gray-600 mt-1">
                  Find talented professionals based on demonstrated ability
                </div>
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-near-black font-medium hover:underline">
                Log in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600">
                Signing up as a {userType === 'professional' ? 'Professional' : 'Recruiter'}
              </p>
            </div>

            <GoogleAuthButton label="Sign up with Google" userType={userType} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>

            <SignUpForm userType={userType} />

            <button
              type="button"
              onClick={() => setUserType(null)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-near-black"
            >
              <BackIcon className="h-4 w-4" />
              Change account type
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-near-black font-medium hover:underline">
                Log in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}
