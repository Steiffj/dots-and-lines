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

export function initFlatbuffersWorker() {
  const worker = new Worker(
    new URL("./flatbuffers.worker.js", import.meta.url),
    {
      type: "module",
    }
  );
  return worker;
}
