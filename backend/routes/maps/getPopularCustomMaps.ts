import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'

const getPopularCustomMaps = async (req: NextApiRequest, res: NextApiResponse) => {
	// TODO: Implement popular custom maps query using PostgreSQL
	res.status(200).send([]);
}

export default getPopularCustomMaps
