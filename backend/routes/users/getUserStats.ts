import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'

const getUserStats = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string

  try {
    // Completed Games
    const gamesPlayedRes = await pool.query(
      "SELECT COUNT(*) FROM games WHERE userid = $1 AND state = 'finished' AND mode = 'standard'",
      [userId]
    );
    const gamesPlayed = parseInt(gamesPlayedRes.rows[0].count, 10);
    // Best Game
    const bestGameRes = await pool.query(
      "SELECT totalpoints FROM games WHERE userid = $1 AND state = 'finished' AND mode = 'standard' ORDER BY totalpoints DESC LIMIT 1",
      [userId]
    );
    const bestGame = bestGameRes.rows[0]?.totalpoints || 0;
    // Average Game Score
    const avgScoreRes = await pool.query(
      "SELECT AVG(totalpoints) as avgscore FROM games WHERE userid = $1 AND state = 'finished' AND mode = 'standard'",
      [userId]
    );
    const avgScore = avgScoreRes.rows[0]?.avgscore ? Math.ceil(avgScoreRes.rows[0].avgscore) : 0;
    // Completed Streak Games
    const streakGamesPlayedRes = await pool.query(
      "SELECT COUNT(*) FROM games WHERE userid = $1 AND state = 'finished' AND mode = 'streak'",
      [userId]
    );
    const streakGamesPlayed = parseInt(streakGamesPlayedRes.rows[0].count, 10);
    // Best Streak Game
    const bestStreakGameRes = await pool.query(
      "SELECT streak FROM games WHERE userid = $1 AND state = 'finished' AND mode = 'streak' ORDER BY streak DESC LIMIT 1",
      [userId]
    );
    const bestStreakGame = bestStreakGameRes.rows[0]?.streak || 0;
    // Daily Challenge Wins
    const dailyChallengeWinsRes = await pool.query(
      "SELECT COUNT(*) FROM challenges WHERE isdailychallenge = true AND winner_userid = $1",
      [userId]
    );
    const dailyChallengeWins = parseInt(dailyChallengeWinsRes.rows[0].count, 10);
    const result = [
      { label: 'Completed Games', data: gamesPlayed },
      { label: 'Best Game', data: bestGame },
      { label: 'Average Game Score', data: avgScore },
      { label: 'Completed Streak Games', data: streakGamesPlayed },
      { label: 'Best Streak Game', data: bestStreakGame },
      { label: 'Daily Challenge Wins', data: dailyChallengeWins },
    ];
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send('Database error retrieving user stats');
  }
}

export default getUserStats
