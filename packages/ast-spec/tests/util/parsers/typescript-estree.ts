import type { Fixture, ParserResponse } from './parser-types';
import { ParserResponseType } from './parser-types';
import { parse } from './typescript-estree-import';

export function parseTSESTree(
  fixture: Fixture,
  contents: string,
): ParserResponse {
  try {
    const result = parse(contents, {
      comment: false,
      jsx: fixture.ext.endsWith('x'),
      loc: true,
      range: true,
      suppressDeprecatedPropertyWarnings: true,
      tokens: true,
    });
    const { tokens: _, comments: __, ...program } = result;

    return {
      type: ParserResponseType.NoError,
      ast: program,
      error: 'NO ERROR',
      tokens: result.tokens,
    };
  } catch (error: unknown) {
    return {
      type: ParserResponseType.Error,
      error,
    };
  }
}
