import { db } from './db'
import { requireMember } from './auth'
import { calculateStats, type CalculatedStats, type Finance, type Project, type Repository, type Task, type Period } from './metrics'
export { dateBounds, periodOptions, resolvePeriod, brl } from './metrics'
export type DashboardStats = CalculatedStats & { available:boolean;issue:string|null }

export async function loadDashboard(period: Period): Promise<DashboardStats> {
  await requireMember()
  const sql = db()
  try {
    const [projects,repositories,finances,tasks] = await Promise.all([
      sql`SELECT status,production_url FROM hub_projects`,
      sql`SELECT id FROM hub_repositories`,
      sql`SELECT direction,status,amount_cents,paid_on::text AS paid_on,due_on::text AS due_on FROM hub_financial_entries`,
      sql`SELECT status,due_on::text AS due_on FROM hub_tasks`,
    ])
    return { ...calculateStats(projects as Project[],repositories as Repository[],finances as Finance[],tasks as Task[],period),available:true,issue:null }
  } catch {
    return { totalProjects:0,activeProjects:0,publishedSites:0,repositories:0,
      incomeCents:0,expensesCents:0,resultCents:0,receivableCents:0,payableCents:0,
      upcomingTasks:0,overdueTasks:0,monthly:[],available:false,
      issue:'Não foi possível consultar o banco de dados. Confira a conexão do Neon.' }
  }
}
