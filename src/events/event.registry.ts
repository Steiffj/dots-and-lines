import { type SigmaEvents } from "sigma/types";
import type { DALSigma } from "../dal-types";

type Params<E extends keyof SigmaEvents> = [
  sigma: DALSigma,
  ...Parameters<SigmaEvents[E]>
];
type Events = {
  [E in keyof SigmaEvents]: (...args: Params<E>) => void;
};

export class EventRegistry {
  #listeners: Map<keyof SigmaEvents, Events[keyof SigmaEvents][]> = new Map();
  #features: Map<Events[keyof SigmaEvents], symbol> = new Map();

  constructor(public readonly sigma: DALSigma) {}

  register<Event extends keyof SigmaEvents>(
    feature: symbol,
    type: Event,
    listener: Events[Event]
  ) {
    let addToSigma = false;
    let listeners = this.#listeners.get(type);
    if (!listeners) {
      addToSigma = true;
      listeners = [];
    }

    listeners.push(listener);
    this.#features.set(listener, feature);
    if (addToSigma) {
      this.#listeners.set(type, listeners);

      // Method signature provides sufficient type assertions and the union to intersection pattern is annoying
      // As long as it's correct for consumers, it's fine :)
      this.sigma.on(type, (...payload: any) => {
        for (const fn of this.#listeners.get(type)!) {
          fn(...[this.sigma, ...payload]);
        }
      });
    }
  }

  unregister<Event extends keyof SigmaEvents>(
    type: Event,
    listener: Events[Event]
  ) {
    let listeners = this.#listeners.get(type);
    if (!listeners) {
      return false;
    }

    let i = listeners.indexOf(listener);
    if (i >= 0) {
      listeners.splice(i, 1);
      return true;
    }

    return false;
  }
}
