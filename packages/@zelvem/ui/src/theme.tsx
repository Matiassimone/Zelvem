'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

/** localStorage key for the persisted theme (fixed by DESIGN.md). */
export const THEME_STORAGE_KEY = 'zelvem-theme'

/**
 * Inline script for the root layout `<head>`: applies the persisted theme
 * before first paint so dark mode never flashes light. Static string — no
 * user input reaches it.
 */
export const themeInitScript = `(function(){try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}})()`

/**
 * Reads and toggles the app theme. Applies `data-theme` on `:root` and
 * persists under {@link THEME_STORAGE_KEY}.
 *
 * @returns The current theme and a toggle function
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    if (next === 'dark') {
      document.documentElement.dataset.theme = 'dark'
    } else {
      delete document.documentElement.dataset.theme
    }
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setTheme(next)
  }

  return [theme, toggle]
}
