import { t } from '../../lib/i18n'
import type { Messages } from '../../lib/i18n/messages'

/** Shared placeholder body for module pages until each module is built. */
export function PlaceholderPage({
  labelKey,
}: {
  labelKey: keyof Messages['nav']
}): React.JSX.Element {
  return (
    <div className="p-8">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{t().nav[labelKey]}</h1>
      <p className="mt-2 text-sm text-muted">{t().placeholder.comingSoon}</p>
    </div>
  )
}
