/* eslint-disable import/no-anonymous-default-export */
import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { throwError, pool } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body

      const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userRes.rows[0];
      if (!user) {
        return throwError(res, 400, 'Incorrect email or password');
      }
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return throwError(res, 400, 'Incorrect email or password');
      }
      res.status(200).json({
        ...user,
        password: '',
      });
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}


