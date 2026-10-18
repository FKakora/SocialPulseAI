import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { PLATFORMS, PLATFORM_LABELS } from '../data/sampleData'
import { PLATFORM_COLORS } from '../lib/chartData'
import type { TrendPoint } from '../lib/chartData'
import { formatNumber } from '../lib/format'

type LineChartCardProps = {
    title: string
    subtitle: string
    data: TrendPoint[]
    valueType: 'number' | 'percent'
    showZeroLine?: boolean
}

// '2026-08-24' -> '24 Aug'
function shortDate(isoDate: string): string {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    })
}

function formatValue(value: unknown, valueType: 'number' | 'percent'): string {
    const number = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(number)) return 'n/a'
    return valueType === 'percent' ? `${number.toFixed(2)}%` : formatNumber(number)
}

function LineChartCard({
    title,
    subtitle,
    data,
    valueType,
    showZeroLine = false,
}: LineChartCardProps) {
    return (
        <section className="card chart-card">
            <h2 className="panel-title">{title}</h2>
            <p className="card-note">{subtitle}</p>
            <div className="chart-area">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="week"
                            tickLine={false}
                            tickFormatter={(value: string) => shortDate(value)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) =>
                                valueType === 'percent' ? `${value}%` : String(value)
                            }
                        />
                        <Tooltip
                            labelFormatter={(label) => `Week starting ${shortDate(String(label))}`}
                            formatter={(value) => formatValue(value, valueType)}
                        />
                        <Legend />
                        {showZeroLine && <ReferenceLine y={0} stroke="#94a3b8" />}
                        {PLATFORMS.map((platform) => (
                            <Line
                                key={platform}
                                type="monotone"
                                dataKey={platform}
                                name={PLATFORM_LABELS[platform]}
                                stroke={PLATFORM_COLORS[platform]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}

export default LineChartCard