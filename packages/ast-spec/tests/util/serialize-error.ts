import { codeFrameColumns } from '@babel/code-frame';

import { TSError } from './parsers/typescript-estree-import';

export function serializeError(
  error: unknown,
  contents: string,
): unknown | string {
  if (!(error instanceof TSError)) {
    return error;
  }

  const { message, lineNumber: line, column, name } = error;
  return (
    name +
    '\n' +
    codeFrameColumns(
      contents,
      { start: { line, column: column + 1 } },
      { highlightCode: false, message },
    )
  );
}
