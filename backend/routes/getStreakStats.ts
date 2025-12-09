import { NextApiRequest, NextApiResponse } from 'next'
import { COUNTRY_STREAKS_ID } from '@utils/constants/random'
import { getUserId } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const LOCATION_COUNT = 250000
const COUNTRY_COUNT = 98

const getStreakStats = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  try {
    // Get top streak scores for COUNTRY_STREAKS_ID
    const scoresRes = await pool.query(`
      SELECT g.id as gameId, g.userid as userId, g.streak as streak, g.totaltime as totalTime,
             u.name as userName, u.avatar as userAvatar
      FROM games g
      JOIN users u ON g.userid = u.id
      WHERE g.mapid = $1 AND g.mode = 'streak' AND g.state = 'finished'
      ORDER BY g.streak DESC
      LIMIT 100
    `, [Number(COUNTRY_STREAKS_ID)]);
    const topScores = scoresRes.rows;
    // Get avgScore and usersPlayed
    const avgScoreRes = await pool.query(
      'SELECT AVG(streak) as avgscore, COUNT(DISTINCT userid) as usersplayed FROM games WHERE mapid = $1 AND mode = $2 AND state = $3',
      [Number(COUNTRY_STREAKS_ID), 'streak', 'finished']
    );
    const avgScore = avgScoreRes.rows[0]?.avgscore ? Math.ceil(avgScoreRes.rows[0].avgscore) : 0;
    const usersPlayed = avgScoreRes.rows[0]?.usersplayed || 0;
    // Highlight user's top score if present
    const thisUserIndex = topScores.findIndex((topScore) => topScore.userId === userId);
    if (thisUserIndex !== -1) {
      topScores[thisUserIndex] = { ...topScores[thisUserIndex], highlight: true };
    } else {
      // Get user's top streak score if not in topScores
      const userScoreRes = await pool.query(`
        SELECT g.id as gameId, g.userid as userId, g.streak as streak, g.totaltime as totalTime,
               u.name as userName, u.avatar as userAvatar
        FROM games g
        JOIN users u ON g.userid = u.id
        WHERE g.userid = $1 AND g.mode = 'streak' AND g.state = 'finished'
        ORDER BY g.streak DESC
        LIMIT 1
      `, [userId]);
      const usersTopScore = userScoreRes.rows;
      if (usersTopScore?.length) {
        topScores.push({ ...usersTopScore[0], highlight: true });
      }
    }
    res.status(200).send({
      avgScore,
      usersPlayed,
      locationCount: LOCATION_COUNT,
      countryCount: COUNTRY_COUNT,
      scores: topScores,
    });
  } catch (err) {
    res.status(500).send({
      avgScore: 0,
      usersPlayed: 0,
      locationCount: LOCATION_COUNT,
      countryCount: COUNTRY_COUNT,
      scores: [],
    });
  }
}


export default getStreakStats
