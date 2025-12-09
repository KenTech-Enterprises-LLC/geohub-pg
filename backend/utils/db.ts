import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
})

export const db = {
  async getUserById(userId: string | number) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    return res.rows[0]
  },
  // Add similar methods for other collections/tables as needed
}
