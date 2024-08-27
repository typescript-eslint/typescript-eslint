import type { Fixture, ParserResponse } from './parser-types';

import { ParserResponseType } from './parser-types';
import { parse } from './typescript-estree-import';

export function parseTSESTree(
  fixture: Fixture,
  contents: string,
): ParserResponse {
  try {
    const result = parse(contents, {
      allowInvalidAST: fixture.config.allowInvalidAST,
      comment: false,
      jsx: fixture.ext.endsWith('x'),
      loc: true,
      range: true,
      suppressDeprecatedPropertyWarnings: true,
      tokens: true,
    });
    const { comments: __, tokens: _, ...program } = result;

    return {
      ast: program,
      error: 'NO ERROR',
      tokens: result.tokens,
      type: ParserResponseType.NoError,
    };
  } catch (error: unknown) {
    return {
      error,
      type: ParserResponseType.Error,
    };
  }
}
