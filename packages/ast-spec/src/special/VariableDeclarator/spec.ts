import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';

export interface LetOrConstOrVarDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  id: BindingName;
  init: Expression | null;
  definite: boolean;
}

export interface UsingInNomalConextDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  id: Identifier;
  init: Expression;
  definite: boolean;
}

export interface UsingInForOfDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  id: Identifier;
  init: null;
  definite: boolean;
}

export type UsingDeclarator =
  | UsingInNomalConextDeclarator
  | UsingInForOfDeclarator;

export type VariableDeclarator = LetOrConstOrVarDeclarator | UsingDeclarator;
