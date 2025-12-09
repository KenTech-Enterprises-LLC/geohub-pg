import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, throwError } from '@backend/utils'

const deleteGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const gameId = req.query.id as string

  const gameRes = await pool.query('SELECT * FROM games WHERE id = $1', [gameId])
  const game = gameRes.rows[0]

  if (!game) {
    return throwError(res, 401, 'The game you are trying to delete could not be found')
  }

  if (userId !== game.user_id?.toString()) {
    return throwError(res, 401, 'You are not authorized to delete this game')
  }

  // If authorized -> Remove game from DB
  try {
    const deletedGame = await pool.query('DELETE FROM games WHERE id = $1', [gameId])
    if (deletedGame.rowCount === 0) {
      return throwError(res, 400, 'An error occurred while deleting the game')
    }
    res.status(200).send({ message: 'The game was successfully deleted' })
  } catch (err) {
    return throwError(res, 400, 'An error occurred while deleting the game')
  }
}

export default deleteGame
