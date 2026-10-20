import { generateInsights } from '../lib/insights'
import type { Post, WeeklyMetric } from '../types'

type InsightsPageProps = {
    platformRows: WeeklyMetric[] // selected platforms, ALL weeks
    weeks: string[] // the selected weeks, oldest first
    posts: Post[] // posts matching the filters
}

function InsightsPage({ platformRows, weeks, posts }: InsightsPageProps) {
    const insights = generateInsights(platformRows, weeks, posts)

    // Lets each suggestion say which finding it is based on.
    const findingTitles = new Map<string, string>(
        insights.findings.map((finding) => [finding.id, finding.title] as const),
    )

    return (
        <>
            <section className="card">
                <div className="insight-header">
                    <h2 className="panel-title">Summary</h2>
                    <span className="tag calculated">Calculated</span>
                </div>
                <p>{insights.summary}</p>
                <p className="card-note">
                    Everything on this page follows the filters above.
                </p>
            </section>

            <section className="card">
                <div className="insight-header">
                    <h2 className="panel-title">Findings</h2>
                    <span className="tag calculated">Calculated from the data</span>
                </div>
                <p className="card-note">
                    Each finding is worked out from the numbers in this dashboard using
                    fixed formulas. Nothing here is estimated or generated.
                </p>
                {insights.findings.length === 0 ? (
                    <p>No findings for the current selection.</p>
                ) : (
                    <ul className="insight-list">
                        {insights.findings.map((finding) => (
                            <li key={finding.id} className={`insight-item ${finding.tone}`}>
                                <div className="insight-meta">
                                    <span className="tag calculated">Calculated</span>
                                    <span className="insight-category">{finding.label}</span>
                                </div>
                                <h3 className="insight-title">{finding.title}</h3>
                                <p className="insight-detail">{finding.detail}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="card">
                <div className="insight-header">
                    <h2 className="panel-title">Suggestions</h2>
                    <span className="tag suggestion">Rule-based suggestion</span>
                </div>
                <p className="notice">
                    These suggestions come from fixed rules written into this app. No AI
                    model is connected. They are ideas to test, not results proven by
                    the data.
                </p>
                {insights.suggestions.length === 0 ? (
                    <p className="card-note">
                        No suggestions are triggered by the current selection.
                    </p>
                ) : (
                    <ul className="insight-list">
                        {insights.suggestions.map((suggestion) => (
                            <li key={suggestion.id} className="insight-item suggestion">
                                <div className="insight-meta">
                                    <span className="tag suggestion">Suggestion</span>
                                </div>
                                <h3 className="insight-title">{suggestion.title}</h3>
                                <p className="insight-detail">{suggestion.detail}</p>
                                {findingTitles.has(suggestion.basedOn) && (
                                    <p className="insight-basis">
                                        Based on the finding: {findingTitles.get(suggestion.basedOn)}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="card">
                <h2 className="panel-title">Limits of this analysis</h2>
                <ul className="limit-list">
                    {insights.limitations.map((limitation) => (
                        <li key={limitation}>{limitation}</li>
                    ))}
                </ul>
            </section>
        </>
    )
}

export default InsightsPage