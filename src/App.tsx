import { useState } from 'react'
import './App.css'
import {
    DATA_NOTICE,
    PLATFORMS,
    POSTS,
    STARTING_FOLLOWERS,
    WEEKLY_METRICS,
} from './data/sampleData'
import FilterBar from './components/FilterBar'
import InsightsPage from './components/InsightsPage'
import KpiCard from './components/KpiCard'
import PlatformsPage from './components/PlatformsPage'
import PostsPage from './components/PostsPage'
import ReportPage from './components/ReportPage'
import { filterPosts } from './lib/filters'
import { buildKpis } from './lib/kpis'
import { comparePeriods, getWeeks } from './lib/metrics'
import { runDataQualityChecks } from './lib/validation'
import type { Platform } from './types'

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

// The data never changes while the app runs, so these are worked out once.
// The data quality checks always cover the full dataset, whatever the filters.
const qualityReport = runDataQualityChecks(WEEKLY_METRICS, POSTS)
const ALL_WEEKS = getWeeks(WEEKLY_METRICS)
const FIRST_WEEK = ALL_WEEKS[0]
const LAST_WEEK = ALL_WEEKS[ALL_WEEKS.length - 1]

function weekRange(weeks: string[]): string {
    return `${weeks[0]} to ${weeks[weeks.length - 1]}`
}

function App() {
    const [activeSection, setActiveSection] = useState<SectionId>('overview')

    // Filter state: which platforms, and which weeks.
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
        ...PLATFORMS,
    ])
    const [fromWeek, setFromWeek] = useState(FIRST_WEEK)
    const [toWeek, setToWeek] = useState(LAST_WEEK)

    function togglePlatform(platform: Platform) {
        setSelectedPlatforms((current) => {
            if (current.includes(platform)) {
                // Always keep at least one platform selected.
                if (current.length === 1) return current
                return current.filter((item) => item !== platform)
            }
            // Add it back, keeping the platforms in their usual order.
            return PLATFORMS.filter(
                (item) => item === platform || current.includes(item),
            )
        })
    }

    // Keep "from" earlier than or equal to "to".
    function changeFromWeek(week: string) {
        setFromWeek(week)
        if (week > toWeek) setToWeek(week)
    }

    function changeToWeek(week: string) {
        setToWeek(week)
        if (week < fromWeek) setFromWeek(week)
    }

    function resetFilters() {
        setSelectedPlatforms([...PLATFORMS])
        setFromWeek(FIRST_WEEK)
        setToWeek(LAST_WEEK)
    }

    const isFiltered =
        selectedPlatforms.length !== PLATFORMS.length ||
        fromWeek !== FIRST_WEEK ||
        toWeek !== LAST_WEEK

    // Apply the filters.
    // platformRows keeps ALL weeks for the chosen platforms, because follower
    // growth for the first selected week needs the week before it.
    const platformRows = WEEKLY_METRICS.filter((row) =>
        selectedPlatforms.includes(row.platform),
    )
    const visibleWeeks = ALL_WEEKS.filter(
        (week) => week >= fromWeek && week <= toWeek,
    )
    const visiblePosts = filterPosts(POSTS, selectedPlatforms, fromWeek, toWeek)

    const comparison = comparePeriods(
        platformRows,
        STARTING_FOLLOWERS,
        visibleWeeks,
    )
    const kpis = comparison ? buildKpis(comparison) : []
    const unusedWeeks = comparison
        ? visibleWeeks.length - 2 * comparison.current.weeks.length
        : 0

    const current =
        NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0]

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

                <FilterBar
                    selectedPlatforms={selectedPlatforms}
                    onTogglePlatform={togglePlatform}
                    weeks={ALL_WEEKS}
                    fromWeek={fromWeek}
                    toWeek={toWeek}
                    onFromWeekChange={changeFromWeek}
                    onToWeekChange={changeToWeek}
                    onReset={resetFilters}
                    isFiltered={isFiltered}
                />

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
                                    Latest {comparison.current.weeks.length}{' '}
                                    {comparison.current.weeks.length === 1 ? 'week' : 'weeks'} (
                                    {weekRange(comparison.current.weeks)}) compared with the
                                    previous {comparison.previous.weeks.length}{' '}
                                    {comparison.previous.weeks.length === 1 ? 'week' : 'weeks'} (
                                    {weekRange(comparison.previous.weeks)}). Dates are week start
                                    dates.
                                    {unusedWeeks > 0 &&
                                        ` The oldest selected week is not used, so both periods are the same length.`}
                                </p>
                                <section className="kpi-grid" aria-label="Key metrics">
                                    {kpis.map((kpi) => (
                                        <KpiCard
                                            key={kpi.id}
                                            kpi={kpi}
                                            comparisonLabel={`vs previous ${comparison.previous.weeks.length} ${comparison.previous.weeks.length === 1 ? 'week' : 'weeks'
                                                }`}
                                        />
                                    ))}
                                </section>
                            </>
                        ) : (
                            <section className="card">
                                <h2 className="panel-title">Select at least 2 weeks</h2>
                                <p>
                                    The cards compare the latest weeks with the weeks before
                                    them, so at least 2 weeks must be selected.
                                </p>
                            </section>
                        )}

                        <section className="card">
                            <h2 className="panel-title">Sample dataset loaded</h2>
                            <p>
                                {WEEKLY_METRICS.length} weekly rows across {PLATFORMS.length}{' '}
                                platforms ({FIRST_WEEK} to {LAST_WEEK}) and {POSTS.length}{' '}
                                posts.
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
                            <p className="card-note">
                                The checks always cover the full dataset, whatever filters are
                                selected.
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
                    <PlatformsPage rows={platformRows} weeks={visibleWeeks} />
                )}

                {activeSection === 'posts' && (
                    <PostsPage posts={visiblePosts} totalPosts={POSTS.length} />
                )}

                {activeSection === 'insights' && (
                    <InsightsPage
                        platformRows={platformRows}
                        weeks={visibleWeeks}
                        posts={visiblePosts}
                    />
                )}

                {activeSection === 'reports' && (
                    <ReportPage
                        platformRows={platformRows}
                        weeks={visibleWeeks}
                        posts={visiblePosts}
                        selectedPlatforms={selectedPlatforms}
                        quality={qualityReport}
                    />
                )}
            </main>
        </div>
    )
}

export default App