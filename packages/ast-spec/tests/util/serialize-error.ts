import { codeFrameColumns } from '@babel/code-frame';
import { TSError } from '@typescript-eslint/typescript-estree';

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
