import { pool } from './dbConnect'

const unbanUser = async (userId: string | number) => {
  // Update is_banned and set all bans to inactive for the user
  await pool.query('UPDATE user_bans SET is_banned = false WHERE user_id = $1', [userId])
  await pool.query('UPDATE bans SET is_active = false WHERE user_id = $1', [userId])
  return true
}

export default unbanUser
