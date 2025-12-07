import { encode } from "cbor2";
import { Builder } from "flatbuffers";
import { PALETTE_HIGH_CONTRAST_CIRCLE } from "../color-scheme/palettes";
import { createSupernode } from "../data";
import {
  Attributes,
  Edge,
  Graph,
  Key,
  KeyIndex,
  Node,
} from "../flatbuffers/gen/graph";
import { graphologyCBOR } from "./grapohlogy-cbor";
import { Sequence } from "./sequence";

export type FlatBuffersWorkerMessageType =
  | "json"
  | "flatbuf-copy"
  | "flatbuf-transfer"
  | "cbor";
export type FlatBuffersWorkerRequest = {
  type: FlatBuffersWorkerMessageType;
  order: number;
  size?: number;
};
export type FlatBuffersWorkerResponse = {
  type: FlatBuffersWorkerMessageType;
  data: unknown;
};

graphologyCBOR();

onmessage = (e) => {
  const msg = e.data as FlatBuffersWorkerRequest;
  console.log(
    `Starting worker processing for "${msg.type}" (${msg.order} nodes)`
  );
  try {
    if (msg.type === "flatbuf-transfer") {
      flatBufTransfer(msg);
    } else if (msg.type === "json") {
      jsonCopy(msg);
    } else if (msg.type === "cbor") {
      cborTransfer(msg);
    } else {
      throw new Error("Invalid test case type");
    }
  } catch (err) {
    console.error("Error in flatbuffers worker", err);
    postMessage(err);
  }
};

/**
 * Encode and transfer graph as FlatBuffers.
 */
