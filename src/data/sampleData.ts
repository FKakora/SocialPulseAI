import type { Platform, Post, WeeklyMetric } from '../types'

// IMPORTANT: Everything in this file is FICTIONAL sample data for a made-up
// outdoor-gear brand. It does not come from any real social media account.
export const DATA_NOTICE =
    'Fictional sample data for a made-up outdoor-gear brand. Not from real accounts.'

export const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'youtube', 'facebook']

export const PLATFORM_LABELS: Record<Platform, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    facebook: 'Facebook',
}

// Fictional follower counts just before the first week of data.
// Needed so we can work out follower growth for week 1.
export const STARTING_FOLLOWERS: Record<Platform, number> = {
    instagram: 18400,
    tiktok: 9800,
    youtube: 4200,
    facebook: 12600,
}

// 8 weeks x 4 platforms = 32 rows.
export const WEEKLY_METRICS: WeeklyMetric[] = [
    { weekStart: '2026-08-24', platform: 'instagram', reach: 45800, impressions: 61800, likes: 1911, comments: 160, shares: 317, followersEnd: 18573 },
    { weekStart: '2026-08-24', platform: 'tiktok', reach: 119600, impressions: 143300, likes: 6010, comments: 791, shares: 1649, followersEnd: 10238 },
    { weekStart: '2026-08-24', platform: 'youtube', reach: 23400, impressions: 30200, likes: 585, comments: 46, shares: 62, followersEnd: 4273 },
    { weekStart: '2026-08-24', platform: 'facebook', reach: 36400, impressions: 56900, likes: 498, comments: 59, shares: 102, followersEnd: 12615 },
    { weekStart: '2026-08-31', platform: 'instagram', reach: 50000, impressions: 67900, likes: 2197, comments: 242, shares: 337, followersEnd: 18916 },
    { weekStart: '2026-08-31', platform: 'tiktok', reach: 126800, impressions: 138900, likes: 6721, comments: 582, shares: 1578, followersEnd: 10798 },
    { weekStart: '2026-08-31', platform: 'youtube', reach: 23500, impressions: 29400, likes: 587, comments: 68, shares: 65, followersEnd: 4357 },
    { weekStart: '2026-08-31', platform: 'facebook', reach: 33000, impressions: 47100, likes: 429, comments: 37, shares: 101, followersEnd: 12627 },
    { weekStart: '2026-09-07', platform: 'instagram', reach: 52500, impressions: 71500, likes: 2070, comments: 172, shares: 317, followersEnd: 19274 },
    { weekStart: '2026-09-07', platform: 'tiktok', reach: 150700, impressions: 166400, likes: 8405, comments: 924, shares: 2305, followersEnd: 11101 },
    { weekStart: '2026-09-07', platform: 'youtube', reach: 22800, impressions: 27300, likes: 570, comments: 44, shares: 53, followersEnd: 4434 },
    { weekStart: '2026-09-07', platform: 'facebook', reach: 33300, impressions: 51300, likes: 430, comments: 41, shares: 89, followersEnd: 12607 },
    { weekStart: '2026-09-14', platform: 'instagram', reach: 52100, impressions: 72500, likes: 2272, comments: 200, shares: 357, followersEnd: 19456 },
    { weekStart: '2026-09-14', platform: 'tiktok', reach: 158200, impressions: 184200, likes: 8315, comments: 1100, shares: 2326, followersEnd: 11814 },
    { weekStart: '2026-09-14', platform: 'youtube', reach: 23000, impressions: 28600, likes: 536, comments: 51, shares: 42, followersEnd: 4525 },
    { weekStart: '2026-09-14', platform: 'facebook', reach: 35400, impressions: 53100, likes: 511, comments: 46, shares: 110, followersEnd: 12623 },
    { weekStart: '2026-09-21', platform: 'instagram', reach: 57100, impressions: 80400, likes: 2491, comments: 256, shares: 439, followersEnd: 19583 },
    { weekStart: '2026-09-21', platform: 'tiktok', reach: 148300, impressions: 171600, likes: 8357, comments: 1037, shares: 2181, followersEnd: 12265 },
    { weekStart: '2026-09-21', platform: 'youtube', reach: 22200, impressions: 28600, likes: 537, comments: 56, shares: 53, followersEnd: 4617 },
    { weekStart: '2026-09-21', platform: 'facebook', reach: 31600, impressions: 48000, likes: 456, comments: 51, shares: 87, followersEnd: 12638 },
    { weekStart: '2026-09-28', platform: 'instagram', reach: 54600, impressions: 74100, likes: 2130, comments: 248, shares: 319, followersEnd: 19906 },
    { weekStart: '2026-09-28', platform: 'tiktok', reach: 152000, impressions: 181500, likes: 8298, comments: 814, shares: 2104, followersEnd: 12462 },
    { weekStart: '2026-09-28', platform: 'youtube', reach: 24900, impressions: 31500, likes: 596, comments: 58, shares: 53, followersEnd: 4696 },
    { weekStart: '2026-09-28', platform: 'facebook', reach: 30300, impressions: 46100, likes: 393, comments: 49, shares: 88, followersEnd: 12601 },
    { weekStart: '2026-10-05', platform: 'instagram', reach: 57800, impressions: 74300, likes: 2550, comments: 244, shares: 363, followersEnd: 20134 },
    { weekStart: '2026-10-05', platform: 'tiktok', reach: 169800, impressions: 197200, likes: 9065, comments: 1004, shares: 2538, followersEnd: 13139 },
    { weekStart: '2026-10-05', platform: 'youtube', reach: 26600, impressions: 33200, likes: 746, comments: 61, shares: 61, followersEnd: 4762 },
    { weekStart: '2026-10-05', platform: 'facebook', reach: 33100, impressions: 48100, likes: 499, comments: 44, shares: 117, followersEnd: 12616 },
    { weekStart: '2026-10-12', platform: 'instagram', reach: 59600, impressions: 80400, likes: 2228, comments: 247, shares: 338, followersEnd: 20425 },
    { weekStart: '2026-10-12', platform: 'tiktok', reach: 154300, impressions: 177200, likes: 8014, comments: 1042, shares: 2547, followersEnd: 13620 },
    { weekStart: '2026-10-12', platform: 'youtube', reach: 27100, impressions: 35100, likes: 712, comments: 71, shares: 58, followersEnd: 4853 },
    { weekStart: '2026-10-12', platform: 'facebook', reach: 32700, impressions: 49100, likes: 528, comments: 62, shares: 99, followersEnd: 12629 },
]

