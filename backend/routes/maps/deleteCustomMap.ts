import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const deleteCustomMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.mapId as string

  if (!mapId) {
    return throwError(res, 400, 'You must pass a valid mapId')
  }

  try {
    // Get map details
    const mapDetailsRes = await pool.query('SELECT creator FROM maps WHERE id = $1', [mapId]);
    if (!mapDetailsRes.rows.length) {
      return throwError(res, 400, `Failed to find map details`);
    }
    const mapDetails = mapDetailsRes.rows[0];
    if (userId !== mapDetails.creator) {
      return throwError(res, 401, 'You do not have permission to delete this map');
    }
    // Remove map as a liked map for all users
    await pool.query('DELETE FROM maplikes WHERE mapid = $1', [mapId]);
    // Mark map as deleted in DB
    await pool.query('UPDATE maps SET isdeleted = true WHERE id = $1', [mapId]);
    // Remove its locations
    await pool.query('DELETE FROM userlocations WHERE mapid = $1', [mapId]);
    res.status(200).send({ message: 'Map was successfully deleted' });
  } catch (err) {
    return throwError(res, 500, 'An unexpected error occurred while trying to delete');
  }
}

export default deleteCustomMap
