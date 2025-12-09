/* eslint-disable import/no-anonymous-default-export */
// Removed ObjectId, not needed for PostgreSQL
import { NextApiRequest, NextApiResponse } from 'next'
import { throwError, pool } from '@backend/utils'
import queryTopScores from '@backend/queries/topScores'
import { COUNTRY_STREAKS_ID, DAILY_CHALLENGE_ID } from '@utils/constants/random'
import queryTopStreaks from '@backend/queries/topStreaks'
import { Game } from '@backend/models'

export const LEADERBOARD_LENGTH = 5

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const authHeader = req.headers.authorization

    if (!authHeader || authHeader !== process.env.INTERNAL_API_SECRET) {
      return throwError(res, 401, 'Unauthorized')
    }

    // PostgreSQL pool does not require explicit connection

    const { game } = req.body

    if (game.mode === 'standard' && !game.isDailyChallenge) {
      await updateMapLeaderboard(game)
      await updateMapStats(game)
    }

    if (game.mode === 'standard' && game.isDailyChallenge) {
      await updateDailyChallenge(game)
    }

    if (game.mode === 'streak') {
      await updateStreakLeaderboard(game)
      await updateStreakStats()
    }

    res.status(200).send('Success')
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}

// DAILY CHALLENGE
const updateDailyChallenge = async (game: Game) => {
  // Get the latest daily challenge
  const dailyChallengeRes = await pool.query(
    `SELECT * FROM challenges WHERE isDailyChallenge = true ORDER BY createdAt DESC LIMIT 1`
  );
  if (!dailyChallengeRes.rows.length) {
    return null;
  }
  const dailyChallenge = dailyChallengeRes.rows[0];
  const dailyChallengeId = dailyChallenge.id;

  const stats = await getDailyChallengeStats(dailyChallengeId);
  const scores = await getDailyChallengeScores(dailyChallengeId, game);

  let updateFields: any = {};
  if (stats) {
    updateFields = { ...updateFields, ...stats };
  }
  if (scores) {
    updateFields = { ...updateFields, scores };
  }

  // Upsert leaderboard row
  await pool.query(
    `INSERT INTO map_leaderboard (mapId, dailyChallengeId, avgScore, usersPlayed, scores)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (mapId, dailyChallengeId)
     DO UPDATE SET avgScore = $3, usersPlayed = $4, scores = $5`,
    [DAILY_CHALLENGE_ID, dailyChallengeId, updateFields.avgScore || 0, updateFields.usersPlayed || 0, JSON.stringify(updateFields.scores || [])]
  );
}

const getDailyChallengeStats = async (dailyChallengeId: string | number) => {
  // Aggregate stats for daily challenge games
  const statsRes = await pool.query(
    `SELECT COUNT(DISTINCT userId) AS explorers, AVG(totalPoints) AS avgScore
     FROM games
     WHERE challengeId = $1 AND state = 'finished' AND (notForLeaderboard IS NULL OR notForLeaderboard = false)`,
    [dailyChallengeId]
  );
  if (!statsRes.rows.length) {
    return null;
  }
  const { explorers, avgscore } = statsRes.rows[0];
  return {
    usersPlayed: Number(explorers) || 0,
    avgScore: Math.ceil(Number(avgscore) || 0),
  };
}

const getDailyChallengeScores = async (dailyChallengeId: string | number, game: Game) => {
  const mapId = DAILY_CHALLENGE_ID;
  // Get current leaderboard
  const leaderboardRes = await pool.query(
    `SELECT scores FROM map_leaderboard WHERE mapId = $1 AND dailyChallengeId = $2`,
    [mapId, dailyChallengeId]
  );
  const mapLeaderboard = leaderboardRes.rows[0] || {};
  const topScores = mapLeaderboard.scores || [];
  const leaderboardNeedsMoreScores = topScores.length && topScores.length < LEADERBOARD_LENGTH;
  const lowestTopScore = topScores.length
    ? topScores.reduce((min: number, score: any) => Math.min(min, score.totalPoints), Infinity)
    : 0;

  if (game.totalPoints < lowestTopScore && !leaderboardNeedsMoreScores) {
    return;
  }

  // Query top scores for this challenge
  const query = { challengeId: dailyChallengeId, state: 'finished' };
  const newTopScores = await queryTopScores(query, LEADERBOARD_LENGTH);
  return newTopScores;
}

