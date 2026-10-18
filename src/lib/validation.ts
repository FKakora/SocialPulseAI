import { PLATFORMS } from '../data/sampleData'
import type { Post, WeeklyMetric } from '../types'
import { interactionsOf } from './metrics'

export type CheckResult = {
    id: string
    name: string
    passed: boolean
    problems: string[] // empty when the check passed
}

export type QualityReport = {
    checks: CheckResult[]
    passedCount: number
    failedCount: number
    allPassed: boolean
}

const WEEKLY_COUNT_FIELDS = [
    'reach',
    'impressions',
    'likes',
    'comments',
    'shares',
    'followersEnd',
] as const

const POST_COUNT_FIELDS = [
    'reach',
    'impressions',
    'likes',
    'comments',
    'shares',
] as const

const DAY_MS = 24 * 60 * 60 * 1000

// A valid count is a whole number that is zero or more.
function isValidCount(value: unknown): boolean {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

// A valid date looks like 2026-08-24 AND is a real calendar date.
function isValidIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isMonday(value: string): boolean {
    return new Date(`${value}T00:00:00Z`).getUTCDay() === 1
}

function daysBetween(earlier: string, later: string): number {
    return (
        (Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) /
        DAY_MS
    )
}

function makeCheck(id: string, name: string, problems: string[]): CheckResult {
    return { id, name, passed: problems.length === 0, problems }
}

function weeklyLabel(row: WeeklyMetric): string {
    return `${row.platform}, week ${row.weekStart}`
}

function postLabel(post: Post): string {
    return `Post ${post.id}`
}

export function runDataQualityChecks(
    weekly: WeeklyMetric[],
    posts: Post[],
): QualityReport {
    const checks: CheckResult[] = []

    // ---------- Weekly platform data ----------

    // 1. Missing, negative, decimal or non-numeric values
    const countProblems: string[] = []
    for (const row of weekly) {
        for (const field of WEEKLY_COUNT_FIELDS) {
            if (!isValidCount(row[field])) {
                countProblems.push(
                    `${weeklyLabel(row)}: "${field}" is missing or invalid (${String(row[field])})`,
                )
            }
        }
    }
    checks.push(
        makeCheck(
            'weekly-counts',
            'Weekly metrics are whole numbers of zero or more',
            countProblems,
        ),
    )

    // 2. Platform names
    const platformProblems: string[] = []
    for (const row of weekly) {
        if (!PLATFORMS.includes(row.platform)) {
            platformProblems.push(`${weeklyLabel(row)}: unknown platform`)
        }
    }
    checks.push(
        makeCheck(
            'weekly-platforms',
            'Every weekly row uses a known platform',
            platformProblems,
        ),
    )

    // 3. Dates are real and are Mondays
    const dateProblems: string[] = []
    for (const row of weekly) {
        if (!isValidIsoDate(row.weekStart)) {
            dateProblems.push(`${weeklyLabel(row)}: invalid date`)
        } else if (!isMonday(row.weekStart)) {
            dateProblems.push(`${weeklyLabel(row)}: week does not start on a Monday`)
        }
    }
    checks.push(
        makeCheck(
            'weekly-dates',
            'Weekly dates are real dates that start on a Monday',
            dateProblems,
        ),
    )

    // 4. Duplicate platform + week rows
    const duplicateProblems: string[] = []
    const seenKeys = new Set<string>()
    for (const row of weekly) {
        const key = `${row.platform}|${row.weekStart}`
        if (seenKeys.has(key)) {
            duplicateProblems.push(`${weeklyLabel(row)}: duplicate row`)
        } else {
            seenKeys.add(key)
        }
    }
    checks.push(
        makeCheck(
            'weekly-duplicates',
            'No duplicate platform-and-week rows',
            duplicateProblems,
        ),
    )

    // 5. Every platform has every week, with no gaps in the timeline
    const completeProblems: string[] = []
    const validWeeks = Array.from(new Set(weekly.map((row) => row.weekStart)))
        .filter(isValidIsoDate)
        .sort()
    for (const platform of PLATFORMS) {
        for (const week of validWeeks) {
            if (!seenKeys.has(`${platform}|${week}`)) {
                completeProblems.push(`Missing row: ${platform}, week ${week}`)
            }
        }
    }
    for (let i = 1; i < validWeeks.length; i++) {
        if (daysBetween(validWeeks[i - 1], validWeeks[i]) !== 7) {
            completeProblems.push(
                `Gap in timeline between ${validWeeks[i - 1]} and ${validWeeks[i]}`,
            )
        }
    }
    checks.push(
        makeCheck(
            'weekly-complete',
            'Every platform has every week, with no timeline gaps',
            completeProblems,
        ),
    )

    // 6. Impressions can never be lower than reach
    const impressionProblems: string[] = []
    for (const row of weekly) {
        if (row.impressions < row.reach) {
            impressionProblems.push(
                `${weeklyLabel(row)}: impressions (${row.impressions}) are lower than reach (${row.reach})`,
            )
        }
    }
    checks.push(
        makeCheck(
            'weekly-impressions',
            'Impressions are never lower than reach',
            impressionProblems,
        ),
    )

    // 7. Engagement rate can be calculated and is not above 100%
    const engagementProblems: string[] = []
    for (const row of weekly) {
        if (!(row.reach > 0)) {
            engagementProblems.push(
                `${weeklyLabel(row)}: reach is not above 0, so engagement rate cannot be calculated`,
            )
        } else if (interactionsOf(row) > row.reach) {
            engagementProblems.push(
                `${weeklyLabel(row)}: interactions (${interactionsOf(row)}) exceed reach (${row.reach})`,
            )
        }
    }
    checks.push(
        makeCheck(
            'weekly-engagement',
            'Engagement rate can be calculated and is not above 100%',
            engagementProblems,
        ),
    )

    // ---------- Individual posts ----------

    // 8. Post IDs
    const idProblems: string[] = []
    const seenIds = new Set<string>()
    for (const post of posts) {
        if (post.id.trim() === '') {
            idProblems.push('A post has an empty ID')
        } else if (seenIds.has(post.id)) {
            idProblems.push(`${postLabel(post)}: duplicate ID`)
        } else {
            seenIds.add(post.id)
        }
    }
    checks.push(
        makeCheck('post-ids', 'Every post has a unique ID', idProblems),
    )

    // 9. Post metric values
    const postCountProblems: string[] = []
    for (const post of posts) {
        for (const field of POST_COUNT_FIELDS) {
            if (!isValidCount(post[field])) {
                postCountProblems.push(
                    `${postLabel(post)}: "${field}" is missing or invalid (${String(post[field])})`,
                )
            }
        }
    }
    checks.push(
        makeCheck(
            'post-counts',
            'Post metrics are whole numbers of zero or more',
            postCountProblems,
        ),
    )

    // 10. Post platform and date
    const postBasicProblems: string[] = []
    for (const post of posts) {
        if (!PLATFORMS.includes(post.platform)) {
            postBasicProblems.push(`${postLabel(post)}: unknown platform`)
        }
        if (!isValidIsoDate(post.date)) {
            postBasicProblems.push(`${postLabel(post)}: invalid date`)
        }
    }
    checks.push(
        makeCheck(
            'post-basics',
            'Every post has a known platform and a real date',
            postBasicProblems,
        ),
    )

    // 11. Post impressions vs reach
    const postImpressionProblems: string[] = []
    for (const post of posts) {
        if (post.impressions < post.reach) {
            postImpressionProblems.push(
                `${postLabel(post)}: impressions (${post.impressions}) are lower than reach (${post.reach})`,
            )
        }
    }
    checks.push(
        makeCheck(
            'post-impressions',
            'Post impressions are never lower than post reach',
            postImpressionProblems,
        ),
    )

    // 12. Post engagement
    const postEngagementProblems: string[] = []
    for (const post of posts) {
        if (!(post.reach > 0)) {
            postEngagementProblems.push(
                `${postLabel(post)}: reach is not above 0, so engagement rate cannot be calculated`,
            )
        } else if (interactionsOf(post) > post.reach) {
            postEngagementProblems.push(
                `${postLabel(post)}: interactions (${interactionsOf(post)}) exceed reach (${post.reach})`,
            )
        }
    }
    checks.push(
        makeCheck(
            'post-engagement',
            'Post engagement rates can be calculated and are not above 100%',
            postEngagementProblems,
        ),
    )

    // 13. Posts fall inside the date range of the weekly data
    const rangeProblems: string[] = []
    if (validWeeks.length > 0) {
        const rangeStart = validWeeks[0]
        const rangeEnd = new Date(
            Date.parse(`${validWeeks[validWeeks.length - 1]}T00:00:00Z`) + 6 * DAY_MS,
        )
            .toISOString()
            .slice(0, 10)
        for (const post of posts) {
            if (isValidIsoDate(post.date) && (post.date < rangeStart || post.date > rangeEnd)) {
                rangeProblems.push(
                    `${postLabel(post)}: date ${post.date} is outside ${rangeStart} to ${rangeEnd}`,
                )
            }
        }
    }
    checks.push(
        makeCheck(
            'post-range',
            'Posts fall inside the date range of the weekly data',
            rangeProblems,
        ),
    )

    const passedCount = checks.filter((check) => check.passed).length
    return {
        checks,
        passedCount,
        failedCount: checks.length - passedCount,
        allPassed: passedCount === checks.length,
    }
}