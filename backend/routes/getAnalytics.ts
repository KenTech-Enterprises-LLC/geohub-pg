import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, isUserAnAdmin, monthAgo, throwError, todayEnd } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getAnalytics = async (req: NextApiRequest, res: NextApiResponse) => {
  const newUsersByDayStart = req.body.newUsersByDayStart
  const newUsersByDayEnd = req.body.newUsersByDayEnd

  const gamesPlayedByDayStart = req.body.gamesPlayedByDayStart
  const gamesPlayedByDayEnd = req.body.gamesPlayedByDayEnd

  const getCounts = async () => {
    const userCount = parseInt((await pool.query('SELECT COUNT(*) FROM users')).rows[0].count, 10);
    const singlePlayerGamesCount = parseInt((await pool.query('SELECT COUNT(*) FROM games WHERE challengeid IS NULL')).rows[0].count, 10);
    const challengesCount = parseInt((await pool.query('SELECT COUNT(*) FROM games WHERE challengeid IS NOT NULL')).rows[0].count, 10);
    const streakGamesCount = parseInt((await pool.query("SELECT COUNT(*) FROM games WHERE mode = 'streak'" )).rows[0].count, 10);
    const customMapsCount = parseInt((await pool.query("SELECT COUNT(*) FROM maps WHERE creator != 'GeoHub'" )).rows[0].count, 10);
    const customLocationsCount = parseInt((await pool.query('SELECT COUNT(*) FROM userlocations')).rows[0].count, 10);
    const customKeysCount = parseInt((await pool.query("SELECT COUNT(*) FROM users WHERE mapsapikey IS NOT NULL AND mapsapikey != ''" )).rows[0].count, 10);
    const unfinishedGamesCount = parseInt((await pool.query("SELECT COUNT(*) FROM games WHERE state != 'finished'" )).rows[0].count, 10);
    return [
      { title: 'Users', count: userCount },
      { title: 'Single Player Games', count: singlePlayerGamesCount },
      { title: 'Challenges', count: challengesCount },
      { title: 'Streak Games', count: streakGamesCount },
      { title: 'Custom Maps', count: customMapsCount },
      { title: 'Custom Map Locations', count: customLocationsCount },
      { title: 'Custom Keys', count: customKeysCount },
      { title: 'Unfinished Games', count: unfinishedGamesCount },
    ];
  }

  const getRecentUsers = async () => {
    const usersRes = await pool.query(`
      SELECT u.id, u.name, u.avatar, u.createdat,
        (SELECT COUNT(*) FROM games g WHERE g.userid = u.id) AS gamesplayed
      FROM users u
      ORDER BY u.createdat DESC
      LIMIT 50
    `);
    return usersRes.rows;
  }

  const getRecentGames = async () => {
    const gamesRes = await pool.query(`
      SELECT g.id, g.createdat, g.mapid, m.name as mapname, m.previewimg as mapavatar,
             g.userid, u.name as username, u.avatar as useravatar
      FROM games g
      JOIN maps m ON g.mapid = m.id
      JOIN users u ON g.userid = u.id
      ORDER BY g.id DESC
      LIMIT 50
    `);
    return gamesRes.rows;
  }

  const getNewUsersByDay = async () => {
    const start = newUsersByDayStart || monthAgo;
    const end = newUsersByDayEnd || todayEnd;
    const usersRes = await pool.query(`
      SELECT TO_CHAR(createdat, 'YYYY-MM-DD') AS date, COUNT(*) AS count
      FROM users
      WHERE createdat >= $1 AND createdat <= $2
      GROUP BY date
      ORDER BY date DESC
    `, [start, end]);
    return usersRes.rows;
  }

  const getGamesPlayedByDay = async () => {
    const start = gamesPlayedByDayStart || monthAgo;
    const end = gamesPlayedByDayEnd || todayEnd;
    const gamesRes = await pool.query(`
      SELECT TO_CHAR(createdat, 'YYYY-MM-DD') AS date, COUNT(*) AS count
      FROM games
      WHERE createdat >= $1 AND createdat <= $2
      GROUP BY date
      ORDER BY date DESC
    `, [start, end]);
    return gamesRes.rows;
  }

  const userId = await getUserId(req, res)
  const isAdmin = await isUserAnAdmin(userId)

  if (!isAdmin) {
    return throwError(res, 401, 'You are not authorized to view this page')
  }

  const counts = await getCounts()
  const recentUsers = await getRecentUsers()
  const recentGames = await getRecentGames()
  const newUsersByDay = await getNewUsersByDay()
  const gamesPlayedByDay = await getGamesPlayedByDay()

  res.status(200).json({
    success: true,
    data: {
      counts,
      recentUsers,
      recentGames,
      newUsersByDay,
      gamesPlayedByDay,
    },
  })
}

export default getAnalytics
