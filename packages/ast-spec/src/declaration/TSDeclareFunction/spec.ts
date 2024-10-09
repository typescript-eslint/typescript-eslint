import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';

interface TSDeclareFunctionBase extends FunctionBase {
  type: AST_NODE_TYPES.TSDeclareFunction;
  /**
   * TS1183: An implementation cannot be declared in ambient contexts.
   */
  body: undefined;
  /**
   * Whether the declaration has `declare` modifier.
   */
  declare: boolean;
  expression: false;
}

/**
 * Function declaration with the `declare` keyword:
 * ```
 * declare function foo(): void;
 * ```
 */
export interface TSDeclareFunctionWithDeclare extends TSDeclareFunctionBase {
  /**
   * TS1040: 'async' modifier cannot be used in an ambient context.
   */
  async: false;
  declare: true;
  /**
   * TS1221: Generators are not allowed in an ambient context.
   */
  generator: false;
}

/**
 * Function declaration without the `declare` keyword:
 * ```
 * function foo(): void;
 * ```
 * This can either be an overload signature or a declaration in an ambient context
 * (e.g. `declare module`)
 */

export interface TSDeclareFunctionNoDeclare extends TSDeclareFunctionBase {
  declare: false;
  /**
   * - TS1221: Generators are not allowed in an ambient context.
   * - TS1222: An overload signature cannot be declared as a generator.
   */
  generator: false;
}

export type TSDeclareFunction =
  | TSDeclareFunctionNoDeclare
  | TSDeclareFunctionWithDeclare;
