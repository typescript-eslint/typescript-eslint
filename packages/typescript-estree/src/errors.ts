import type * as ts from 'typescript';

import type { TSESTree } from './ts-estree';

interface Position {
  column: number;
  line: number;
  offset: number;
}

interface Location {
  start: Position;
  end: Position;
}

// TODO: Remove this in major version
export class LegacyTSError extends Error {
  override name = 'TSError';

  constructor(
    message: string,
    public readonly fileName: string,
    public readonly location: Location,
  ) {
    super(message);
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

export class TSError extends LegacyTSError {
  constructor(node: ts.Node, message: string);
  constructor(
    node: number | ts.Node | TSESTree.Range,
    message: string,
    sourceFile: ts.SourceFile,
  );
  constructor(
    node: number | ts.Node | TSESTree.Range,
    message: string,
    sourceFile?: ts.SourceFile,
  ) {
    if (!sourceFile && typeof node !== 'number' && !Array.isArray(node)) {
      sourceFile = node.getSourceFile();
    }

    if (!sourceFile) {
      throw new Error('`sourceFile` is required.');
    }

    super(message, sourceFile.fileName, getErrorLocation(node, sourceFile));
  }
}

function getErrorLocation(
  node: number | ts.Node | TSESTree.Range,
  sourceFile: ts.SourceFile,
): Location {
  let startIndex;
  let endIndex;

  if (Array.isArray(node)) {
    [startIndex, endIndex] = node;
  } else if (typeof node === 'number') {
    startIndex = endIndex = node;
  } else {
    startIndex = node.getStart(sourceFile);
    endIndex = node.getEnd();
  }

  const [start, end] = [startIndex, endIndex].map(offset => {
    const { character: column, line } =
      sourceFile.getLineAndCharacterOfPosition(offset);
    return { column, line: line + 1, offset };
  });

  return { end, start };
}
