import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft,FolderKanban,Plus,ExternalLink,Link2Off } from 'lucide-react'
import { getClient,listClientProjects } from '@/lib/clients'
import { clientStatusName } from '@/lib/client-fields.mjs'
import { ClientForm } from '@/components/client-form'
import { attachProjectAction,detachProjectAction,deleteClientAction } from '../actions'
import { DeleteRecordForm } from '@/components/delete-record-form'
export const metadata={title:'Editar cliente'}
export default async function ClientDetail({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{criado?:string;salvo?:string;vinculo?:string}>}){
 const {id}=await params
 const [client,flags]=await Promise.all([getClient(id),searchParams])
 if(!client)notFound()
 const {attached,available}=await listClientProjects(id)
 return <div className="client-detail-page"><div className="page-header"><div><div className="page-eyebrow">CLIENTES / CADASTRO</div><h1>{client.name}</h1><p><span className={`client-status client-${client.status}`}>{clientStatusName(client.status)}</span> · {client.contact_name||'Sem contato principal'}</p></div><Link className="ghost-button" href="/clientes"><ArrowLeft size={16}/> Clientes</Link></div>
 {(flags.criado==='1'||flags.salvo==='1'||flags.vinculo==='1'||flags.vinculo==='removido')&&<p role="status" className="project-success">{flags.criado==='1'?'Cliente cadastrado.':flags.salvo==='1'?'Dados atualizados.':flags.vinculo==='1'?'Projeto vinculado.':'Vínculo removido.'}</p>}
 {flags.vinculo==='erro'&&<p role="alert" className="error-banner">O projeto não pôde ser vinculado. Verifique se ele já pertence a outro cliente.</p>}
 <ClientForm client={client}/>
 <section className="panel client-projects"><div className="client-projects-head"><div><h2>Projetos desse cliente</h2><p>Vincule projetos existentes; eles continuarão acessíveis no módulo Projetos & Sites.</p></div><Link href="/projects/novo" className="ghost-button"><Plus size={16}/> Criar projeto</Link></div>
 {attached.length?<div className="client-project-list">{attached.map(p=><div className="client-project-item" key={p.id}><div><FolderKanban size={18}/><Link href={`/projects/${p.id}`}>{p.name} <ExternalLink size={13}/></Link></div><form action={detachProjectAction.bind(null,id,p.id)}><button className="ghost-button" type="submit" title="Desvincular projeto"><Link2Off size={14}/> Desvincular</button></form></div>)}</div>:<p className="client-empty">Nenhum projeto vinculado ainda.</p>}
 {available.length>0&&<form className="client-attach" action={attachProjectAction.bind(null,id)}><label htmlFor="available-project">Vincular projeto existente</label><div><select id="available-project" name="project_id" required defaultValue=""><option value="" disabled>Selecione um projeto sem cliente</option>{available.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="primary-button" type="submit"><Plus size={15}/> Vincular</button></div></form>}
 </section>
 <DeleteRecordForm title="Excluir cliente" itemLabel={client.name} description="Remove o cadastro do cliente. Os projetos e lançamentos existentes são preservados, mas deixam de ter vínculo com este cliente. Esta ação não pode ser desfeita." action={deleteClientAction.bind(null,id)}/>
 </div>
}
