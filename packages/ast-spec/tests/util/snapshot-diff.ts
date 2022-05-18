import { diff } from 'jest-diff';
import defaultPrinter from 'pretty-format';
import * as NodeSerializer from './serializers/Node';
import * as StringSerializer from './serializers/string';

function identity<T>(value: T): T {
  return value;
}

function diffStrings(
  valueA: unknown,
  valueB: unknown,
  valueAName: string,
  valueBName: string,
): string | null {
  return diff(valueA, valueB, {
    expand: false,
    // we want to show the entire file in the diff
    // that way you don't have to try and figure out what lines map to which sections
    contextLines: Number.MAX_SAFE_INTEGER,
    aAnnotation: valueAName,
    bAnnotation: valueBName,
    aColor: identity,
    bColor: identity,
    changeColor: identity,
    commonColor: identity,
    patchColor: identity,
  });
}

export function snapshotDiff(
  valueAName: string,
  valueA: unknown,
  valueBName: string,
  valueB: unknown,
): string {
  const OPTIONS = {
    plugins: [
      NodeSerializer.serializer,
      // by default jest will quote the string with double quotes
      // this means the diff string will have double quotes escaped and look ugly
      // this is a single-quote string serializer which won't clash with the outer double quotes
      // so we get a nicer looking diff because of it!
      StringSerializer.serializer,
    ],
  };

  const difference = diffStrings(
    defaultPrinter(valueA, OPTIONS),
    defaultPrinter(valueB, OPTIONS),
    valueAName,
    valueBName,
  );

  if (difference == null) {
    throw new Error('Unexpected null when diffing snapshots.');
  }

  return 'Snapshot Diff:\n' + difference;
}

// https://github.com/facebook/jest/blob/a293b75310cfc209713df1d34d243eb258995316/packages/jest-diff/src/constants.ts#L8
const NO_DIFF_MESSAGE = 'Compared values have no visual difference.';

export function diffHasChanges(diff: string): boolean {
  return !diff.includes(NO_DIFF_MESSAGE);
}
