import "dotenv/config"

import {Pool} from "pg"

const db = new Pool({
    connectionString: process.env.DB_URL
});

export default db;