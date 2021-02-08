import { TSError } from '../src/node-utils';
import type { Plugin } from 'pretty-format';

export const serializer: Plugin = {
  test: (val: unknown): val is TSError => val instanceof TSError,
  serialize(val: TSError, config) {
    return (
      `${val.name} {\n` +
      `${config.indent}"column": ${val.column},\n` +
      `${config.indent}"index": ${val.index},\n` +
      `${config.indent}"lineNumber": ${val.lineNumber},\n` +
      `${config.indent}"message": "${val.message}",\n` +
      `}`
    );
  },
};
