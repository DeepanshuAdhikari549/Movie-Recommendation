import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({
  filename: "movies.db",
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_input TEXT,
    recommended_movies TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
