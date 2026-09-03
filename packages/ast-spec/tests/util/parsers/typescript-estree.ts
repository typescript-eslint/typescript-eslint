import { parse } from '@typescript-eslint/typescript-estree';

import type { Fixture, ParserResponse } from './parser-types.js';

import { ParserResponseType } from './parser-types.js';

export function parseTSESTree(
  fixture: Pick<Fixture, 'config' | 'contents' | 'isJSX'>,
): ParserResponse {
  try {
    const result = parse(fixture.contents, {
      allowInvalidAST: fixture.config.allowInvalidAST,
      comment: false,
      jsx: fixture.isJSX,
      loc: true,
      range: true,
      suppressDeprecatedPropertyWarnings: true,
      tokens: true,
    });
    const { comments: __, tokens, ...ast } = result;

    return {
      ast,
      error: 'NO ERROR',
      tokens,
      type: ParserResponseType.NoError,
    };
  } catch (error: unknown) {
    return {
      error,
      type: ParserResponseType.Error,
    };
  }
}
