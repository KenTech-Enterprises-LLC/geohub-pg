import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const likeMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string
  try {
    const query = 'INSERT INTO maplikes (userid, mapid) VALUES ($1, $2) RETURNING id';
    const result = await pool.query(query, [userId, mapId]);
    if (!result.rows.length) {
      return res.status(500).send(`Failed to add like to map with id: ${mapId}`);
    }
    res.status(201).send(result.rows[0].id);
  } catch (err) {
    res.status(500).send(`Failed to add like to map with id: ${mapId}`);
  }
}

export default likeMap
