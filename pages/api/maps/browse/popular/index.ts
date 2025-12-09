/* eslint-disable import/no-anonymous-default-export */
// Removed ObjectId, not needed for PostgreSQL
import { NextApiRequest, NextApiResponse } from 'next'
import { throwError, pool } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    // HALP -> Sort maps by most liked -> going to need to query the mapLikes collection
    const countQuery = req.query.count as string
    const mapCount = Number(countQuery)
    const mapId = req.query.mapId as string

    if (req.method === 'GET') {
      // Migrate MongoDB query to PostgreSQL
      try {
        const limit = mapCount || 3;
        // Exclude the map with mapId, filter published and not deleted
        const result = await pool.query(
          `SELECT * FROM maps WHERE id != $1 AND isPublished = true AND (isDeleted IS NULL OR isDeleted = false) ORDER BY like_count DESC LIMIT $2`,
          [mapId, limit]
        );
        const maps = result.rows;
        if (!maps) {
          return throwError(res, 400, 'Failed to get popular maps');
        }
        res.status(200).send(maps);
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
