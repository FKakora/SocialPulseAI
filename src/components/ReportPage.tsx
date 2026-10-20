import { useState } from 'react'
import { PLATFORM_LABELS } from '../data/sampleData'
import {
    PLATFORM_COLORS,
    weeklyEngagementTrend,
    weeklyFollowerGainTrend,
} from '../lib/chartData'
import { downloadTextFile } from '../lib/download'
import { formatDate, formatNumber, formatPercent } from '../lib/format'
import { buildReport, reportFileName, reportToMarkdown } from '../lib/report'
import type { QualityReport } from '../lib/validation'
import type { Platform, Post, WeeklyMetric } from '../types'
import BarChartCard from './BarChartCard'
import type { BarDatum } from './BarChartCard'
import LineChartCard from './LineChartCard'

type ReportPageProps = {
    platformRows: WeeklyMetric[] // selected platforms, ALL weeks
    weeks: string[] // the selected weeks, oldest first
    posts: Post[] // posts matching the filters
    selectedPlatforms: Platform[]
    quality: QualityReport
}

type CopyStatus = 'idle' | 'copied' | 'failed'

function ReportPage({
    platformRows,
    weeks,
    posts,
    selectedPlatforms,
    quality,
}: ReportPageProps) {
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

    const visibleRows = platformRows.filter((row) => weeks.includes(row.weekStart))
    if (visibleRows.length === 0) {
        return (
            <section className="card">
                <h2 className="panel-title">No data</h2>
                <p>There is no data to report on for the current selection.</p>
            </section>
        )
    }

    const report = buildReport({
        platformRows,
        weeks,
        posts,
        platforms: selectedPlatforms,
        quality,
        generatedOn: formatDate(new Date().toISOString().slice(0, 10)),
    })
    const markdown = reportToMarkdown(report)
    const { insights } = report

    const engagementBars: BarDatum[] = report.platformTotals.map((item) => ({
        name: PLATFORM_LABELS[item.platform],
        value: item.engagementRate,
        color: PLATFORM_COLORS[item.platform],
    }))

    const findingTitles = new Map<string, string>(
        insights.findings.map((finding) => [finding.id, finding.title] as const),
    )

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(markdown)
            setCopyStatus('copied')
        } catch {
            setCopyStatus('failed')
        }
    }

    function handleDownload() {
        downloadTextFile(reportFileName(weeks), markdown)
    }

    return (
        <>
            <section className="card report-actions">
                <div className="report-buttons">
                    <button type="button" className="action-button primary" onClick={handleCopy}>
                        Copy report
                    </button>
                    <button type="button" className="action-button" onClick={handleDownload}>
                        Download Markdown (.md)
                    </button>
                    <button type="button" className="action-button" onClick={() => window.print()}>
                        Print / Save as PDF
                    </button>
                </div>
                <p className="card-note">
                    The report follows the filters above. Copy and Download give the
                    text version (no charts). Use Print / Save as PDF to include the
                    charts.
                </p>
                {copyStatus === 'copied' && (
                    <p className="status-ok" role="status">
                        Report copied to the clipboard.
                    </p>
                )}
                {copyStatus === 'failed' && (
                    <p className="warning-note" role="alert">
                        The browser blocked copying. Open "Show report text" below and copy
                        it by hand.
                    </p>
                )}
            </section>

            <article className="card report" aria-label="Performance report">
                <header>
                    <h2 className="report-title">{report.title}</h2>
                    <p className="card-note">{report.dataNotice}</p>
                    <ul className="report-meta">
                        <li>
                            <strong>Platforms:</strong> {report.platformsText}
                        </li>
                        <li>
                            <strong>Period:</strong> {report.periodText}
                        </li>
                        {report.comparisonText && (
                            <li>
                                <strong>Comparison:</strong> {report.comparisonText}
                            </li>
                        )}
                        <li>
                            <strong>Data quality:</strong> {report.qualityText}
                        </li>
                        <li>
                            <strong>Generated:</strong> {report.generatedOn}
                        </li>
                    </ul>
                </header>

                {report.qualityWarning && (
                    <p className="warning-note">{report.qualityWarning}</p>
                )}

                <section>
                    <h3 className="report-section-title">Headline metrics</h3>
                    {report.kpis.length > 0 ? (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th className="num">Latest period</th>
                                        <th className="num">Change vs previous</th>
                                        <th>What it measures</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.kpis.map((kpi) => (
                                        <tr key={kpi.id}>
                                            <td>{kpi.label}</td>
                                            <td className="num">{kpi.value}</td>
                                            <td className="num">{kpi.changeText}</td>
                                            <td>{kpi.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>Select at least 2 weeks to compare periods.</p>
                    )}
                </section>

                <section>
                    <h3 className="report-section-title">Charts</h3>
                    <div className="chart-grid">
                        <BarChartCard
                            title="Engagement rate by platform"
                            subtitle="Total interactions divided by total reach"
                            data={engagementBars}
                            valueType="percent"
                        />
                        <LineChartCard
                            title="Weekly engagement rate"
                            subtitle="How engagement rate changed week by week"
                            data={weeklyEngagementTrend(visibleRows)}
                            valueType="percent"
                        />
                        <LineChartCard
                            title="Weekly net follower growth"
                            subtitle="Followers gained minus followers lost each week"
                            data={weeklyFollowerGainTrend(platformRows, weeks)}
                            valueType="number"
                            showZeroLine
                        />
                    </div>
                </section>

                <section>
                    <h3 className="report-section-title">Platform summary</h3>
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
                                {report.platformTotals.map((item) => (
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

                <section>
                    <h3 className="report-section-title">
                        Summary <span className="tag calculated">Calculated</span>
                    </h3>
                    <p>{insights.summary}</p>
                </section>

                <section>
                    <h3 className="report-section-title">
                        Findings <span className="tag calculated">Calculated from the data</span>
                    </h3>
                    {insights.findings.length === 0 ? (
                        <p>No findings for the current selection.</p>
                    ) : (
                        <ul className="report-list">
                            {insights.findings.map((finding) => (
                                <li key={finding.id}>
                                    <strong>{finding.title}</strong>
                                    <br />
                                    {finding.detail}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h3 className="report-section-title">
                        Suggestions <span className="tag suggestion">Rule-based suggestion</span>
                    </h3>
                    <p className="notice">
                        These suggestions come from fixed rules in the dashboard. No AI
                        model is connected. They are ideas to test, not results proven by
                        the data.
                    </p>
                    {insights.suggestions.length === 0 ? (
                        <p className="card-note">
                            No suggestions are triggered by the current selection.
                        </p>
                    ) : (
                        <ul className="report-list">
                            {insights.suggestions.map((suggestion) => (
                                <li key={suggestion.id}>
                                    <strong>{suggestion.title}</strong>
                                    <br />
                                    {suggestion.detail}
                                    {findingTitles.has(suggestion.basedOn) && (
                                        <>
                                            <br />
                                            <em>Based on the finding: {findingTitles.get(suggestion.basedOn)}</em>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h3 className="report-section-title">Limitations</h3>
                    <ul className="report-list">
                        {insights.limitations.map((limitation) => (
                            <li key={limitation}>{limitation}</li>
                        ))}
                    </ul>
                </section>
            </article>

            <details className="card report-text">
                <summary>Show report text (Markdown)</summary>
                <textarea readOnly value={markdown} rows={18} aria-label="Report text" />
            </details>
        </>
    )
}

export default ReportPage