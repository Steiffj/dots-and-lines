import type { Serializable } from "../serialization";

type SerializedEventState = {
  selection: string[];
};

export class EventState implements Serializable<SerializedEventState> {
  #selection = new Set<string>();
  #draggedNode: string | undefined;
  #active: string | undefined;
  #activeType: "node" | "edge" | undefined;

  get active() {
    return {
      active: this.#active,
      type: this.#activeType,
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

  get dragging() {
    return this.#draggedNode;
  }

  dragStart(node: string) {
    this.#draggedNode = node;
    this.#active = node;
    this.#activeType = "node";
  }

  dragEnd() {
    this.#draggedNode = undefined;
    this.#active = undefined;
    this.#active = undefined;
    this.#activeType = undefined;
  }
}
