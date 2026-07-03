import * as React from 'react'

import { cn } from '../lib/cn'
import { Input } from './input'

/** Zelvem-customized input: shadcn primitive pinned to the DESIGN.md field radius (9px). */
export function ZelvemInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return <Input className={cn('rounded-[9px]', className)} {...props} />
}
