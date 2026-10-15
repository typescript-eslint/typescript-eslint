export function throwOnUnsupportedMembers<T extends object>(
  label: string,
  unsupported: ReadonlySet<string>,
  implementation: T,
): T {
  for (const property of unsupported) {
    Object.defineProperty(implementation, property, {
      get() {
        throw new Error(
          `${label}#${property} is not available on the TypeScript native preview API.`,
        );
      },
    });
  }
  return implementation;
}
