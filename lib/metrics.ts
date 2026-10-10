// Pure business calculations. No client, database or Next.js dependency.
export type Period = '7d' | '30d' | 'month' | 'previous' | 'year'
export const periodOptions: { key: Period; name: string }[] = [
  { key: '7d', name: '7 dias' },
  { key: '30d', name: '30 dias' },
  { key: 'month', name: 'Este mês' },
  { key: 'previous', name: 'Mês anterior' },
  { key: 'year', name: 'Este ano' },
]
export function resolvePeriod(value?: string): Period {
  return periodOptions.some(p => p.key === value) ? value as Period : 'month'
}
const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10)

// Calendar dates always use the Brazil/Sao_Paulo business timezone, not server UTC.
export function dateBounds(period: Period, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (name: string) => Number(parts.find(p => p.type === name)?.value)
  const today = new Date(Date.UTC(part('year'), part('month') - 1, part('day')))
  const start = new Date(today)
  const end = new Date(today)
  switch (period) {
    case '7d': start.setUTCDate(today.getUTCDate() - 6); break
    case '30d': start.setUTCDate(today.getUTCDate() - 29); break
    case 'month': start.setUTCDate(1); break
    case 'previous':
      start.setUTCMonth(today.getUTCMonth() - 1, 1)
      end.setUTCDate(0)
      break
    case 'year': start.setUTCMonth(0, 1); break
  }
  return { start: yyyyMmDd(start), end: yyyyMmDd(end), today: yyyyMmDd(today) }
}
export const brl = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

export type Finance = {
  direction: 'income' | 'expense'; status: 'pending' | 'paid' | 'cancelled';
  amount_cents: number | string; paid_on: string | null; due_on: string | null
}
export type Project = { status: string; production_url: string | null }
export type Task = { status: string; due_on: string | null }
export type Repository = { id: string }

export type CalculatedStats = {
  totalProjects: number; activeProjects: number; publishedSites: number;
  repositories: number; incomeCents: number; expensesCents: number;
  resultCents: number; receivableCents: number; payableCents: number;
  upcomingTasks: number; overdueTasks: number;
  monthly: { label: string; income: number; expense: number }[]
}

// Avoid silently rounding cents: Postgres int8 values may come through as strings.
function centsOf(item: Finance): number {
  const amount = Number(item.amount_cents)
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Valor financeiro inválido ou fora do intervalo seguro')
  return amount
}
function sum(items: Finance[]): number {
  const value = items.reduce((acc, item) => acc + centsOf(item), 0)
  if (!Number.isSafeInteger(value)) throw new Error('Soma financeira fora do intervalo seguro')
  return value
}

export function calculateStats(
  projects: Project[], repositories: Repository[], finance: Finance[], tasks: Task[],
  period: Period, now = new Date(),
): CalculatedStats {
  const bounds = dateBounds(period, now)
  const paid = finance.filter(x => x.status === 'paid' && x.paid_on && x.paid_on >= bounds.start && x.paid_on <= bounds.end)
  const incomeCents = sum(paid.filter(x => x.direction === 'income'))
  const expensesCents = sum(paid.filter(x => x.direction === 'expense'))
  const firstMonth = new Date(`${bounds.today.slice(0, 7)}-01T00:00:00Z`)
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const dt = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() - (5 - index), 1))
    const prefix = yyyyMmDd(dt).slice(0, 7)
    const monthEntries = finance.filter(x => x.status === 'paid' && x.paid_on?.startsWith(prefix))
    return {
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(dt).replace('.', ''),
      income: sum(monthEntries.filter(x => x.direction === 'income')),
      expense: sum(monthEntries.filter(x => x.direction === 'expense')),
    }
  })
  const endOfNextSevenDays = new Date(`${bounds.today}T00:00:00Z`)
  endOfNextSevenDays.setUTCDate(endOfNextSevenDays.getUTCDate() + 6)
  const nextSevenDays = yyyyMmDd(endOfNextSevenDays)
  const resultCents = incomeCents - expensesCents
  if (!Number.isSafeInteger(resultCents)) throw new Error('Resultado financeiro fora do intervalo seguro')
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(x => ['development', 'review', 'planning', 'production'].includes(x.status)).length,
    publishedSites: projects.filter(x => x.production_url && ['production', 'completed'].includes(x.status)).length,
    repositories: repositories.length,
    incomeCents, expensesCents, resultCents,
    receivableCents: sum(finance.filter(x => x.direction === 'income' && x.status === 'pending')),
    payableCents: sum(finance.filter(x => x.direction === 'expense' && x.status === 'pending')),
    upcomingTasks: tasks.filter(x => x.status !== 'done' && x.due_on && x.due_on >= bounds.today && x.due_on <= nextSevenDays).length,
    overdueTasks: tasks.filter(x => x.status !== 'done' && x.due_on && x.due_on < bounds.today).length,
    monthly,
  }
}
