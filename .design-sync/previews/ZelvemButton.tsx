import { ZelvemButton } from '@zelvem/ui'

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ZelvemButton>Entrar</ZelvemButton>
    <ZelvemButton variant="outline">Ver agenda</ZelvemButton>
    <ZelvemButton variant="ghost">Descartar</ZelvemButton>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ZelvemButton>Revisar digest</ZelvemButton>
    <ZelvemButton size="sm">Responder</ZelvemButton>
    <ZelvemButton size="icon" aria-label="Nuevo evento">
      +
    </ZelvemButton>
  </div>
)

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ZelvemButton disabled>Enviando…</ZelvemButton>
    <ZelvemButton variant="outline" disabled>
      Ver agenda
    </ZelvemButton>
  </div>
)
