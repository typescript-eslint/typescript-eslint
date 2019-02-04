/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import { convertError, Converter } from './convert';
import { convertComments } from './convert-comments';
import { convertTokens } from './node-utils';
import ts from 'typescript';
import { Extra } from './parser-options';

export default function astConverter(
  ast: ts.SourceFile,
  extra: Extra,
  shouldProvideParserServices: boolean
) {
  /**
   * The TypeScript compiler produced fundamental parse errors when parsing the
   * source.
   */
  if ((ast as any).parseDiagnostics.length) {
    throw convertError((ast as any).parseDiagnostics[0]);
  }

  /**
   * Recursively convert the TypeScript AST into an ESTree-compatible AST
   */
  const instance = new Converter(ast, {
    errorOnUnknownASTType: extra.errorOnUnknownASTType || false,
    useJSXTextNode: extra.useJSXTextNode || false,
    shouldProvideParserServices
  });

  const estree = instance.convertProgram();

  /**
   * Optionally convert and include all tokens in the AST
   */
  if (extra.tokens) {
    estree.tokens = convertTokens(ast);
  }

  /**
   * Optionally convert and include all comments in the AST
   */
  if (extra.comment) {
    estree.comments = convertComments(ast, extra.code);
  }

  const astMaps = shouldProvideParserServices
    ? instance.getASTMaps()
    : undefined;

  return { estree, astMaps };
}
