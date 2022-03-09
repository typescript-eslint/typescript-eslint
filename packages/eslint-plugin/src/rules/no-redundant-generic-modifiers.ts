import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

function isArrowFunctionTypeParameter(node: TSESTree.TSTypeParameter): boolean {
  return (
    node.parent?.type === AST_NODE_TYPES.TSTypeParameterDeclaration &&
    node.parent.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

export default util.createRule({
  name: 'no-redundant-generic-modifiers',
  meta: {
    docs: {
      description:
        'Disallows generic type parameter modifiers that do nothing.',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferDefault:
        'Prefer the shorter `= unknown` default for arrow function type parameters in .tsx files.',
      redundantConstraint:
        'This `extends unknown` constraint does nothing because all type parameters extend unknown.',
      redundantDefault:
        'This `= unknown` default does nothing because type parameters default to unknown.',
    },
    schema: [
      {
        additionalProperties: false,
        type: 'object',
        properties: {
          preferInJsx: {
            default: 'default',
            enum: ['constraint', 'default'],
          },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      preferInJsx: 'default',
    },
  ],
  create(context) {
    const inJsx = util.isJsxFile(context.getFilename());

    return {
      TSTypeParameter(node): void {
        const { constraint, default: typeDefault } = node;

        if (constraint?.type === AST_NODE_TYPES.TSUnknownKeyword) {
          if (inJsx && isArrowFunctionTypeParameter(node)) {
            context.report({
              fix: fixer =>
                fixer.replaceTextRange(
                  [node.name.range[1], constraint.range[1]],
                  ' = unknown',
                ),
              messageId: 'preferDefault',
              node: constraint,
            });
          } else {
            context.report({
              fix: fixer =>
                fixer.removeRange([node.name.range[1], constraint.range[1]]),
              messageId: 'redundantConstraint',
              node: constraint,
            });
          }
        }

        if (
          typeDefault?.type === AST_NODE_TYPES.TSUnknownKeyword &&
          !(inJsx && isArrowFunctionTypeParameter(node))
        ) {
          context.report({
            fix: fixer =>
              fixer.removeRange([
                node.constraint?.range[1] ?? node.name.range[1],
                typeDefault.range[1],
              ]),
            messageId: 'redundantDefault',
            node: typeDefault,
          });
        }
      },
    };
  },
});
