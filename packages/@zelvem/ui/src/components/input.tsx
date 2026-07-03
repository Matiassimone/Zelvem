import * as React from 'react'

import { cn } from '../lib/cn'

/** shadcn/ui input primitive, themed with the Zelvem token set. Extend via Zelvem* components, never edit in place. */
function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
