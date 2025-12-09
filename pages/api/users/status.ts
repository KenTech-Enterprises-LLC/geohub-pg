/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, isUserBanned } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // dbConnect not needed for pg

    if (req.method !== 'GET') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const userId = await getUserId(req, res)

    if (!userId) {
      return res.status(200).send({ isBanned: false })
    }

    const banDetails = await isUserBanned(userId)

    res.status(200).send(banDetails)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
