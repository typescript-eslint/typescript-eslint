import * as util from '../util';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';

type MessageIds = 'noReturnType' | 'untypedParameter';

type Options = [
  { ignoredMethods: string[] }
  ];

export default util.createRule<Options, MessageIds>({
  name: 'no-unused-public-signature',
  meta: {
    docs: {
      description:
        'Requires that all public method arguments and return type will be explicitly typed',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noReturnType: 'Public method has no return type',
      untypedParameter: 'Public method parameters should be typed',
    },
    schema: [
      {
        allowAdditionalProperties: false,
        properties: {
          ignoredMethods: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [{ignoredMethods: []}],
  create(context, [{ignoredMethods}]) {
    function isPublicMethod(node: TSESTree.MethodDefinition) {
      return node.accessibility === 'public' || !node.accessibility;
    }

    function isIgnoredMethod(node: TSESTree.MethodDefinition, ignoredMethods: string[]) {
      return (ignoredMethods.includes((node.key as TSESTree.Identifier).name))
    }

    function isParamTyped(node: TSESTree.Identifier) {
      return (
        node.typeAnnotation &&
        node.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSAnyKeyword
      );
    }

    function isReturnTyped(node: TSESTree.TSTypeAnnotation | undefined) {
      if (!node) {
        return false;
      }
      return (
        node.typeAnnotation &&
        node.typeAnnotation.type !== AST_NODE_TYPES.TSAnyKeyword
      );
    }

    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        if (isPublicMethod(node) && !isIgnoredMethod(node, ignoredMethods)) {
          const paramIdentifiers = node.value.params.filter(
            param => param.type === AST_NODE_TYPES.Identifier,
          ) as TSESTree.Identifier[];
          const identifiersHaveTypes = paramIdentifiers.every(isParamTyped);
          if (!identifiersHaveTypes) {
            context.report({
              node,
              messageId: 'untypedParameter',
              data: {},
            });
          }

          if (!isReturnTyped(node.value.returnType)) {
            context.report({
              node,
              messageId: 'noReturnType',
              data: {},
            });
          }
        }
      },
    };
  },
});
