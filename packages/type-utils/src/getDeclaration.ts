import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

/**
 * Gets the declaration for the given variable
 */
export function getDeclaration(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): ts.Declaration | null {
  const symbol = services.getSymbolAtLocation(node);
  if (!symbol) {
    return null;
  }
  const declarations = symbol.getDeclarations();
  return declarations?.[0] ?? null;
}
