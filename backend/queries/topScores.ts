import { TopScore } from '@backend/models'
import { pool } from '@backend/utils/dbConnect'

const queryTopScores = async (query: any, limit: number) => {
  // Build WHERE clause from query object
  const whereClauses = []
  const values: any[] = []
  let idx = 1
  for (const key in query) {
    whereClauses.push(`${key} = $${idx}`)
    values.push(query[key])
    idx++
  }
  whereClauses.push('not_for_leaderboard != true')
  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

  // SQL: Get top score per user, sorted, limited
  const sql = `
    SELECT DISTINCT ON (user_id) id AS gameId, user_id AS userId, total_points AS totalPoints, total_time AS totalTime
    FROM games
    ${whereSQL}
    ORDER BY user_id, total_points DESC, total_time ASC
    LIMIT $${idx}
  `
  values.push(limit)
  const res = await pool.query(sql, values)
  return res.rows as TopScore[]
}

export default queryTopScores
