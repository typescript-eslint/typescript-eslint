import codeFrame from 'babel-code-frame';
import * as parser from '../../src/parser';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import * as parseUtils from './utils';

function createError(message: string, line: number, column: number) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(`${message} (${line}:${column})`);
  (error as any).loc = {
    line,
    column
  };
  return error;
}

function parseWithBabylonPluginTypescript(text: string, parserOptions?: any) {
  parserOptions = parserOptions || {};
  const babylon = require('@babel/parser');
  return babylon.parse(
    text,
    Object.assign(
      {
        sourceType: 'script',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        ranges: true,
        plugins: [
          'jsx',
          'typescript',
          'objectRestSpread',
          'decorators-legacy',
          'classProperties',
          'asyncGenerators',
          'dynamicImport',
          'estree',
          'bigInt'
        ]
      },
      parserOptions
    )
  );
}

function parseWithTypeScriptESTree(
  text: string,
  parserOptions?: ParserOptions
) {
  parserOptions = parserOptions || ({} as ParserOptions);
  try {
    return parser.parse(text, Object.assign(
      {
        loc: true,
        range: true,
        tokens: false,
        comment: false,
        useJSXTextNode: true,
        errorOnUnknownASTType: true,
        jsx: true
      },
      parserOptions
    ) as any);
  } catch (e) {
    throw createError(e.message, e.lineNumber, e.column);
  }
}

interface ASTComparisonParseOptions {
  parser: string;
  typeScriptESTreeOptions?: ParserOptions;
  babylonParserOptions?: any;
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
          parseWithTypeScriptESTree(text, opts.typeScriptESTreeOptions)
        );
        break;
      case 'babylon-plugin-typescript':
        result.ast = parseUtils.normalizeNodeTypes(
          parseWithBabylonPluginTypescript(text, opts.babylonParserOptions)
        );
        break;
      default:
        throw new Error(
          'Please provide a valid parser: either "typescript-estree" or "babylon-plugin-typescript"'
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
