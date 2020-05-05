import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Options {
  allowInGenericTypeArguments: boolean | string[];
}

type MessageIds =
  | 'invalidVoidForGeneric'
  | 'invalidVoidNotReturnOrGeneric'
  | 'invalidVoidNotReturn';

export default util.createRule<[Options], MessageIds>({
  name: 'no-invalid-void-type',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows usage of `void` type outside of generic or return types',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      invalidVoidForGeneric:
        '{{ generic }} may not have void as a type variable',
      invalidVoidNotReturnOrGeneric:
        'void is only valid as a return type or generic type variable',
      invalidVoidNotReturn: 'void is only valid as a return type',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInGenericTypeArguments: {
            oneOf: [
              { type: 'boolean' },
              {
                type: 'array',
                items: { type: 'string' },
                minLength: 1,
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allowInGenericTypeArguments: true }],
  create(context, [{ allowInGenericTypeArguments }]) {
    const validParents: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSTypeAnnotation, //
    ];
    const invalidGrandParents: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSPropertySignature,
      AST_NODE_TYPES.CallExpression,
      AST_NODE_TYPES.ClassProperty,
      AST_NODE_TYPES.Identifier,
    ];

    if (allowInGenericTypeArguments === true) {
      validParents.push(AST_NODE_TYPES.TSTypeParameterInstantiation);
    }

    return {
      TSVoidKeyword(node: TSESTree.TSVoidKeyword): void {
        /* istanbul ignore next */
        if (!node.parent?.parent) {
          return;
        }

        if (
          validParents.includes(node.parent.type) &&
          !invalidGrandParents.includes(node.parent.parent.type)
        ) {
          return;
        }

        if (
          node.parent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
          node.parent.parent.type === AST_NODE_TYPES.TSTypeReference &&
          Array.isArray(allowInGenericTypeArguments)
        ) {
          const sourceCode = context.getSourceCode();
          const fullyQualifiedName = sourceCode
            .getText(node.parent.parent.typeName)
            .replace(/ /gu, '');

          if (
            !allowInGenericTypeArguments
              .map(s => s.replace(/ /gu, ''))
              .includes(fullyQualifiedName)
          ) {
            context.report({
              messageId: 'invalidVoidForGeneric',
              data: { generic: fullyQualifiedName },
              node,
            });
          }

          return;
        }

        context.report({
          messageId: allowInGenericTypeArguments
            ? 'invalidVoidNotReturnOrGeneric'
            : 'invalidVoidNotReturn',
          node,
        });
      },
    };
  },
});
