import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'

const getUserScores = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.id as string
  const page = req.query.page ? Number(req.query.page) : 0
  const gamesPerPage = 20

  try {
    const offset = page * gamesPerPage;
    const limit = gamesPerPage + 1;
    const gamesRes = await pool.query(`
      SELECT g.id as gameId, g.mapid as mapId, m.name as mapName, m.previewimg as mapAvatar,
             g.totalpoints as totalPoints, g.totaltime as totalTime
      FROM games g
      JOIN maps m ON g.mapid = m.id
      WHERE g.userid = $1 AND g.mode = 'standard' AND g.state = 'finished'
      ORDER BY g.totalpoints DESC
      OFFSET $2 LIMIT $3
    `, [userId, offset, limit]);
    const games = gamesRes.rows;
    if (!games) {
      return res.status(404).send(`Failed to find games for user with id: ${userId}`);
    }
    const data = games.slice(0, gamesPerPage).map((item) => ({
      gameId: item.gameid,
      mapId: item.mapid,
      mapName: item.mapname,
      mapAvatar: item.mapavatar,
      totalPoints: item.totalpoints,
      totalTime: item.totaltime,
    }));
    const hasMore = games.length > gamesPerPage;
    res.status(200).send({
      data,
      hasMore,
    });
  } catch (err) {
    return res.status(500).send('Database error retrieving user scores');
  }
}

export default getUserScores
