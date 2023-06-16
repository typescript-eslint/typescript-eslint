// https://github.com/microsoft/TypeScript/issues/17002
export function isArray(arg: unknown): arg is readonly unknown[] {
  return Array.isArray(arg);
}
