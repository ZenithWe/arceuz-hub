'use client'
import {useState} from 'react'
import {Trash2,AlertTriangle} from 'lucide-react'
type Props={
 title:string;description:string;itemLabel:string;
 action:(formData:FormData)=>void|Promise<void>
}
export function DeleteRecordForm({title,description,itemLabel,action}:Props){
 const [confirmation,setConfirmation]=useState('')
 return <section className="panel hub-delete-panel">
  <div className="hub-delete-heading"><AlertTriangle size={20}/><div><h2>{title}</h2><p>{description}</p></div></div>
  <form action={action} className="hub-delete-form">
   <label htmlFor="hub-delete-confirm">Para remover <strong>{itemLabel}</strong>, digite <strong>EXCLUIR</strong>:</label>
   <div className="hub-delete-row"><input id="hub-delete-confirm" name="confirmation" type="text" autoComplete="off" maxLength={7} pattern="EXCLUIR" placeholder="EXCLUIR" value={confirmation} onChange={event=>setConfirmation(event.target.value)} required aria-label={'Confirme a exclusão de '+itemLabel}/><button type="submit" className="hub-delete-button" disabled={confirmation!=='EXCLUIR'}><Trash2 size={15}/> Excluir definitivamente</button></div>
  </form>
 </section>
}
