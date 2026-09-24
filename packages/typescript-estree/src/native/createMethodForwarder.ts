export type NativeMethod = (this: unknown, ...args: unknown[]) => unknown;

/**
 * Native methods read native fields off `this`, so a call made through a
 * classic wrapper has to reach the native object. Each native method gets one
 * forwarder, shared by every wrapper, rather than a binding per access.
 */
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
