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

export class TSError extends Error {
  location: Location;
  override name = 'TSError';

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
    super(message);

    this.location = getErrorLocation(node, sourceFile);
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

function getErrorLocation(
  node: number | ts.Node | TSESTree.Range,
  sourceFile?: ts.SourceFile,
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
    sourceFile = node.getSourceFile();
  }

  if (!sourceFile) {
    throw new Error('`sourceFile` is required.');
  }

  const [start, end] = [startIndex, endIndex].map(offset => {
    const { character: column, line } =
      sourceFile.getLineAndCharacterOfPosition(offset);
    return { column, line: line + 1, offset };
  });

  return {
    end,
    start,
  };
}
