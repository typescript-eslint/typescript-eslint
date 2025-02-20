import type { ParserOptions } from '@babel/core';

import { parse as parse7 } from '@babel/eslint-parser';
import { parse as parse8 } from './babel-8';

import type { Fixture, ParserResponse } from './parser-types';

import { ParserResponseType } from './parser-types';

const PARSERS = { 7: parse7, 8: parse8 };

const PLUGINS: NonNullable<ParserOptions['plugins']> = [
  'decoratorAutoAccessors',
  // TODO - enable classFeatures instead of classProperties when we support it
  // 'classFeatures',
  'classProperties',
  'decorators-legacy',
  'explicitResourceManagement',
  'typescript',
];

export function parseBabel(
  fixture: Fixture,
  contents: string,
  version: 7 | 8 = 7,
): ParserResponse {
  const plugins = [...PLUGINS];
  if (fixture.isJSX) {
    plugins.push('jsx');
  }
  plugins.push(version === 7 ? 'importAssertions' : 'deprecatedImportAssert');

  try {
    const result = PARSERS[version](contents, {
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
