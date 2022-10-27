import type { ParserPlugin } from '@babel/eslint-parser';
import { parse } from '@babel/eslint-parser';

import type { Fixture, ParserResponse } from './parser-types';
import { ParserResponseType } from './parser-types';

const PLUGINS: ParserPlugin[] = [
  // TODO - enable classFeatures instead of classProperties when we support it
  // 'classFeatures',
  'classProperties',
  'decorators-legacy',
  'importAssertions',
  'typescript',
];

export function parseBabel(fixture: Fixture, contents: string): ParserResponse {
  const plugins = [...PLUGINS];
  if (fixture.isJSX) {
    plugins.push('jsx');
  }

  try {
    const result = parse(contents, {
      allowImportExportEverywhere: true,
      babelOptions: {
        parserOpts: {
          plugins,
        },
      },
      ecmaFeatures: {
        globalReturn: true,
      },
      requireConfigFile: false,
      sourceType: 'unambiguous',
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
