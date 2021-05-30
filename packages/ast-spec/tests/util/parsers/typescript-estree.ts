import { parse, TSESTree } from '@typescript-eslint/typescript-estree';
import { Fixture, ParserResponse } from './parser-types';

export function parseTSESTree(
  fixture: Fixture,
  contents: string,
): ParserResponse {
  let ast: TSESTree.Program | 'ERROR' = 'ERROR';
  let tokens: TSESTree.Token[] | 'ERROR' = 'ERROR';
  let error: unknown | 'NO ERROR' = 'NO ERROR';

  try {
    const result = parse(contents, {
      comment: false,
      jsx: fixture.ext.endsWith('x'),
      loc: true,
      range: true,
      tokens: true,
    });
    const { tokens: _, comments: __, ...program } = result;

    tokens = result.tokens;
    ast = program;
  } catch (e: unknown) {
    error = e;
  }

  return {
    tokens,
    ast,
    error,
  };
}
