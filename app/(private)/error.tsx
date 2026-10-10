'use client'
import { AlertCircle, RotateCcw } from 'lucide-react'
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="loading-state" role="alert"><AlertCircle size={30}/><h2>Não foi possível carregar esta página.</h2><p>Verifique sua conexão e tente novamente.</p><button onClick={reset} className="primary-button"><RotateCcw size={17}/> Tentar novamente</button></div>
}
