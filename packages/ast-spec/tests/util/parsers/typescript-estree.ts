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
      comment: fixture.config.comment ?? false,
      jsx: fixture.ext.endsWith('x'),
      loc: true,
      range: true,
      suppressDeprecatedPropertyWarnings: true,
      tokens: true,
    });
    const { tokens, comments, ...program } = result;

    const response = {
      type: ParserResponseType.NoError,
      ast: program,
      error: 'NO ERROR',
      tokens: tokens,
    };

    if (fixture.config.comment) {
      response.comments = comments;
    }

    return response;
  } catch (error: unknown) {
    return {
      type: ParserResponseType.Error,
      error,
    };
  }
}
