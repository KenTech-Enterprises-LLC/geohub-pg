import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getMapLikeCount = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string

  try {
    const likesRes = await pool.query('SELECT COUNT(*) FROM maplikes WHERE mapid = $1', [mapId]);
    const likes = parseInt(likesRes.rows[0].count, 10);
    const likedByUserRes = await pool.query('SELECT COUNT(*) FROM maplikes WHERE mapid = $1 AND userid = $2', [mapId, userId]);
    const likedByUser = parseInt(likedByUserRes.rows[0].count, 10) > 0;
    const result = {
      numLikes: likes,
      likedByUser: likedByUser,
    };
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send('Failed to get map like count');
  }
}

export default getMapLikeCount
