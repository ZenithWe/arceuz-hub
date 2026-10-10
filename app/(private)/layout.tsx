import { requireMember } from '@/lib/auth'
import { Shell } from '@/components/shell'
export const dynamic = 'force-dynamic'
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember()
  return <Shell member={member}>{children}</Shell>
}
