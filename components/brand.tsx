export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand">
    <div className="brand-symbol"><span>A</span></div>
    {!compact && <div className="brand-copy"><strong>ARCEUZ<span>.</span></strong><small>COMMAND CENTER</small></div>}
  </div>
}
