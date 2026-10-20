import { PLATFORMS, PLATFORM_LABELS } from '../data/sampleData'
import { PLATFORM_COLORS } from '../lib/chartData'
import { formatDate } from '../lib/format'
import type { Platform } from '../types'

type FilterBarProps = {
    selectedPlatforms: Platform[]
    onTogglePlatform: (platform: Platform) => void
    weeks: string[] // every week available, oldest first
    fromWeek: string
    toWeek: string
    onFromWeekChange: (week: string) => void
    onToWeekChange: (week: string) => void
    onReset: () => void
    isFiltered: boolean
}

function FilterBar({
    selectedPlatforms,
    onTogglePlatform,
    weeks,
    fromWeek,
    toWeek,
    onFromWeekChange,
    onToWeekChange,
    onReset,
    isFiltered,
}: FilterBarProps) {
    return (
        <section className="filter-bar" aria-label="Filters">
            <div className="filter-group">
                <span className="filter-label">Platforms</span>
                <div className="chip-row">
                    {PLATFORMS.map((platform) => {
                        const selected = selectedPlatforms.includes(platform)
                        return (
                            <button
                                key={platform}
                                type="button"
                                className={selected ? 'chip selected' : 'chip'}
                                aria-pressed={selected}
                                onClick={() => onTogglePlatform(platform)}
                            >
                                <span
                                    className="chip-dot"
                                    style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                                />
                                {PLATFORM_LABELS[platform]}
                            </button>
                        )
                    })}
                </div>
                {selectedPlatforms.length === 1 && (
                    <span className="filter-hint">
                        At least one platform must stay selected.
                    </span>
                )}
            </div>

            <div className="filter-group">
                <label className="filter-label" htmlFor="from-week">
                    From week starting
                </label>
                <select
                    id="from-week"
                    className="select"
                    value={fromWeek}
                    onChange={(event) => onFromWeekChange(event.target.value)}
                >
                    {weeks.map((week) => (
                        <option key={week} value={week}>
                            {formatDate(week)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label" htmlFor="to-week">
                    To week starting
                </label>
                <select
                    id="to-week"
                    className="select"
                    value={toWeek}
                    onChange={(event) => onToWeekChange(event.target.value)}
                >
                    {weeks.map((week) => (
                        <option key={week} value={week}>
                            {formatDate(week)}
                        </option>
                    ))}
                </select>
            </div>

            {isFiltered && (
                <button type="button" className="reset-button" onClick={onReset}>
                    Reset filters
                </button>
            )}
        </section>
    )
}

export default FilterBar