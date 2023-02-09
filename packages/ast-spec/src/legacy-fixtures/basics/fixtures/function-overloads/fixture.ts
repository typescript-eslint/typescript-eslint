// TODO: This fixture might be too large, and if so should be split up.

export function f(x: number): number;
export function f(x: string): string;
export function f(x: string | number): string | number {
  return x;
}
