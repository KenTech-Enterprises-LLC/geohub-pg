import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'
import { COUNTRY_STREAK_DETAILS, COUNTRY_STREAKS_ID } from '@utils/constants/random'
import { GameType } from '@types';

const SENSITIVE_GAME_FIELDS: (keyof GameType)[] = ["guesses", "rounds"]

const getChallengeScores = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const challengeId = req.query.id as string

  try {
    // Get finished games for the challenge, sorted by totalPoints
    const gamesRes = await pool.query(`
      SELECT g.*, u.id as userId, u.name as userName, u.avatar as userAvatar
      FROM games g
      JOIN users u ON g.userid = u.id
      WHERE g.challengeid = $1 AND g.state = 'finished'
      ORDER BY g.totalpoints DESC
      LIMIT 100
    `, [Number(challengeId)]);
    const gamesData = gamesRes.rows;
    if (!gamesData || gamesData.length < 1) {
      return throwError(res, 404, `Failed to get scores for challenged with id: ${challengeId}`);
    }
    let notPlayed = false;
    if (!gamesData.find((x) => x?.userid === userId)) {
      notPlayed = true;
      for (const game of gamesData) {
        for (const field of SENSITIVE_GAME_FIELDS) {
          delete game[field];
        }
      }
    }
    // Get Map
    const mapId = gamesData[0].mapid;
    if (mapId === COUNTRY_STREAKS_ID) {
      return res.status(200).send({ games: gamesData, map: COUNTRY_STREAK_DETAILS, notPlayed });
    }
    const mapRes = await pool.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    const map = mapRes.rows[0];
    if (!map) {
      return throwError(res, 404, `Failed to get map for challenged with id: ${challengeId}`);
    }
    res.status(200).send({ games: gamesData, map, notPlayed });
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving challenge scores');
  }
}

export default getChallengeScores
