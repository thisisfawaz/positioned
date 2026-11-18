'use client'

import Link from 'next/link'

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#efefef] px-4 py-2.5 md:px-6 xl:hidden">
      <div className="flex items-center">
        <Link href="/feed" className="font-bold text-xl tracking-tight">
          POSITIONED<span className="text-gray-400">.PRO</span>
        </Link>
      </div>
    </header>
  )
}
