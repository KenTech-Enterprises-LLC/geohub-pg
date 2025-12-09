import { db } from './db'


const isUserAnAdmin = async (userId?: string | number) => {
  if (!userId) {
    return false
  }
  const user = await db.getUserById(userId)
  if (!user) {
    return false
  }
  return user.is_admin || false
}

export default isUserAnAdmin
