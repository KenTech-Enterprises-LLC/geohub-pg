
import { NextApiRequest, NextApiResponse } from 'next'
import { pool, getUserId, throwError } from '@backend/utils'
import { DAILY_CHALLENGE_ID } from '@utils/constants/random'
import { TopScore } from '@backend/models'

type TopScoreType = TopScore & {
  highlight?: boolean
}

const LOCATION_COUNT = 250000
const COUNTRY_COUNT = 98

const getDailyChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)

  // Fetch today's daily challenge from PostgreSQL
  const dailyChallengeRes = await pool.query(
    'SELECT * FROM challenges WHERE isdailychallenge = true ORDER BY createdat DESC LIMIT 1'
  );
  if (!dailyChallengeRes.rows.length) {
    return throwError(res, 500, `Could not find today's challenge`);
  }
  const dailyChallenge = dailyChallengeRes.rows[0];

  // Fetch leaderboard for the daily challenge
  const leaderboardRes = await pool.query(
    `SELECT g.id as gameId, g.userid as userId, g.totalpoints as totalPoints, g.totaltime as totalTime,
            u.name as userName, u.avatar as userAvatar
     FROM games g
     JOIN users u ON g.userid = u.id
     WHERE g.challengeid = $1 AND g.state = 'finished'
     ORDER BY g.totalpoints DESC
     LIMIT 100`,
    [Number(dailyChallenge.id)]
  );
  const topScores: TopScoreType[] = leaderboardRes.rows;

  // Highlight the current user's score if present
  const thisUserIndex = topScores.findIndex((topScore) => topScore.userId === userId);
  const isUserInTopFive = thisUserIndex !== -1;
  if (isUserInTopFive) {
    topScores[thisUserIndex] = { ...topScores[thisUserIndex], highlight: true };
  }

  res.status(200).send({
    stats: {
      avgScore: 0, // You can calculate avgScore if needed
      usersPlayed: topScores.length,
      locationCount: LOCATION_COUNT,
      countryCount: COUNTRY_COUNT,
    },
    scores: topScores,
    challengeId: dailyChallenge.id,
    date: dailyChallenge.createdat,
    usersGameState: isUserInTopFive ? 'finished' : 'notStarted',
  });
}

export default getDailyChallenge
