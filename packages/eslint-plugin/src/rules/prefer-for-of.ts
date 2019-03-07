import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';
import { Scope, RuleContext } from 'ts-eslint';

export default util.createRule({
  name: 'prefer-for-of',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access the array being iterated.',
      category: 'Stylistic Issues',
      recommended: false,
      tslintName: 'prefer-for-of',
    },
    messages: {
      preferForOf:
        'Expected a `for-of` loop instead of a `for` loop with this simple iteration',
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
      let arrayExpression: TSESTree.Expression | null = null;
      if (
        node !== null &&
        node.type === AST_NODE_TYPES.BinaryExpression &&
        node.operator === '<' &&
        isMatchingIdentifier(node.left, name) &&
        node.right.type === AST_NODE_TYPES.MemberExpression &&
        isMatchingIdentifier(node.right.property, 'length')
      ) {
        arrayExpression = node.right.object;
      }
      return arrayExpression;
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
      return (
        // a[i] = 1, a[i] += 1, etc.
        (parent.type === AST_NODE_TYPES.AssignmentExpression &&
          parent.left === node) ||
        // delete a[i]
        (parent.type === AST_NODE_TYPES.UnaryExpression &&
          parent.operator === 'delete' &&
          parent.argument === node) ||
        // a[i]++, --a[i], etc.
        (parent.type === AST_NODE_TYPES.UpdateExpression &&
          parent.argument === node) ||
        // [a[i]] = [0]
        parent.type === AST_NODE_TYPES.ArrayPattern ||
        // [...a[i]] = [0]
        parent.type === AST_NODE_TYPES.RestElement ||
        // ({ foo: a[i] }) = { foo: 0 }
        (parent.type === AST_NODE_TYPES.Property &&
          parent.parent !== undefined &&
          parent.parent.type === AST_NODE_TYPES.ObjectExpression &&
          parent.value === node &&
          isAssignee(parent.parent))
      );
    }

    function isIndexOnlyUsedWithArray(
      context: RuleContext<'preferForOf', never[]>,
      body: TSESTree.Statement,
      indexVar: Scope.Variable,
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
      'ForStatement:exit'(node: TSESTree.ForStatement) {
        if (!isSingleVariableDeclaration(node.init)) {
          return;
        }

        const [declarator] = node.init.declarations;
        if (
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
          isIndexOnlyUsedWithArray(
            context,
            node.body,
            indexVar,
            arrayExpression,
          )
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
