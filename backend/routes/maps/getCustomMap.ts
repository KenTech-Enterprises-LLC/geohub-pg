import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getCustomMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.mapId as string

  if (!mapId) {
    return throwError(res, 400, 'You must pass a valid mapId')
  }

  try {
    // Get map details
    const mapRes = await pool.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    if (!mapRes.rows.length) {
      return throwError(res, 400, `Failed to find map details`);
    }
    const mapDetails = mapRes.rows[0];
    // Verify that this map belongs to this user
    if (userId !== mapDetails.creator) {
      return throwError(res, 401, 'You are not authorized to view this page');
    }
    // Get corresponding locations
    const locRes = await pool.query('SELECT * FROM userlocations WHERE mapid = $1', [mapId]);
    const locations = locRes.rows;
    res.status(200).send({ ...mapDetails, locations });
  } catch (err) {
    return throwError(res, 500, 'Failed to get locations for map');
  }
}

export default getCustomMap
