import type { Platform, Post } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Last day (the Sunday) of the week that starts on the given Monday. */
export function weekEndDate(weekStart: string): string {
    return new Date(Date.parse(`${weekStart}T00:00:00Z`) + 6 * DAY_MS)
        .toISOString()
        .slice(0, 10)
}

/**
 * Posts on the chosen platforms that were published between the start of
 * fromWeek and the end of toWeek (both weeks included).
 */
export function filterPosts(
    posts: Post[],
    platforms: Platform[],
    fromWeek: string,
    toWeek: string,
): Post[] {
    const lastDay = weekEndDate(toWeek)
    return posts.filter(
        (post) =>
            platforms.includes(post.platform) &&
            post.date >= fromWeek &&
            post.date <= lastDay,
    )
}