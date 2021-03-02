import { SourceFile } from 'typescript';
import { convertError, Converter, ASTMaps } from './convert';
import { convertComments } from './convert-comments';
import { convertTokens } from './node-utils';
import { Extra } from './parser-options';
import { TSESTree } from './ts-estree';
import { simpleTraverse } from './simple-traverse';

export function astConverter(
  ast: SourceFile,
  extra: Extra,
  shouldPreserveNodeMaps: boolean,
): { estree: TSESTree.Program; astMaps: ASTMaps } {
  /**
   * The TypeScript compiler produced fundamental parse errors when parsing the
   * source.
   */
  // internal typescript api...
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseDiagnostics = (ast as any).parseDiagnostics;
  if (parseDiagnostics.length) {
    throw convertError(parseDiagnostics[0]);
  }

  /**
   * Recursively convert the TypeScript AST into an ESTree-compatible AST
   */
  const instance = new Converter(ast, {
    errorOnUnknownASTType: extra.errorOnUnknownASTType || false,
    useJSXTextNode: extra.useJSXTextNode || false,
    shouldPreserveNodeMaps,
  });

  const estree = instance.convertProgram();

  /**
   * Optionally remove range and loc if specified
   */
  if (!extra.range || !extra.loc) {
    simpleTraverse(estree, {
      enter: node => {
        if (!extra.range) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- TS 4.0 made this an error because the types aren't optional
          // @ts-expect-error
          delete node.range;
        }
        if (!extra.loc) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- TS 4.0 made this an error because the types aren't optional
          // @ts-expect-error
          delete node.loc;
        }
      },
    });
  }

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

  const astMaps = instance.getASTMaps();

  return { estree, astMaps };
}
