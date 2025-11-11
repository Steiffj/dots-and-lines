export class FeatureActivityManager {
  #active: symbol[] = [];
  #exclusive = new Map<symbol, symbol[]>();

  isDisabled(feature: symbol) {
    for (const active of this.#active) {
      const disabled = this.#exclusive.get(active);
      if (disabled?.includes(feature)) {
        return true;
      }
    }

    return false;
  }

  configure([active, disabled]: [symbol, symbol]) {
    const opts = this.#exclusive.get(active) ?? [];
    if (!opts.includes(disabled)) {
      opts.push(disabled);
    }
    this.#exclusive.set(active, opts);
  }

  clear(feature?: symbol) {
    if (feature && this.#exclusive.has(feature)) {
      this.#exclusive.set(feature, []);
    } else {
      this.#exclusive.clear();
    }
  }

  pushActive(feature: symbol) {
    this.#active.push(feature);
  }

  popActive() {
    return this.#active.pop();
  }

  removeActive(feature: symbol) {
    const i = this.#active.lastIndexOf(feature);
    if (i > -1) {
      const inactive = this.#active.splice(i, 1);
      return inactive[0];
    }
    return undefined;
  }
}
