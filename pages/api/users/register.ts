/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { catchErrors } from '@backend/utils'
import handleRegister from '@backend/routes/auth/handleRegister'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    switch (req.method) {
      case 'POST':
        await handleRegister(req, res)
        break
      default:
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    return catchErrors(res, err)
  }
}
