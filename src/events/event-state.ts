import type Graph from "graphology";
import type { Serializable } from "../serialization";

type SerializedEventState = {
  selection: string[];
};

type IncidenceEntries = {
  nodes: Set<string>;
  edges: Set<string>;
};

export class EventState implements Serializable<SerializedEventState> {
  #selection = new Set<string>();
  #draggedNode: string | undefined;
  #active: string | undefined;
  #activeType: "node" | "edge" | undefined;
  #hovered: string | undefined;
  #hoveredType: "node" | "edge" | undefined;
  #incidentDrag: IncidenceEntries | undefined;
  #incidentHover: IncidenceEntries | undefined;

  get active() {
    return {
      key: this.#active,
      type: this.#activeType,
    };
  }

  get hovered() {
    return {
      key: this.#hovered,
      type: this.#hoveredType,
      incident: this.#incidentHover,
    };
  }

  get drag() {
    return {
      key: this.#draggedNode,
      incident: this.#incidentDrag,
    };
  }

  serialize() {
    return {
      selection: Array.from(this.#selection),
    };
  }

  deserialize(obj: SerializedEventState): void {
    this.#selection = new Set(obj.selection);
    this.#draggedNode = undefined;
  }

  select(...nodes: string[]) {
    for (const node of nodes) {
      this.#selection.add(node);
    }
  }

  deselect(...nodes: string[]) {
    for (const node of nodes) {
      this.#selection.delete(node);
    }
  }

  clearSelection() {
    this.#selection.clear();
  }

  dragStart(node: string, graph: Graph) {
    this.#draggedNode = node;
    this.#active = node;
    this.#activeType = "node";
    this.#incidentDrag = {
      nodes: new Set(graph.neighbors(node)),
      edges: new Set(graph.edges(node)),
    };
  }

  dragEnd() {
    this.#draggedNode = undefined;
    this.#active = undefined;
    this.#activeType = undefined;
    const incident = this.#incidentDrag;
    this.#incidentDrag = undefined;
    return incident!;
  }

  hoverStart(key: string, type: "node" | "edge", g: Graph) {
    this.#hovered = key;
    this.#hoveredType = type;
    if (type === "node") {
      this.#incidentHover = {
        nodes: new Set(g.neighbors(key)),
        edges: new Set(g.edges(key)),
      };
    } else {
      this.#incidentHover = {
        nodes: new Set([g.source(key), g.target(key)]),
        edges: new Set(key),
      };
    }
  }

  hoverEnd() {
    this.#hovered = undefined;
    this.#hoveredType = undefined;
    const incident = this.#incidentHover;
    this.#incidentHover = undefined;
    return incident!;
  }
}
