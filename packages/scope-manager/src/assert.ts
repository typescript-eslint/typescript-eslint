// the base assert module doesn't use ts assertion syntax
export function assert(value: unknown, message?: string): asserts value {
  if (value == null) {
    throw new Error(message);
  }
}
