import { closeDb, initDb } from "./db.js";
import { collect } from "./collector.js";

try {
  await initDb();
  await collect();
} finally {
  await closeDb();
}
