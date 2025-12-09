import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, throwError } from '@backend/utils'

const getGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.id as string
  const userId = await getUserId(req, res)

  // Fetch game and user details from PostgreSQL
  const sql = `
    SELECT g.*, u.id as user_id, u.name as user_name, u.email as user_email
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.id = $1
  `
  const result = await pool.query(sql, [gameId])
  if (!result.rows || result.rows.length !== 1) {
    return throwError(res, 404, 'Failed to find game')
  }
  const game = result.rows[0] as Game
  const gameBelongsToUser = userId === game.userId?.toString()
  const mapDetails = await getMapFromGame(game)
  res.status(200).send({ game, gameBelongsToUser, mapDetails })
}

export default getGame
