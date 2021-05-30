import { getSerializers } from 'jest-snapshot';
import { diff } from 'jest-diff';
import { NO_DIFF_MESSAGE } from 'jest-diff/build/constants';
import defaultPrinter from 'pretty-format';
import * as string from './serializers/string';

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
      ...getSerializers(),
      // by default jest will quote the string with double quotes
      // this means the diff string will have double quotes escaped and look ugly
      // this is a single-quote string serializer which won't clash with the outer double quotes
      // so we get a nicer looking diff because of it!
      string.serializer,
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

export function diffHasChanges(diff: string): boolean {
  return !diff.includes(NO_DIFF_MESSAGE);
}
