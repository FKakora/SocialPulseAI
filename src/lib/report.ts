import { DATA_NOTICE, PLATFORM_LABELS, STARTING_FOLLOWERS } from '../data/sampleData'
import type { Platform, Post, WeeklyMetric } from '../types'
import { totalsByPlatform } from './chartData'
import type { PlatformTotals } from './chartData'
import { formatNumber, formatPercent } from './format'
import { generateInsights } from './insights'
import type { Insights } from './insights'
import { buildKpis } from './kpis'
import type { Kpi } from './kpis'
import { comparePeriods } from './metrics'
import type { QualityReport } from './validation'

export type ReportData = {
    title: string
    generatedOn: string
    dataNotice: string
    platformsText: string
    periodText: string
    comparisonText: string | null
    qualityText: string
    qualityWarning: string | null
    kpis: Kpi[]
    platformTotals: PlatformTotals[]
    insights: Insights
}

type BuildReportInput = {
    platformRows: WeeklyMetric[] // selected platforms, ALL weeks
    weeks: string[] // the selected weeks, oldest first
    posts: Post[] // posts matching the filters
    platforms: Platform[] // the selected platforms
    quality: QualityReport
    generatedOn: string // already formatted, e.g. '19 Oct 2026'
}

const listFormat = new Intl.ListFormat('en-GB', {
    style: 'long',
    type: 'conjunction',
})

function weeksLabel(count: number): string {
    return `${count} ${count === 1 ? 'week' : 'weeks'}`
}

function range(weeks: string[]): string {
    return weeks.length === 1 ? weeks[0] : `${weeks[0]} to ${weeks[weeks.length - 1]}`
}

/** Gather everything the report needs. Nothing here is formatted for a screen. */
export function buildReport(input: BuildReportInput): ReportData {
    const { platformRows, weeks, posts, platforms, quality, generatedOn } = input
    const visibleRows = platformRows.filter((row) => weeks.includes(row.weekStart))
    const comparison = comparePeriods(platformRows, STARTING_FOLLOWERS, weeks)

    let comparisonText: string | null = null
    if (comparison) {
        const unused = weeks.length - 2 * comparison.current.weeks.length
        comparisonText =
            `Latest ${weeksLabel(comparison.current.weeks.length)} (${range(comparison.current.weeks)}) ` +
            `compared with the previous ${weeksLabel(comparison.previous.weeks.length)} (${range(comparison.previous.weeks)}).` +
            (unused > 0
                ? ' The oldest selected week is not used, so both periods are the same length.'
                : '')
    }

    const failedNames = quality.checks
        .filter((check) => !check.passed)
        .map((check) => check.name)

    return {
        title: 'SocialPulse AI: performance report',
        generatedOn,
        dataNotice: DATA_NOTICE,
        platformsText: listFormat.format(platforms.map((p) => PLATFORM_LABELS[p])),
        periodText: `${weeksLabel(weeks.length)} of data, week start dates ${range(weeks)}`,
        comparisonText,
        qualityText: `${quality.passedCount} of ${quality.checks.length} data quality checks passed`,
        qualityWarning:
            failedNames.length > 0
                ? `${failedNames.length} data quality check(s) failed (${failedNames.join('; ')}). The figures in this report may be unreliable.`
                : null,
        kpis: comparison ? buildKpis(comparison) : [],
        platformTotals: totalsByPlatform(visibleRows),
        insights: generateInsights(platformRows, weeks, posts),
    }
}

function row(cells: string[]): string {
    return `| ${cells.join(' | ')} |`
}

/** The report as Markdown text (works as plain text too). */
export function reportToMarkdown(report: ReportData): string {
    const lines: string[] = []
    const { insights } = report

    lines.push(`# ${report.title}`, '')
    lines.push(`> ${report.dataNotice}`, '')
    lines.push(`- **Platforms:** ${report.platformsText}`)
    lines.push(`- **Period:** ${report.periodText}`)
    if (report.comparisonText) lines.push(`- **Comparison:** ${report.comparisonText}`)
    lines.push(`- **Data quality:** ${report.qualityText}`)
    lines.push(`- **Generated:** ${report.generatedOn}`, '')

    if (report.qualityWarning) {
        lines.push(`**Warning:** ${report.qualityWarning}`, '')
    }

    lines.push('## Headline metrics', '')
    if (report.kpis.length > 0) {
        lines.push(row(['Metric', 'Latest period', 'Change vs previous', 'What it measures']))
        lines.push(row(['---', '---:', '---:', '---']))
        for (const kpi of report.kpis) {
            lines.push(row([kpi.label, kpi.value, kpi.changeText, kpi.note]))
        }
    } else {
        lines.push('Not enough weeks selected to compare periods (at least 2 are needed).')
    }
    lines.push('')

    lines.push('## Platform summary', '')
    lines.push(row(['Platform', 'Reach', 'Impressions', 'Interactions', 'Engagement rate']))
    lines.push(row(['---', '---:', '---:', '---:', '---:']))
    for (const item of report.platformTotals) {
        lines.push(
            row([
                PLATFORM_LABELS[item.platform],
                formatNumber(item.reach),
                formatNumber(item.impressions),
                formatNumber(item.interactions),
                formatPercent(item.engagementRate, 2),
            ]),
        )
    }
    lines.push('')

    lines.push('## Summary (calculated)', '', insights.summary, '')

    lines.push('## Findings (calculated from the data)', '')
    if (insights.findings.length === 0) {
        lines.push('No findings for the current selection.')
    }
    for (const finding of insights.findings) {
        lines.push(`- **${finding.title}**`, `  ${finding.detail}`)
    }
    lines.push('')

    lines.push('## Suggestions (rule-based, not AI-generated)', '')
    lines.push(
        '> These suggestions come from fixed rules in the dashboard. No AI model is connected. They are ideas to test, not results proven by the data.',
        '',
    )
    if (insights.suggestions.length === 0) {
        lines.push('No suggestions are triggered by the current selection.')
    }
    for (const suggestion of insights.suggestions) {
        const basis = insights.findings.find((f) => f.id === suggestion.basedOn)
        lines.push(`- **${suggestion.title}**`, `  ${suggestion.detail}`)
        if (basis) lines.push(`  _Based on the finding: ${basis.title}_`)
    }
    lines.push('')

    lines.push('## Limitations', '')
    for (const limitation of insights.limitations) {
        lines.push(`- ${limitation}`)
    }
    lines.push('')

    return lines.join('\n')
}

/** A file name such as socialpulse-report-2026-08-24-to-2026-10-12.md */
export function reportFileName(weeks: string[]): string {
    return `socialpulse-report-${range(weeks).replace(' to ', '-to-')}.md`
}