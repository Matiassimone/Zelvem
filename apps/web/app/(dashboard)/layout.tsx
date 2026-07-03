import { Rail } from '../../components/rail'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen">
      <Rail />
      <main className="flex-1">{children}</main>
    </div>
  )
}
