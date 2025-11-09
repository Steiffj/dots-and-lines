import type { Attributes } from "graphology-types";
import type { Sigma } from "sigma";
import type { Settings } from "sigma/settings";

export class FeatureSettingsManager<
  N extends Attributes,
  E extends Attributes,
  A extends Attributes
> {
  #settings: Partial<{
    [key in keyof Settings<N, E, A>]: Settings<N, E, A>[keyof Settings][];
  }> = {};

  constructor(public readonly sigma: Sigma<N, E, A>) {}

  pushSetting<Setting extends keyof Settings<N, E, A>>(
    key: Setting,
    value: Settings[Setting]
  ) {
    let stack = this.#settings[key];
    if (!stack) {
      stack = [];
      this.#settings[key] = stack;
      stack.push(this.sigma.getSetting(key));
    }

    stack.push(value as any);
    this.sigma.setSetting(key, value);
  }

  popSetting<Setting extends keyof Settings<N, E, A>>(key: Setting) {
    const stack = this.#settings[key];
    if (!stack || stack.length === 0) {
      return undefined;
    }

    const setting = stack.pop();
    this.sigma.setSetting(key, setting as any);
    return setting;
  }
}
