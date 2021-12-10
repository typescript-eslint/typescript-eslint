import type { SelectedPosition, SelectedRange } from './types';
import { GetRangeFn } from './types';

export function isWithinRange(
  loc: SelectedPosition,
  range: SelectedRange,
): boolean {
  const canStart =
    range.start.line < loc.line ||
    (range.start.line === loc.line && range.start.column < loc.column);
  const canEnd =
    range.end.line > loc.line ||
    (range.end.line === loc.line && range.end.column >= loc.column);
  return canStart && canEnd;
}

export function objType(obj: unknown): string {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  // @ts-expect-error: this is correct check
  if (type === 'Object' && obj && typeof obj[Symbol.iterator] === 'function') {
    return 'Iterable';
  }

  return type;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return objType(value) === 'Object';
}

export function isInRange(
  position: SelectedPosition | null | undefined,
  value: unknown,
  getRange: GetRangeFn,
): boolean {
  if (!position) {
    return false;
  }
  const range = getRange(value);
  if (!range) {
    return false;
  }
  return isWithinRange(position, range);
}

export function isArrayInRange(
  position: SelectedPosition | null | undefined,
  value: unknown,
  getRange: GetRangeFn,
): boolean {
  return Boolean(
    position &&
      Array.isArray(value) &&
      value.some(item => isInRange(position, item, getRange)),
  );
}

export function hasChildInRange(
  position: SelectedPosition | null | undefined,
  value: [string, unknown][],
  getRange: GetRangeFn,
): boolean {
  return Boolean(
    position &&
      value.some(
        ([, item]) =>
          isInRange(position, item, getRange) ||
          isArrayInRange(position, item, getRange),
      ),
  );
}
