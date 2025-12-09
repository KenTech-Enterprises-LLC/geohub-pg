import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const unlikeMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string
  try {
    const query = 'DELETE FROM maplikes WHERE mapid = $1 AND userid = $2';
    const result = await pool.query(query, [mapId, userId]);
    if (result.rowCount === 0) {
      return throwError(res, 400, 'Failed to unlike map');
    }
    res.status(200).send({ message: 'Map was successfully unliked' });
  } catch (err) {
    return throwError(res, 500, 'Database error unliking map');
  }
}

export default unlikeMap
