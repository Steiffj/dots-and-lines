import { graphologyCBOR } from "./grapohlogy-cbor";
import { cborTransfer } from "./test-cases/cbor";
import { flatBufTransfer } from "./test-cases/flatbuf-transfer";
import { jsonCopy } from "./test-cases/json-copy";
import type {
  FlatBuffersWorkerMessageType,
  FlatBuffersWorkerRequest,
} from "./test-cases/types";

graphologyCBOR();

const handlers: {
  [key in FlatBuffersWorkerMessageType]?: (
    msg: FlatBuffersWorkerRequest
  ) => void;
} = {
  "flatbuf-transfer": flatBufTransfer,
  json: jsonCopy,
  cbor: cborTransfer,
};

onmessage = (e) => {
  const msg = e.data as FlatBuffersWorkerRequest;
  console.log(
    `Starting worker processing for "${msg.type}" (${msg.order} nodes)`
  );
  try {
    const handler = handlers[msg.type];
    if (handler) {
      handler(msg);
    } else {
      throw new Error(`Unsupported message type ${msg.type}`);
    }
  } catch (err) {
    console.error("Error in flatbuffers worker", err);
    postMessage(err);
  }
};
