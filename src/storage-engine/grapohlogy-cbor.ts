import Graph from "graphology";

export function graphologyCBOR() {
  if (typeof Graph.prototype["toJSON"] !== "function") {
    Graph.prototype["toJSON"] = Graph.prototype.export;
  }
}