// REGULAR MAPS
const updateMapStats = async (game: Game) => {
  const mapId = game.mapId;
  // Aggregate stats for games on this map
  const statsRes = await pool.query(
    `SELECT COUNT(DISTINCT userId) AS explorers, AVG(totalPoints) AS avgScore
     FROM games
     WHERE mapId = $1 AND state = 'finished' AND (notForLeaderboard IS NULL OR notForLeaderboard = false)`,
    [mapId]
  );
  if (!statsRes.rows.length) {
    return null;
  }
  const { explorers, avgscore } = statsRes.rows[0];
  const roundedAvgScore = Math.ceil(Number(avgscore) || 0);
  // Update map stats
  await pool.query(
    `UPDATE maps SET avgScore = $1, usersPlayed = $2 WHERE id = $3`,
    [roundedAvgScore, Number(explorers) || 0, mapId]
  );
}

const updateMapLeaderboard = async (game: Game) => {
  const mapId = game.mapId;
  // Get current leaderboard
  const leaderboardRes = await pool.query(
    `SELECT scores FROM map_leaderboard WHERE mapId = $1`,
    [mapId]
  );
  const mapLeaderboard = leaderboardRes.rows[0] || {};
  const topScores = mapLeaderboard.scores || [];
  const leaderboardNeedsMoreScores = topScores.length && topScores.length < LEADERBOARD_LENGTH;
  const lowestTopScore = topScores.length
    ? topScores.reduce((min: number, score: any) => Math.min(min, score.totalPoints), Infinity)
    : 0;

  if (game.totalPoints >= lowestTopScore || leaderboardNeedsMoreScores) {
    const query = { mapId, round: 6 };
    const newTopScores = await queryTopScores(query, LEADERBOARD_LENGTH);
    // Upsert leaderboard row
    await pool.query(
      `INSERT INTO map_leaderboard (mapId, scores)
       VALUES ($1, $2)
       ON CONFLICT (mapId)
       DO UPDATE SET scores = $2`,
      [mapId, JSON.stringify(newTopScores)]
    );
  }
}

// COUNTRY STREAKS
const updateStreakStats = async () => {
  // Aggregate stats for streak games
  const statsRes = await pool.query(
    `SELECT COUNT(DISTINCT userId) AS explorers, AVG(streak) AS avgScore
     FROM games
     WHERE mode = 'streak' AND state = 'finished' AND (notForLeaderboard IS NULL OR notForLeaderboard = false)`
  );
  if (!statsRes.rows.length) {
    return null;
  }
  const { explorers, avgscore } = statsRes.rows[0];
  const roundedAvgScore = Math.ceil(Number(avgscore) || 0);
  // Upsert streak stats in leaderboard
  await pool.query(
    `INSERT INTO map_leaderboard (mapId, avgScore, usersPlayed)
     VALUES ($1, $2, $3)
     ON CONFLICT (mapId)
     DO UPDATE SET avgScore = $2, usersPlayed = $3`,
    [COUNTRY_STREAKS_ID, roundedAvgScore, Number(explorers) || 0]
  );
}

const updateStreakLeaderboard = async (game: Game) => {
  const mapId = COUNTRY_STREAKS_ID;
  // Get current leaderboard
  const leaderboardRes = await pool.query(
    `SELECT scores FROM map_leaderboard WHERE mapId = $1`,
    [mapId]
  );
  const mapLeaderboard = leaderboardRes.rows[0] || {};
  const topScores = mapLeaderboard.scores || [];
  const leaderboardNeedsMoreScores = topScores.length && topScores.length < LEADERBOARD_LENGTH;
  const lowestTopScore = topScores.length
    ? topScores.reduce((min: number, score: any) => Math.min(min, score.totalPoints), Infinity)
    : 0;

  if (game.streak >= lowestTopScore || leaderboardNeedsMoreScores) {
    const query = { mode: 'streak', state: 'finished' };
    const newTopScores = await queryTopStreaks(query, LEADERBOARD_LENGTH);
    // Upsert leaderboard row
    await pool.query(
      `INSERT INTO map_leaderboard (mapId, scores)
       VALUES ($1, $2)
       ON CONFLICT (mapId)
       DO UPDATE SET scores = $2`,
      [mapId, JSON.stringify(newTopScores)]
    );
  }
}
