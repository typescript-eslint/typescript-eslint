// working around https://github.com/microsoft/TypeScript/issues/17002
export function isReadonlyArray(arg: unknown): arg is readonly unknown[] {
  return Array.isArray(arg);
}
