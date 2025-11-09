export class LRUCache<K, V> {
  #cap: number;
  #capStack: number[] = [];
  readonly #cache: Map<K, V> = new Map();
  readonly #cleanup?: (key: K, value: V) => void;

  constructor(capacity: number, cleanup?: (key: K, value: V) => void) {
    this.#cap = capacity;
    if (cleanup) {
      this.#cleanup = cleanup;
    }
  }

  get capacity() {
    return this.#cap;
  }

  set capacity(value: number) {
    this.#cap = value;
    if (this.#cache.size <= this.#cap) {
      return;
    }
  }

  pushCapacity(capacity: number): number {
    this.#capStack.push(capacity);
    this.#cap = capacity;
    return this.#capStack.length;
  }

  popCapacity(): number {
    let capacity = this.#cap;
    if (this.#capStack.length > 1) {
      capacity = this.#capStack.pop()!;
      this.#cap = capacity;
    }
    return capacity;
  }

  set(key: K, data: V) {
    if (this.#cache.size >= this.#cap) {
      const evict = this.#cache.keys().next().value;
      this.#cache.delete(evict as K);
    }
    this.#cache.set(key, data);
  }

  get(key: K) {
    const value = this.#cache.get(key);
    if (value) {
      this.#cache.delete(key);
      this.#cache.set(key, value);
    }
    return value;
  }

  delete(key: K) {
    const value = this.#cache.get(key);
    if (value && this.#cleanup) {
      this.#cleanup(key, value);
    }
    return this.#cache.delete(key);
  }

  clear() {
    if (!this.#cleanup) {
      this.#cache.clear();
      return;
    }

    for (const [key, value] of this.#cache.entries()) {
      this.#cleanup(key, value);
    }
    this.#cache.clear();
  }
}
