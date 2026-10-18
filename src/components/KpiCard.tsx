import type { Kpi } from '../lib/kpis'

type KpiCardProps = {
    kpi: Kpi
    comparisonLabel: string // e.g. "vs previous 4 weeks"
}

function KpiCard({ kpi, comparisonLabel }: KpiCardProps) {
    return (
        <div className="card kpi-card">
            <div className="card-label">{kpi.label}</div>
            <div className="card-value">{kpi.value}</div>
            <div className="kpi-change-row">
                <span className={`trend ${kpi.trend}`}>{kpi.changeText}</span>
                <span className="kpi-compare">{comparisonLabel}</span>
            </div>
            <div className="card-note">{kpi.note}</div>
        </div>
    )
}

export default KpiCard