function flatBufTransfer(msg: FlatBuffersWorkerRequest) {
  const keys = new Map<bigint, string>();
  const nodeKeys = new Map<string, bigint>();
  const edgeKeys = new Map<string, bigint>();
  const seq = new Sequence();

  const jsonPerfs: PerformanceMeasure[] = [];
  performance.mark("create-graph-start");
  const graph = createSupernode(msg.order, PALETTE_HIGH_CONTRAST_CIRCLE);
  performance.mark("create-graph-end");
  const createGraphPerf = performance.measure(
    "create-graph-duration",
    "create-graph-start",
    "create-graph-end"
  );
  console.log("Create graph duration", createGraphPerf);
  const builder = new Builder((graph.order + graph.size) * 32);
  let i = 0;

  console.log("Serializing flatbuffers");
  performance.mark("flatbuf-start");
  // Populate nodes
  const nodes: number[] = new Array(graph.order);
  graph.forEachNode((node, attrs) => {
    // Node key
    // const nodeKey = builder.createSharedString(node);
    const key = seq.next();
    keys.set(key, node);
    nodeKeys.set(node, key);
    Key.startKey(builder);
    Key.addKey(builder, key);
    // Key.addRaw(builder, nodeKey);
    const keyBuf = Key.endKey(builder);

    // Node attributes
    performance.mark("json-start");
    const nodeAttrs = builder.createString(JSON.stringify(attrs));
    performance.mark("json-end");
    jsonPerfs.push(
      performance.measure("json-stringify", "json-start", "json-end")
    );

    Attributes.startAttributes(builder);
    Attributes.addRaw(builder, nodeAttrs);
    const attrBuf = Attributes.endAttributes(builder);

    // Compose node key/attrs into node buffer
    Node.startNode(builder);
    Node.addKey(builder, keyBuf);
    Node.addAttributes(builder, attrBuf);

    const nodeBuf = Node.endNode(builder);
    nodes[i] = nodeBuf;
    i++;
  });

  // Populate edges
  i = 0;
  const edges: number[] = new Array(graph.size);
  graph.forEachEdge((edge, attrs, source, target, _, __, undirected) => {
    // Edge key
    // const edgeKey = builder.createSharedString(edge);
    Key.startKey(builder);
    const key = seq.next();
    keys.set(key, edge);
    Key.addKey(builder, key);
    edgeKeys.set(edge, key);

    // Key.addRaw(builder, edgeKey);
    const edgeKeyBuf = Key.endKey(builder);

    // Source key
    // const sourceKey = builder.createSharedString(source);
    const sourceKey = nodeKeys.get(source);
    if (!sourceKey) {
      throw new Error(`Missing node key mapping for source key "${sourceKey}"`);
    }

    Key.startKey(builder);
    Key.addKey(builder, sourceKey);
    // Key.addRaw(builder, sourceKey);
    const sourceKeyBuf = Key.endKey(builder);

    // Target key
    // const targetKey = builder.createSharedString(target);
    const targetKey = nodeKeys.get(target);
    if (!targetKey) {
      throw new Error(`Missing node key mapping for source key "${targetKey}"`);
    }
    Key.startKey(builder);
    Key.addKey(builder, targetKey);
    // Key.addRaw(builder, targetKey);
    const targetKeyBuf = Key.endKey(builder);

    // Edge attributes
    performance.mark("json-start");
    const edgeAttrs = builder.createString(JSON.stringify(attrs));
    performance.mark("json-end");
    jsonPerfs.push(
      performance.measure("json-stringify", "json-start", "json-end")
    );

    Attributes.startAttributes(builder);
    Attributes.addRaw(builder, edgeAttrs);
    const attrBuf = Attributes.endAttributes(builder);

    Edge.startEdge(builder);
    Edge.addKey(builder, edgeKeyBuf);
    Edge.addSource(builder, sourceKeyBuf);
    Edge.addTarget(builder, targetKeyBuf);
    Edge.addAttributes(builder, attrBuf);
    Edge.addUndirected(builder, undirected);

    const edgeBuf = Edge.endEdge(builder);
    edges[i] = edgeBuf;
    i++;
  });

  // Compose everything into a full graph buffer
  const attrsRaw = builder.createString(JSON.stringify(graph.getAttributes()));
  const attrs = Attributes.createAttributes(builder, attrsRaw);
  const nodesBuf = Graph.createNodesVector(builder, nodes);
  const edgesBuf = Graph.createEdgesVector(builder, edges);
  Graph.startGraph(builder);
  Graph.addAttributes(builder, attrs);
  Graph.addNodes(builder, nodesBuf);
  Graph.addEdges(builder, edgesBuf);
  const gBuf = Graph.endGraph(builder);
  builder.finish(gBuf);
  performance.mark("flatbuf-end");
  const flatbufPerf = performance.measure(
    "flatbuf-serialize-duration",
    "flatbuf-start",
    "flatbuf-end"
  );

  // Build keyset index (mapping integer IDs to string IDs)
  const indexBuilder = new Builder(keys.size * 16);
  const keyIndexEntries: number[] = [];
  for (const [key, raw] of keys.entries()) {
    const rawBuf = indexBuilder.createString(raw);
    keyIndexEntries.push(Key.createKey(indexBuilder, key, rawBuf));
  }

  const indexVecBuf = KeyIndex.createIndexVector(indexBuilder, keyIndexEntries);
  KeyIndex.startKeyIndex(indexBuilder);
  KeyIndex.addIndex(indexBuilder, indexVecBuf);
  const keyIndexBuf = KeyIndex.endKeyIndex(indexBuilder);
  indexBuilder.finish(keyIndexBuf);

  console.log(`FlatBuffers serialization time ${flatbufPerf.duration}ms`);

  let jsonStringifyDuration = jsonPerfs.reduce(
    (duration, entry) => duration + entry.duration,
    0
  );
  console.log(`JSON stringify time ${jsonStringifyDuration}ms`);
  console.log(
    `FlatBuffers effective serialization time ${
      flatbufPerf.duration - jsonStringifyDuration
    }ms`
  );

  const data = {
    graph: builder.asUint8Array(),
    index: indexBuilder.asUint8Array(),
  };
  const res: FlatBuffersWorkerResponse = {
    type: "flatbuf-transfer",
    data,
  };

  performance.mark("flatbuf-sending");
  postMessage(res, {
    transfer: [data.graph.buffer, data.index.buffer],
  });
  performance.mark("flatbuf-serialized");
  const perf = performance.measure(
    "postmessage-duration-worker",
    "flatbuf-sending",
    "flatbuf-serialized"
  );
  console.log("Worker postmessage serialization time", perf);
}

/**
 * Export and copy graph as JSON.
 */
function jsonCopy(msg: FlatBuffersWorkerRequest) {
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

/**
 * Encode and transfer graph as CBOR.
 */
function cborTransfer(msg: FlatBuffersWorkerRequest) {
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
