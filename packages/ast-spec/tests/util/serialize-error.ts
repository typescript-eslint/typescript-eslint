import type { ParseError as BabelParseError } from '@babel/parser';
import { codeFrameColumns } from '@babel/code-frame';

import { TSError } from './parsers/typescript-estree-import';

function serializeTSError(error: TSError, contents: string): string {
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

type BabelError = SyntaxError &
  BabelParseError & { loc: { column: number; line: number } };

const isBabelError = (error: unknown): error is BabelError =>
  error instanceof SyntaxError &&
  'code' in error &&
  'reasonCode' in error &&
  'loc' in error;

function serializeBabelError(error: BabelError, contents: string): string {
  const { loc, message } = error;

  return `BabelError
${codeFrameColumns(
  contents,
  {
    start: { column: loc.column + 1, line: loc.line },
  },
  { highlightCode: false, message },
)}
  `;
}

export function serializeError(error: unknown, contents: string): unknown {
  if (error instanceof TSError) {
    return serializeTSError(error, contents);
  }

  if (isBabelError(error)) {
    return serializeBabelError(error, contents);
  }

  return error;
}
