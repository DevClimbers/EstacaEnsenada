// components/brand/Logo.tsx
//
// Estaca Ensenada — Wordmark (Concept C)
// Use this anywhere you need the brand lockup: sidebar, topbar, footer, PDFs, etc.
//
// Requires: Bricolage Grotesque + Plus Jakarta Sans loaded via next/font/google.
// See app/layout.tsx for the font setup.

import { cn } from '@/lib/utils'

type LogoProps = {
  /** "full" includes the tagline below; "wordmark" hides it; "icon" renders only the "e" badge */
  variant?: 'full' | 'wordmark' | 'icon'
  /** Color theme: light = navy text (default), dark = white text for navy backgrounds */
  theme?: 'light' | 'dark'
  /** Size preset for the wordmark text */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: { word: 'text-[15px]', tag: 'text-[8px]',  gap: 'gap-[2px]' },
  md: { word: 'text-[18px]', tag: 'text-[9px]',  gap: 'gap-[3px]' },
  lg: { word: 'text-[28px]', tag: 'text-[11px]', gap: 'gap-[4px]' },
}

export function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className,
}: LogoProps) {
  if (variant === 'icon') return <LogoMark theme={theme} className={className} />

  const s = SIZE[size]
  const wordColor = theme === 'dark' ? 'text-white' : 'text-[#1B2A5E]'
  const tagColor  = theme === 'dark' ? 'text-white/55' : 'text-[#9C9A91]'

  return (
    <div className={cn('inline-flex flex-col leading-none', s.gap, className)}>
      <span
        className={cn(
          'font-display font-semibold tracking-[-0.028em]',
          s.word,
          wordColor
        )}
      >
        estaca<span className="text-[#C9A84C] mx-[1px]">·</span>ensenada
      </span>
      {variant === 'full' && (
        <span
          className={cn(
            'font-sans font-bold uppercase tracking-[0.18em]',
            s.tag,
            tagColor
          )}
        >
          Presidencia de Estaca
        </span>
      )}
    </div>
  )
}

/** The square "e" badge — for favicons, avatars, compact contexts */
export function LogoMark({
  theme = 'light',
  className,
}: {
  theme?: 'light' | 'dark'
  className?: string
}) {
  const bg = theme === 'dark' ? 'bg-[#C9A84C]' : 'bg-[#1B2A5E]'
  const fg = theme === 'dark' ? 'text-[#1B2A5E]' : 'text-[#C9A84C]'
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-[7px] size-8',
        bg,
        className
      )}
      aria-label="Estaca Ensenada"
    >
      <span className={cn('font-display font-bold text-[22px] leading-none -mt-0.5', fg)}>
        e
      </span>
    </div>
  )
}
