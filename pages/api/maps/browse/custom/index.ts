/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { throwError } from '@backend/utils'
import { pool } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    if (req.method === 'GET') {
      const page = req.query.page ? Number(req.query.page) : 0
      const mapsPerPage = 28

      // Migrate MongoDB query to PostgreSQL
      try {
        const offset = page * mapsPerPage;
        const limit = mapsPerPage + 1;
        const result = await pool.query(
          `SELECT * FROM maps WHERE isPublished = true AND (isDeleted IS NULL OR isDeleted = false) AND creator != $1 ORDER BY id OFFSET $2 LIMIT $3`,
          ['GeoHub', offset, limit]
        );
        const maps = result.rows;
        if (!maps) {
          return throwError(res, 400, 'Failed to get official maps');
        }
        const data = maps.slice(0, mapsPerPage);
        const hasMore = maps.length > mapsPerPage;
        res.status(200).send({
          data,
          hasMore,
        });
      } catch (err) {
        return throwError(res, 500, 'Database error');
      }
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
