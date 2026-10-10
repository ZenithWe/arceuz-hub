import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listOwners } from '@/lib/projects'
import { ProjectForm } from '@/components/project-form'
export const metadata={title:'Novo projeto'}
export default async function NewProjectPage(){const owners=await listOwners();return <div><div className="page-header"><div><div className="page-eyebrow">PROJETOS & SITES / CADASTRO</div><h1>Novo projeto</h1><p>Adicione um trabalho para acompanhar toda sua evolução.</p></div><Link href="/projects" className="ghost-button"><ArrowLeft size={15}/> Voltar</Link></div><ProjectForm owners={owners}/></div>}
