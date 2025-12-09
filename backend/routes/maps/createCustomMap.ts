
import { NextApiRequest, NextApiResponse } from 'next'
import { Map } from '@backend/models'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const createCustomMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const creatorId = await getUserId(req, res)
  const { name, description, avatar } = req.body

  if (!name) {
    return throwError(res, 400, 'A map name is required')
  }

  try {
    const query = `
      INSERT INTO maps (name, description, previewimg, creator, createdat, ispublished, avgscore, locationcount, usersplayed)
      VALUES ($1, $2, $3, $4, NOW(), false, 0, 0, 0)
      RETURNING id;
    `;
    const values = [
      name,
      description,
      avatar || 'https://wallpaperaccess.com/full/2707446.jpg',
      creatorId,
    ];
    const result = await pool.query(query, values);
    if (!result.rows.length) {
      return throwError(res, 500, 'Failed to create map, please try again later');
    }
    res.status(201).send({
      mapId: result.rows[0].id,
      message: 'Successfully created map',
    });
  } catch (err) {
    return throwError(res, 500, 'Database error creating map');
  }
}

export default createCustomMap
