import { NextApiRequest, NextApiResponse } from 'next'
import { throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getDailyChallengeWinners = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const winnersRes = await pool.query(`
      SELECT c.id, c.createdat, c.winner_totalpoints AS totalPoints, c.winner_totaltime AS totalTime, c.winner_gameid AS gameId,
             u.id AS userId, u.name AS userName, u.avatar AS userAvatar
      FROM challenges c
      JOIN users u ON c.winner_userid = u.id
      WHERE c.isdailychallenge = true AND c.winner_userid IS NOT NULL
      ORDER BY c.createdat DESC
      LIMIT 7
    `);
    const winners = winnersRes.rows;
    if (!winners) {
      return throwError(res, 400, 'Failed to get recent winners');
    }
    res.status(200).send(winners);
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving daily challenge winners');
  }
}

export default getDailyChallengeWinners
