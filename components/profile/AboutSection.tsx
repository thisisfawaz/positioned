'use client'

/**
 * The profile "About" text. It used to clamp to 4 lines with a More/Less
 * toggle, but About now has its own TAB, so there is room to show the whole
 * thing - render the text exactly as the user wrote it.
 */
export function AboutSection({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{text}</p>
  )
}
