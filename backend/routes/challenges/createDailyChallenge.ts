import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getLocations, throwError } from '@backend/utils'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'

const createDailyChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  // First set winner for previous daily challenge
  const prevRes = await pool.query('SELECT * FROM challenges WHERE is_daily_challenge = true ORDER BY created_at DESC LIMIT 1')
  const previousDailyChallenge = prevRes.rows[0]

  if (previousDailyChallenge) {
    const winRes = await pool.query(
      'SELECT * FROM games WHERE challenge_id = $1 AND not_for_leaderboard != true ORDER BY total_points DESC, total_time ASC LIMIT 1',
      [Number(previousDailyChallenge.id)]
    )
    const winningGame = winRes.rows[0]
    if (winningGame) {
      const winner = {
        gameId: winningGame.id,
        userId: winningGame.user_id,
        totalPoints: winningGame.total_points,
        totalTime: winningGame.total_time,
      }
      await pool.query('UPDATE challenges SET winner = $1 WHERE id = $2', [JSON.stringify(winner), Number(previousDailyChallenge.id)])
    }
  }

  const locations = await getLocations(Number(OFFICIAL_WORLD_ID))

  const newDailyChallenge = {
    mapId: Number(OFFICIAL_WORLD_ID),
    createdAt: new Date(),
    isDailyChallenge: true,
    mode: 'standard',
    gameSettings: {
      timeLimit: 180,
      canMove: true,
      canPan: true,
      canZoom: true,
    },
    locations,
  }
  const insertSQL = `
    INSERT INTO challenges (map_id, created_at, is_daily_challenge, mode, game_settings, locations)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `
  const values = [
    newDailyChallenge.mapId,
    newDailyChallenge.createdAt,
    newDailyChallenge.isDailyChallenge,
    newDailyChallenge.mode,
    JSON.stringify(newDailyChallenge.gameSettings),
    JSON.stringify(newDailyChallenge.locations),
  ]
  try {
    const createResult = await pool.query(insertSQL, values)
    res.status(201).send({ challengeId: createResult.rows[0].id })
  } catch (err) {
    return throwError(res, 400, 'Could not create new daily challenge')
  }
}

export default createDailyChallenge
