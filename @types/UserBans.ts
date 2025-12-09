

export type BanType = {
  start: Date
  end: Date | null
  duration: '1 day' | '3 day' | '7 day' | '30 day' | 'permanent'
  reason?: string
  isActive: boolean
}

type UserBans = {
  _id: string
  userId: string
  isBanned: boolean
  bans: BanType[]
}

export default UserBans
