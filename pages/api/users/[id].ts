/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { userProject } from '@backend/utils/dbProjects'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // dbConnect not needed for pg

    if (req.method === 'GET') {
      const userId = req.query.id as string

      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (!userRes.rows.length) {
        return res.status(400).send(`Failed to find user with id: ${userId}`);
      }
      res.status(200).send(userRes.rows[0]);
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
