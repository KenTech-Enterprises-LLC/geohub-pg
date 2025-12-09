import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, isUserBanned, throwError } from '@backend/utils'

const createChallengeGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const challengeId = req.query.id as string
  const { mapId, mode, gameSettings, locations, isDailyChallenge } = req.body

  if (!userId) {
    return throwError(res, 401, 'Unauthorized')
  }

  const { isBanned } = await isUserBanned(userId)

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  // Ensure user has not already played this challenge
  const playedRes = await pool.query('SELECT COUNT(*) FROM games WHERE challenge_id = $1 AND user_id = $2', [challengeId, userId])
  const hasAlreadyPlayed = Number(playedRes.rows[0].count)
  if (hasAlreadyPlayed) {
    return throwError(res, 400, 'You have already played this challenge')
  }

  const newGame = {
    mapId,
    userId,
    challengeId,
    mode,
    gameSettings,
    guesses: [],
    rounds: locations,
    round: 1,
    totalPoints: 0,
    totalDistance: { metric: 0, imperial: 0 },
    totalTime: 0,
    streak: 0,
    state: 'started',
    isDailyChallenge,
    createdAt: new Date(),
  }
  // Insert game into PostgreSQL
  const insertSQL = `
    INSERT INTO games (map_id, user_id, challenge_id, mode, game_settings, guesses, rounds, round, total_points, total_distance, total_time, streak, state, is_daily_challenge, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id
  `
  const values = [
    newGame.mapId,
    newGame.userId,
    newGame.challengeId,
    newGame.mode,
    JSON.stringify(newGame.gameSettings),
    JSON.stringify(newGame.guesses),
    JSON.stringify(newGame.rounds),
    newGame.round,
    newGame.totalPoints,
    JSON.stringify(newGame.totalDistance),
    newGame.totalTime,
    newGame.streak,
    newGame.state,
    newGame.isDailyChallenge,
    newGame.createdAt,
  ]
  try {
    const result = await pool.query(insertSQL, values)
    const mapDetails = await getMapFromGame(newGame as Game)
    res.status(201).send({ id: result.rows[0].id, ...newGame, mapDetails })
  } catch (err) {
    return throwError(res, 400, 'Failed to create your game in this challenge')
  }
}
export default createChallengeGame
