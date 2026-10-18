import { useState } from 'react'
import './App.css'
import {
    DATA_NOTICE,
    PLATFORMS,
    POSTS,
    STARTING_FOLLOWERS,
    WEEKLY_METRICS,
} from './data/sampleData'
import KpiCard from './components/KpiCard'
import PlatformsPage from './components/PlatformsPage'
import { buildKpis } from './lib/kpis'
import { comparePeriods } from './lib/metrics'
import { runDataQualityChecks } from './lib/validation'

type SectionId = 'overview' | 'platforms' | 'posts' | 'insights' | 'reports'

type NavItem = {
    id: SectionId
    label: string
    title: string
    subtitle: string
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        title: 'Dashboard overview',
        subtitle: 'Headline performance across all platforms',
    },
    {
        id: 'platforms',
        label: 'Platforms',
        title: 'Platform performance',
        subtitle: 'Compare Instagram, TikTok, YouTube and Facebook',
    },
    {
        id: 'posts',
        label: 'Posts',
        title: 'Post performance',
        subtitle: 'How individual posts performed',
    },
    {
        id: 'insights',
        label: 'Insights',
        title: 'Insights',
        subtitle: 'Calculated findings and content suggestions',
    },
    {
        id: 'reports',
        label: 'Reports',
        title: 'Reports',
        subtitle: 'Copy or export a performance summary',
    },
]

// The data never changes while the app runs, so we check and calculate once.
const qualityReport = runDataQualityChecks(WEEKLY_METRICS, POSTS)
const comparison = comparePeriods(WEEKLY_METRICS, STARTING_FOLLOWERS)
const kpis = comparison ? buildKpis(comparison) : []

function weekRange(weeks: string[]): string {
    return `${weeks[0]} to ${weeks[weeks.length - 1]}`
}

function App() {
    const [activeSection, setActiveSection] = useState<SectionId>('overview')

    const current =
        NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0]

    const firstWeek = WEEKLY_METRICS[0].weekStart
    const lastWeek = WEEKLY_METRICS[WEEKLY_METRICS.length - 1].weekStart

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-logo">SP</div>
                    <div>
                        <div className="brand-name">SocialPulse AI</div>
                        <div className="brand-sub">Analytics dashboard</div>
                    </div>
                </div>

                <nav className="nav" aria-label="Main navigation">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={
                                item.id === activeSection ? 'nav-button active' : 'nav-button'
                            }
                            onClick={() => setActiveSection(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    All data shown is fictional sample data.
                </div>
            </aside>

            <main className="main">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">{current.title}</h1>
                        <p className="page-subtitle">{current.subtitle}</p>
                    </div>
                    <span className="badge">Fictional sample data</span>
                </header>

                {activeSection === 'overview' && (
                    <>
                        {!qualityReport.allPassed && (
                            <p className="warning-note">
                                {qualityReport.failedCount} data quality check(s) failed, so
                                the figures below may be unreliable. See the checks at the
                                bottom of this page.
                            </p>
                        )}

                        {comparison ? (
                            <>
                                <p className="period-caption">
                                    Latest {comparison.current.weeks.length} weeks (
                                    {weekRange(comparison.current.weeks)}) compared with the
                                    previous {comparison.previous.weeks.length} weeks (
                                    {weekRange(comparison.previous.weeks)}). Dates are week start dates.
                                </p>
                                <section className="kpi-grid" aria-label="Key metrics">
                                    {kpis.map((kpi) => (
                                        <KpiCard
                                            key={kpi.id}
                                            kpi={kpi}
                                            comparisonLabel={`vs previous ${comparison.previous.weeks.length} weeks`}
                                        />
                                    ))}
                                </section>
                            </>
                        ) : (
                            <section className="card">
                                <h2 className="panel-title">Not enough data</h2>
                                <p>
                                    At least 2 weeks of data are needed to compare periods.
                                </p>
                            </section>
                        )}

                        <section className="card">
                            <h2 className="panel-title">Sample dataset loaded</h2>
                            <p>
                                {WEEKLY_METRICS.length} weekly rows across {PLATFORMS.length}{' '}
                                platforms ({firstWeek} to {lastWeek}) and {POSTS.length} posts.
                            </p>
                            <p className="card-note">{DATA_NOTICE}</p>
                        </section>

                        <section className="card">
                            <h2 className="panel-title">Data quality checks</h2>
                            <p
                                className={
                                    qualityReport.allPassed
                                        ? 'quality-summary pass'
                                        : 'quality-summary fail'
                                }
                            >
                                {qualityReport.passedCount} of {qualityReport.checks.length}{' '}
                                checks passed
                            </p>
                            {!qualityReport.allPassed && (
                                <p className="warning-note">
                                    Some checks failed. The numbers on this page may be
                                    unreliable until these problems are fixed.
                                </p>
                            )}
                            <ul className="check-list">
                                {qualityReport.checks.map((check) => (
                                    <li key={check.id}>
                                        <span
                                            className={
                                                check.passed ? 'check-icon pass' : 'check-icon fail'
                                            }
                                        >
                                            {check.passed ? '✓' : '✗'}
                                        </span>
                                        {check.name}
                                        {!check.passed && (
                                            <ul className="problem-list">
                                                {check.problems.slice(0, 5).map((problem, index) => (
                                                    <li key={`${problem}-${index}`}>{problem}</li>
                                                ))}
                                                {check.problems.length > 5 && (
                                                    <li>…and {check.problems.length - 5} more</li>
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </>
                )}

                {activeSection === 'platforms' && (
                    <PlatformsPage rows={WEEKLY_METRICS} />
                )}

                {activeSection !== 'overview' && activeSection !== 'platforms' && (
                    <section className="card">
                        <h2 className="panel-title">{current.label}</h2>
                        <p>
                            This section is a placeholder. Real charts, tables and insights
                            will appear here as we build the next stages.
                        </p>
                    </section>
                )}
            </main>
        </div>
    )
}

export default App