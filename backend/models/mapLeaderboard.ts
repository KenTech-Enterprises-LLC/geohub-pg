export type TopScore = {
  gameId: string | number
  userId: string | number
  totalPoints: number
  totalTime: number
}

type MapLeaderboard = {
  _id: string | number
  mapId: string | number
  scores: TopScore[]
  avgScore?: number
  usersPlayed?: number
  dailyChallengeId?: string | number
}

export default MapLeaderboard
