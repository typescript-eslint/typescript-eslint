import type { TSESTree } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule, deepMerge } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-empty-function');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const defaultOptions: Options = [
  {
    allow: [],
  },
];

const schema = deepMerge(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- https://github.com/microsoft/TypeScript/issues/17002
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
  {
    properties: {
      allow: {
        description:
          'Locations and kinds of functions that are allowed to be empty.',
        items: {
          type: 'string',
          enum: [
            'functions',
            'arrowFunctions',
            'generatorFunctions',
            'methods',
            'generatorMethods',
            'getters',
            'setters',
            'constructors',
            'private-constructors',
            'protected-constructors',
            'asyncFunctions',
            'asyncMethods',
            'decoratedFunctions',
            'overrideMethods',
          ],
        },
      },
    },
  },
) as unknown as JSONSchema4;

export default createRule<Options, MessageIds>({
  name: 'no-empty-function',
  meta: {
    type: 'suggestion',
    defaultOptions,
    docs: {
      extendsBaseRule: true,
      recommended: 'stylistic',
      description: 'Disallow empty functions',
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: [schema],
  },
  defaultOptions,
  create(context, [{ allow = [] }]) {
    const rules = baseRule.create(context);

    const isAllowedProtectedConstructors = allow.includes(
      'protected-constructors',
    );
    const isAllowedPrivateConstructors = allow.includes('private-constructors');
    const isAllowedDecoratedFunctions = allow.includes('decoratedFunctions');
    const isAllowedOverrideMethods = allow.includes('overrideMethods');

    /**
     * Check if the method body is empty
     * @param node the node to be validated
     * @returns true if the body is empty
     * @private
     */
    function isBodyEmpty(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return node.body.body.length === 0;
    }

    /**
     * Check if method has parameter properties
     * @param node the node to be validated
     * @returns true if the body has parameter properties
     * @private
     */
    function hasParameterProperties(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return node.params.some(
        param => param.type === AST_NODE_TYPES.TSParameterProperty,
      );
    }

    /**
     * @param node the node to be validated
     * @returns true if the constructor is allowed to be empty
     * @private
     */
    function isAllowedEmptyConstructor(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      const parent = node.parent;
      if (
        isBodyEmpty(node) &&
        parent.type === AST_NODE_TYPES.MethodDefinition &&
        parent.kind === 'constructor'
      ) {
        const { accessibility } = parent;

        return (
          // allow protected constructors
          (accessibility === 'protected' && isAllowedProtectedConstructors) ||
          // allow private constructors
          (accessibility === 'private' && isAllowedPrivateConstructors) ||
          // allow constructors which have parameter properties
          hasParameterProperties(node)
        );
      }

      return false;
    }

    /**
     * @param node the node to be validated
     * @returns true if a function has decorators
     * @private
     */
    function isAllowedEmptyDecoratedFunctions(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      if (isAllowedDecoratedFunctions && isBodyEmpty(node)) {
        const decorators =
          node.parent.type === AST_NODE_TYPES.MethodDefinition
            ? node.parent.decorators
            : undefined;
        return !!decorators && !!decorators.length;
      }

      return false;
    }

    function isAllowedEmptyOverrideMethod(
      node: TSESTree.FunctionExpression,
    ): boolean {
      return (
        isAllowedOverrideMethods &&
        isBodyEmpty(node) &&
        node.parent.type === AST_NODE_TYPES.MethodDefinition &&
        node.parent.override
      );
    }

    return {
      ...rules,
      FunctionExpression(node): void {
        if (
          isAllowedEmptyConstructor(node) ||
          isAllowedEmptyDecoratedFunctions(node) ||
          isAllowedEmptyOverrideMethod(node)
        ) {
          return;
        }

        rules.FunctionExpression(node);
      },
    };
  },
});
