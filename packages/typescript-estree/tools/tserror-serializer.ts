import { TSError } from '../src/node-utils';

export const serializer: import('pretty-format').Plugin = {
  test: (val: unknown): val is TSError => val instanceof TSError,
  serialize(val: TSError, config) {
    return (
      `[${val.name}: ${val.message}\n` +
      `${config.indent}"lineNumber": ${val.lineNumber},\n` +
      `${config.indent}"column": ${val.column},\n` +
      `${config.indent}"index": ${val.index},\n` +
      `]`
    );
  },
};