// 24 individual posts (6 per platform).
export const POSTS: Post[] = [
    { id: 'p01', date: '2026-08-24', platform: 'tiktok', format: 'Video', title: 'Day in the life of a trail guide', reach: 38600, impressions: 42600, likes: 3217, comments: 284, shares: 663 },
    { id: 'p02', date: '2026-08-27', platform: 'tiktok', format: 'Video', title: 'Trail snack taste test', reach: 14900, impressions: 18290, likes: 574, comments: 46, shares: 147 },
    { id: 'p03', date: '2026-08-29', platform: 'facebook', format: 'Video', title: 'Safety tips for winter hikes', reach: 4700, impressions: 7140, likes: 103, comments: 11, shares: 16 },
    { id: 'p04', date: '2026-08-30', platform: 'tiktok', format: 'Video', title: 'Camp coffee hack', reach: 29400, impressions: 36670, likes: 2159, comments: 162, shares: 543 },
    { id: 'p05', date: '2026-08-31', platform: 'youtube', format: 'Short', title: 'Filter water in 30 seconds', reach: 8300, impressions: 10700, likes: 193, comments: 21, shares: 19 },
    { id: 'p06', date: '2026-09-03', platform: 'instagram', format: 'Carousel', title: 'Spring gear checklist', reach: 8000, impressions: 11640, likes: 388, comments: 36, shares: 76 },
    { id: 'p07', date: '2026-09-09', platform: 'instagram', format: 'Reel', title: 'Behind the scenes: packing a weekend hike kit', reach: 6400, impressions: 8740, likes: 184, comments: 16, shares: 23 },
    { id: 'p08', date: '2026-09-09', platform: 'facebook', format: 'Link', title: 'Blog: trail etiquette basics', reach: 6200, impressions: 9610, likes: 100, comments: 11, shares: 28 },
    { id: 'p09', date: '2026-09-10', platform: 'instagram', format: 'Image', title: 'Meet the team: our trail guides', reach: 6100, impressions: 8670, likes: 340, comments: 35, shares: 41 },
    { id: 'p10', date: '2026-09-10', platform: 'tiktok', format: 'Video', title: 'Rain jacket water test', reach: 47500, impressions: 57810, likes: 1924, comments: 219, shares: 589 },
    { id: 'p11', date: '2026-09-10', platform: 'facebook', format: 'Image', title: 'Customer photo of the week', reach: 5400, impressions: 8180, likes: 71, comments: 4, shares: 10 },
    { id: 'p12', date: '2026-09-11', platform: 'youtube', format: 'Short', title: 'How to read a trail map', reach: 4200, impressions: 5570, likes: 111, comments: 11, shares: 7 },
    { id: 'p13', date: '2026-09-18', platform: 'youtube', format: 'Video', title: 'Beginner guide to day hikes (12 min)', reach: 4100, impressions: 5470, likes: 121, comments: 12, shares: 12 },
    { id: 'p14', date: '2026-09-26', platform: 'instagram', format: 'Carousel', title: '5 trail snacks that actually fuel you', reach: 6600, impressions: 9800, likes: 381, comments: 29, shares: 47 },
    { id: 'p15', date: '2026-09-27', platform: 'instagram', format: 'Reel', title: 'Tent setup in under 2 minutes', reach: 5500, impressions: 7060, likes: 159, comments: 14, shares: 22 },
    { id: 'p16', date: '2026-09-27', platform: 'facebook', format: 'Link', title: 'Blog: choosing your first daypack', reach: 4100, impressions: 6050, likes: 42, comments: 4, shares: 9 },
    { id: 'p17', date: '2026-09-28', platform: 'tiktok', format: 'Video', title: 'Packing a 30L bag in 20 seconds', reach: 36900, impressions: 43930, likes: 1659, comments: 151, shares: 384 },
    { id: 'p18', date: '2026-09-30', platform: 'youtube', format: 'Video', title: 'Planning a first overnight trip', reach: 7000, impressions: 9320, likes: 265, comments: 23, shares: 21 },
    { id: 'p19', date: '2026-10-04', platform: 'facebook', format: 'Image', title: 'Weekend trail event announcement', reach: 2800, impressions: 4070, likes: 26, comments: 2, shares: 5 },
    { id: 'p20', date: '2026-10-06', platform: 'youtube', format: 'Short', title: 'One tip for blister-free hiking', reach: 3900, impressions: 4790, likes: 99, comments: 11, shares: 12 },
    { id: 'p21', date: '2026-10-12', platform: 'facebook', format: 'Video', title: 'Community hike highlights', reach: 3500, impressions: 5320, likes: 37, comments: 3, shares: 7 },
    { id: 'p22', date: '2026-10-15', platform: 'youtube', format: 'Video', title: 'Gear review: 3 headlamps compared', reach: 4300, impressions: 5510, likes: 170, comments: 13, shares: 13 },
    { id: 'p23', date: '2026-10-17', platform: 'instagram', format: 'Image', title: 'Sunrise at the summit - community photo', reach: 6700, impressions: 8760, likes: 351, comments: 43, shares: 64 },
    { id: 'p24', date: '2026-10-17', platform: 'tiktok', format: 'Video', title: 'Boots: worth the hype?', reach: 20200, impressions: 23150, likes: 715, comments: 107, shares: 214 },
]