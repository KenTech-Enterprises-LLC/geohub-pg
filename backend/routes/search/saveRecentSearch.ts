import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'
import { RecentSearchItem } from '@types'

const saveRecentSearch = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const { type, term, searchedUserId, searchedMapId } = req.body

  try {
    // Remove oldest if more than 4 already exist
    const countRes = await pool.query('SELECT COUNT(*) FROM recentsearches WHERE userid = $1', [userId]);
    const count = parseInt(countRes.rows[0].count, 10);
    if (count >= 5) {
      await pool.query('DELETE FROM recentsearches WHERE userid = $1 AND createdat = (SELECT MIN(createdat) FROM recentsearches WHERE userid = $1)', [userId]);
    }
    // Insert new search item
    await pool.query(
      'INSERT INTO recentsearches (userid, type, term, searcheduserid, searchedmapid, createdat) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, type, term, searchedUserId || null, searchedMapId || null, new Date()]
    );
    res.status(201).send({ message: 'Recent search successfully saved' });
  } catch (err) {
    return throwError(res, 400, `Something went wrong when trying to insert the recent search for user with id: ${userId}`);
  }
}

export default saveRecentSearch
