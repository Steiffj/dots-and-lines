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

  /**
   * Adds a Sigma event listener function to the registry.
   *
   * This method internally attaches listeners to the registry's connected Sigma instance.
   * Consumers do not need to (and typically should not) call `Sigma.on()`, `Sigma.addEventListener()`, etc. directly.
   * @param feature visualization/user interactivity feature the event listener is a part of
   * @param type Sigma event name
   * @param listener Sigma event listener (callback function) to add
   * @throw an error if the provided listener function was previously registered under a different feature
   */
  register<Event extends keyof SigmaEvents>(
    feature: symbol,
    type: Event,
    listener: Events[Event]
  ) {
    // There might be a valid use case here but supporting it overly complicates the callback/feature mapping for now
    const existingFeat = this.#features.get(listener);
    if (existingFeat && existingFeat !== feature) {
      throw new Error(
        `Attempted to register event listener under feature '${String(
          feature
        )}' but was previously registered under feature '${String(feature)}'`
      );
    }

    let addToSigma = false;
    let listeners = this.#listeners.get(type);
    if (!listeners) {
      addToSigma = true;
      listeners = [];
    }

    listeners.push(listener);
    this.#features.set(listener, feature);

    // Add higher-order event callback function to Sigma the first time a listener of this type (event name) is registered.
    // This calls registered listeners and manages skipping paused listeners by feature or by individual callback function.
    // TODO also handle listener sorting based on externally provided configuration.
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

  /**
   * Removes a Sigma event listener from the registry.
   * @param type Sigma event name
   * @param listener Sigma event listener (callback function) to remove
   * @returns true if the listener was removed from the registry
   */
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
      this.#features.delete(listener);
      return true;
    }

    return false;
  }

  /**
   * Removes all Sigma event listeners from the registry for a specified feature.
   * @param feature visualization/user interactivity feature to remove
   */
  unregisterFeature(feature: symbol) {
    const listenersToRemove: [keyof Events, Events[keyof Events]][] = [];
    for (const [type, listeners] of this.#listeners.entries()) {
      for (const listener of listeners) {
        if (this.#features.get(listener) === feature) {
          listenersToRemove.push([type, listener]);
        }
      }
    }

    for (const [type, listener] of listenersToRemove) {
      this.unregister(type, listener);
    }
  }

  /**
   * Temporarily stop an event listener or entire feature from executing.
   * This method does nothing if the provided listener/feature was already paused.
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
