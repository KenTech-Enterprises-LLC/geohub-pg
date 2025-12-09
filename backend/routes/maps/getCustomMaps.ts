import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

// HALP -> likely want to paginate in future
const getCustomMaps = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const queryUserId = req.query.userId as string

  try {
    let customMaps;
    if (queryUserId) {
      const query = `SELECT * FROM maps WHERE creator = $1 AND (isdeleted IS NULL OR isdeleted = false) AND ispublished = true ORDER BY createdat DESC`;
      const result = await pool.query(query, [queryUserId]);
      customMaps = result.rows;
      if (!customMaps) {
        return throwError(res, 400, 'Failed to get users maps');
      }
      return res.status(200).send(customMaps);
    }
    const query = `SELECT * FROM maps WHERE creator = $1 AND (isdeleted IS NULL OR isdeleted = false) ORDER BY createdat DESC`;
    const result = await pool.query(query, [userId]);
    customMaps = result.rows;
    if (!customMaps) {
      return throwError(res, 400, 'Could not retrieve your maps');
    }
    res.status(200).send(customMaps);
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving maps');
  }
}

export default getCustomMaps
