import { codeFrameColumns } from '@babel/code-frame';

import { TSError } from './parsers/typescript-estree-import';

export function serializeError(error: any, contents: string): unknown {
  if (!(error instanceof TSError)) {
    return error;
  }

  const {
    location: { end, start },
    message,
    name,
  } = error;

  return `${name}
${codeFrameColumns(
  contents,
  {
    end: { column: end.column + 1, line: end.line },
    start: { column: start.column + 1, line: start.line },
  },
  { highlightCode: false, message },
)}`;
}
