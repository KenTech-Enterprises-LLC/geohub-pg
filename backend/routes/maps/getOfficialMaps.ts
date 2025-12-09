import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@backend/utils/dbConnect'

const getOfficialMaps = async (req: NextApiRequest, res: NextApiResponse) => {
	// TODO: Implement official maps query using PostgreSQL
	res.status(200).send([]);
}

export default getOfficialMaps
