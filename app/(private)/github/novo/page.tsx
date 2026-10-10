import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { linkedProjects } from '@/lib/repositories'
import { RepositoryForm } from '@/components/repository-form'
export const metadata={title:'Adicionar repositório'}
export default async function NewRepositoryPage(){
 const projects=await linkedProjects()
 return <div><div className="page-header"><div><div className="page-eyebrow">REPOSITÓRIOS / CADASTRO</div><h1>Novo repositório</h1><p>Adicione um projeto GitHub ao controle da Arceuz.</p></div><Link href="/github" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div><RepositoryForm projects={projects}/></div>
}
