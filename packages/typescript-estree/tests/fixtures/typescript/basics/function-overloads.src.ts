export function f(x: number): number;
export function f(x: string): string;
export function f(x: string | number): string | number {
  return x;
}
