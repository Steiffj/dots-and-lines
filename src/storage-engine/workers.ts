export function initSQLiteWorker() {
  return new Worker(new URL("./sqlite-worker.js", import.meta.url), {
    type: "module",
  });
}

export function initOPFSWorker() {
  return new Worker(new URL("./opfs.worker.js", import.meta.url), {
    type: "module",
  });
}
