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
      validUnionMembers.push(AST_NODE_TYPES.TSTypeReference);
    }

    /*
     * isValidGenericTypeArgument:
     */

    function isValidGenericTypeArgument(
      node: TSESTree.TSTypeReference,
    ): boolean | string {
      // only matches T<..., void, ...>
      if (
        !(
          node.typeParameters?.type ===
            AST_NODE_TYPES.TSTypeParameterInstantiation &&
          node.typeParameters?.params
            .map(param => param.type)
            .includes(AST_NODE_TYPES.TSVoidKeyword)
        )
      ) {
        return true;
      }

      if (Array.isArray(allowInGenericTypeArguments)) {
        const sourceCode = context.getSourceCode();
        const fullyQualifiedName = sourceCode
          .getText(node.typeName)
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
          return false;
        }

        return true;
      }
      return allowInGenericTypeArguments;
    }

    /*
     * isValidUnionType: checks that each member of the union is either a void,
     * never, or Promise<void>
     */

    function isValidUnionType(node: TSESTree.TSUnionType): boolean {
      return node.types.every(
        member =>
          validUnionMembers.includes(member.type) &&
          (member.type !== AST_NODE_TYPES.TSTypeReference ||
            isValidGenericTypeArgument(member)),
      );
    }

    return {
      TSVoidKeyword(node: TSESTree.TSVoidKeyword): void {
        /* istanbul ignore next */
        if (!node.parent?.parent) {
          return;
        }

        // handling void inside union
        if (
          node.parent.type === AST_NODE_TYPES.TSUnionType &&
          isValidUnionType(node.parent)
        ) {
          return;
        }

        // handling T<void> inside union
        if (
          node.parent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
          node.parent.parent.type === AST_NODE_TYPES.TSTypeReference &&
          node.parent.parent.parent?.type === AST_NODE_TYPES.TSUnionType &&
          isValidUnionType(node.parent.parent.parent)
        ) {
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
          node.parent.parent.type === AST_NODE_TYPES.TSTypeReference
        ) {
          isValidGenericTypeArgument(node.parent.parent);
        } else {
          context.report({
            messageId: allowInGenericTypeArguments
              ? 'invalidVoidNotReturnOrGeneric'
              : 'invalidVoidNotReturn',
            node,
          });
        }
      },
    };
  },
});
