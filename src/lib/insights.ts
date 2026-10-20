import {
    PLATFORMS,
    PLATFORM_LABELS,
    STARTING_FOLLOWERS,
} from '../data/sampleData'
import type { Platform, Post, WeeklyMetric } from '../types'
import { totalsByPlatform } from './chartData'
import { formatDate, formatNumber, formatPercent } from './format'
import { comparePeriods, engagementRate, interactionsOf, sum } from './metrics'

// ---------------------------------------------------------------------------
// Everything in this file is plain, fixed rules. No AI model is involved.
//   - A FINDING is a fact worked out from the numbers.
//   - A SUGGESTION is an idea triggered by one or more findings.
// ---------------------------------------------------------------------------

export type Tone = 'positive' | 'negative' | 'neutral'

export type Finding = {
    id: string
    label: string // short category, e.g. 'Platform', 'Trend', 'Post'
    title: string
    detail: string
    tone: Tone
}

export type Suggestion = {
    id: string
    basedOn: string // the id of the finding that triggered this suggestion
    title: string
    detail: string
}

export type Insights = {
    summary: string
    findings: Finding[]
    suggestions: Suggestion[]
    limitations: string[]
}

// Thresholds used by the rules. Small changes are treated as "no change".
const MIN_ENGAGEMENT_MOVE_POINTS = 0.1 // percentage points
const MIN_POSTS_PER_FORMAT = 2 // posts needed before comparing formats
const MIN_RATIO_FOR_PLATFORM_ADVICE = 1.5 // best rate vs weakest rate
const FLAT_ENGAGEMENT_POINTS = 0.05 // smaller moves count as "flat"
const MIN_FOLLOWER_SLOWDOWN = 25 // ignore slowdowns of fewer followers than this
const MIN_WEEKS_PER_PERIOD = 3 // fewer weeks make trends very noisy

const listFormat = new Intl.ListFormat('en-GB', {
    style: 'long',
    type: 'conjunction',
})

function label(platform: Platform): string {
    return PLATFORM_LABELS[platform]
}

/** 1 -> 'week', 4 -> '4 weeks' (used in "the previous week / 4 weeks"). */
function periodText(count: number): string {
    return count === 1 ? 'week' : `${count} weeks`
}

/** Findings about a change in a count or total (reach, follower growth). */
function changeFinding(
    id: string,
    metric: string,
    change: number | null,
    previousText: string,
    currentText: string,
    periodText: string,
): Finding {
    if (change === null) {
        return {
            id,
            label: 'Trend',
            tone: 'neutral',
            title: `${metric}: change cannot be calculated`,
            detail: `The previous ${periodText} had no value to compare against (now ${currentText}).`,
        }
    }
    const rounded = Math.round(change * 10) / 10
    const detail = `${previousText} in the previous ${periodText}; ${currentText} in the latest ${periodText}.`
    if (rounded === 0) {
        return { id, label: 'Trend', tone: 'neutral', title: `${metric} was flat`, detail }
    }
    const rose = rounded > 0
    return {
        id,
        label: 'Trend',
        tone: rose ? 'positive' : 'negative',
        title: `${metric} ${rose ? 'rose' : 'fell'} ${Math.abs(rounded).toFixed(1)}%`,
        detail,
    }
}

