type PrimitiveValue =
  | boolean
  | number
  | string
  | Date
  | bigint
  | null
  | undefined;
type PlainValue = PrimitiveValue | PlainObj | PlainList;
type PlainObj = {
  [key: string | number]: PlainValue;
};
type PlainList = PlainValue[];

export type SerializableObject = PrimitiveValue | PlainObj | PlainList;

export interface Serializable<T extends SerializableObject> {
  serialize(): T;
  deserialize(obj: T): void;
}

export function isSerializable<T extends SerializableObject>(
  obj: unknown
): obj is Serializable<T> {
  if (!obj) {
    return false;
  }

  const serializable = obj as Serializable<T>;
  return (
    typeof serializable["serialize"] === "function" &&
    typeof serializable["deserialize"] === "function"
  );
}
