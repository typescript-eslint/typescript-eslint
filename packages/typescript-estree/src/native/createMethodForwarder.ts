export type NativeMethod = (this: unknown, ...args: unknown[]) => unknown;

export function createMethodForwarder(
  unwrap: (classic: never) => object,
): (method: NativeMethod) => NativeMethod {
  const forwarders = new WeakMap<NativeMethod, NativeMethod>();
  return method => {
    let forwarder = forwarders.get(method);
    if (!forwarder) {
      forwarder = function (this: unknown, ...args: unknown[]) {
        return method.apply(unwrap(this as never), args);
      };
      forwarders.set(method, forwarder);
    }
    return forwarder;
  };
}
