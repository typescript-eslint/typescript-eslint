export function importedWithDefault(value = 0): void {}

export function importedWithOptions({ value = 5 }: { value?: number }): void {}

export function ImportedComponent({ value = 5 }: { value?: number }): null {
  return null;
}

export const importedArrow = (value = 0): void => {};

export const importedFnExpr = function (value = 0): void {};

export function importedWithThis(this: void, value = 0): void {}

export function importedLiterals(
  mode = 'all',
  enabled = true,
  disabled = false,
  empty: null = null,
  offset = -1,
  count = -1n,
): void {}

export function importedWrapped(
  asserted = 0 as const,
  // prettier-ignore
  parens = (0),
  nonNull = 0!,
  satisfied = 0 satisfies number,
): void {}

export function importedOverload(value?: number): void;
export function importedOverload(value = 0): void {}

// prettier-ignore
export function importedKeys({
  'the-value': renamed = 5,
  0: indexed = 5,
  ['skip']: skipped = 5,
  ...rest
}: {
  'the-value'?: number;
  0?: number;
  skip?: number;
  extra?: number;
}): void {}

export let importedLet = (value = 0): void => {};

export const importedAny: any = 1;

export declare const importedDecl: (value?: number) => void;
