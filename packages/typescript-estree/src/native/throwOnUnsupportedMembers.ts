/**
 * Names the missing API rather than failing as a `TypeError` inside a rule.
 * Only listed members throw: every absent property would also catch the names
 * JS and host tooling probe for, such as `then` and `toJSON`.
 */
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
