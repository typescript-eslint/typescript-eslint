import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getTextWithParentheses,
  isAssignee,
  nullThrows,
  NullThrowsReasons,
} from '../util';

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
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
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
        const node = id.parent;
        return (
          !contains(body, id) ||
          (node.type === AST_NODE_TYPES.MemberExpression &&
            node.object.type !== AST_NODE_TYPES.ThisExpression &&
            node.property === id &&
            context.sourceCode.getText(node.object) === arrayText &&
            !isAssignee(node))
        );
      });
    }

    // Names declared or referenced anywhere in the file. A fix only uses a
    // name outside this set, so it can't shadow or capture another variable.
    let namesInFile: Set<string> | undefined;
    // Fixes in one pass can't see each other's names, so each fix gets a new
    // suffix. It only counts up, so a taken name is skipped once per file.
    let nameSuffix = 0;

    function getElementName(): string {
      namesInFile ??= new Set(
        nullThrows(
          context.sourceCode.scopeManager,
          'Missing required scope manager',
        ).scopes.flatMap(scope => [
          ...scope.variables.map(variable => variable.name),
          ...scope.references.map(reference => reference.identifier.name),
        ]),
      );

      let name: string;
      do {
        name = nameSuffix === 0 ? 'value' : `value${nameSuffix}`;
        nameSuffix++;
      } while (namesInFile.has(name));
      return name;
    }

    return {
      // Outer loops are visited first so they get the lower suffix.
      ForStatement(node: TSESTree.ForStatement): void {
        if (!isSingleVariableDeclaration(node.init)) {
          return;
        }

        const declarator = node.init.declarations[0] as
          TSESTree.VariableDeclarator | undefined;
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
            *fix(fixer) {
              // The fix deletes the index, so it can't be used in code the
              // fix keeps: outside a `var` loop, or in the array expression.
              if (
                indexVar.references.some(
                  reference =>
                    !contains(node, reference.identifier) ||
                    contains(arrayExpression, reference.identifier),
                )
              ) {
                return;
              }

              const name = getElementName();
              yield fixer.replaceTextRange(
                [
                  node.range[0],
                  nullThrows(
                    context.sourceCode.getTokenBefore(node.body),
                    NullThrowsReasons.MissingToken(')', 'for loop'),
                  ).range[1],
                ],
                `for (const ${name} of ${getTextWithParentheses(
                  context.sourceCode,
                  arrayExpression,
                )})`,
              );
              for (const reference of indexVar.references) {
                if (contains(node.body, reference.identifier)) {
                  yield fixer.replaceText(reference.identifier.parent, name);
                }
              }
            },
          });
        }
      },
    };
  },
});
