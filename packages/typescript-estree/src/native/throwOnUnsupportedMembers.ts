export function throwOnUnsupportedMembers<T extends object>(
  label: string,
  unsupported: ReadonlySet<string>,
  implementation: T,
): T {
  return new Proxy(implementation, {
    get(target, property) {
      if (typeof property === 'string' && unsupported.has(property)) {
        throw new Error(
          `${label}#${property} is not available on the TypeScript native preview API.`,
        );
      }
      return Reflect.get(target, property, target);
    },
  });
}
