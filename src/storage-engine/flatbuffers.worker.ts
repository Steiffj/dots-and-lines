import { Builder } from "flatbuffers";
import { PALETTE_HIGH_CONTRAST_CIRCLE } from "../color-scheme/palettes";
import { createSupernode } from "../data";
import { Attributes, Edge, Graph, Key, Node } from "../flatbuffers/gen/graph";

export type FlatBuffersWorkerRequest = {
  type: "json" | "flatbuf-copy" | "flatbuf-transfer";
  order: number;
  size?: number;
};

// postMessage("Hello from flatbuffers worker?");
// onmessage = (e) => {
//   console.log("Got message in flatbuffers worker");
// };

onmessage = (e) => {
  try {
    runTest(e.data);
  } catch (err) {
    console.error("Error in flatbuffers worker", err);
    postMessage(err);
  }
};

function runTest(msg: FlatBuffersWorkerRequest) {
  const jsonPerfs: PerformanceMeasure[] = [];

  console.log("Starting worker processing");
  performance.mark("create-graph-start");
  const graph = createSupernode(msg.order, PALETTE_HIGH_CONTRAST_CIRCLE);
  performance.mark("create-graph-end");
  const createGraphPerf = performance.measure(
    "create-graph-duration",
    "create-graph-start",
    "create-graph-end"
  );
  console.log("Create graph duration", createGraphPerf);
  const builder = new Builder((graph.order + graph.size) * 512);
  let i = 0;

  console.log("Serializing flatbuffers");
  performance.mark("flatbuf-start");
  // Populate nodes
  const nodes: number[] = new Array(graph.order);
  graph.forEachNode((node, attrs) => {
    // Node key
    const nodeKey = builder.createSharedString(node);
    Key.startKey(builder);
    Key.addKey(builder, BigInt(i));
    Key.addRaw(builder, nodeKey);
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
    const edgeKey = builder.createSharedString(edge);
    Key.startKey(builder);
    Key.addKey(builder, BigInt(i));
    Key.addRaw(builder, edgeKey);
    const edgeKeyBuf = Key.endKey(builder);

    // Source key
    const sourceKey = builder.createSharedString(source);
    Key.startKey(builder);
    Key.addKey(builder, BigInt(i));
    Key.addRaw(builder, sourceKey);
    const sourceKeyBuf = Key.endKey(builder);

    // Target key
    const targetKey = builder.createSharedString(target);
    Key.startKey(builder);
    Key.addKey(builder, BigInt(i));
    Key.addRaw(builder, targetKey);
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

    // Edge direction
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

  const res = {
    data: builder.asUint8Array(),
  };

  console.log("Finished worker processing");

  performance.mark("flatbuf-sending");
  postMessage(res, {
    transfer: [res.data.buffer],
  });
  performance.mark("flatbuf-serialized");
  const perf = performance.measure(
    "postmessage-duration-worker",
    "flatbuf-sending",
    "flatbuf-serialized"
  );
  console.log("Worker postmessage serialization time", perf);
}
