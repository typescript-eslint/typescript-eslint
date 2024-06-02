import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

interface FunctionDeclarationBase extends FunctionBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
  declare: false;
  expression: false;
}

/**
 * A normal function declaration:
 * ```
 * function f() {}
 * ```
 */
export interface FunctionDeclarationWithName extends FunctionDeclarationBase {
  id: Identifier;
}

/**
 * Default-exported function declarations have optional names:
 * ```
 * export default function () {}
 * ```
 */
export interface FunctionDeclarationWithOptionalName
  extends FunctionDeclarationBase {
  id: Identifier | null;
}

export type FunctionDeclaration =
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName;
