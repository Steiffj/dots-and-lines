export class FeatureActivityManager {
  #active: symbol[] = [];
  #exclusive = new Map<symbol, symbol[]>();
  /**
   * This terribly named structure keeps track of reducers that are supposed to run once:
   * - as a feature becomes active,
   * - or directly after a feature becomes inactive.
   *
   * Note: a limitation with this approach is that a feature can only register a single before/after reducer function.
   */
  #runOncePending: {
    [feat: symbol]: {
      before: boolean;
      after: boolean;
    };
  } = {};

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
    this.#runOncePending[feature] = {
      before: true,
      after: false,
    };
  }

  consumePendingBefore(feature: symbol) {
    const pending = this.#runOncePending[feature];
    if (pending) {
      const shouldRun = pending.before;
      pending.before = false;
      return shouldRun;
    }

    return false;
  }

  consumePendingAfter(feature: symbol) {
    const pending = this.#runOncePending[feature];
    if (pending) {
      const shouldRun = pending.after;
      pending.after = false;
      return shouldRun;
    }

    return false;
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
