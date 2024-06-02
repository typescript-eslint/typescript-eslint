import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';

// TODO: these declarator types can probably be refined further, especially
// their differences when used in different contexts (e.g. for...of)
interface VariableDeclaratorBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  /**
   * The name(s) of the variable(s).
   */
  id: BindingName;
  /**
   * The initializer expression of the variable. Must be present for `const` unless
   * in a `declare const`.
   */
  init: Expression | null;
  /**
   * Whether there's definite assignment assertion (`let x!: number`).
   * If `true`, then: `id` must be an identifier with a type annotation,
   * `init` must be `null`, and the declarator must be a `var`/`let` declarator.
   */
  definite: boolean;
}

export interface DeclareLetOrVarDeclarator extends VariableDeclaratorBase {
  init: null;
  definite: false;
}

export interface LetOrVarDeclaratorDefiniteAssignment
  extends VariableDeclaratorBase {
  /**
   * The name of the variable. Must have a type annotation.
   */
  id: Identifier;
  init: null;
  definite: true;
}

export interface LetOrConstOrVarDeclaratorNoDefiniteAssignment
  extends VariableDeclaratorBase {
  definite: false;
}

export interface ConstDeclaratorWithInit extends VariableDeclaratorBase {
  init: Expression;
  definite: false;
}

export type LetOrConstOrVarDeclarator =
  | DeclareLetOrVarDeclarator
  | LetOrVarDeclaratorDefiniteAssignment
  | LetOrConstOrVarDeclaratorNoDefiniteAssignment
  | ConstDeclaratorWithInit;

export interface UsingInNomalConextDeclarator extends VariableDeclaratorBase {
  id: Identifier;
  init: Expression;
  definite: false;
}

export interface UsingInForOfDeclarator extends VariableDeclaratorBase {
  id: Identifier;
  init: null;
  definite: false;
}

export type UsingDeclarator =
  | UsingInForOfDeclarator
  | UsingInNomalConextDeclarator;

export type VariableDeclarator = LetOrConstOrVarDeclarator | UsingDeclarator;
