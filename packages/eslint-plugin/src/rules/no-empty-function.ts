import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

const baseRule = getESLintCoreRule('no-empty-function');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = util.deepMerge(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- https://github.com/microsoft/TypeScript/issues/17002
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
            'overrideMethods',
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
      recommended: 'error',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
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

    function isAllowedEmptyOverrideMethod(
      node: TSESTree.FunctionExpression,
    ): boolean {
      if (isAllowedOverrideMethods && isBodyEmpty(node)) {
        return (
          node.parent?.type === AST_NODE_TYPES.MethodDefinition &&
          node.parent.override === true
        );
      }
      return false;
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
      FunctionDeclaration(node): void {
        if (isAllowedEmptyDecoratedFunctions(node)) {
          return;
        }

        rules.FunctionDeclaration(node);
      },
    };
  },
});
