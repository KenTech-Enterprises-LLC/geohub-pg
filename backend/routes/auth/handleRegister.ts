import bcrypt from 'bcryptjs'
import { throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'
import { registerUserSchema } from '@backend/validations/userValidations'
import { getRandomAvatar } from '@utils/helpers'
import { NextApiRequest, NextApiResponse } from 'next'

const handleRegister = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, password } = registerUserSchema.parse(req.body)

  try {
    // Check for existing email
    const emailRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailRes.rows.length > 0) {
      return throwError(res, 400, 'An account with that email already exists');
    }
    // Check for existing name
    const nameRes = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (nameRes.rows.length > 0) {
      return throwError(res, 400, `The name ${name} is already taken`);
    }
    // Values are unique, so create user
    const hashPassword = bcrypt.hashSync(password, 10);
    const avatar = getRandomAvatar();
    const createdAt = new Date();
    const onNewDomain = req.headers.host === 'www.geohub.gg';
    const insertRes = await pool.query(
      'INSERT INTO users (name, email, password, avatar, createdat, onnewdomain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, avatar, createdat, onnewdomain',
      [name, email, hashPassword, avatar, createdAt, onNewDomain]
    );
    const newUser = insertRes.rows[0];
    res.status(201).json({ ...newUser, password: '' });
  } catch (err) {
    return throwError(res, 500, 'Failed to register user');
  }
}

export default handleRegister
