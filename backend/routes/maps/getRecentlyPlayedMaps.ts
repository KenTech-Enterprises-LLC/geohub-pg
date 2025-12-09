import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getRecentlyPlayedMaps = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  try {
    const query = `
      SELECT m.id, m.previewimg, m.name, g.createdat
      FROM games g
      JOIN maps m ON g.mapid = m.id
      WHERE g.userid = $1
      GROUP BY m.id, m.previewimg, m.name, g.createdat
      ORDER BY g.createdat DESC
      LIMIT 5;
    `;
    const result = await pool.query(query, [userId]);
    const games = result.rows;
    if (!games) {
      return throwError(res, 400, 'Could not find any recent games for this user');
    }
    res.status(200).send(games);
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving recent games');
  }
}

export default getRecentlyPlayedMaps
