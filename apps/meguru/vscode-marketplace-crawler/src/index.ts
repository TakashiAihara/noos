import { initDb } from "./db.js";
import { collect } from "./collector.js";

const db = initDb();

try {
  await collect(db);
} finally {
  db.close();
}
