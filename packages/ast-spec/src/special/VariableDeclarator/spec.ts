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
   * Whether there's definite assignment assertion (`let x!: number`).
   * If `true`, then: `id` must be an identifier with a type annotation,
   * `init` must be `null`, and the declarator must be a `var`/`let` declarator.
   */
  definite: boolean;
  /**
   * The name(s) of the variable(s).
   */
  id: BindingName;
  /**
   * The initializer expression of the variable. Must be present for `const` unless
   * in a `declare const`.
   */
  init: Expression | null;
}

export interface VariableDeclaratorNoInit extends VariableDeclaratorBase {
  definite: false;
  init: null;
}

export interface VariableDeclaratorMaybeInit extends VariableDeclaratorBase {
  definite: false;
}

export interface VariableDeclaratorDefiniteAssignment extends VariableDeclaratorBase {
  definite: true;
  /**
   * The name of the variable. Must have a type annotation.
   */
  id: Identifier;
  init: null;
}

export type LetOrConstOrVarDeclarator =
  | VariableDeclaratorDefiniteAssignment
  | VariableDeclaratorMaybeInit
  | VariableDeclaratorNoInit;

export interface UsingInNormalContextDeclarator extends VariableDeclaratorBase {
  definite: false;
  id: Identifier;
  init: Expression;
}

export interface UsingInForOfDeclarator extends VariableDeclaratorBase {
  definite: false;
  id: Identifier;
  init: null;
}

export type UsingDeclarator =
  | UsingInForOfDeclarator
  | UsingInNormalContextDeclarator;

export type VariableDeclarator = LetOrConstOrVarDeclarator | UsingDeclarator;
