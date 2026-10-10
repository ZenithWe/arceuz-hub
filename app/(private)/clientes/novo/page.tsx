import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireMember } from '@/lib/auth'
import { ClientForm } from '@/components/client-form'
export const metadata={title:'Novo cliente'}
export default async function NewClientPage(){
 await requireMember()
 return <div><div className="page-header"><div><div className="page-eyebrow">CLIENTES / NOVO</div><h1>Novo cliente</h1><p>Cadastre uma pessoa ou empresa para acompanhar seu relacionamento comercial.</p></div><Link href="/clientes" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div><ClientForm/></div>
}
