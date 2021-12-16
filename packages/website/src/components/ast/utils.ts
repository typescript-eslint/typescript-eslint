import type { SelectedPosition, SelectedRange } from './types';
import { ASTViewerModel, ASTViewerModelComplex } from './types';

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
  value: ASTViewerModel,
): boolean {
  if (!position || !value.range) {
    return false;
  }
  return isWithinRange(position, value.range);
}

export function isArrayInRange(
  position: SelectedPosition | null | undefined,
  value: ASTViewerModelComplex,
): boolean {
  return Boolean(
    position && value.value.some(item => isInRange(position, item)),
  );
}

export function hasChildInRange(
  position: SelectedPosition | null | undefined,
  value: ASTViewerModelComplex,
): boolean {
  return Boolean(
    position &&
      value.value.some(item =>
        item.type === 'object'
          ? isInRange(position, item)
          : item.type === 'array'
          ? isArrayInRange(position, item)
          : false,
      ),
  );
}
