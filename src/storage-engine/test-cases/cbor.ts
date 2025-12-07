import { encode } from "cbor2";
import { PALETTE_HIGH_CONTRAST_CIRCLE } from "../../color-scheme/palettes";
import { createSupernode } from "../../data";
import type { FlatBuffersWorkerRequest } from "./types";

/**
 * Encode and transfer graph as CBOR.
 */
export function cborTransfer(msg: FlatBuffersWorkerRequest) {
  performance.mark("create-graph-start");
  const graph = createSupernode(msg.order, PALETTE_HIGH_CONTRAST_CIRCLE);
  performance.mark("create-graph-end");
  const createGraphPerf = performance.measure(
    "create-graph-duration",
    "create-graph-start",
    "create-graph-end"
  );
  console.log("Create graph duration", createGraphPerf);

  console.log("Encoding graph as CBOR");
  performance.mark("encode-cbor-start");
  const cbor = encode(graph);
  performance.mark("encode-cbor-end");
  const exportPerf = performance.measure(
    "encode-cbor-duration",
    "encode-cbor-start",
    "encode-cbor-end"
  );
  console.log("Encode CBOR duration", exportPerf);

  performance.mark("postmessage-start");
  postMessage(
    {
      data: cbor,
    },
    {
      transfer: [cbor.buffer],
    }
  );
  performance.mark("postmessage-end");
  const perf = performance.measure(
    "postmessage-duration-worker",
    "postmessage-start",
    "postmessage-end"
  );
  console.log("Worker postmessage serialization time", perf);
}
