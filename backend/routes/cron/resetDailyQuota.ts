import { NextApiRequest, NextApiResponse } from 'next'
import { throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const resetDailyQuota = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resetRes = await pool.query(
      "UPDATE featureflags SET mapsquotareached = false"
    );
    if (resetRes.rowCount === 0) {
      return throwError(res, 500, 'Failed to reset map quota flag');
    }
    res.status(200).send('Successfully reset map quota flag');
  } catch (err) {
    return throwError(res, 500, 'Failed to reset map quota flag');
  }
}

export default resetDailyQuota
