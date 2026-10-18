import { formatChange, formatNumber, formatPercent } from './format'
import type { PeriodComparison } from './metrics'

export type Trend = 'up' | 'down' | 'flat' | 'na'

export type Kpi = {
    id: string
    label: string
    value: string // the headline number, already formatted for display
    changeText: string // e.g. "+9.7%" or "n/a"
    trend: Trend
    note: string // one line explaining what the number means
}

// Decide the trend from the number the user will actually SEE.
// A change of +0.04% is shown as "+0.0%", so we treat it as flat.
function trendOf(change: number | null): Trend {
    if (change === null) return 'na'
    const rounded = Math.round(change * 10) / 10
    if (rounded > 0) return 'up'
    if (rounded < 0) return 'down'
    return 'flat'
}

function signedNumber(value: number): string {
    return `${value > 0 ? '+' : ''}${formatNumber(value)}`
}

/** Turn the calculated period comparison into the five KPI card contents. */
export function buildKpis(comparison: PeriodComparison): Kpi[] {
    const { current } = comparison

    return [
        {
            id: 'reach',
            label: 'Total reach',
            value: formatNumber(current.reach),
            changeText: formatChange(comparison.reachChange),
            trend: trendOf(comparison.reachChange),
            note: 'Added across platforms, so overlap is not removed',
        },
        {
            id: 'impressions',
            label: 'Impressions',
            value: formatNumber(current.impressions),
            changeText: formatChange(comparison.impressionsChange),
            trend: trendOf(comparison.impressionsChange),
            note: 'Total times content was shown',
        },
        {
            id: 'engagement',
            label: 'Engagement rate',
            value: formatPercent(current.engagementRate, 2),
            changeText: formatChange(comparison.engagementRateChangePoints, ' pts'),
            trend: trendOf(comparison.engagementRateChangePoints),
            note: 'Interactions divided by reach',
        },
        {
            id: 'interactions',
            label: 'Total interactions',
            value: formatNumber(current.interactions),
            changeText: formatChange(comparison.interactionsChange),
            trend: trendOf(comparison.interactionsChange),
            note: 'Likes + comments + shares',
        },
        {
            id: 'followers',
            label: 'Follower growth',
            value: signedNumber(current.followerGrowth),
            changeText: formatChange(comparison.followerGrowthChange),
            trend: trendOf(comparison.followerGrowthChange),
            note: 'Net new followers across all platforms',
        },
    ]
}