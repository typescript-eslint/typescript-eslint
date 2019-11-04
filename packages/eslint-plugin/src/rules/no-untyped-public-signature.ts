import * as util from '../util';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'noReturnType' | 'untypedParameter';

type Options = [{ ignoredMethods: string[] }];

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
  defaultOptions: [{ ignoredMethods: [] }],
  create(context, [options]) {
    const ignoredMethods = new Set(options.ignoredMethods);

    function isPublicMethod(
      node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
    ): boolean {
      return node.accessibility === 'public' || !node.accessibility;
    }

    function isIgnoredMethod(
      node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
      ignoredMethods: Set<string>,
    ): boolean {
      if (
        node.key.type === AST_NODE_TYPES.Literal &&
        typeof node.key.value === 'string'
      ) {
        return ignoredMethods.has(node.key.value);
      }
      if (
        node.key.type === AST_NODE_TYPES.TemplateLiteral &&
        node.key.expressions.length === 0
      ) {
        return ignoredMethods.has(node.key.quasis[0].value.raw);
      }
      if (node.key.type === AST_NODE_TYPES.Identifier && !node.computed) {
        return ignoredMethods.has(node.key.name);
      }

      return false;
    }

    function isParamTyped(node: TSESTree.Identifier): boolean {
      return (
        !!node.typeAnnotation &&
        node.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSAnyKeyword
      );
    }

    function isReturnTyped(
      node: TSESTree.TSTypeAnnotation | undefined,
    ): boolean {
      if (!node) {
        return false;
      }
      return (
        node.typeAnnotation &&
        node.typeAnnotation.type !== AST_NODE_TYPES.TSAnyKeyword
      );
    }

    return {
      'TSAbstractMethodDefinition, MethodDefinition'(
        node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
      ): void {
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
