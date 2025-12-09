// Use integer IDs for PostgreSQL compatibility
export const OFFICIAL_WORLD_ID = 1
export const COUNTRY_STREAKS_ID = 2 // If you need a special string, handle it separately in code
export const DAILY_CHALLENGE_ID = 3

export const GUEST_ACCOUNT_ID = 0

export const COUNTRY_STREAK_DETAILS = {
  _id: COUNTRY_STREAKS_ID,
  name: 'Country Streaks',
  description: 'How many countries can you guess in a row?',
  previewImg: 'official22.jpg',
  creator: 'GeoHub',
}

export const DAILY_CHALLENGE_DETAILS = {
  name: 'The Daily Challenge',
  description: 'A brand new challenge everyday. See how you compare!',
  previewImg: 'official8.jpg',
}

export const MAP_AVATAR_PATH = '/images/mapAvatars'
export const USER_AVATAR_PATH = '/images/userAvatars'

export const MAX_ALLOWED_CUSTOM_LOCATIONS = 60000

export const SUPPORT_EMAIL = 'geohub.game@gmail.com'
