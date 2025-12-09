/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import createCustomMap from '@backend/routes/maps/createCustomMap'
import getCustomMaps from '@backend/routes/maps/getCustomMaps'
// Removed dbConnect, not needed for PostgreSQL

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    switch (req.method) {
      case 'GET':
        return getCustomMaps(req, res)
      case 'POST':
        return createCustomMap(req, res)
      default:
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
