import { PLATFORM_LABELS } from '../data/sampleData'
import {
    PLATFORM_COLORS,
    totalsByPlatform,
    weeklyEngagementTrend,
    weeklyFollowerGainTrend,
} from '../lib/chartData'
import { formatNumber, formatPercent } from '../lib/format'
import { getWeeks } from '../lib/metrics'
import type { WeeklyMetric } from '../types'
import BarChartCard from './BarChartCard'
import type { BarDatum } from './BarChartCard'
import LineChartCard from './LineChartCard'

type PlatformsPageProps = {
    rows: WeeklyMetric[]
}

function PlatformsPage({ rows }: PlatformsPageProps) {
    if (rows.length === 0) {
        return (
            <section className="card">
                <h2 className="panel-title">No data</h2>
                <p>There is no data to show for the current selection.</p>
            </section>
        )
    }

    const weeks = getWeeks(rows)
    const totals = totalsByPlatform(rows)

    const engagementBars: BarDatum[] = totals.map((item) => ({
        name: PLATFORM_LABELS[item.platform],
        value: item.engagementRate,
        color: PLATFORM_COLORS[item.platform],
    }))

    const reachBars: BarDatum[] = totals.map((item) => ({
        name: PLATFORM_LABELS[item.platform],
        value: item.reach,
        color: PLATFORM_COLORS[item.platform],
    }))

    return (
        <>
            <p className="period-caption">
                Based on {weeks.length} weeks of data ({weeks[0]} to{' '}
                {weeks[weeks.length - 1]}, week start dates). Engagement rate is
                interactions divided by reach. Real platforms measure reach in
                different ways, so comparisons between platforms are only indicative.
            </p>

            <div className="chart-grid">
                <BarChartCard
                    title="Engagement rate by platform"
                    subtitle="Total interactions divided by total reach"
                    data={engagementBars}
                    valueType="percent"
                />
                <BarChartCard
                    title="Reach by platform"
                    subtitle="Total reach over the period"
                    data={reachBars}
                    valueType="number"
                />
                <LineChartCard
                    title="Weekly engagement rate"
                    subtitle="How engagement rate changed week by week"
                    data={weeklyEngagementTrend(rows)}
                    valueType="percent"
                />
                <LineChartCard
                    title="Weekly net follower growth"
                    subtitle="Followers gained minus followers lost each week"
                    data={weeklyFollowerGainTrend(rows)}
                    valueType="number"
                    showZeroLine
                />
            </div>

            <section className="card">
                <h2 className="panel-title">Platform summary</h2>
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Platform</th>
                                <th className="num">Reach</th>
                                <th className="num">Impressions</th>
                                <th className="num">Interactions</th>
                                <th className="num">Engagement rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {totals.map((item) => (
                                <tr key={item.platform}>
                                    <td>{PLATFORM_LABELS[item.platform]}</td>
                                    <td className="num">{formatNumber(item.reach)}</td>
                                    <td className="num">{formatNumber(item.impressions)}</td>
                                    <td className="num">{formatNumber(item.interactions)}</td>
                                    <td className="num">{formatPercent(item.engagementRate, 2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}

export default PlatformsPage