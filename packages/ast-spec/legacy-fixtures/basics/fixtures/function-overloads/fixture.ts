// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

export function f(x: number): number;
export function f(x: string): string;
export function f(x: string | number): string | number {
  return x;
}
