import 'server-only'
import {db} from './db'
import {requireMember} from './auth'
import {knownProposalStatus,isProposalId} from './proposal-fields.mjs'
export type ProposalRow={id:string;title:string;scope:string;delivery_terms:string;payment_terms:string;notes:string;status:string;amount_cents:string|number;valid_until:string|null;client_id:string|null;client_name:string|null;project_id:string|null;project_name:string|null;created_at:string;updated_at:string;created_by_name:string|null}
export type ProposalOption={id:string;name:string}
export function proposalFilters(raw:{q?:string;status?:string;page?:string}){
 const q=typeof raw.q==='string'?raw.q.trim().slice(0,80):''
 const status=knownProposalStatus(raw.status)?raw.status!:'all'
 const n=Number(raw.page??1),page=Number.isSafeInteger(n)&&n>0?Math.min(n,1000):1
 return {q,status,page}
}
export async function proposalOptions(){
 await requireMember()
 const sql=db()
 const [clients,projects]=await Promise.all([sql`SELECT id,name FROM hub_clients ORDER BY name LIMIT 300`,sql`SELECT id,name FROM hub_projects WHERE status<>'archived' ORDER BY name LIMIT 300`])
 return {clients:clients as ProposalOption[],projects:projects as ProposalOption[]}
}
export async function validateProposalRefs(clientId:string|null,projectId:string|null){
 const sql=db()
 if(clientId){if(!isProposalId(clientId))return 'Cliente inválido.';const r=await sql`SELECT id FROM hub_clients WHERE id::text=${clientId} LIMIT 1`;if(!r.length)return 'Cliente não encontrado.'}
 if(projectId){if(!isProposalId(projectId))return 'Projeto inválido.';const r=await sql`SELECT id FROM hub_projects WHERE id::text=${projectId} LIMIT 1`;if(!r.length)return 'Projeto não encontrado.'}
 return null
}
export async function getProposal(id:string):Promise<ProposalRow|null>{
 await requireMember()
 if(!isProposalId(id))return null
 const sql=db()
 const rows=await sql`SELECT p.id,p.title,p.scope,p.delivery_terms,p.payment_terms,p.notes,p.status,p.amount_cents,p.valid_until::text AS valid_until,
 p.client_id,c.name AS client_name,p.project_id,pr.name AS project_name,p.created_at::text AS created_at,p.updated_at::text AS updated_at,m.name AS created_by_name
 FROM hub_proposals p LEFT JOIN hub_clients c ON c.id=p.client_id
 LEFT JOIN hub_projects pr ON pr.id=p.project_id
 LEFT JOIN hub_members m ON m.id=p.created_by WHERE p.id::text=${id} LIMIT 1`
 return rows.length?rows[0] as ProposalRow:null
}
export async function listProposals({q,status,page}:ReturnType<typeof proposalFilters>){
 await requireMember()
 const sql=db(),offset=(page-1)*15
 const [rows,counts,metrics]=await Promise.all([
 sql`SELECT p.id,p.title,p.scope,p.delivery_terms,p.payment_terms,p.notes,p.status,p.amount_cents,p.valid_until::text AS valid_until,
 p.client_id,c.name AS client_name,p.project_id,pr.name AS project_name,p.created_at::text AS created_at,p.updated_at::text AS updated_at,m.name AS created_by_name
 FROM hub_proposals p LEFT JOIN hub_clients c ON c.id=p.client_id
 LEFT JOIN hub_projects pr ON pr.id=p.project_id LEFT JOIN hub_members m ON m.id=p.created_by
 WHERE (${status}='all' OR p.status=${status})
 AND (${q}='' OR position(lower(${q}) in lower(p.title))>0 OR position(lower(${q}) in lower(coalesce(c.name,'')))>0)
 ORDER BY p.created_at DESC,p.id DESC LIMIT 15 OFFSET ${offset}`,
 sql`SELECT count(*)::integer AS total FROM hub_proposals p LEFT JOIN hub_clients c ON c.id=p.client_id
 WHERE (${status}='all' OR p.status=${status})
 AND (${q}='' OR position(lower(${q}) in lower(p.title))>0 OR position(lower(${q}) in lower(coalesce(c.name,'')))>0)`,
 sql`SELECT count(*)::integer AS total,
 count(*) FILTER(WHERE status='draft')::integer AS drafts,
 count(*) FILTER(WHERE status='sent' OR status='negotiation')::integer AS in_progress,
 count(*) FILTER(WHERE status='accepted')::integer AS accepted,
 COALESCE(SUM(amount_cents) FILTER(WHERE status='accepted'),0)::text AS accepted_amount
 FROM hub_proposals`
 ])
 return {rows:rows as ProposalRow[],total:Number(counts[0]?.total??0),page,perPage:15,
 metrics:{total:Number(metrics[0]?.total??0),drafts:Number(metrics[0]?.drafts??0),inProgress:Number(metrics[0]?.in_progress??0),accepted:Number(metrics[0]?.accepted??0),acceptedAmount:Number(metrics[0]?.accepted_amount??0)}}
}
