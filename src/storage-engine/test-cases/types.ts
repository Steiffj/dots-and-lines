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
