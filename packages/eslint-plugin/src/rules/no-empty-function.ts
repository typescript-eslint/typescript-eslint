import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-empty-function';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = util.deepMerge(
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
  {
    properties: {
      allow: {
        items: {
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
          ],
        },
      },
    },
  },
);

export default util.createRule<Options, MessageIds>({
  name: 'no-empty-function',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow empty functions',
      category: 'Best Practices',
      recommended: 'error',
      extendsBaseRule: true,
    },
    schema: [schema],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      allow: [],
    },
  ],
  create(context, [{ allow = [] }]) {
    const rules = baseRule.create(context);

    const isAllowedProtectedConstructors = allow.includes(
      'protected-constructors',
    );
    const isAllowedPrivateConstructors = allow.includes('private-constructors');
    const isAllowedDecoratedFunctions = allow.includes('decoratedFunctions');

    /**
     * Check if the method body is empty
     * @param node the node to be validated
     * @returns true if the body is empty
     * @private
     */
    function isBodyEmpty(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return !node.body || node.body.body.length === 0;
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
      return node.params?.some(
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
        parent?.type === AST_NODE_TYPES.MethodDefinition &&
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
      node: TSESTree.FunctionExpression | TSESTree.FunctionDeclaration,
    ): boolean {
      if (isAllowedDecoratedFunctions && isBodyEmpty(node)) {
        const decorators =
          node.parent?.type === AST_NODE_TYPES.MethodDefinition
            ? node.parent.decorators
            : undefined;
        return !!decorators && !!decorators.length;
      }

      return false;
    }

    return {
      ...rules,
      FunctionExpression(node): void {
        if (
          isAllowedEmptyConstructor(node) ||
          isAllowedEmptyDecoratedFunctions(node)
        ) {
          return;
        }

        rules.FunctionExpression(node);
      },
      FunctionDeclaration(node): void {
        if (isAllowedEmptyDecoratedFunctions(node)) {
          return;
        }

        rules.FunctionDeclaration(node);
      },
    };
  },
});
