import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

interface FunctionDeclarationBase extends FunctionBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
  declare?: never;
  expression?: never;
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
