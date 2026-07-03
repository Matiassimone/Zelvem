'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { loginRequestSchema } from '@zelvem/contracts'
import { ZelvemButton, ZelvemInput, ZelvemLogo } from '@zelvem/ui'

import { apiClient } from '../../../lib/api-client'
import { t } from '../../../lib/i18n'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    const credentials = loginRequestSchema.safeParse({ email, password })
    if (!credentials.success) {
      setError(t().login.invalidCredentials)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await apiClient.login(credentials.data)
      router.push('/')
    } catch {
      setError(t().login.genericError)
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <form
        onSubmit={onSubmit}
        className="flex w-[360px] flex-col gap-4 rounded-2xl border border-border bg-surface p-8"
      >
        <ZelvemLogo size={34} />
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{t().login.title}</h1>
        <ZelvemInput
          type="email"
          autoComplete="email"
          placeholder={t().login.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <ZelvemInput
          type="password"
          autoComplete="current-password"
          placeholder={t().login.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-[13px] text-muted">{error}</p> : null}
        <ZelvemButton type="submit" disabled={submitting}>
          {t().login.submit}
        </ZelvemButton>
      </form>
    </main>
  )
}
