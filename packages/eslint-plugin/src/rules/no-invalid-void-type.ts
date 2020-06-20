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
    const validUnionMembers: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSVoidKeyword,
      AST_NODE_TYPES.TSNeverKeyword,
    ];

    if (allowInGenericTypeArguments === true) {
      validParents.push(AST_NODE_TYPES.TSTypeParameterInstantiation);
    }

    /**
     * @brief check if the given void keyword is used as a valid generic type
     *
     * reports if the type parametrized by void is not in the whitelist, or
     * allowInGenericTypeArguments is false.
     * no-op if the given void keyword is not used as generic type
     */
    function checkGenericTypeArgument(node: TSESTree.TSVoidKeyword): void {
      // only matches T<..., void, ...>
      // extra check for precaution
      /* istanbul ignore next */
      if (
        node.parent?.type !== AST_NODE_TYPES.TSTypeParameterInstantiation ||
        node.parent.parent?.type !== AST_NODE_TYPES.TSTypeReference
      ) {
        return;
      }

      // check whitelist
      if (Array.isArray(allowInGenericTypeArguments)) {
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

      if (!allowInGenericTypeArguments) {
        context.report({
          messageId: 'invalidVoidNotReturn',
          node,
        });
      }
    }

    /**
     * @brief checks that a union containing void is valid
     * @return true if every member of the union is specified as a valid type in
     * validUnionMembers, or is a valid generic type parametrized by void
     */
    function isValidUnionType(node: TSESTree.TSUnionType): boolean {
      return node.types.every(
        member =>
          validUnionMembers.includes(member.type) ||
          // allows any T<..., void, ...> here, checked by checkGenericTypeArgument
          (member.type === AST_NODE_TYPES.TSTypeReference &&
            member.typeParameters?.type ===
              AST_NODE_TYPES.TSTypeParameterInstantiation &&
            member.typeParameters?.params
              .map(param => param.type)
              .includes(AST_NODE_TYPES.TSVoidKeyword)),
      );
    }

    return {
      TSVoidKeyword(node: TSESTree.TSVoidKeyword): void {
        /* istanbul ignore next */
        if (!node.parent?.parent) {
          return;
        }

        // checks T<..., void, ...> against specification of allowInGenericArguments option
        if (
          node.parent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
          node.parent.parent.type === AST_NODE_TYPES.TSTypeReference
        ) {
          checkGenericTypeArgument(node);
          return;
        }

        // union w/ void must contain types from validUnionMembers, or a valid generic void type
        if (
          node.parent.type === AST_NODE_TYPES.TSUnionType &&
          isValidUnionType(node.parent)
        ) {
          return;
        }

        // default cases
        if (
          validParents.includes(node.parent.type) &&
          !invalidGrandParents.includes(node.parent.parent.type)
        ) {
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
