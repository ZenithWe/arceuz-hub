import 'server-only'
import { db } from './db'
import { requireMember } from './auth'
import {knownDirection,knownStatus,isFinanceId} from './finance-fields.mjs'
export type FinanceRow={
 id:string;project_id:string|null;project_name:string|null;title:string;
 direction:string;status:string;amount_cents:string|number;
 category:string|null;method:string|null;reference:string|null;notes:string;
 competence_on:string|null;due_on:string|null;paid_on:string|null;
 created_at:string;updated_at:string;created_by_name:string|null;updated_by_name:string|null
}
export type FinanceProject={id:string;name:string}
export function parseFinanceFilters(raw:{q?:string;direction?:string;status?:string;month?:string;page?:string}){
 const q=typeof raw.q==='string'?raw.q.trim().slice(0,80):''
 const direction=knownDirection(raw.direction)?raw.direction!:'all'
 const status=knownStatus(raw.status)?raw.status!:'all'
 const month=typeof raw.month==='string'&&/^(20\d\d)-(0[1-9]|1[0-2])$/.test(raw.month)?raw.month:'all'
 const n=Number(raw.page??1)
 const page=Number.isSafeInteger(n)&&n>0?Math.min(n,1000):1
 return {q,direction,status,month,page}
}
export async function financeProjects(){
 await requireMember()
 const sql=db()
 return (await sql`SELECT id,name FROM hub_projects WHERE status<>'archived' ORDER BY name ASC LIMIT 300`) as FinanceProject[]
}
export async function verifyFinanceProject(id:string|null){
 if(!id)return true
 if(!isFinanceId(id))return false
 const sql=db()
 const r=await sql`SELECT id FROM hub_projects WHERE id::text=${id} LIMIT 1`
 return r.length===1
}
export async function getFinanceEntry(id:string){
 await requireMember()
 if(!isFinanceId(id))return null
 const sql=db()
 const rows=await sql`SELECT f.id,f.title,f.direction,f.status,f.amount_cents,f.category,
 f.method,f.reference,f.notes,f.project_id,p.name AS project_name,
 f.competence_on::text AS competence_on,f.due_on::text AS due_on,f.paid_on::text AS paid_on,
 f.created_at::text AS created_at,f.updated_at::text AS updated_at,
 creator.name AS created_by_name,editor.name AS updated_by_name
 FROM hub_financial_entries f
 LEFT JOIN hub_projects p ON p.id=f.project_id
 LEFT JOIN hub_members creator ON creator.id=f.created_by
 LEFT JOIN hub_members editor ON editor.id=f.updated_by
 WHERE f.id::text=${id} LIMIT 1`
 return (rows[0] as FinanceRow|undefined)??null
}
export async function listFinances(filters:ReturnType<typeof parseFinanceFilters>){
 await requireMember()
 const sql=db(),{q,direction,status,month,page}=filters
 const offset=(page-1)*20
 const [rows,totals,summary]=await Promise.all([
 sql`SELECT f.id,f.title,f.direction,f.status,f.amount_cents,f.category,
 f.method,f.reference,f.notes,f.project_id,p.name AS project_name,
 f.competence_on::text AS competence_on,f.due_on::text AS due_on,f.paid_on::text AS paid_on,
 f.created_at::text AS created_at,f.updated_at::text AS updated_at,
 creator.name AS created_by_name,editor.name AS updated_by_name
 FROM hub_financial_entries f
 LEFT JOIN hub_projects p ON p.id=f.project_id
 LEFT JOIN hub_members creator ON creator.id=f.created_by
 LEFT JOIN hub_members editor ON editor.id=f.updated_by
 WHERE (${direction}='all' OR f.direction=${direction})
 AND (${status}='all' OR f.status=${status})
 AND (${month}='all' OR to_char(COALESCE(f.competence_on,f.due_on,f.paid_on,f.created_at::date),'YYYY-MM')=${month})
 AND (${q}='' OR position(lower(${q}) in lower(f.title))>0 OR
 position(lower(${q}) in lower(coalesce(f.category,'')))>0 OR
 position(lower(${q}) in lower(coalesce(p.name,'')))>0)
 ORDER BY COALESCE(f.due_on,f.competence_on,f.created_at::date) DESC,f.created_at DESC,f.id DESC LIMIT 20 OFFSET ${offset}`,
 sql`SELECT count(*)::integer AS total FROM hub_financial_entries f
 LEFT JOIN hub_projects p ON p.id=f.project_id
 WHERE (${direction}='all' OR f.direction=${direction})
 AND (${status}='all' OR f.status=${status})
 AND (${month}='all' OR to_char(COALESCE(f.competence_on,f.due_on,f.paid_on,f.created_at::date),'YYYY-MM')=${month})
 AND (${q}='' OR position(lower(${q}) in lower(f.title))>0 OR
 position(lower(${q}) in lower(coalesce(f.category,'')))>0 OR
 position(lower(${q}) in lower(coalesce(p.name,'')))>0)`,
 sql`SELECT
 COALESCE(SUM(amount_cents) FILTER(WHERE status='paid' AND direction='income'),0)::text AS received,
 COALESCE(SUM(amount_cents) FILTER(WHERE status='paid' AND direction='expense'),0)::text AS spent,
 COALESCE(SUM(amount_cents) FILTER(WHERE status='pending' AND direction='income'),0)::text AS receivable,
 COALESCE(SUM(amount_cents) FILTER(WHERE status='pending' AND direction='expense'),0)::text AS payable,
 count(*) FILTER(WHERE status='pending' AND due_on<(now() AT TIME ZONE 'America/Sao_Paulo')::date)::integer AS overdue
 FROM hub_financial_entries f
 WHERE (${month}='all' OR to_char(COALESCE(f.competence_on,f.due_on,f.paid_on,f.created_at::date),'YYYY-MM')=${month})`
 ])
 const x=summary[0]
 return {rows:rows as FinanceRow[],total:Number(totals[0]?.total??0),perPage:20,
 summary:{received:Number(x?.received??0),spent:Number(x?.spent??0),
  receivable:Number(x?.receivable??0),payable:Number(x?.payable??0),overdue:Number(x?.overdue??0)}}
}
