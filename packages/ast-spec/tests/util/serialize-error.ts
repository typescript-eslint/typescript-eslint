import { codeFrameColumns } from '@babel/code-frame';

import { TSError } from './parsers/typescript-estree-import';

export function serializeError(
  error: unknown,
  contents: string,
): unknown | string {
  if (!(error instanceof TSError)) {
    return error;
  }

  const {
    name,
    message,
    location: { start, end },
  } = error;

  return (
    name +
    '\n' +
    codeFrameColumns(
      contents,
      {
        start: { line: start.line, column: start.column + 1 },
        end: { line: end.line, column: end.column + 1 },
      },
      { highlightCode: false, message },
    )
  );
}
