import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import LoginForm from '@/components/auth/LoginForm'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  // Signed-in users go straight to the timeline.
  const user = await getCurrentUser()
  if (user) redirect('/feed')

  return (
    <main className="min-h-screen flex">
      {/* Left: brand panel */}
      <section className="hidden lg:flex w-1/2 items-center justify-center bg-near-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-white" />
        </div>

        <div className="relative z-10 max-w-md px-12 text-white">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
            Show your work.
            <br />
            <span className="text-gray-500">Get discovered.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            Publish project showcases and case studies that prove what you can
            actually do — and let recruiters find you by ability, not buzzwords.
          </p>

          <ul className="mt-10 space-y-4 text-[15px] text-gray-300">
            {[
              'Publish real work, not just a CV',
              'Get found by recruiters searching for your skills',
              'Track views, likes and saves on every post',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Right: auth panel */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              Show your work.
              <br />
              <span className="text-gray-500">Get discovered.</span>
            </h1>
          </div>

          <div className="text-2xl font-bold tracking-tight mb-6">
            POSITIONED<span className="text-gray-400">.PRO</span>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/auth/signup?type=professional"
              className="block w-full text-center rounded-md bg-near-black text-white font-semibold px-6 py-3 text-sm hover:bg-gray-800 transition-colors"
            >
              Join as a Professional
            </Link>
            <Link
              href="/auth/signup?type=recruiter"
              className="block w-full text-center rounded-md border border-[#e5e5e5] text-near-black font-semibold px-6 py-3 text-sm hover:bg-gray-50 transition-colors"
            >
              Join as a Recruiter
            </Link>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 tracking-wider">
                Or sign in
              </span>
            </div>
          </div>

          <GoogleAuthButton label="Continue with Google" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 tracking-wider">
                Or sign in with email
              </span>
            </div>
          </div>

          <LoginForm />

          <p className="mt-8 text-xs text-gray-500 leading-relaxed">
            By joining you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  )
}
