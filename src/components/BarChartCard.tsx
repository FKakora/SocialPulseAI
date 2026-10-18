import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { formatNumber } from '../lib/format'

export type BarDatum = {
    name: string
    value: number | null
    color: string
}

type BarChartCardProps = {
    title: string
    subtitle: string
    data: BarDatum[]
    valueType: 'number' | 'percent'
}

const compactFormat = new Intl.NumberFormat('en-GB', { notation: 'compact' })

function formatValue(value: unknown, valueType: 'number' | 'percent'): string {
    const number = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(number)) return 'n/a'
    return valueType === 'percent' ? `${number.toFixed(2)}%` : formatNumber(number)
}

function formatTick(value: number, valueType: 'number' | 'percent'): string {
    return valueType === 'percent' ? `${value}%` : compactFormat.format(value)
}

function BarChartCard({ title, subtitle, data, valueType }: BarChartCardProps) {
    return (
        <section className="card chart-card">
            <h2 className="panel-title">{title}</h2>
            <p className="card-note">{subtitle}</p>
            <div className="chart-area">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) => formatTick(value, valueType)}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(47, 128, 255, 0.06)' }}
                            formatter={(value) => formatValue(value, valueType)}
                        />
                        <Bar dataKey="value" name={title} radius={[6, 6, 0, 0]}>
                            {data.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}

export default BarChartCard