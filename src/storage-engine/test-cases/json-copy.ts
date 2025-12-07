import { PALETTE_HIGH_CONTRAST_CIRCLE } from "../../color-scheme/palettes";
import { createSupernode } from "../../data";
import type {
  FlatBuffersWorkerRequest,
  FlatBuffersWorkerResponse,
} from "./types";

/**
 * Export and copy graph as JSON.
 */
export function jsonCopy(msg: FlatBuffersWorkerRequest) {
  performance.mark("create-graph-start");
  const graph = createSupernode(msg.order, PALETTE_HIGH_CONTRAST_CIRCLE);
  performance.mark("create-graph-end");
  const createGraphPerf = performance.measure(
    "create-graph-duration",
    "create-graph-start",
    "create-graph-end"
  );
  console.log("Create graph duration", createGraphPerf);

  performance.mark("export-graph-start");
  const json = graph.export();
  performance.mark("export-graph-end");
  const exportPerf = performance.measure(
    "export-graph-duration",
    "export-graph-start",
    "export-graph-end"
  );
  console.log("Export graph duration", exportPerf);

  performance.mark("postmessage-start");
  const res: FlatBuffersWorkerResponse = {
    type: "json",
    data: json,
  };
  postMessage(res);
  performance.mark("postmessage-end");
  const postMessagePerf = performance.measure(
    "postmessage-duration-worker",
    "postmessage-start",
    "postmessage-end"
  );
  console.log("Worker postMessage serialization time", postMessagePerf);
}
