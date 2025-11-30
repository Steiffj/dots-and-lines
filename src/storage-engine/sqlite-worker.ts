import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";

const log = console.log;
const error = console.error;

const start = (sqlite3: Sqlite3Static) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  const db =
    "opfs" in sqlite3
      ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
      : new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
  log(
    "opfs" in sqlite3
      ? `OPFS is available, created persisted database at ${db.filename}`
      : `OPFS is not available, created transient database ${db.filename}`
  );
  // Your SQLite code here.
  db.exec("CREATE TABLE IF NOT EXISTS hello(a, b PRIMARY KEY);");
  // db.exec("INSERT INTO hello (a, b) VALUES ('hello', 'world')");
  const data: any[] = [];
  db.exec("SELECT * FROM hello", {
    resultRows: data,
  });
  console.log(data);
};

const initializeSQLite = async () => {
  try {
    log("Loading and initializing SQLite3 module...");
    const sqlite3 = await sqlite3InitModule({ print: log, printErr: error });
    log("Done initializing. Running demo...");
    start(sqlite3);
  } catch (err) {
    error("Initialization error:", err);
  }
};

initializeSQLite();
