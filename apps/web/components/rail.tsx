'use client'

import {
  Calendar,
  Home,
  type LucideIcon,
  Mail,
  Moon,
  PenLine,
  Share2,
  SquareCheck,
  Sun,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTheme, ZelvemLogo } from '@zelvem/ui'

import { t } from '../lib/i18n'
import type { Messages } from '../lib/i18n/messages'

interface NavItem {
  href: string
  icon: LucideIcon
  labelKey: keyof Messages['nav']
}

const NAV: NavItem[] = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/inbox', icon: Mail, labelKey: 'inbox' },
  { href: '/calendar', icon: Calendar, labelKey: 'calendar' },
  { href: '/todos', icon: SquareCheck, labelKey: 'todos' },
  { href: '/blog', icon: PenLine, labelKey: 'blog' },
  { href: '/social', icon: Share2, labelKey: 'social' },
  { href: '/finance', icon: Wallet, labelKey: 'finance' },
]

/** App shell left rail — 66px, per DESIGN.md "App Shell". */
export function Rail(): React.JSX.Element {
  const pathname = usePathname()
  const [theme, toggleTheme] = useTheme()

  return (
    <aside className="sticky top-0 flex h-screen w-[66px] shrink-0 flex-col items-center border-r border-border bg-surface py-4">
      <Link href="/" aria-label={t().common.appName} className="mb-5">
        <ZelvemLogo size={30} />
      </Link>

      <nav className="flex flex-col items-center gap-1.5">
        {NAV.map(({ href, icon: Icon, labelKey }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={t().nav[labelKey]}
              aria-current={isActive ? 'page' : undefined}
              className={`flex size-10 items-center justify-center rounded-[10px] transition-colors ${
                isActive ? 'bg-tint text-ink' : 'text-muted hover:bg-tint hover:text-ink2'
              }`}
            >
              <Icon size={19} strokeWidth={1.7} />
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={t().nav.themeToggle}
          className="flex size-10 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-tint hover:text-ink2"
        >
          {theme === 'dark' ? (
            <Sun size={19} strokeWidth={1.7} />
          ) : (
            <Moon size={19} strokeWidth={1.7} />
          )}
        </button>
        <Link
          href="/account"
          aria-label={t().nav.account}
          className="flex size-[34px] items-center justify-center rounded-full bg-avatar text-[11px] font-medium text-ink2 transition-shadow hover:shadow-[0_0_0_2px_var(--moss)]"
        >
          {/* Sample initials from the hi-fi design — replaced by real account data with the Account module. */}
          TR
        </Link>
      </div>
    </aside>
  )
}
