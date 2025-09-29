import type { SnapshotSerializer } from 'vitest';

import { TSError } from '@typescript-eslint/typescript-estree';

export const serializer: SnapshotSerializer = {
  serialize(val: TSError, config, indentation, depth, refs, printer) {
    const format = (value: unknown): string =>
      printer(value, config, indentation, depth + 1, refs);
    return (
      `${val.name} {\n` +
      `${config.indent}"column": ${format(val.column)},\n` +
      `${config.indent}"index": ${format(val.index)},\n` +
      `${config.indent}"lineNumber": ${format(val.lineNumber)},\n` +
      `${config.indent}"message": ${format(val.message)},\n` +
      `}`
    );
  },
  test: (val: unknown): val is TSError => val instanceof TSError,
};
