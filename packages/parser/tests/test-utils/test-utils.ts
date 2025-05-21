import type { ParserOptions } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

import * as path from 'node:path';

export const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'services');

const DEFAULT_PARSER_OPTIONS = {
  comment: true,
  errorOnUnknownASTType: true,
  loc: true,
  range: true,
  raw: true,
  sourceType: 'module',
  tokens: true,
} as const satisfies ParserOptions;

export function createConfig(filename: string): ParserOptions {
  return {
    ...DEFAULT_PARSER_OPTIONS,
    filePath: filename,
    project: './tsconfig.json',
    tsconfigRootDir: FIXTURES_DIR,
  };
}

/**
 * Returns a raw copy of the given AST
 * @param ast the AST object
 * @returns copy of the AST object
 */
export function getRaw(ast: TSESTree.Program): TSESTree.Program {
  return JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if ((key === 'start' || key === 'end') && typeof value === 'number') {
        return undefined;
      }
      return value;
    }),
  );
}
