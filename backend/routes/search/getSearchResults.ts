import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'
import { getQueryLimit } from '@backend/utils'

// Reference: https://docs.atlas.mongodb.com/reference/atlas-search/text/

const getSearchResults = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.q as string
  const limit = getQueryLimit(req.query.count as string, 3)

  try {
    // Search users by name
    const userRes = await pool.query(
      'SELECT id, name, avatar FROM users WHERE name ILIKE $1 LIMIT $2', [`%${query}%`, limit]
    );
    const users = userRes.rows;
    // Search maps by name
    const mapRes = await pool.query(
      'SELECT id, name, previewimg FROM maps WHERE name ILIKE $1 AND ispublished = true AND (isdeleted IS NULL OR isdeleted = false) LIMIT $2', [`%${query}%`, limit]
    );
    const maps = mapRes.rows;
    const all = [...users, ...maps];
    all.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
    res.status(200).send({ all, users, maps });
  } catch (err) {
    res.status(500).send('Database error retrieving search results');
  }
}

export default getSearchResults
