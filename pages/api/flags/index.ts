import { pool, throwError } from '@backend/utils'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM feature_flags LIMIT 1')
      const flags = result.rows[0]
      if (!flags) {
        return throwError(res, 500, 'Failed to get feature flags')
      }
      res.status(200).send({ flags })
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}

export default handler
