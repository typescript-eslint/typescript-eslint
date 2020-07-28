import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-for-of',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access the array being iterated',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      preferForOf:
        'Expected a `for-of` loop instead of a `for` loop with this simple iteration.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isSingleVariableDeclaration(
      node: TSESTree.Node | null,
    ): node is TSESTree.VariableDeclaration {
      return (
        node !== null &&
        node.type === AST_NODE_TYPES.VariableDeclaration &&
        node.kind !== 'const' &&
        node.declarations.length === 1
      );
    }

    function isLiteral(node: TSESTree.Expression, value: number): boolean {
      return node.type === AST_NODE_TYPES.Literal && node.value === value;
    }

    function isZeroInitialized(node: TSESTree.VariableDeclarator): boolean {
      return node.init !== null && isLiteral(node.init, 0);
    }

    function isMatchingIdentifier(
      node: TSESTree.Expression,
      name: string,
    ): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === name;
    }

    function isLessThanLengthExpression(
      node: TSESTree.Node | null,
      name: string,
    ): TSESTree.Expression | null {
      if (
        node !== null &&
        node.type === AST_NODE_TYPES.BinaryExpression &&
        node.operator === '<' &&
        isMatchingIdentifier(node.left, name) &&
        node.right.type === AST_NODE_TYPES.MemberExpression &&
        isMatchingIdentifier(node.right.property, 'length')
      ) {
        return node.right.object;
      }
      return null;
    }

    function isIncrement(node: TSESTree.Node | null, name: string): boolean {
      if (!node) {
        return false;
      }
      switch (node.type) {
        case AST_NODE_TYPES.UpdateExpression:
          // x++ or ++x
          return (
            node.operator === '++' && isMatchingIdentifier(node.argument, name)
          );
        case AST_NODE_TYPES.AssignmentExpression:
          if (isMatchingIdentifier(node.left, name)) {
            if (node.operator === '+=') {
              // x += 1
              return isLiteral(node.right, 1);
            } else if (node.operator === '=') {
              // x = x + 1 or x = 1 + x
              const expr = node.right;
              return (
                expr.type === AST_NODE_TYPES.BinaryExpression &&
                expr.operator === '+' &&
                ((isMatchingIdentifier(expr.left, name) &&
                  isLiteral(expr.right, 1)) ||
                  (isLiteral(expr.left, 1) &&
                    isMatchingIdentifier(expr.right, name)))
              );
            }
          }
      }
      return false;
    }

    function contains(outer: TSESTree.Node, inner: TSESTree.Node): boolean {
      return (
        outer.range[0] <= inner.range[0] && outer.range[1] >= inner.range[1]
      );
    }

    function isAssignee(node: TSESTree.Node): boolean {
      const parent = node.parent;
      if (!parent) {
        return false;
      }

      // a[i] = 1, a[i] += 1, etc.
      if (
        parent.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.left === node
      ) {
        return true;
      }

      // delete a[i]
      if (
        parent.type === AST_NODE_TYPES.UnaryExpression &&
        parent.operator === 'delete' &&
        parent.argument === node
      ) {
        return true;
      }

      // a[i]++, --a[i], etc.
      if (
        parent.type === AST_NODE_TYPES.UpdateExpression &&
        parent.argument === node
      ) {
        return true;
      }

      // [a[i]] = [0]
      if (parent.type === AST_NODE_TYPES.ArrayPattern) {
        return true;
      }

      // [...a[i]] = [0]
      if (parent.type === AST_NODE_TYPES.RestElement) {
        return true;
      }

      // ({ foo: a[i] }) = { foo: 0 }
      if (
        parent.type === AST_NODE_TYPES.Property &&
        parent.value === node &&
        parent.parent?.type === AST_NODE_TYPES.ObjectExpression &&
        isAssignee(parent.parent)
      ) {
        return true;
      }

      return false;
    }

    function isIndexOnlyUsedWithArray(
      body: TSESTree.Statement,
      indexVar: TSESLint.Scope.Variable,
      arrayExpression: TSESTree.Expression,
    ): boolean {
      const sourceCode = context.getSourceCode();
      const arrayText = sourceCode.getText(arrayExpression);
      return indexVar.references.every(reference => {
        const id = reference.identifier;
        const node = id.parent;
        return (
          !contains(body, id) ||
          (node !== undefined &&
            node.type === AST_NODE_TYPES.MemberExpression &&
            node.property === id &&
            sourceCode.getText(node.object) === arrayText &&
            !isAssignee(node))
        );
      });
    }

    return {
      'ForStatement:exit'(node: TSESTree.ForStatement): void {
        if (!isSingleVariableDeclaration(node.init)) {
          return;
        }

        const declarator = node.init.declarations[0] as
          | TSESTree.VariableDeclarator
          | undefined;
        if (
          !declarator ||
          !isZeroInitialized(declarator) ||
          declarator.id.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const indexName = declarator.id.name;
        const arrayExpression = isLessThanLengthExpression(
          node.test,
          indexName,
        );
        if (!arrayExpression) {
          return;
        }

        const [indexVar] = context.getDeclaredVariables(node.init);
        if (
          isIncrement(node.update, indexName) &&
          isIndexOnlyUsedWithArray(node.body, indexVar, arrayExpression)
        ) {
          context.report({
            node,
            messageId: 'preferForOf',
          });
        }
      },
    };
  },
});
