/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { codeFrameColumns } from '@babel/code-frame';
import type babelParser from '@babel/parser';
import type { ParserPlugin } from '@babel/parser';
import type { File } from '@babel/types';
import type { TSESTree } from '@typescript-eslint/types';
import * as path from 'path';

import type { TSError } from '../../src/node-utils';
import type { AST } from '../../src/parser';
import { parseAndGenerateServices } from '../../src/parser';

function createError(
  message: string,
  line: number,
  column: number,
): SyntaxError {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(`${message} (${line}:${column})`);
  (error as any).loc = {
    line,
    column,
  };
  return error;
}

function parseWithBabelParser(text: string, jsx = true): File {
  const babel = require('@babel/parser') as typeof babelParser;
  const plugins: ParserPlugin[] = [
    [
      'estree',
      {
        classFeatures: true,
      },
    ],
    'decorators-legacy',
    'classStaticBlock',
    'importAssertions',
    'typescript',
  ];
  if (jsx) {
    plugins.push('jsx');
  }

  return babel.parse(text, {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    ranges: true,
    plugins,
  });
}

const emptyProjectPath = path.resolve(
  __dirname,
  '..',
  'fixtures',
  'simpleProject',
);
function parseWithTypeScriptESTree(text: string, jsx = true): AST<any> {
  try {
    const result = parseAndGenerateServices(text, {
      loc: true,
      range: true,
      tokens: false,
      comment: false,
      errorOnInvalidAST: true,
      errorOnUnknownASTType: true,
      /**
       * Babel will always throw on these types of issues, so we enable
       * them in typescript-estree when comparing behavior between the
       * two parsers. By default, the TypeScript compiler is much more
       * forgiving.
       */
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
      project: [path.join(emptyProjectPath, 'tsconfig.json')],
      tsconfigRootDir: emptyProjectPath,
      filePath: path.join(emptyProjectPath, jsx ? 'file-jsx.tsx' : 'file.ts'),
      jsx,
    });
    return result.ast;
  } catch (e: unknown) {
    const error = e as TSError;

    throw createError(error.message, error.lineNumber, error.column);
  }
}

interface ASTComparisonParseOptions {
  parser: string;
  jsx?: boolean;
}

export function parse(
  text: string,
  opts: ASTComparisonParseOptions,
): { parseError: any | null; ast: any | null } {
  /**
   * Always return a consistent interface, there will be times when we expect both
   * parsers to fail to parse the invalid source.
   */
  const result: { parseError: any | null; ast: any | null } = {
    parseError: null,
    ast: null,
  };

  try {
    switch (opts.parser) {
      case '@typescript-eslint/typescript-estree':
        result.ast = parseWithTypeScriptESTree(text, opts.jsx);
        break;
      case '@babel/parser':
        result.ast = parseWithBabelParser(text, opts.jsx);
        break;
      default:
        throw new Error(
          'Please provide a valid parser: either "typescript-estree" or "@babel/parser"',
        );
    }
  } catch (error: any) {
    const loc = error.loc as TSESTree.Position | undefined;
    if (loc) {
      error.codeFrame = codeFrameColumns(
        text,
        {
          start: {
            line: loc.line,
            column: loc.column + 1,
          },
        },
        {
          highlightCode: true,
        },
      );
      error.message += `\n${error.codeFrame}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    result.parseError = error;
  }

  return result;
}
