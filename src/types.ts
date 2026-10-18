// A "type" describes the shape of our data.
// TypeScript uses these to catch mistakes (typos, missing fields) early.

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook'

// One row = one platform for one week (weeks start on a Monday).
export type WeeklyMetric = {
    weekStart: string // ISO date, e.g. '2026-08-24'
    platform: Platform
    reach: number // unique accounts that saw content
    impressions: number // total times content was shown
    likes: number
    comments: number
    shares: number
    followersEnd: number // follower count at the end of the week
}

// One row = one individual post.
export type Post = {
    id: string
    date: string // ISO date
    platform: Platform
    format: string // e.g. 'Reel', 'Carousel', 'Video'
    title: string
    reach: number
    impressions: number
    likes: number
    comments: number
    shares: number
}