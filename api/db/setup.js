import "dotenv/config"

import fs from "fs"
import db from "./connect.js"

const database = fs.readFileSync("./db/database.sql").toString();


db.query(database).then((data)=>{
    db.end();
    console.log("Setup complete");
})
.catch(error => console.log(error))