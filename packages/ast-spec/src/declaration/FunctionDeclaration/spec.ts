import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

interface FunctionDeclarationBase extends FunctionBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
  // TODO(#5020) - make this always `false` if it is not `declare`d instead of `undefined`
  declare?: false;
  expression: false;
}

export interface FunctionDeclarationWithName extends FunctionDeclarationBase {
  id: Identifier;
}

export interface FunctionDeclarationWithOptionalName
  extends FunctionDeclarationBase {
  id: Identifier | null;
}

export type FunctionDeclaration =
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName;
