import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getLocations, getUserId } from '@backend/utils'

const createChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const { mapId, gameSettings, mode } = req.body

  const numLocationsToGenerate = mode === 'streak' ? 10 : 5
  const locations = await getLocations(mapId, numLocationsToGenerate)

  if (locations === null) {
    return res.status(400).send('Invalid map Id, challenge could not be created')
  }

  const newChallenge = {
    mapId,
    creatorId: userId,
    mode,
    gameSettings,
    locations,
  }
  // Insert challenge into PostgreSQL
  const insertSQL = `
    INSERT INTO challenges (map_id, creator_id, mode, game_settings, locations)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `
  const values = [
    newChallenge.mapId,
    newChallenge.creatorId,
    newChallenge.mode,
    JSON.stringify(newChallenge.gameSettings),
    JSON.stringify(newChallenge.locations),
  ]
  try {
    const result = await pool.query(insertSQL, values)
    res.status(201).send(result.rows[0].id)
  } catch (err) {
    return res.status(500).send('Failed to create a new challenge.')
  }
}

export default createChallenge
