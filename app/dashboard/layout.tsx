import { Header } from '@/components/shared/Header'
import { HeaderConditional } from './HeaderConditional'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderConditional />
      {children}
    </>
  )
}
