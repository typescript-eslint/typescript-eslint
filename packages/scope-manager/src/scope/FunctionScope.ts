import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { Reference } from '../referencer/Reference';
import type { ScopeManager } from '../ScopeManager';
import type { Variable } from '../variable';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class FunctionScope extends ScopeBase<
  ScopeType.function,
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSDeclareFunction
  | TSESTree.TSEmptyBodyFunctionExpression
  | TSESTree.Program,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: FunctionScope['upper'],
    block: FunctionScope['block'],
    isMethodDefinition: boolean,
  ) {
    super(
      scopeManager,
      ScopeType.function,
      upperScope,
      block,
      isMethodDefinition,
    );

    // section 9.2.13, FunctionDeclarationInstantiation.
    // NOTE Arrow functions never have an arguments objects.
    if (this.block.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
      this.defineVariable('arguments', this.set, this.variables, null, null);
    }
  }

  // References in default parameters isn't resolved to variables which are in their function body.
  //     const x = 1
  //     function f(a = x) { // This `x` is resolved to the `x` in the outer scope.
  //         const x = 2
  //         console.log(a)
  //     }
  protected isValidResolution(ref: Reference, variable: Variable): boolean {
    // If `options.globalReturn` is true, `this.block` becomes a Program node.
    if (this.block.type === AST_NODE_TYPES.Program) {
      return true;
    }

    const bodyStart = this.block.body?.range[0] ?? -1;

    // It's invalid resolution in the following case:
    return !(
      (
        variable.scope === this &&
        ref.identifier.range[0] < bodyStart && // the reference is in the parameter part.
        variable.defs.every(d => d.name.range[0] >= bodyStart)
      ) // the variable is in the body.
    );
  }
}

export { FunctionScope };
