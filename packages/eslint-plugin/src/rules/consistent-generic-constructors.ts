import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  isReferenceToGlobalFunction,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type MessageIds = 'preferConstructor' | 'preferTypeAnnotation';
export type Options = ['constructor' | 'type-annotation'];

const builtInArrays = new Set([
  'Float32Array',
  'Float64Array',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
]);

export default createRule<Options, MessageIds>({
  name: 'consistent-generic-constructors',
  meta: {
    type: 'suggestion',
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
        type: 'string',
        description: 'Which constructor call syntax to prefer.',
        enum: ['type-annotation', 'constructor'],
      },
    ],
  },
  defaultOptions: ['constructor'],
  create(context, [mode]) {
    return {
      'VariableDeclarator,PropertyDefinition,AccessorProperty,:matches(FunctionDeclaration,FunctionExpression) > AssignmentPattern'(
        node:
          | TSESTree.AccessorProperty
          | TSESTree.AssignmentPattern
          | TSESTree.PropertyDefinition
          | TSESTree.VariableDeclarator,
      ): void {
        function getLHSRHS(): [
          (
            | TSESTree.AccessorProperty
            | TSESTree.BindingName
            | TSESTree.PropertyDefinition
          ),
          TSESTree.Expression | null,
        ] {
          switch (node.type) {
            case AST_NODE_TYPES.VariableDeclarator:
              return [node.id, node.init];
            case AST_NODE_TYPES.PropertyDefinition:
            case AST_NODE_TYPES.AccessorProperty:
              return [node, node.value];
            case AST_NODE_TYPES.AssignmentPattern:
              return [node.left, node.right];
            default:
              throw new Error(
                `Unhandled node type: ${(node as { type: string }).type}`,
              );
          }
        }

        function isBuiltInArray(typeName: TSESTree.Identifier) {
          return (
            builtInArrays.has(typeName.name) &&
            isReferenceToGlobalFunction(
              typeName.name,
              typeName,
              context.sourceCode,
            )
          );
        }

        const [lhsName, rhs] = getLHSRHS();
        const lhs = lhsName.typeAnnotation?.typeAnnotation;

        if (
          rhs?.type !== AST_NODE_TYPES.NewExpression ||
          rhs.callee.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }
        if (
          lhs &&
          (lhs.type !== AST_NODE_TYPES.TSTypeReference ||
            lhs.typeName.type !== AST_NODE_TYPES.Identifier ||
            lhs.typeName.name !== rhs.callee.name ||
            isBuiltInArray(lhs.typeName))
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
              node,
              messageId: 'preferTypeAnnotation',
              fix(fixer) {
                function getIDToAttachAnnotation():
                  | TSESTree.Node
                  | TSESTree.Token {
                  if (
                    node.type !== AST_NODE_TYPES.PropertyDefinition &&
                    node.type !== AST_NODE_TYPES.AccessorProperty
                  ) {
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
            });
          }
          return;
        }

        const isolatedDeclarations = context.parserOptions.isolatedDeclarations;
        if (!isolatedDeclarations && lhs?.typeArguments && !rhs.typeArguments) {
          const hasParens =
            context.sourceCode.getTokenAfter(rhs.callee)?.value === '(';
          const extraComments = new Set(
            context.sourceCode.getCommentsInside(lhs.parent),
          );
          context.sourceCode
            .getCommentsInside(lhs.typeArguments)
            .forEach(c => extraComments.delete(c));
          context.report({
            node,
            messageId: 'preferConstructor',
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
          });
        }
      },
    };
  },
});
