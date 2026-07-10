import { ZelvemInput } from '@zelvem/ui'

export const Default = () => <ZelvemInput placeholder="Email" style={{ width: 280 }} />

export const WithValue = () => (
  <ZelvemInput defaultValue="matias@zelvem.com" type="email" style={{ width: 280 }} />
)

export const Password = () => (
  <ZelvemInput type="password" placeholder="Contraseña" defaultValue="secret-pass" style={{ width: 280 }} />
)

export const Disabled = () => (
  <ZelvemInput disabled placeholder="Sincronizando…" style={{ width: 280 }} />
)

export const LoginForm = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 300 }}>
    <ZelvemInput type="email" placeholder="Email" autoComplete="email" />
    <ZelvemInput type="password" placeholder="Contraseña" autoComplete="current-password" />
  </div>
)
