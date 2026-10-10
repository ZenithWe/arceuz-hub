'use client'
import {Printer} from 'lucide-react'
export function ProposalPrintButton(){return <button type="button" onClick={()=>window.print()} className="primary-button proposal-print-trigger"><Printer size={16}/> Imprimir / salvar PDF</button>}
