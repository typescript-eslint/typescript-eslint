import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { nullThrows } from '@typescript-eslint/utils/eslint-utils';
import * as tsutils from 'ts-api-utils';

import { createRule, findVariable, getParserServices } from '../util';

export default createRule({
  name: 'no-misused-disposable',
  meta: {
    type: 'suggestion',
    docs: {
      description: "Disallow using disposables in ways that won't be disposed",
    },
    messages: {
      misusedDisposable:
        "Disposable is not handled correctly. Disposable must be in a 'using'/'await using' declaration, or returned",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    return {
      CallExpression(node): void {
        const type = services.getTypeAtLocation(node);
        const disposeSymbol = tsutils.getWellKnownSymbolPropertyOfType(
          type,
          'dispose',
          checker,
        );
        if (disposeSymbol == null) {
          return;
        }

        if (isValidWayToHandleDisposable(node)) {
          return;
        }
        context.report({
          node,
          messageId: 'misusedDisposable',
        });
      },
    };

    function traverseUpTransparentParents(node: TSESTree.Node): TSESTree.Node {
      if (node.parent == null) {
        return node;
      }
      switch (node.parent.type) {
        case AST_NODE_TYPES.ConditionalExpression:
          return traverseUpTransparentParents(node.parent);
        case AST_NODE_TYPES.LogicalExpression:
          if (node.parent.operator === '||' || node.parent.operator === '&&') {
            return traverseUpTransparentParents(node.parent);
          }
          return node;
        case AST_NODE_TYPES.SequenceExpression:
          if (node.parent.expressions.at(-1) === node) {
            return traverseUpTransparentParents(node.parent);
          }
          return node;
        default:
          return node;
      }
    }

    function isValidWayToHandleDisposable(
      disposableNode: TSESTree.Node,
    ): boolean {
      disposableNode = traverseUpTransparentParents(disposableNode);

      if (disposableNode.parent == null) {
        return false;
      }

      if (disposableNode.parent.type === AST_NODE_TYPES.VariableDeclarator) {
        // using x = makeDisposable();
        if (
          ['using', 'await using'].includes(disposableNode.parent.parent.kind)
        ) {
          return true;
        }

        // Support code like:
        //    const foo = makeDisposable();
        //    return foo;
        if (
          disposableNode.parent.parent.kind === 'const' &&
          disposableNode.parent.id.type === AST_NODE_TYPES.Identifier
        ) {
          const scope = context.sourceCode.getScope(disposableNode);
          const smVariable = nullThrows(
            findVariable(scope, disposableNode.parent.id),
            "couldn't find variable",
          );
          for (const reference of smVariable.references) {
            // TODO:  if one of these is a return statement within the same function, it's handled.
            const refNode = reference.identifier;
            if (refNode === disposableNode) {
              continue;
            }
            const refScope = context.sourceCode.getScope(refNode);
            if (
              refScope.variableScope === scope.variableScope &&
              isValidWayToHandleDisposable(refNode)
            ) {
              return true;
            }
          }
        }

        return false;
      }

      // return makeDisposable();
      if (disposableNode.parent.type === AST_NODE_TYPES.ReturnStatement) {
        return true;
      }

      return false;
    }
  },
});
