import { parse, ParserPlugin } from '@babel/eslint-parser';
import { Fixture, ParserResponse } from './parser-types';

const PLUGINS: ParserPlugin[] = [
  // TODO - enable classFeatures instead of classProperties when we support it
  // 'classFeatures',
  'classProperties',
  'decorators-legacy',
  'typescript',
];

export function parseBabel(fixture: Fixture, contents: string): ParserResponse {
  const plugins = [...PLUGINS];
  if (fixture.isJSX) {
    plugins.push('jsx');
  }

  let ast: unknown | 'ERROR' = 'ERROR';
  let tokens: unknown | 'ERROR' = 'ERROR';
  let error: unknown | 'NO ERROR' = 'NO ERROR';

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
