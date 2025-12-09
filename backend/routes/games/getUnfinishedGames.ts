import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, throwError } from '@backend/utils'

const getUnfinishedGames = async (req: NextApiRequest, res: NextApiResponse) => {
  const page = req.query.page ? Number(req.query.page) : 0
  const gamesPerPage = 20

  const userId = await getUserId(req, res)

  // Fetch unfinished games from PostgreSQL
  const sql = `
    SELECT * FROM games WHERE user_id = $1 AND state != 'finished' ORDER BY created_at DESC OFFSET $2 LIMIT $3`
  const values = [userId, page * gamesPerPage, gamesPerPage + 1]
  const result = await pool.query(sql, values)
  const games = result.rows
  if (!games) {
    return throwError(res, 400, 'There was a problem fetching your ongoing games')
  }
  const data = games.slice(0, gamesPerPage)
  const hasMore = games.length > gamesPerPage
  res.status(200).send({ data, hasMore })
}

export default getUnfinishedGames
