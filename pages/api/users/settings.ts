import Cryptr from 'cryptr'
/* eslint-disable import/no-anonymous-default-export */
// Removed ObjectId, not needed for PostgreSQL
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserId, throwError, pool } from '@backend/utils'
import { GUEST_ACCOUNT_ID } from '@utils/constants/random'

const ALLOWED_DISTANCE_UNITS = ['metric', 'imperial']
const GOOGLE_MAPS_KEY_LENGTH = 39

const cryptr = new Cryptr(process.env.CRYPTR_SECRET as string)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // PostgreSQL pool does not require explicit connection

    if (req.method === 'GET') {
      const userId = await getUserId(req, res)

      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userRes.rows[0];
      if (!user) {
        return throwError(res, 500, 'Failed to get user details.');
      }
      const decrypedMapsAPIKey = user.mapsapikey ? cryptr.decrypt(user.mapsapikey) : '';
      return res.status(200).send({
        distanceUnit: user.distanceunit,
        mapsAPIKey: decrypedMapsAPIKey,
      });
    }

    if (req.method === 'POST') {
      const { distanceUnit, mapsAPIKey } = req.body
      const userId = await getUserId(req, res)

      if (!userId) {
        return throwError(res, 401, 'Unauthorized')
      }

      if (userId === GUEST_ACCOUNT_ID) {
        return throwError(res, 401, 'This account is not allowed to modify settings')
      }

      if (mapsAPIKey && (typeof mapsAPIKey !== 'string' || mapsAPIKey.length !== GOOGLE_MAPS_KEY_LENGTH)) {
        return throwError(res, 400, `The Google Maps API key should be ${GOOGLE_MAPS_KEY_LENGTH} characters in length.`)
      }

      if (distanceUnit && !ALLOWED_DISTANCE_UNITS.includes(distanceUnit)) {
        return throwError(res, 400, 'This distance unit is not allowed.')
      }

      const safeDistance = distanceUnit ?? 'metric'
      const safeMapsKey = mapsAPIKey ? cryptr.encrypt(mapsAPIKey) : ''

      const updateRes = await pool.query('UPDATE users SET distanceunit = $1, mapsapikey = $2 WHERE id = $3', [safeDistance, safeMapsKey, userId]);
      if (updateRes.rowCount === 0) {
        return throwError(res, 500, 'There was an unexpected problem while updating your settings.');
      }
      return res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
