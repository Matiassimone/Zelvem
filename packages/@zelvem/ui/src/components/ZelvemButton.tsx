import * as React from 'react'

import { cn } from '../lib/cn'
import { Button, type ButtonProps } from './button'

/** Zelvem-customized button: shadcn primitive pinned to the DESIGN.md button radius (9px). */
export function ZelvemButton({ className, ...props }: ButtonProps): React.JSX.Element {
  return <Button className={cn('rounded-[9px]', className)} {...props} />
}
