import { PLATFORMS, STARTING_FOLLOWERS } from '../data/sampleData'
import type { Platform, WeeklyMetric } from '../types'
import { engagementRate, getWeeks, interactionsOf, sum } from './metrics'

// One colour per platform, used the same way in every chart.
export const PLATFORM_COLORS: Record<Platform, string> = {
    instagram: '#d6249f',
    tiktok: '#14b8a6',
    youtube: '#ef4444',
    facebook: '#2f80ff',
}

export type PlatformTotals = {
    platform: Platform
    reach: number
    impressions: number
    interactions: number
    engagementRate: number | null
}

/** One row of totals per platform, added up across the weeks given. */
export function totalsByPlatform(rows: WeeklyMetric[]): PlatformTotals[] {
    // Only platforms that have rows, so a filtered-out platform is not shown.
    const platformsWithData = PLATFORMS.filter((platform) =>
        rows.some((row) => row.platform === platform),
    )
    return platformsWithData.map((platform) => {
        const platformRows = rows.filter((row) => row.platform === platform)
        const reach = sum(platformRows.map((row) => row.reach))
        const impressions = sum(platformRows.map((row) => row.impressions))
        const interactions = sum(platformRows.map((row) => interactionsOf(row)))
        return {
            platform,
            reach,
            impressions,
            interactions,
            engagementRate: engagementRate(interactions, reach),
        }
    })
}

// One point on a trend chart: a week plus one value per platform.
// null means "no value for this platform that week" (the line has a gap).
export type TrendPoint = { week: string } & Record<Platform, number | null>

function emptyValues(): Record<Platform, number | null> {
    return { instagram: null, tiktok: null, youtube: null, facebook: null }
}

/** Engagement rate (%) for each platform, week by week. */
export function weeklyEngagementTrend(rows: WeeklyMetric[]): TrendPoint[] {
    return getWeeks(rows).map((week) => {
        const values = emptyValues()
        for (const platform of PLATFORMS) {
            const row = rows.find(
                (r) => r.weekStart === week && r.platform === platform,
            )
            values[platform] = row
                ? engagementRate(interactionsOf(row), row.reach)
                : null
        }
        return { week, ...values }
    })
}

/**
 * Net new followers for each platform, week by week.
 * Gain = followers at the end of this week - followers at the end of the
 * previous week (STARTING_FOLLOWERS is used for the very first week).
 *
 * rows:         should include ALL weeks for the platforms you want, so the
 *               first visible week still has a correct "previous week".
 * visibleWeeks: the weeks to return (defaults to every week in rows).
 */
export function weeklyFollowerGainTrend(
    rows: WeeklyMetric[],
    visibleWeeks: string[] = getWeeks(rows),
): TrendPoint[] {
    const gains = new Map<string, number>()

    for (const platform of PLATFORMS) {
        const platformRows = rows
            .filter((row) => row.platform === platform)
            .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
        let previous = STARTING_FOLLOWERS[platform]
        for (const row of platformRows) {
            gains.set(`${platform}|${row.weekStart}`, row.followersEnd - previous)
            previous = row.followersEnd
        }
    }

    return visibleWeeks.map((week) => {
        const values = emptyValues()
        for (const platform of PLATFORMS) {
            values[platform] = gains.get(`${platform}|${week}`) ?? null
        }
        return { week, ...values }
    })
}