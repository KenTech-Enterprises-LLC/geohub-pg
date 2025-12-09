/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getUserId, throwError } from '@backend/utils'
import { BACKGROUND_COLORS, EMOJIS } from '@utils/constants/avatarOptions'
import { GUEST_ACCOUNT_ID } from '@utils/constants/random'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // dbConnect not needed for pg

    if (req.method === 'POST') {
      const { _id, name, bio, avatar } = req.body
      const userId = await getUserId(req, res)

      if (!userId || userId !== _id.toString()) {
        return throwError(res, 401, 'Unauthorized')
      }

      if (userId === GUEST_ACCOUNT_ID) {
        return throwError(res, 401, 'This account is not allowed to modify profile values')
      }

      // Validate avatar
      if (!BACKGROUND_COLORS.includes(avatar.color) || !EMOJIS.includes(avatar.emoji)) {
        return throwError(res, 400, 'You picked an invalid avatar')
      }

      // Ensure new name is not already taken
      const nameRes = await pool.query('SELECT id FROM users WHERE id != $1 AND name = $2', [userId, name]);
      if (nameRes.rows.length > 0) {
        return throwError(res, 400, `The name ${name} is already taken`);
      }
      await pool.query('UPDATE users SET name = $1, bio = $2, avatar = $3 WHERE id = $4', [name, bio, avatar, _id]);
      res.status(200).send({ status: 'ok' });
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
