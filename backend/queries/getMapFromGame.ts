import { Game } from '@backend/models'
import { pool } from '@backend/utils/dbConnect'
import { ChallengeType, GameType } from '@types'
import { COUNTRY_STREAKS_ID, OFFICIAL_WORLD_ID } from '@utils/constants/random'

const getMapFromGame = async (game: GameType | Game | ChallengeType) => {
  const mapId = game.isDailyChallenge || Number(game.mapId) === COUNTRY_STREAKS_ID ? Number(OFFICIAL_WORLD_ID) : Number(game.mapId)
  const res = await pool.query('SELECT * FROM maps WHERE id = $1', [mapId])
  return res.rows[0]
}

export default getMapFromGame
