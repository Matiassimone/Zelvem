import { ZelvemLogo } from '@zelvem/ui'

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
    <ZelvemLogo size={30} />
    <ZelvemLogo size={48} />
    <ZelvemLogo size={72} />
  </div>
)

export const Thinking = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
    <ZelvemLogo size={48} thinking />
    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
      Rota en pasos de 90° solo mientras Zelvem procesa — estático en reposo.
    </span>
  </div>
)
