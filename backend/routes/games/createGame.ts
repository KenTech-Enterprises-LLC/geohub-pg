import { NextApiRequest, NextApiResponse } from 'next'
import Game from '@backend/models/game'
import { pool } from '@backend/utils/dbConnect'
import { getLocations, getUserId, isUserBanned, throwError } from '@backend/utils'

const createGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const { mode, mapId } = req.body

  if (!userId) {
    return throwError(res, 401, 'Unauthorized')
  }

  const { isBanned } = await isUserBanned(userId)

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  const locations = await getLocations(mapId)

  if (!locations) {
    return throwError(res, 400, 'Failed to get locations')
  }

  const newGame = {
    ...req.body,
    mapId: mode === 'standard' ? mapId : mapId,
    userId,
    guesses: [],
    rounds: locations,
    round: 1,
    totalPoints: 0,
    totalDistance: { metric: 0, imperial: 0 },
    totalTime: 0,
    streak: 0,
    state: 'started',
    createdAt: new Date(),
  } as Game

  // Insert game into PostgreSQL
  const insertSQL = `
    INSERT INTO games (map_id, user_id, guesses, rounds, round, total_points, total_distance, total_time, streak, state, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `
  const values = [
    newGame.mapId,
    newGame.userId,
    JSON.stringify(newGame.guesses),
    JSON.stringify(newGame.rounds),
    newGame.round,
    newGame.totalPoints,
    JSON.stringify(newGame.totalDistance),
    newGame.totalTime,
    newGame.streak,
    newGame.state,
    newGame.createdAt,
  ]
  try {
    const result = await pool.query(insertSQL, values)
    res.status(201).send({ id: result.rows[0].id, ...newGame })
  } catch (err) {
    return res.status(500).send('Failed to create a new game.')
  }
}

export default createGame
