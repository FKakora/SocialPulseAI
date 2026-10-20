import { useState } from 'react'
import { PLATFORM_LABELS } from '../data/sampleData'
import { formatDate, formatNumber, formatPercent } from '../lib/format'
import { engagementRate, interactionsOf } from '../lib/metrics'
import type { Post } from '../types'

type PostsPageProps = {
    posts: Post[] // posts that match the current filters
    totalPosts: number // all posts in the dataset
}

type SortKey = 'date' | 'reach' | 'impressions' | 'engagementRate'
type SortDirection = 'asc' | 'desc'

type PostRow = {
    post: Post
    rate: number | null // engagement rate in %, or null if it can't be calculated
}

function sortValue(row: PostRow, key: SortKey): number {
    switch (key) {
        case 'date':
            return Date.parse(row.post.date)
        case 'reach':
            return row.post.reach
        case 'impressions':
            return row.post.impressions
        case 'engagementRate':
            return row.rate ?? -1 // posts without a rate sort last when high-to-low
    }
}

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'reach', label: 'Reach' },
    { key: 'impressions', label: 'Impressions' },
]

function PostsPage({ posts, totalPosts }: PostsPageProps) {
    const [sortKey, setSortKey] = useState<SortKey>('engagementRate')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    function handleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
        } else {
            setSortKey(key)
            setSortDirection('desc')
        }
    }

    function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
        if (key !== sortKey) return 'none'
        return sortDirection === 'asc' ? 'ascending' : 'descending'
    }

    function sortClass(key: SortKey): string {
        if (key !== sortKey) return 'sort-button'
        return `sort-button active ${sortDirection}`
    }

    if (posts.length === 0) {
        return (
            <section className="card">
                <h2 className="panel-title">No posts</h2>
                <p>No posts match the current filters.</p>
            </section>
        )
    }

    const rows: PostRow[] = posts.map((post) => ({
        post,
        rate: engagementRate(interactionsOf(post), post.reach),
    }))

    const sorted = [...rows].sort((a, b) => {
        const difference = sortValue(a, sortKey) - sortValue(b, sortKey)
        return sortDirection === 'asc' ? difference : -difference
    })

    return (
        <section className="card">
            <h2 className="panel-title">Individual posts</h2>
            <p className="card-note">
                Showing {posts.length} of {totalPosts} posts. Click a column heading to
                sort. Engagement rate is likes + comments + shares divided by reach.
                These posts are a sample, so their totals will not match the weekly
                platform totals.
            </p>
            <div className="table-wrap">
                <table className="table posts-table">
                    <thead>
                        <tr>
                            <th aria-sort={ariaSort('date')}>
                                <button
                                    type="button"
                                    className={sortClass('date')}
                                    onClick={() => handleSort('date')}
                                >
                                    Date
                                </button>
                            </th>
                            <th>Post</th>
                            <th>Platform</th>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column.key}
                                    className="num"
                                    aria-sort={ariaSort(column.key)}
                                >
                                    <button
                                        type="button"
                                        className={sortClass(column.key)}
                                        onClick={() => handleSort(column.key)}
                                    >
                                        {column.label}
                                    </button>
                                </th>
                            ))}
                            <th className="num">Likes</th>
                            <th className="num">Comments</th>
                            <th className="num">Shares</th>
                            <th className="num" aria-sort={ariaSort('engagementRate')}>
                                <button
                                    type="button"
                                    className={sortClass('engagementRate')}
                                    onClick={() => handleSort('engagementRate')}
                                >
                                    Engagement rate
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(({ post, rate }) => (
                            <tr key={post.id}>
                                <td>{formatDate(post.date)}</td>
                                <td className="post-title">
                                    {post.title}
                                    <span className="post-format">{post.format}</span>
                                </td>
                                <td>{PLATFORM_LABELS[post.platform]}</td>
                                <td className="num">{formatNumber(post.reach)}</td>
                                <td className="num">{formatNumber(post.impressions)}</td>
                                <td className="num">{formatNumber(post.likes)}</td>
                                <td className="num">{formatNumber(post.comments)}</td>
                                <td className="num">{formatNumber(post.shares)}</td>
                                <td className="num">{formatPercent(rate, 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default PostsPage