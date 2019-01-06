import codeFrame from 'babel-code-frame';
import * as parser from '../../src/parser';
import * as parseUtils from './utils';
import { ParserPlugin } from '@babel/parser';

function createError(message: string, line: number, column: number) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(`${message} (${line}:${column})`);
  (error as any).loc = {
    line,
    column
  };
  return error;
}

function parseWithBabelParser(text: string, jsx: boolean = true) {
  const babel = require('@babel/parser');
  const plugins: ParserPlugin[] = [
    'typescript',
    'objectRestSpread',
    'decorators-legacy',
    'classProperties',
    'asyncGenerators',
    'dynamicImport',
    'estree',
    'bigInt',
    'importMeta'
  ];
  if (jsx) {
    plugins.push('jsx');
  }

  return babel.parse(text, {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    ranges: true,
    plugins
  });
}

function parseWithTypeScriptESTree(text: string, jsx: boolean = true) {
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
      jsx
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

export function parse(text: string, opts: ASTComparisonParseOptions) {
  /**
   * Always return a consistent interface, there will be times when we expect both
   * parsers to fail to parse the invalid source.
   */
  const result: any = {
    parseError: null,
    ast: null
  };

  try {
    switch (opts.parser) {
      case 'typescript-estree':
        result.ast = parseUtils.normalizeNodeTypes(
          parseWithTypeScriptESTree(text, opts.jsx)
        );
        break;
      case '@babel/parser':
        result.ast = parseUtils.normalizeNodeTypes(
          parseWithBabelParser(text, opts.jsx)
        );
        break;
      default:
        throw new Error(
          'Please provide a valid parser: either "typescript-estree" or "@babel/parser"'
        );
    }
  } catch (error) {
    const loc = error.loc;
    if (loc) {
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += `\n${error.codeFrame}`;
    }
    result.parseError = error;
  }

  return result;
}
