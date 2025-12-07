import { KeyIndex } from "../../flatbuffers/gen/graph";

export async function chunkFlatBufferProcessing(
  index: KeyIndex,
  chunkSize: number = 1000
) {
  const keys = new Map<bigint, string>();
  for await (const entries of generateChunks(index, chunkSize)) {
    for (const [key, str] of entries) {
      keys.set(key, str);
    }
  }
  return keys;
}

async function* generateChunks(index: KeyIndex, chunkSize: number) {
  let offset = 0;
  const length = index.indexLength();
  while (offset < index.indexLength()) {
    const remaining = length - offset;
    const chunk = remaining < chunkSize ? remaining : chunkSize;

    const entries: [bigint, string][] = [];
    for (let i = offset; i < offset + chunk; i++) {
      const entry = index.index(i);
      if (!entry) {
        console.error(
          `Missing key index value for position ${i} with length ${index.indexLength()}`
        );
        continue;
      }

      const keyStr = entry.raw();
      if (!keyStr) {
        console.error(`Missing key string ("raw") for position ${i}`);
        continue;
      }
      entries.push([entry.key(), keyStr]);
    }

    offset += chunk;
    yield entries;
  }
}

export async function chunkFlatBufferRequestProcessingInterval(
  index: KeyIndex,
  chunkSize: number = 1000
) {
  let done: (keys: Map<bigint, string>) => void;
  const value = new Promise<Map<bigint, string>>((resolve) => {
    done = resolve;
  });

  const keys = new Map<bigint, string>();
  let offset = 0;
  const length = index.indexLength();
  const interval = setInterval(() => {
    const remaining = length - offset;
    const chunk = remaining < chunkSize ? remaining : chunkSize;

    for (let i = offset; i < offset + chunk; i++) {
      const entry = index.index(i);
      if (!entry) {
        console.error(
          `Missing key index value for position ${i} with length ${index.indexLength()}`
        );
        continue;
      }
      const keyStr = entry.raw();
      if (!keyStr) {
        console.error(`Missing key string ("raw") for position ${i}`);
        continue;
      }

      keys.set(entry.key(), keyStr);
    }

    offset += chunk;
    if (offset >= length) {
      clearInterval(interval);
      done(keys);
    }
  }, 0);

  return await value;
}
