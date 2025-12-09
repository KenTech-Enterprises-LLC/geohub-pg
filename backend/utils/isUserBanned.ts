import { db } from './db'
import { pool } from './dbConnect'
import unbanUser from '@backend/utils/unbanUser'


const isUserBanned = async (userId: string | number) => {
  // Example query, adjust table/column names as needed
  const res = await pool.query('SELECT * FROM user_bans WHERE user_id = $1', [userId])
  const user = res.rows[0]
  if (!user) {
    return { isBanned: false }
  }
  const isBanned = user.is_banned
  const bans = user.bans || []
  const activeBan = bans.find((ban: any) => ban.is_active)
  if (!isBanned || !activeBan) {
    return { isBanned: false }
  }
  const banHasEnded = activeBan.end && new Date() >= new Date(activeBan.end)
  if (banHasEnded) {
    await unbanUser(userId)
    return { isBanned: false }
  }
  return { isBanned, details: activeBan }
}

export default isUserBanned
