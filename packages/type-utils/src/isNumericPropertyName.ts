import type { __String } from 'typescript';

export function isNumericPropertyName(name: string | __String): boolean {
  return String(+name) === name;
}
