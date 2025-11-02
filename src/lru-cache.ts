export class LRUCache<K, V> {
  #cap: number;
  readonly #cache: Map<K, V> = new Map();
  readonly #cleanup?: (key: K, value: V) => void;

  constructor(capacity: number, cleanup: (key: K, value: V) => void) {
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

  set(key: K, data: V) {
    if (this.#cache.size >= this.#cap) {
      const evict = this.#cache.keys().next().value;
      this.#cache.delete(evict);
    }
    this.#cache.set(key, data);
  }

  get(key: K) {
    return this.#cache.get(key);
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
