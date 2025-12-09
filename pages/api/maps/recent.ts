/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import getRecentlyPlayedMaps from '@backend/routes/maps/getRecentlyPlayedMaps'
// Removed dbConnect, not needed for PostgreSQL

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    switch (req.method) {
      case 'GET':
        return getRecentlyPlayedMaps(req, res)
      default:
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
