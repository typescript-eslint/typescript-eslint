import type { Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'no-unsafe-declaration-merging',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unsafe declaration merging',
      recommended: 'strict',
      requiresTypeChecking: false,
    },
    messages: {
      unsafeMerging:
        'Unsafe declaration merging between classes and interfaces.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkUnsafeDeclaration(
      scope: Scope,
      node: TSESTree.Identifier,
      unsafeKind: AST_NODE_TYPES,
    ): void {
      const variable = scope.set.get(node.name);
      if (!variable) {
        return;
      }

      const defs = variable.defs;
      if (defs.length <= 1) {
        return;
      }

      if (defs.some(def => def.node.type === unsafeKind)) {
        context.report({
          node,
          messageId: 'unsafeMerging',
        });
      }
    }

    return {
      ClassDeclaration(node): void {
        if (node.id) {
          // by default eslint returns the inner class scope for the ClassDeclaration node
          // but we want the outer scope within which merged variables will sit
          const currentScope = context.getScope().upper;
          if (currentScope == null) {
            return;
          }

          checkUnsafeDeclaration(
            currentScope,
            node.id,
            AST_NODE_TYPES.TSInterfaceDeclaration,
          );
        }
      },
      TSInterfaceDeclaration(node): void {
        checkUnsafeDeclaration(
          context.getScope(),
          node.id,
          AST_NODE_TYPES.ClassDeclaration,
        );
      },
    };
  },
});
