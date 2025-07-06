import type { TSESTree } from '@typescript-eslint/utils';

export type ClassNode = TSESTree.ClassDeclaration | TSESTree.ClassExpression;
export type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;
export type MemberNode =
  | TSESTree.AccessorProperty
  | TSESTree.MethodDefinition
  | TSESTree.PropertyDefinition
  | TSESTree.TSAbstractAccessorProperty
  | TSESTree.TSAbstractMethodDefinition
  | TSESTree.TSAbstractPropertyDefinition;
export type PrivateKey = string & { __brand: 'private-key' };
export type PublicKey = string & { __brand: 'public-key' };
export type Key = PrivateKey | PublicKey;

export function publicKey(node: string): PublicKey {
  return node as PublicKey;
}
export function privateKey(node: TSESTree.PrivateIdentifier): PrivateKey {
  return `#private@@${node.name}` as PrivateKey;
}
