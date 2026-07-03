import * as React from 'react'
import { useId } from 'react'

import { cn } from '../lib/cn'

interface ZelvemLogoProps {
  /** Rendered size in px (the rail uses ~30). */
  size?: number
  /** Spins the frame in 90° steps — ONLY while Zelvem is processing. Static at rest. */
  thinking?: boolean
  className?: string
}

/**
 * Brand mark "The Frame": rounded square with a transparent hollow, built
 * with an SVG mask so the hollow adapts to any background (DESIGN.md — Brand).
 * Flat, no shadow, never animated at rest.
 */
export function ZelvemLogo({
  size = 30,
  thinking = false,
  className,
}: ZelvemLogoProps): React.JSX.Element {
  const maskId = useId()
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn(thinking && 'animate-zrotate', className)}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="#fff" />
          <rect x="35" y="35" width="30" height="30" rx="9" fill="#000" />
        </mask>
      </defs>
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="20"
        fill="var(--moss)"
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}
