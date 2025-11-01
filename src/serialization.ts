export interface Serializable<T extends object> {
  serialize(): T;
  deserialize(obj: T): void;
}
