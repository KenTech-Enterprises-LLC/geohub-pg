import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getUsersLikedMaps = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const count = Number(req.query.count as string)
  try {
    const query = `
      SELECT m.*
      FROM maplikes ml
      JOIN maps m ON ml.mapid = m.id
      WHERE ml.userid = $1
      LIMIT $2;
    `;
    const result = await pool.query(query, [userId, count || 36]);
    const likedMaps = result.rows;
    if (!likedMaps) {
      return res.status(400).send('Failed to get your liked maps');
    }
    res.status(200).send(likedMaps);
  } catch (err) {
    res.status(500).send('Database error retrieving liked maps');
  }
}

export default getUsersLikedMaps
