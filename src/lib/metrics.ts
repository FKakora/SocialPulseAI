import { PLATFORMS } from '../data/sampleData'
import type { Platform, WeeklyMetric } from '../types'

// Anything that has likes, comments and shares (a weekly row or a post).
type HasInteractions = { likes: number; comments: number; shares: number }

/** Add up a list of numbers. */
export function sum(values: number[]): number {
    return values.reduce((total, value) => total + value, 0)
}

/** Interactions = likes + comments + shares. */
export function interactionsOf(item: HasInteractions): number {
    return item.likes + item.comments + item.shares
}

/**
 * Engagement rate as a percentage: interactions / reach x 100.
 * Returns null (not 0) when reach is not above zero, because dividing by
 * zero would give a meaningless answer.
 */
export function engagementRate(
    interactions: number,
    reach: number,
): number | null {
    if (!(reach > 0)) return null
    return (interactions / reach) * 100
}

/**
 * Percentage change from previous to current.
 * Returns null when previous is 0, because the change is undefined.
 */
export function percentChange(
    current: number,
    previous: number,
): number | null {
    if (previous === 0) return null
    return ((current - previous) / previous) * 100
}

/** Unique week start dates, oldest first. */
export function getWeeks(rows: WeeklyMetric[]): string[] {
    return Array.from(new Set(rows.map((row) => row.weekStart))).sort()
}

export type PeriodSummary = {
    weeks: string[]
    reach: number
    impressions: number
    interactions: number
    engagementRate: number | null
    followerGrowth: number
}

export type PeriodComparison = {
    current: PeriodSummary
    previous: PeriodSummary
    reachChange: number | null
    impressionsChange: number | null
    interactionsChange: number | null
    engagementRateChangePoints: number | null
    followerGrowthChange: number | null
}

/**
 * Net follower growth over a set of weeks, added across platforms.
 * Growth = followers at the end of the last week - followers just before
 * the first week. For the very first week we use STARTING_FOLLOWERS.
 */
function followerGrowthForPeriod(
    allRows: WeeklyMetric[],
    weeks: string[],
    startingFollowers: Record<Platform, number>,
): number {
    if (weeks.length === 0) return 0
    const firstWeek = weeks[0]
    const lastWeek = weeks[weeks.length - 1]
    let total = 0

    for (const platform of PLATFORMS) {
        const rows = allRows
            .filter((row) => row.platform === platform)
            .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
        const firstIndex = rows.findIndex((row) => row.weekStart === firstWeek)
        const lastIndex = rows.findIndex((row) => row.weekStart === lastWeek)
        if (firstIndex === -1 || lastIndex === -1) continue

        const baseline =
            firstIndex === 0
                ? startingFollowers[platform]
                : rows[firstIndex - 1].followersEnd
        total += rows[lastIndex].followersEnd - baseline
    }
    return total
}

/** Totals and rates for one group of weeks. */
export function summarisePeriod(
    allRows: WeeklyMetric[],
    weeks: string[],
    startingFollowers: Record<Platform, number>,
): PeriodSummary {
    const rows = allRows.filter((row) => weeks.includes(row.weekStart))
    const reach = sum(rows.map((row) => row.reach))
    const impressions = sum(rows.map((row) => row.impressions))
    const interactions = sum(rows.map((row) => interactionsOf(row)))

    return {
        weeks,
        reach,
        impressions,
        interactions,
        // Total interactions / total reach (not an average of weekly rates).
        engagementRate: engagementRate(interactions, reach),
        followerGrowth: followerGrowthForPeriod(allRows, weeks, startingFollowers),
    }
}

/**
 * Compare the latest weeks with the same number of weeks before them.
 * With 8 weeks of data that means weeks 5-8 versus weeks 1-4.
 * Returns null if there are fewer than 2 weeks of data.
 */
export function comparePeriods(
    rows: WeeklyMetric[],
    startingFollowers: Record<Platform, number>,
): PeriodComparison | null {
    const weeks = getWeeks(rows)
    const half = Math.floor(weeks.length / 2)
    if (half < 1) return null

    const previous = summarisePeriod(rows, weeks.slice(0, half), startingFollowers)
    const current = summarisePeriod(
        rows,
        weeks.slice(weeks.length - half),
        startingFollowers,
    )

    return {
        current,
        previous,
        reachChange: percentChange(current.reach, previous.reach),
        impressionsChange: percentChange(current.impressions, previous.impressions),
        interactionsChange: percentChange(
            current.interactions,
            previous.interactions,
        ),
        // Rates are compared in percentage points, not as a percent of a percent.
        engagementRateChangePoints:
            current.engagementRate !== null && previous.engagementRate !== null
                ? current.engagementRate - previous.engagementRate
                : null,
        followerGrowthChange: percentChange(
            current.followerGrowth,
            previous.followerGrowth,
        ),
    }
}