import { TSError } from '../src/node-utils';

export const serializer: import('pretty-format').Plugin = {
  test: (val: unknown): val is TSError => val instanceof TSError,
  serialize(val: TSError) {
    return `[${val.name}: ${val.message} (${val.lineNumber}:${val.column} | ${val.index})`;
  },
};
