import type { FlatBuffersWorkerRequest } from "./flatbuffers.worker";
import { initFlatbuffersWorker } from "./workers";

export function flatbuffersTesting() {
  const worker = initFlatbuffersWorker();
  worker.onerror = (e) => {
    console.error(e);
  };

  worker.onmessage = (e) => {
    // console.log("Received flatbuffer data on main thread");
    performance.mark("flatbuf-received");
    console.log(e.data);
    performance.mark("flatbuf-deserialized");
    const perf = performance.measure(
      "postmessage-duration-ui",
      "flatbuf-received",
      "flatbuf-deserialized"
    );
    console.log("UI postmessage deserialization time", perf);
  };

  const testCount = 10;
  let interval: number | null = null;
  const orders = [100, 1000, 10000, 100000, 1000000];
  let run = 1;

  const sendTestCase = (order: number) => {
    const req: FlatBuffersWorkerRequest = {
      type: "flatbuf-transfer",
      order,
    };
    worker.postMessage(req);
  };

  const testCase = () => {
    if (run === testCount && typeof interval === "number") {
      clearInterval(interval);
    }

    const i = run % orders.length;
    run++;
    const req: FlatBuffersWorkerRequest = {
      type: "flatbuf-transfer",
      order: orders[i],
    };
    worker.postMessage(req);
  };

  // testCase();
  sendTestCase(1_000_000);
  // sendTestCase(100_000);
  // interval = setInterval(testCase, 4000);
}
