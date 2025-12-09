import { NextApiRequest, NextApiResponse } from 'next'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, throwError } from '@backend/utils'
import { ChallengeType } from '@types'

const getChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const challengeId = req.query.id as string

  const challengeRes = await pool.query('SELECT * FROM challenges WHERE id = $1', [challengeId])
  const challenge = challengeRes.rows[0]

  if (!challenge) {
    return throwError(res, 404, 'Failed to find challenge')
  }

  // Get user details of challenge creator (if not the daily challenge)
  let challengeCreator = null
  if (!challenge.is_daily_challenge) {
    const creatorRes = await pool.query('SELECT * FROM users WHERE id = $1', [challenge.creator_id])
    challengeCreator = creatorRes.rows[0]
    if (!challengeCreator) {
      return throwError(res, 404, 'Failed to find challenge')
    }
  }

  let playersGame = null

  if (userId) {
    const gameRes = await pool.query('SELECT * FROM games WHERE user_id = $1 AND challenge_id = $2', [userId, challengeId])
    playersGame = gameRes.rows[0]
  }

  const mapDetails = await getMapFromGame(challenge as ChallengeType)

  if (!mapDetails) {
    return throwError(res, 404, 'Failed to find challenge')
  }

  const challengeBelongsToUser = challenge.creatorId && challenge.creatorId.toString() === userId

  const result = {
    ...challenge,
    creatorName: challengeCreator?.name,
    creatorAvatar: challengeCreator?.avatar,
    playersGame,
    mapDetails,
    challengeBelongsToUser,
  }

  res.status(200).send(result)
}

export default getChallenge
