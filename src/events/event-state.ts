import type { Serializable } from "../serialization";

type SerializedEventState = {
  selection: string[];
};

export class EventState implements Serializable<SerializedEventState> {
  #selection = new Set<string>();
  dragging = false;
  draggedNode: string | undefined;

  serialize() {
    return {
      selection: Array.from(this.#selection),
    };
  }

  deserialize(obj: SerializedEventState): void {
    this.#selection = new Set(obj.selection);
    this.dragging = false;
    this.draggedNode = undefined;
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
}
