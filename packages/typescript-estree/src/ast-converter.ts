import type { SourceFile } from 'typescript';

import type { ASTMaps } from './convert';
import type { TSESTree } from './ts-estree';

import { Converter } from './convert';
import { convertComments } from './convert-comments';
import { convertTokens } from './node-utils';
import { simpleTraverse } from './simple-traverse';
import { convertTSErrorToTSESTreeError } from './errors';

export interface AstConverterSettings {
  allowInvalidAST?: boolean | undefined;
  codeFullText: string;
  comment?: boolean;
  errorOnUnknownASTType?: boolean | undefined;
  loc?: boolean;
  range?: boolean;
  suppressDeprecatedPropertyWarnings?: boolean | undefined;
  tokens?: TSESTree.Token[] | null;
}

export function astConverter(
  ast: SourceFile,
  settings: AstConverterSettings,
  shouldPreserveNodeMaps: boolean,
): { astMaps: ASTMaps; estree: TSESTree.Program } {
  /**
   * The TypeScript compiler produced fundamental parse errors when parsing the
   * source.
   */
  const { parseDiagnostics } = ast;
  if (parseDiagnostics.length) {
    throw convertTSErrorToTSESTreeError(parseDiagnostics[0]);
  }

  /**
   * Recursively convert the TypeScript AST into an ESTree-compatible AST
   */
  const instance = new Converter(ast, {
    allowInvalidAST: settings.allowInvalidAST,
    errorOnUnknownASTType: settings.errorOnUnknownASTType,
    shouldPreserveNodeMaps,
    suppressDeprecatedPropertyWarnings:
      settings.suppressDeprecatedPropertyWarnings,
  });

  const estree = instance.convertProgram();

  /**
   * Optionally remove range and loc if specified
   */
  if (!settings.range || !settings.loc) {
    simpleTraverse(estree, {
      enter: node => {
        if (!settings.range) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- TS 4.0 made this an error because the types aren't optional
          // @ts-expect-error
          delete node.range;
        }
        if (!settings.loc) {
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
  if (settings.tokens) {
    estree.tokens = convertTokens(ast);
  }

  /**
   * Optionally convert and include all comments in the AST
   */
  if (settings.comment) {
    estree.comments = convertComments(ast, settings.codeFullText);
  }

  const astMaps = instance.getASTMaps();

  return { astMaps, estree };
}
