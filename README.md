# SocialPulse AI

A social media analytics dashboard that turns performance data into clear numbers, charts, findings and a shareable report.

> **All data in this project is fictional.** It is sample data for a made-up outdoor-gear brand. It does not come from any real social media account, and no real platform is connected.

SocialPulse AI is a portfolio project. It shows how data analysis, validation, automation and visual reporting can be combined to answer a practical question: *how are our social channels performing, and what should we try next?*

## What it does

- **Overview:** five headline metrics (reach, impressions, engagement rate, interactions, follower growth), each compared with the previous period.
- **Platforms:** engagement and reach comparisons for Instagram, TikTok, YouTube and Facebook, plus weekly engagement and follower-growth trends.
- **Posts:** a sortable table of individual posts with their engagement rates.
- **Insights:** findings calculated from the data, kept visibly separate from rule-based suggestions.
- **Reports:** a report summary you can copy, download as Markdown, or print / save as PDF (the PDF includes the charts).
- **Filters:** choose platforms and a week range. Every section updates together.
- **Data quality checks:** 13 automatic checks on the dataset, with a warning shown if any fail.

## Screenshots

| Overview | Platforms |
|---|---|
| ![Overview](docs/screenshots/overview.png) | ![Platforms](docs/screenshots/platforms.png) |

| Insights | Report |
|---|---|
| ![Insights](docs/screenshots/insights.png) | ![Report](docs/screenshots/report.png) |

## A note on "AI"

The insights are produced by **fixed, rule-based code**. No AI model is connected, no API is called, and there are no API keys in this project. The dashboard labels calculated findings and rule-based suggestions separately so it is always clear which is which.

AI was used as an **assistant while building** the project. See [docs/AI-AND-AUTOMATION.md](docs/AI-AND-AUTOMATION.md) for exactly how.

## Tech stack

- [React](https://react.dev/) 19 and [TypeScript](https://www.typescriptlang.org/) 6
- [Vite](https://vite.dev/) 8 (development server and build tool)
- [Recharts](https://recharts.org/) 3 (charts)
- No backend, no database, no paid services

## Getting started

**Requirements:** Node.js 20.19+ or 22.12+ (developed on Node 24) and npm.

```bash
npm install        # install dependencies
npm run dev        # start the development server (http://localhost:5173)
npm run build      # type-check and create a production build in dist/
npm run preview    # serve the production build locally
npm run lint       # run ESLint
```

## Project structure

```
src/
├── data/
│   └── sampleData.ts        # the fictional dataset (32 weekly rows, 24 posts)
├── lib/                     # logic with no screen code
│   ├── validation.ts        # 13 data quality checks
│   ├── metrics.ts           # engagement rate, % change, period comparison
│   ├── chartData.ts         # shapes data for the charts
│   ├── filters.ts           # post filtering by platform and week
│   ├── kpis.ts              # turns results into KPI card content
│   ├── insights.ts          # rule-based findings and suggestions
│   ├── report.ts            # builds the report and its Markdown text
│   ├── format.ts            # number, percent and date formatting
│   └── download.ts          # saves a text file from the browser
├── components/              # what appears on screen
│   ├── FilterBar.tsx
│   ├── KpiCard.tsx
│   ├── BarChartCard.tsx
│   ├── LineChartCard.tsx
│   ├── PlatformsPage.tsx
│   ├── PostsPage.tsx
│   ├── InsightsPage.tsx
│   └── ReportPage.tsx
├── types.ts                 # TypeScript types for the data
├── App.tsx                  # layout, navigation and filter state
└── App.css / index.css      # styles
docs/                        # project documentation
```

The calculation code in `lib/` is kept separate from the screen code in `components/`, so a number can be checked or fixed without touching the layout.

## How the key numbers are calculated

| Metric | Definition |
|---|---|
| Engagement rate | (likes + comments + shares) ÷ reach × 100. Totals are divided by totals, not an average of weekly rates. |
| Change vs previous | The latest N weeks compared with the N weeks before them. With 8 weeks of data that is weeks 5-8 versus weeks 1-4. If an odd number of weeks is selected, the oldest week is left out so both periods match. |
| Engagement rate change | Shown in percentage points, not as a percentage of a percentage. |
| Follower growth | Net new followers: followers at the end of the last week minus followers just before the first week. |
| Total reach | The platforms' reach added together. People reached on more than one platform are counted more than once. |

If a value cannot be calculated (for example, a change from zero), the dashboard shows "n/a" instead of a misleading number.

## Data quality

Thirteen automatic checks run on the dataset: valid numbers, known platform names, real Monday dates, no duplicate rows, no missing weeks, impressions never below reach, engagement rate calculable and not above 100%, unique post IDs, and posts inside the weekly date range. If any check fails, the dashboard shows a warning.

These checks catch impossible data. They cannot catch a value that is plausible but wrong. The full list and what the checks cannot do are in [docs/DATA-QUALITY-AND-LIMITATIONS.md](docs/DATA-QUALITY-AND-LIMITATIONS.md).

## Limitations

- The data is fictional and small (8 weeks, 4 platforms, 24 posts).
- Data is weekly, so date filtering works in whole weeks, not days.
- The posts are a sample and are not reconciled with the weekly platform totals.
- Platforms measure reach differently in reality, so cross-platform comparisons are indicative only.
- Format comparisons rest on 2-3 posts per format and are labelled as very small samples.
- The calculations were checked against independently worked-out figures, but the project does not yet include automated unit tests.

## Possible next steps

- Add automated tests for the calculation and validation code (for example with Vitest).
- Import real exports (CSV) with schema validation, and add a reconciliation check against known totals.
- Use daily data so reports can follow calendar months.
- Generate suggestion text with a real AI model through a small backend, so no API key is ever in the browser, while keeping calculated findings separate.
- Deploy the dashboard as a static site.

## Documentation

- [Written analysis: key findings and recommendations](docs/ANALYSIS.md)
- [Sample report (exported from the app)](docs/sample-report.md)
- [How AI assistance and automation were used](docs/AI-AND-AUTOMATION.md)
- [Data quality checks and limitations](docs/DATA-QUALITY-AND-LIMITATIONS.md)
