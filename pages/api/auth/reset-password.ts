/* eslint-disable import/no-anonymous-default-export */
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import { pool, throwError } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    if (req.method === 'POST') {
      const { password, confirmPassword, token } = req.body

      if (!password || password.length < 6) {
        return throwError(res, 400, 'Password must be at least 6 characters')
      }

      if (password !== confirmPassword) {
        return throwError(res, 400, 'Passwords do not match')
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

      // Find user with valid reset token
      const result = await pool.query(
        'SELECT * FROM users WHERE resetToken = $1 AND resetTokenExpiry > $2',
        [hashedToken, new Date()]
      )
      const user = result.rows[0]

      if (!user) {
        return throwError(res, 400, 'This token is invalid or has expired')
      }

      // Update user password and clear reset token
      const hashedPassword = bcrypt.hashSync(password, 10)
      const updateResult = await pool.query(
        'UPDATE users SET password = $1, resetToken = NULL, resetTokenExpiry = NULL WHERE id = $2',
        [hashedPassword, user.id]
      )
      if (updateResult.rowCount === 0) {
        return throwError(res, 500, 'Failed to update password')
      }

      res.status(200).send({ message: 'Successfully updated password' })
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}