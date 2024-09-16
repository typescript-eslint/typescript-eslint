import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, nullThrows, NullThrowsReasons } from '../util';

type MessageIds = 'preferConstructor' | 'preferTypeAnnotation';
type Options = ['constructor' | 'type-annotation'];

export default createRule<Options, MessageIds>({
  create(context, [mode]) {
    return {
      'VariableDeclarator,PropertyDefinition,:matches(FunctionDeclaration,FunctionExpression) > AssignmentPattern'(
        node:
          | TSESTree.AssignmentPattern
          | TSESTree.PropertyDefinition
          | TSESTree.VariableDeclarator,
      ): void {
        function getLHSRHS(): [
          TSESTree.BindingName | TSESTree.PropertyDefinition,
          TSESTree.Expression | null,
        ] {
          switch (node.type) {
            case AST_NODE_TYPES.VariableDeclarator:
              return [node.id, node.init];
            case AST_NODE_TYPES.PropertyDefinition:
              return [node, node.value];
            case AST_NODE_TYPES.AssignmentPattern:
              return [node.left, node.right];
            default:
              throw new Error(
                `Unhandled node type: ${(node as { type: string }).type}`,
              );
          }
        }
        const [lhsName, rhs] = getLHSRHS();
        const lhs = lhsName.typeAnnotation?.typeAnnotation;

        if (
          !rhs ||
          rhs.type !== AST_NODE_TYPES.NewExpression ||
          rhs.callee.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }
        if (
          lhs &&
          (lhs.type !== AST_NODE_TYPES.TSTypeReference ||
            lhs.typeName.type !== AST_NODE_TYPES.Identifier ||
            lhs.typeName.name !== rhs.callee.name)
        ) {
          return;
        }
        if (mode === 'type-annotation') {
          if (!lhs && rhs.typeArguments) {
            const { callee, typeArguments } = rhs;
            const typeAnnotation =
              context.sourceCode.getText(callee) +
              context.sourceCode.getText(typeArguments);
            context.report({
              fix(fixer) {
                function getIDToAttachAnnotation():
                  | TSESTree.Node
                  | TSESTree.Token {
                  if (node.type !== AST_NODE_TYPES.PropertyDefinition) {
                    return lhsName;
                  }
                  if (!node.computed) {
                    return node.key;
                  }
                  // If the property's computed, we have to attach the
                  // annotation after the square bracket, not the enclosed expression
                  return nullThrows(
                    context.sourceCode.getTokenAfter(node.key),
                    NullThrowsReasons.MissingToken(']', 'key'),
                  );
                }
                return [
                  fixer.remove(typeArguments),
                  fixer.insertTextAfter(
                    getIDToAttachAnnotation(),
                    `: ${typeAnnotation}`,
                  ),
                ];
              },
              messageId: 'preferTypeAnnotation',
              node,
            });
          }
          return;
        }

        if (lhs?.typeArguments && !rhs.typeArguments) {
          const hasParens =
            context.sourceCode.getTokenAfter(rhs.callee)?.value === '(';
          const extraComments = new Set(
            context.sourceCode.getCommentsInside(lhs.parent),
          );
          context.sourceCode
            .getCommentsInside(lhs.typeArguments)
            .forEach(c => extraComments.delete(c));
          context.report({
            *fix(fixer) {
              yield fixer.remove(lhs.parent);
              for (const comment of extraComments) {
                yield fixer.insertTextAfter(
                  rhs.callee,
                  context.sourceCode.getText(comment),
                );
              }
              yield fixer.insertTextAfter(
                rhs.callee,
                context.sourceCode.getText(lhs.typeArguments),
              );
              if (!hasParens) {
                yield fixer.insertTextAfter(rhs.callee, '()');
              }
            },
            messageId: 'preferConstructor',
            node,
          });
        }
      },
    };
  },
  defaultOptions: ['constructor'],
  meta: {
    docs: {
      description:
        'Enforce specifying generic type arguments on type annotation or constructor name of a constructor call',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      preferConstructor:
        'The generic type arguments should be specified as part of the constructor type arguments.',
      preferTypeAnnotation:
        'The generic type arguments should be specified as part of the type annotation.',
    },
    schema: [
      {
        enum: ['type-annotation', 'constructor'],
        type: 'string',
      },
    ],
    type: 'suggestion',
  },
  name: 'consistent-generic-constructors',
});
