import { pool } from '@backend/utils/dbConnect'
import { LocationType } from '@types'
import { COUNTRY_STREAKS_ID, OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { OFFICIAL_COUNTRIES } from '@utils/constants/officialCountries'

const getLocations = async (mapId: string, count: number = 5) => {
  if (!mapId) return null

  if (Number(mapId) === COUNTRY_STREAKS_ID) {
    // Get random locations for official world and countries
    const sql = `
      SELECT * FROM locations WHERE map_id = $1 AND country_code = ANY($2) ORDER BY RANDOM() LIMIT $3
    `
    const result = await pool.query(sql, [Number(OFFICIAL_WORLD_ID), OFFICIAL_COUNTRIES, count])
    const locations = result.rows as LocationType[]
    if (!locations || locations.length === 0) {
      return null
    }
    return locations
  }

  // Determine if this map is an official or custom map
  const mapRes = await pool.query('SELECT * FROM maps WHERE id = $1', [Number(mapId)])
  const map = mapRes.rows[0]

  if (!map) {
    return null
  }

  const locationTable = map.creator === 'GeoHub' ? 'locations' : 'user_locations'
  // Get random locations from DB
  const sql = `SELECT * FROM ${locationTable} WHERE map_id = $1 ORDER BY RANDOM() LIMIT $2`
  const result = await pool.query(sql, [mapId, count])
  const locations = result.rows as LocationType[]
  if (!locations || locations.length === 0) {
    return null
  }
  return locations
}

export default getLocations
