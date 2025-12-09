/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import getUnfinishedGames from '@backend/routes/games/getUnfinishedGames'
// Removed dbConnect, not needed for PostgreSQL

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    switch (req.method) {
      case 'GET':
        return getUnfinishedGames(req, res)
      default:
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({ success: false })
  }
}
