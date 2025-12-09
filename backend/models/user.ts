type User = {
  id: string | number
  name: string
  bio?: string
  email: string
  password: string
  avatar: { emoji: string; color: string }
  createdAt?: Date
  isAdmin?: boolean
}

export default User
