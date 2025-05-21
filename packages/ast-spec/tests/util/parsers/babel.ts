import type { ParserOptions } from '@babel/core';

import { parse } from '@babel/eslint-parser';

import type { Fixture, ParserResponse } from './parser-types.js';

import { ParserResponseType } from './parser-types.js';

const PLUGINS: NonNullable<ParserOptions['plugins']> = [
  'decoratorAutoAccessors',
  // TODO - enable classFeatures instead of classProperties when we support it
  // 'classFeatures',
  'classProperties',
  'decorators-legacy',
  'explicitResourceManagement',
  'importAssertions',
  'typescript',
];

export function parseBabel(
  fixture: Pick<Fixture, 'contents' | 'isJSX'>,
): ParserResponse {
  const plugins = [...PLUGINS];
  if (fixture.isJSX) {
    plugins.push('jsx');
  }

  try {
    const result = parse(fixture.contents, {
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