export function generateInsights(
    platformRows: WeeklyMetric[], // selected platforms, ALL weeks
    weeks: string[], // the selected weeks, oldest first
    posts: Post[], // posts matching the filters
): Insights {
    const findings: Finding[] = []
    const suggestions: Suggestion[] = []
    const limitations: string[] = [
        'All figures come from fictional sample data, not from real accounts.',
        'Combined reach adds the platforms together, so people reached on more than one platform are counted more than once.',
        'Real platforms define reach differently, so comparisons between platforms are only indicative.',
        'The posts are a sample of activity. Their totals do not match the weekly platform totals.',
    ]

    const visibleRows = platformRows.filter((row) => weeks.includes(row.weekStart))
    if (visibleRows.length === 0) {
        return {
            summary: 'There is no data for the current selection.',
            findings,
            suggestions,
            limitations,
        }
    }

    // ---------- Summary ----------
    const totals = totalsByPlatform(visibleRows)
    const totalReach = sum(totals.map((item) => item.reach))
    const totalImpressions = sum(totals.map((item) => item.impressions))
    const totalInteractions = sum(totals.map((item) => item.interactions))
    const overallRate = engagementRate(totalInteractions, totalReach)
    const names = listFormat.format(totals.map((item) => label(item.platform)))
    const weekSpan =
        weeks.length === 1
            ? `the week starting ${weeks[0]}`
            : `${weeks.length} weeks starting ${weeks[0]} to ${weeks[weeks.length - 1]}`
    const summary =
        `${names}, ${weekSpan}: ` +
        `combined reach was ${formatNumber(totalReach)}, impressions ${formatNumber(totalImpressions)} ` +
        `and interactions ${formatNumber(totalInteractions)}, an overall engagement rate of ${formatPercent(overallRate, 2)}.`

    // ---------- Platform findings ----------
    const rated = totals.flatMap((item) =>
        item.engagementRate === null
            ? []
            : [{ platform: item.platform, rate: item.engagementRate }],
    )

    let bestPlatformRate: { platform: Platform; rate: number } | null = null
    let weakestPlatformRate: { platform: Platform; rate: number } | null = null

    if (rated.length >= 2) {
        const best = rated.reduce((a, b) => (b.rate > a.rate ? b : a))
        const weakest = rated.reduce((a, b) => (b.rate < a.rate ? b : a))
        if (best.platform !== weakest.platform && best.rate > weakest.rate) {
            bestPlatformRate = best
            weakestPlatformRate = weakest
            const ratioText =
                weakest.rate > 0
                    ? ` ${label(best.platform)}'s rate is ${(best.rate / weakest.rate).toFixed(1)} times as high.`
                    : ''
            findings.push({
                id: 'best-engagement',
                label: 'Platform',
                tone: 'positive',
                title: `${label(best.platform)} has the highest engagement rate`,
                detail: `${formatPercent(best.rate, 2)} (interactions divided by reach), against ${formatPercent(weakest.rate, 2)} on ${label(weakest.platform)}.`,
            })
            findings.push({
                id: 'weakest-engagement',
                label: 'Platform',
                tone: 'negative',
                title: `${label(weakest.platform)} has the lowest engagement rate`,
                detail: `${formatPercent(weakest.rate, 2)}.${ratioText}`,
            })
        }
    }

    if (totals.length >= 2 && totalReach > 0) {
        const top = totals.reduce((a, b) => (b.reach > a.reach ? b : a))
        findings.push({
            id: 'largest-reach',
            label: 'Platform',
            tone: 'neutral',
            title: `${label(top.platform)} delivers the most reach`,
            detail: `${formatNumber(top.reach)} reach, ${formatPercent((top.reach / totalReach) * 100, 1)} of the combined total.`,
        })
    }

    // ---------- Trend findings (latest weeks vs the weeks before) ----------
    const comparison = comparePeriods(platformRows, STARTING_FOLLOWERS, weeks)
    if (comparison) {
        const { current, previous } = comparison
        const period = periodText(current.weeks.length)

        findings.push(
            changeFinding(
                'reach-trend',
                'Total reach',
                comparison.reachChange,
                formatNumber(previous.reach),
                formatNumber(current.reach),
                period,
            ),
        )

        const points = comparison.engagementRateChangePoints
        if (points !== null) {
            const roundedPoints = Math.round(points * 100) / 100
            const detail = `${formatPercent(previous.engagementRate, 2)} in the previous ${period}; ${formatPercent(current.engagementRate, 2)} in the latest ${period}.`
            if (Math.abs(roundedPoints) < FLAT_ENGAGEMENT_POINTS) {
                findings.push({
                    id: 'engagement-trend',
                    label: 'Trend',
                    tone: 'neutral',
                    title: 'Engagement rate was flat',
                    detail,
                })
            } else {
                const rose = roundedPoints > 0
                findings.push({
                    id: 'engagement-trend',
                    label: 'Trend',
                    tone: rose ? 'positive' : 'negative',
                    title: `Engagement rate ${rose ? 'rose' : 'fell'} ${Math.abs(roundedPoints).toFixed(2)} percentage points`,
                    detail,
                })
            }
        }

        findings.push(
            changeFinding(
                'follower-trend',
                'Net follower growth',
                comparison.followerGrowthChange,
                `${formatNumber(previous.followerGrowth)} net new followers`,
                `${formatNumber(current.followerGrowth)}`,
                period,
            ),
        )

        // Suggestion: reach grew but follower growth slowed.
        if (
            comparison.reachChange !== null &&
            comparison.reachChange > 0 &&
            current.followerGrowth < previous.followerGrowth
        ) {
            suggestions.push({
                id: 'convert-reach',
                basedOn: 'follower-trend',
                title: 'Turn extra reach into followers',
                detail:
                    'Reach grew but net follower growth slowed. Try a clear follow prompt in the highest-reach posts for a few weeks and check whether follower growth responds.',
            })
        }
        if (current.weeks.length < MIN_WEEKS_PER_PERIOD) {
            const count = current.weeks.length
            limitations.push(
                `Each trend compares only ${count === 1 ? 'one week' : `${count} weeks`} with the ${count === 1 ? 'week' : `${count} weeks`} before it. Short periods are noisy, so treat these trends with caution.`,
            )
        }
    } else {
        limitations.push(
            'Trend findings need at least 2 selected weeks, so they are not shown for this selection.',
        )
    }

    // ---------- Platform movers (needs the same period split per platform) ----------
    const movers = totals.flatMap((item) => {
        const rows = platformRows.filter((row) => row.platform === item.platform)
        const result = comparePeriods(rows, STARTING_FOLLOWERS, weeks)
        if (
            !result ||
            result.previous.engagementRate === null ||
            result.current.engagementRate === null
        ) {
            return []
        }
        return [
            {
                platform: item.platform,
                previousRate: result.previous.engagementRate,
                currentRate: result.current.engagementRate,
                points: result.current.engagementRate - result.previous.engagementRate,
                previousGrowth: result.previous.followerGrowth,
                currentGrowth: result.current.followerGrowth,
            },
        ]
    })

    if (movers.length >= 2) {
        const gain = movers.reduce((a, b) => (b.points > a.points ? b : a))
        const drop = movers.reduce((a, b) => (b.points < a.points ? b : a))
        if (gain.points >= MIN_ENGAGEMENT_MOVE_POINTS) {
            findings.push({
                id: 'engagement-gain',
                label: 'Trend',
                tone: 'positive',
                title: `${label(gain.platform)} improved its engagement rate the most`,
                detail: `Up ${gain.points.toFixed(2)} percentage points, from ${formatPercent(gain.previousRate, 2)} to ${formatPercent(gain.currentRate, 2)}.`,
            })
        }
        if (drop.points <= -MIN_ENGAGEMENT_MOVE_POINTS) {
            findings.push({
                id: 'engagement-drop',
                label: 'Trend',
                tone: 'negative',
                title: `${label(drop.platform)} lost the most engagement rate`,
                detail: `Down ${Math.abs(drop.points).toFixed(2)} percentage points, from ${formatPercent(drop.previousRate, 2)} to ${formatPercent(drop.currentRate, 2)}.`,
            })
        }

        const slowdown = movers.reduce((a, b) =>
            b.currentGrowth - b.previousGrowth < a.currentGrowth - a.previousGrowth
                ? b
                : a,
        )
        if (slowdown.previousGrowth - slowdown.currentGrowth >= MIN_FOLLOWER_SLOWDOWN) {
            findings.push({
                id: 'follower-slowdown',
                label: 'Trend',
                tone: 'negative',
                title: `${label(slowdown.platform)} had the biggest slowdown in follower growth`,
                detail: `${formatNumber(slowdown.previousGrowth)} net new followers in the previous period against ${formatNumber(slowdown.currentGrowth)} in the latest.`,
            })
        }
    }

    // Suggestion: the platform whose engagement rate fell by the most.
    if (movers.length >= 1) {
        const drop = movers.reduce((a, b) => (b.points < a.points ? b : a))
        if (drop.points <= -MIN_ENGAGEMENT_MOVE_POINTS) {
            suggestions.push({
                id: 'review-drop',
                basedOn: movers.length >= 2 ? 'engagement-drop' : 'engagement-trend',
                title: `Review recent ${label(drop.platform)} posts`,
                detail: `Compare the latest posts with earlier ones and test two different opening hooks or formats to see what lifts engagement again.`,
            })
        }
    }

    // Suggestion: learn from the strongest platform.
    if (
        bestPlatformRate &&
        weakestPlatformRate &&
        weakestPlatformRate.rate > 0 &&
        bestPlatformRate.rate / weakestPlatformRate.rate >=
        MIN_RATIO_FOR_PLATFORM_ADVICE
    ) {
        suggestions.push({
            id: 'borrow-from-best',
            basedOn: 'weakest-engagement',
            title: `Test ${label(bestPlatformRate.platform)}-style content on ${label(weakestPlatformRate.platform)}`,
            detail: `Look at the formats and opening hooks behind ${label(bestPlatformRate.platform)}'s strongest posts and try adapted versions on ${label(weakestPlatformRate.platform)} for a few weeks, then compare engagement rates.`,
        })
    }

    // ---------- Post findings ----------
    if (posts.length >= 2) {
        const ratedPosts = posts.flatMap((post) => {
            const rate = engagementRate(interactionsOf(post), post.reach)
            return rate === null ? [] : [{ post, rate }]
        })

        let bestPostId: string | null = null
        if (ratedPosts.length >= 1) {
            const best = ratedPosts.reduce((a, b) => (b.rate > a.rate ? b : a))
            bestPostId = best.post.id
            findings.push({
                id: 'best-post',
                label: 'Post',
                tone: 'positive',
                title: `Best post by engagement rate: "${best.post.title}"`,
                detail: `${label(best.post.platform)} ${best.post.format}, ${formatDate(best.post.date)}: ${formatPercent(best.rate, 2)} engagement rate on a reach of ${formatNumber(best.post.reach)}.`,
            })
        }

        // Only mention the highest-reach post if it is a different post.
        const topReach = posts.reduce((a, b) => (b.reach > a.reach ? b : a))
        if (topReach.id !== bestPostId) {
            findings.push({
                id: 'top-reach-post',
                label: 'Post',
                tone: 'neutral',
                title: `Highest reach: "${topReach.title}"`,
                detail: `${label(topReach.platform)} ${topReach.format}, ${formatDate(topReach.date)}: reach of ${formatNumber(topReach.reach)}.`,
            })
        }

        if (new Set(posts.map((post) => post.platform)).size > 1) {
            limitations.push(
                'The best-post finding compares posts across platforms, and platforms differ in typical engagement. Compare within a platform on the Posts tab for a fairer view.',
            )
        }
    } else {
        limitations.push(
            'Fewer than 2 posts match the current filters, so no post comparison is shown.',
        )
    }

    // ---------- Format findings (within one platform) ----------
    let formatFindingCount = 0
    for (const platform of PLATFORMS) {
        const groups = new Map<string, Post[]>()
        for (const post of posts.filter((item) => item.platform === platform)) {
            groups.set(post.format, [...(groups.get(post.format) ?? []), post])
        }
        const comparable = Array.from(groups.entries()).flatMap(([format, items]) => {
            if (items.length < MIN_POSTS_PER_FORMAT) return []
            const rate = engagementRate(
                sum(items.map((item) => interactionsOf(item))),
                sum(items.map((item) => item.reach)),
            )
            return rate === null ? [] : [{ format, count: items.length, rate }]
        })
        if (comparable.length < 2) continue

        const best = comparable.reduce((a, b) => (b.rate > a.rate ? b : a))
        const worst = comparable.reduce((a, b) => (b.rate < a.rate ? b : a))
        if (best.rate <= worst.rate) continue

        formatFindingCount += 1
        findings.push({
            id: `format-${platform}`,
            label: 'Format',
            tone: 'neutral',
            title: `${label(platform)}: ${best.format} posts engaged best`,
            detail: `${best.format} posts averaged ${formatPercent(best.rate, 2)} (${best.count} posts) against ${formatPercent(worst.rate, 2)} for ${worst.format} (${worst.count} posts). This is a very small sample.`,
        })
        suggestions.push({
            id: `format-${platform}-suggestion`,
            basedOn: `format-${platform}`,
            title: `Try more ${best.format} content on ${label(platform)}`,
            detail: `${best.format} posts did better in this small sample. Publish a few more and re-check before changing the whole plan.`,
        })
    }
    if (formatFindingCount === 0) {
        limitations.push(
            `Format comparisons need at least ${MIN_POSTS_PER_FORMAT} posts for each of at least 2 formats on a platform. The current selection does not have that, so none are shown.`,
        )
    }

    return { summary, findings, suggestions, limitations }
}