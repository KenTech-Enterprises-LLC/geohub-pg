import { LocationType } from '@types'

type Map = {
  _id?: string | number
  name: string
  description?: string
  previewImg: string
  creator: 'GeoHub' | string | number
  isPublished?: boolean
  isDeleted?: boolean
  createdAt?: Date
  lastUpdatedAt?: Date
  locations?: LocationType[]
  avgScore: number
  usersPlayed: number
  locationCount: number
  likes?: { numLikes: number; likedByUser: boolean }
  bounds?: { min: { lat: number; lng: number }; max: { lat: number; lng: number } }
  scoreFactor?: number
}

export default Map
