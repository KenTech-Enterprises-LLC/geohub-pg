import { DistanceType, GameSettingsType, GuessType, LocationType, MapType } from '@types'
import User from './user'

type Game = {
  id?: string | number
  _id?: string | number // replace id with _id throughout app
  mapId: string
  mapName?: string
  userId: string | number
  userName?: string
  userAvatar?: { emoji: string; color: string }
  gameSettings: GameSettingsType
  rounds: LocationType[]
  guesses: GuessType[]
  round: number
  totalPoints: number
  totalDistance: DistanceType
  totalTime: number
  difficulty?: 'Normal' | 'Easy' | 'Challenging'
  countryCode?: string
  challengeId?: string | number | null
  userDetails?: User
  createdAt?: Date
  mapDetails?: MapType
  state: 'started' | 'finished'
  mode: 'standard' | 'streak'
  streak: number
  isDailyChallenge?: boolean
}

export default Game
