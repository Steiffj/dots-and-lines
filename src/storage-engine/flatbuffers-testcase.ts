import { ByteBuffer } from "flatbuffers";
import { Graph, KeyIndex } from "../flatbuffers/gen/graph";
import { graphologyCBOR } from "./grapohlogy-cbor";
import { chunkFlatBufferProcessing } from "./test-cases/flatbuf-chunking";
import type {
  FlatBuffersWorkerRequest,
  FlatBuffersWorkerResponse,
} from "./test-cases/types";
import { initFlatbuffersWorker } from "./workers";

export function flatbuffersTesting() {
  graphologyCBOR();

  const worker = initFlatbuffersWorker();
  worker.onerror = (e) => {
    console.error(e);
  };

  worker.onmessage = (e) => {
    console.log("UI postMessage event received");
    performance.mark("postmessage-received");
    const data: FlatBuffersWorkerResponse = e.data;
    console.log(data);
    performance.mark("postmessage-deserialized");
    const perf = performance.measure(
      "postmessage-duration-ui",
      "postmessage-received",
      "postmessage-deserialized"
    );
    console.log("UI postMessage deserialization time", perf);

    if (data.type !== "flatbuf-transfer") {
      return;
    }

    // Test FlatBuffers parsing, if relevant
    console.log("Parsing FlatBuffers in UI");
    performance.mark("flatbuf-parse-start");
    const bytes = data.data as { graph: Uint8Array; index: Uint8Array };
    const graphBuf = new ByteBuffer(bytes.graph);
    const indexBuf = new ByteBuffer(bytes.index);
    const graph = Graph.getRootAsGraph(graphBuf);
    const index = KeyIndex.getRootAsKeyIndex(indexBuf);
    performance.mark("flatbuf-parse-end");
    const flatbufPerf = performance.measure(
      "flatbuf-parse",
      "flatbuf-parse-start",
      "flatbuf-parse-end"
    );
    console.log("FlatBuffers parsing time", flatbufPerf);

    // Measure performance of loading keys into JS map from FlatBuffers (this is the slow part)
    performance.mark("flatbuf-process-start");
    let keys: Map<bigint, string>;
    chunkFlatBufferProcessing(index, 1002).then(
      (k) => {
        keys = k;
        performance.mark("flatbuf-process-end");
        const flatbufProcessPerf = performance.measure(
          "flatbuf-process",
          "flatbuf-process-start",
          "flatbuf-process-end"
        );
        console.log("FlatBuffers processing time", flatbufProcessPerf);
        console.log(`Key index length: ${keys.size}`);
      },
      (reason) => {
        console.error("Failed to chunk process key index FlatBuffer", reason);
      }
    );
  };

  /**
   * Edit here to run different test cases.
   */
  const test: FlatBuffersWorkerRequest = {
    type: "flatbuf-transfer",
    order: 2_000_000,
  };
  worker.postMessage(test);
}
