
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import compareObjectIds from '@backend/utils/compareObjectIds'
import { pool } from '@backend/utils/dbConnect'
import { TopScore } from '@backend/models'

const getGameScores = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string

  // Fetch leaderboard from PostgreSQL
  const scoresRes = await pool.query(`
    SELECT g.id as gameId, g.userid as userId, g.totalpoints as totalPoints, g.totaltime as totalTime,
           u.name as userName, u.avatar as userAvatar
    FROM games g
    JOIN users u ON g.userid = u.id
    WHERE g.mapid = $1 AND g.state = 'finished'
    ORDER BY g.totalpoints DESC
    LIMIT 100
  `, [mapId]);
  const topScores = scoresRes.rows;
  if (!topScores?.length) {
    return res.status(200).send([]);
  }
  const thisUserIndex = topScores.findIndex((topScore) => topScore.userId === userId);
  const isUserInTopFive = thisUserIndex !== -1;
  res.status(200).send(topScores);
}

export default getGameScores
