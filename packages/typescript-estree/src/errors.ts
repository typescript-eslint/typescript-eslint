import * as ts from 'typescript';
import { SemanticOrSyntacticError } from './semantic-or-syntactic-errors';

/**
 * Extends and formats a given error object
 * @param error the error object
 * @returns converted error object
 */
export function convertTSErrorToTSESTreeError(
  error: SemanticOrSyntacticError | ts.DiagnosticWithLocation,
): TSESTreeError {
  return createTSESTreeError(
    ('message' in error && error.message) || (error.messageText as string),
    error.file!,
    error.start!,
  );
}

export function createTSESTreeError(
  message: string,
  ast: ts.SourceFile,
  startIndex: number,
  endIndex: number = startIndex,
): TSESTreeError {
  const [start, end] = [startIndex, endIndex].map(offset => {
    const { character: column, line } =
      ast.getLineAndCharacterOfPosition(offset);
    return { column, line: line + 1, offset };
  });
  return new TSESTreeError(message, ast.fileName, { end, start });
}

export class TSESTreeError extends Error {
  constructor(
    message: string,
    public readonly fileName: string,
    public readonly location: {
      end: {
        column: number;
        line: number;
        offset: number;
      };
      start: {
        column: number;
        line: number;
        offset: number;
      };
    },
  ) {
    super(message);
    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: new.target.name,
    });
  }

  // For old version of ESLint https://github.com/typescript-eslint/typescript-eslint/pull/6556#discussion_r1123237311
  get index(): number {
    return this.location.start.offset;
  }

  // https://github.com/eslint/eslint/blob/b09a512107249a4eb19ef5a37b0bd672266eafdb/lib/linter/linter.js#L853
  get lineNumber(): number {
    return this.location.start.line;
  }

  // https://github.com/eslint/eslint/blob/b09a512107249a4eb19ef5a37b0bd672266eafdb/lib/linter/linter.js#L854
  get column(): number {
    return this.location.start.column;
  }
}
