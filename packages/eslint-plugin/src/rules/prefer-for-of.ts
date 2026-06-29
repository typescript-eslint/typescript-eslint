import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isAssignee } from '../util';

export default createRule({
  name: 'prefer-for-of',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce the use of `for-of` loop over the standard `for` loop where possible',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      preferForOf:
        'Expected a `for-of` loop instead of a `for` loop with this simple iteration.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const usedNames = new Set<string>();
    const nameCounters = new Map<string, number>();
    function getSafeName(base: string, scope: TSESLint.Scope.Scope): string {
      const declared = new Set<string>();

      let current: TSESLint.Scope.Scope | null = scope;

      while (current) {
        for (const variable of current.variables) {
          declared.add(variable.name);
        }

        current = current.upper;
      }

      if (!declared.has(base) && !usedNames.has(base)) {
        usedNames.add(base);
        return base;
      }

      let suffix = nameCounters.get(base) ?? 1;
      let candidate = `${base}${suffix}`;

      while (declared.has(candidate) || usedNames.has(candidate)) {
        suffix++;
        candidate = `${base}${suffix}`;
      }

      nameCounters.set(base, suffix + 1);
      usedNames.add(candidate);
      return candidate;
    }

    function isSingleVariableDeclaration(
      node: TSESTree.Node | null,
    ): node is TSESTree.VariableDeclaration {
      return (
        node?.type === AST_NODE_TYPES.VariableDeclaration &&
        node.kind !== 'const' &&
        node.declarations.length === 1
      );
    }

    function isLiteral(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
      value: number,
    ): boolean {
      return node.type === AST_NODE_TYPES.Literal && node.value === value;
    }

    function isZeroInitialized(node: TSESTree.VariableDeclarator): boolean {
      return node.init != null && isLiteral(node.init, 0);
    }

    function isMatchingIdentifier(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
      name: string,
    ): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === name;
    }

    function isLessThanLengthExpression(
      node: TSESTree.Node | null,
      name: string,
    ): TSESTree.Expression | null {
      if (
        node?.type === AST_NODE_TYPES.BinaryExpression &&
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
            }
            if (node.operator === '=') {
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

    function isIndexOnlyUsedWithArray(
      body: TSESTree.Statement,
      indexVar: TSESLint.Scope.Variable,
      arrayExpression: TSESTree.Expression,
    ): boolean {
      const arrayText = context.sourceCode.getText(arrayExpression);
      return indexVar.references.every(reference => {
        const id = reference.identifier;
        return (
          !contains(body, id) ||
          (id.parent.type === AST_NODE_TYPES.MemberExpression &&
            id.parent.object.type !== AST_NODE_TYPES.ThisExpression &&
            id.parent.property === id &&
            context.sourceCode.getText(id.parent.object) === arrayText &&
            !isAssignee(id.parent))
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

        const [indexVar] = context.sourceCode.getDeclaredVariables(node.init);
        if (
          isIncrement(node.update, indexName) &&
          isIndexOnlyUsedWithArray(node.body, indexVar, arrayExpression)
        ) {
          context.report({
            node,
            messageId: 'preferForOf',
            fix(fixer) {
              const sourceCode = context.sourceCode;
              const arrayText = sourceCode.getText(arrayExpression);
              const scope = sourceCode.getScope(node);
              const elementName = getSafeName('value', scope);
              const fixes: TSESLint.RuleFix[] = [];

              fixes.push(
                fixer.replaceTextRange(
                  [node.range[0], node.body.range[0]],
                  `for (const ${elementName} of ${arrayText}) `,
                ),
              );

              for (const reference of indexVar.references) {
                const id = reference.identifier;

                if (!contains(node.body, id)) {
                  continue;
                }

                if (
                  id.parent.type === AST_NODE_TYPES.MemberExpression &&
                  id.parent.property === id &&
                  id.parent.computed
                ) {
                  fixes.push(fixer.replaceText(id.parent, elementName));
                }
              }

              return fixes;
            },
          });
        }
      },
    };
  },
});
