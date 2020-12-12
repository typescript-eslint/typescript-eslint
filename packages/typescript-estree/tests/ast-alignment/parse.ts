/* eslint-disable @typescript-eslint/no-explicit-any */

import type babelParser from '@babel/parser';
import { ParserPlugin } from '@babel/parser';
import { codeFrameColumns } from '@babel/code-frame';
import * as parser from '../../src/parser';

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

function parseWithBabelParser(text: string, jsx = true): any {
  const babel: typeof babelParser = require('@babel/parser');
  const plugins: ParserPlugin[] = [
    'classProperties',
    'decorators-legacy',
    'estree',
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

function parseWithTypeScriptESTree(text: string, jsx = true): parser.AST<any> {
  try {
    const result = parser.parseAndGenerateServices(text, {
      loc: true,
      range: true,
      tokens: false,
      comment: false,
      useJSXTextNode: true,
      errorOnUnknownASTType: true,
      /**
       * Babel will always throw on these types of issues, so we enable
       * them in typescript-estree when comparing behavior between the
       * two parsers. By default, the TypeScript compiler is much more
       * forgiving.
       */
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
      jsx,
    });
    return result.ast;
  } catch (e) {
    throw createError(e.message, e.lineNumber, e.column);
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
  } catch (error) {
    const loc = error.loc;
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
    result.parseError = error;
  }

  return result;
}
