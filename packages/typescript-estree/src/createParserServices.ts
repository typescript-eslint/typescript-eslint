import type * as ts from 'typescript';

import type { ASTMaps } from './convert';
import type { ParserServices } from './parser-options';

export function createParserServices(
  astMaps: ASTMaps,
  program: ts.Program | null,
): ParserServices {
  if (!program) {
    return {
      program,
      emitDecoratorMetadata: undefined,
      experimentalDecorators: undefined,
      // we always return the node maps because
      // (a) they don't require type info and
      // (b) they can be useful when using some of TS's internal non-type-aware AST utils
      ...astMaps,
    };
  }

  const checker = program.getTypeChecker();
  const compilerOptions = program.getCompilerOptions();

  return {
    program,
    // not set in the config is the same as off
    emitDecoratorMetadata: compilerOptions.emitDecoratorMetadata ?? false,
    experimentalDecorators: compilerOptions.experimentalDecorators ?? false,
    ...astMaps,
    getSymbolAtLocation: node =>
      checker.getSymbolAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
    getTypeAtLocation: node =>
      checker.getTypeAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
  };
}
