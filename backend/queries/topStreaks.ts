import { TopScore } from '@backend/models'
import { pool } from '@backend/utils/dbConnect'

const queryTopStreaks = async (_query: any, limit: number) => {
  // Replace with a SQL query for top streaks
  const sql = `
    SELECT g.id as gameId, g.userid as userId, g.streak as totalPoints, g.totaltime as totalTime
    FROM games g
    WHERE g.notforleaderboard IS NULL OR g.notforleaderboard = false
    ORDER BY g.streak DESC, g.totaltime ASC
    LIMIT $1
  `;
  const res = await pool.query(sql, [limit]);
  return res.rows as TopScore[];
}

export default queryTopStreaks
