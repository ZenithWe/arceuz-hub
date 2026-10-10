import { BarChart3 } from 'lucide-react'
export function RevenueChart({ months }: { months: {label:string,income:number,expense:number}[] }) {
  const values = months.flatMap(m => [m.income, m.expense])
  const max = Math.max(0,...values)
  return <div className="chart-shell">
    <div className="chart-legend"><span><i className="legend-income"/>Receitas</span><span><i className="legend-expenses"/>Despesas</span></div>
    {max === 0 ? <div className="chart-empty"><div className="chart-empty-icon"><BarChart3 size={27}/></div><b>Sem movimentações registradas</b><span>Os gráficos serão preenchidos conforme os lançamentos financeiros forem cadastrados.</span></div>
    : <div className="bar-chart" role="img" aria-label={`Receitas e despesas nos últimos seis meses: ${months.map(x=>x.label+' receitas '+x.income/100+' despesas '+x.expense/100).join('; ')}`}>
       {months.map(m => <div className="bar-group" key={m.label}><div className="bar-pair"><div className="bar income" style={{height:`${Math.max(2,m.income / max*100)}%`}} title={`Receitas R$ ${(m.income/100).toFixed(2)}`}/><div className="bar expense" style={{height:`${Math.max(2,m.expense/max*100)}%`}} title={`Despesas R$ ${(m.expense/100).toFixed(2)}`}/></div><span>{m.label}</span></div>)}
      </div>}
  </div>
}
