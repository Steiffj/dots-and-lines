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
  #pausedListeners: Events[keyof SigmaEvents][] = [];
  #pausedFeatures: symbol[] = [];

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
          if (this.isPaused(fn)) {
            continue;
          }
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

  /**
   * Temporarily stop an event listener or entire feature from executing.
   * This method does nothing if the provided listener/feature was already paused.
   *
   * @param listenerOrFeature listener/feature to pause
   */
  pause(listenerOrFeature: Events[keyof SigmaEvents] | symbol) {
    if (
      typeof listenerOrFeature === "symbol" &&
      !this.#pausedFeatures.includes(listenerOrFeature)
    ) {
      this.#pausedFeatures.push(listenerOrFeature);
    } else if (
      typeof listenerOrFeature === "function" &&
      !this.#pausedListeners.includes(listenerOrFeature)
    ) {
      this.#pausedListeners.push(listenerOrFeature);
    }
  }

  /**
   * Resume an event listener's or feature's normal execution.
   * This method does nothing if the provided listener/feature was not paused.
   *
   * @param listenerOrFeature listener/feature to resume
   */
  resume(listenerOrFeature: Events[keyof SigmaEvents] | symbol) {
    let i: number;
    if (
      typeof listenerOrFeature === "symbol" &&
      (i = this.#pausedFeatures.indexOf(listenerOrFeature)) > -1
    ) {
      this.#pausedFeatures.splice(i, 1);
    } else if (
      typeof listenerOrFeature === "function" &&
      (i = this.#pausedListeners.indexOf(listenerOrFeature)) > -1
    ) {
      this.#pausedListeners.splice(i, 1);
    }
  }

  /**
   * Check whether an event listener is currently paused.
   *
   * @param listener event listener to check
   * @returns true if the listener is paused
   */
  isPaused(listener: Events[keyof SigmaEvents]) {
    return (
      this.#pausedListeners.includes(listener) ||
      this.#pausedFeatures.includes(this.#features.get(listener)!)
    );
  }
}
