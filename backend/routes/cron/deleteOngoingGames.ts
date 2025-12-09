import { NextApiRequest, NextApiResponse } from 'next'
import { throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'
import { daysAgo } from '@backend/utils/queryDates'

const deleteOngoingGames = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const cutoffDate = daysAgo(30);
    const deleteRes = await pool.query(
      "DELETE FROM games WHERE state != 'finished' AND createdat < $1 RETURNING id",
      [cutoffDate]
    );
    const deletedCount = deleteRes.rowCount;
    await pool.query(
      "UPDATE analytics SET deletedongoinggames = deletedongoinggames + $1",
      [deletedCount]
    );
    res.status(200).send(`Successfully deleted ${deletedCount} games`);
  } catch (err) {
    return throwError(res, 500, 'Failed to delete ongoing games');
  }
}

export default deleteOngoingGames
