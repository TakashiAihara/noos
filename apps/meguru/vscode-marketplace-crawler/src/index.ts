import { parseArgs } from "node:util";
import { initDb } from "./db.js";
import { type SortMode, collect } from "./collector.js";

const { values } = parseArgs({
  options: {
    sort: { type: "string", default: "all" },
    pages: { type: "string", default: "10" },
  },
});

const mode = (values.sort ?? "all") as SortMode;
const maxPages = Number.parseInt(values.pages ?? "10", 10);

const db = initDb();

try {
  await collect(db, mode, maxPages);
} finally {
  db.close();
}
