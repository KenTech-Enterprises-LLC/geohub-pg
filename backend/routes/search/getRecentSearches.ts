import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

// Gets the 5 most recent searches from this user
const getRecentSearches = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  try {
    // Get recent searches for user
    const searchesRes = await pool.query(
      'SELECT * FROM recentsearches WHERE userid = $1 ORDER BY createdat DESC LIMIT 5',
      [userId]
    );
    const searches = searchesRes.rows;
    if (!searches || searches.length === 0) {
      return throwError(res, 400, `Failed to find recent searches for user with id: ${userId}`);
    }
    // Build result array
    const result: any[] = [];
    for (const search of searches) {
      if (search.type === 'term') {
        if (!result.some((x) => x.term === search.term)) {
          result.push({ type: 'term', term: search.term });
        }
      } else if (search.type === 'user') {
        // Get user details
        const userRes = await pool.query('SELECT id, name, avatar FROM users WHERE id = $1', [search.searcheduserid]);
        const userDetails = userRes.rows[0];
        if (userDetails && !result.some((x) => x._id === userDetails.id)) {
          result.push({ type: 'user', _id: userDetails.id, name: userDetails.name, avatar: userDetails.avatar });
        }
      } else if (search.type === 'map') {
        // Get map details
        const mapRes = await pool.query('SELECT id, name, previewimg FROM maps WHERE id = $1', [search.searchedmapid]);
        const mapDetails = mapRes.rows[0];
        if (mapDetails && !result.some((x) => x._id === mapDetails.id)) {
          result.push({ type: 'map', _id: mapDetails.id, name: mapDetails.name, previewImg: mapDetails.previewimg });
        }
      }
    }
    res.status(200).send(result);
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving recent searches');
  }
}

export default getRecentSearches
