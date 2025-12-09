import { calculateMapScoreFactor, getMapBounds, getUserId, throwError } from '@backend/utils'
import { pool } from '@backend/utils/dbConnect'
import { LocationType } from '@types'
import { MAX_ALLOWED_CUSTOM_LOCATIONS } from '@utils/constants/random'
import { formatLargeNumber } from '@utils/helpers'
import { NextApiRequest, NextApiResponse } from 'next'

type ReqBody = {
  name?: string
  description?: string
  previewImg?: string
  isPublished?: boolean
  locations?: LocationType[]
}

type UpdatedMap = {
  name?: string
  description?: string
  previewImg?: string
  isPublished?: boolean
  lastUpdatedAt?: Date
}

const updateCustomMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.mapId as string

  if (!mapId) {
    return throwError(res, 400, 'You must pass a valid mapId')
  }


  // Fetch map details from PostgreSQL
  const mapRes = await pool.query('SELECT * FROM maps WHERE id = $1', [mapId])
  const mapDetails = mapRes.rows[0]
  if (!mapDetails) {
    return throwError(res, 400, `Failed to find map details`)
  }

  // Verify user is updating their own map
  if (userId !== mapDetails.creator?.toString()) {
    return throwError(res, 401, 'You can only make changes to maps you create')
  }

  let updatedMap: UpdatedMap = {}

  const { name, description, previewImg, isPublished, locations } = req.body as ReqBody

  if (name) {
    updatedMap['name'] = name
  }

  if (description) {
    updatedMap['description'] = description
  }

  if (previewImg) {
    updatedMap['previewImg'] = previewImg
  }

  if (locations && locations.length < 5) {
    return throwError(res, 400, 'Maps must have a minimum of 5 locations')
  }

  if (isPublished !== undefined) {
    updatedMap['isPublished'] = isPublished
  }

  updatedMap.lastUpdatedAt = new Date()


  // Update map details in PostgreSQL
  const updateFields = []
  const updateValues = []
  let idx = 1
  for (const key in updatedMap) {
    updateFields.push(`${key} = $${idx}`)
    updateValues.push((updatedMap as any)[key])
    idx++
  }
  updateValues.push(mapId)
  const updateSQL = `UPDATE maps SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`
  const updateRes = await pool.query(updateSQL, updateValues)
  const result = updateRes.rows[0]
  if (!result) {
    return throwError(res, 400, 'Could not update map details')
  }

  // HALP -> Really shouldn't be deleting locations and then inserting new
  if (locations) {
    if (locations.length > MAX_ALLOWED_CUSTOM_LOCATIONS) {
      return throwError(res, 400, `The max locations allowed is ${formatLargeNumber(MAX_ALLOWED_CUSTOM_LOCATIONS)}`)
    }


    // Removes old locations in PostgreSQL
    const removeRes = await pool.query('DELETE FROM user_locations WHERE map_id = $1', [mapId])
    // Optionally check removeRes.rowCount if you want to ensure something was deleted

    // Attach mapId to each location
    locations.map((location) => {
      location.mapId = mapId
    })

    // Finally insert the new locations (if not empty)
    if (locations.length > 0) {
      // Bulk insert locations into user_locations table
      const values = locations.map(loc => `('${mapId}', ${loc.lat}, ${loc.lng}, '${loc.countryCode}')`).join(', ');
      const insertSQL = `INSERT INTO user_locations (map_id, lat, lng, countrycode) VALUES ${values}`;
      await pool.query(insertSQL);

      // Update map's score factor (since locations have changed)
      const newBounds = getMapBounds(locations)
      const newScoreFactor = calculateMapScoreFactor(newBounds)

      // Update map's score factor and bounds in PostgreSQL
      const updateMapRes = await pool.query(
        'UPDATE maps SET scorefactor = $1, bounds = $2 WHERE id = $3 RETURNING *',
        [newScoreFactor, JSON.stringify(newBounds), mapId]
      )
      const updateMap = updateMapRes.rows[0]
      if (!updateMap) {
        return throwError(res, 400, 'Could not update map score factor')
      }
    }
  }

  res.status(200).send({ message: 'Map was successfully updated' })
}

export default updateCustomMap
