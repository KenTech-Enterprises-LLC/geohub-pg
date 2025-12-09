import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'

const getMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string
  const includeStats = req.query.stats as string // true or false

  if (!mapId) {
    return throwError(res, 400, 'You must pass a valid mapId')
  }

  try {
    // Get Map Details
    const mapRes = await pool.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    if (!mapRes.rows.length) {
      return throwError(res, 404, `Failed to find map with id: ${mapId}`);
    }
    let mapDetails = mapRes.rows[0];
    // If map is not published or is deleted -> return early
    if (!mapDetails.ispublished || (mapDetails.isdeleted && mapDetails.creator !== userId)) {
      return throwError(res, 400, `This map has not been published or does not exist`);
    }
    const isOfficialMap = mapDetails.creator === 'GeoHub';
    // If map is user created -> get the user details
    if (!isOfficialMap) {
      const creatorRes = await pool.query('SELECT * FROM users WHERE id = $1', [mapDetails.creator]);
      if (!creatorRes.rows.length) {
        return throwError(res, 404, `Failed to get creator details for map with id: ${mapId}`);
      }
      mapDetails = { ...mapDetails, creatorDetails: creatorRes.rows[0] };
    }
    // If query does not want stats, return early
    if (!includeStats || includeStats === 'false') {
      return res.status(200).send(mapDetails);
    }
    // Get Map's likes and if it's liked by this user
    const likesRes = await pool.query('SELECT * FROM maplikes WHERE mapid = $1', [mapId]);
    const likes = likesRes.rows;
    const likedByUser = likes.some((like) => like.userid === userId);
    res.status(200).send({
      ...mapDetails,
      likes: {
        numLikes: likes.length,
        likedByUser,
      },
    });
  } catch (err) {
    return throwError(res, 500, 'Database error retrieving map');
  }
}

export default getMap
