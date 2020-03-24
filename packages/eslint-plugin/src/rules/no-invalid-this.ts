import baseRule from 'eslint/lib/rules/no-invalid-this';
import astUtils from 'eslint/lib/rules/utils/ast-utils';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type CheckingContextNode =
  | TSESTree.Program
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

interface CheckingContext {
  init: boolean;
  node: CheckingContextNode;
  valid: boolean;
}

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-invalid-this',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `this` keywords outside of classes or class-like objects',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noInvalidThis: "Unexpected 'this'.",
    },
    schema: baseRule.meta.schema,
  },
  defaultOptions: [
    {
      capIsConstructor: true,
    },
  ],
  create(context, [options]) {
    /** Modified version of "eslint/lib/rules/no-invalid-this" */

    const capIsConstructor = options.capIsConstructor !== false;
    const stack: CheckingContext[] = [],
      sourceCode = context.getSourceCode();

    /**
     * Gets the current checking context.
     *
     * The return value has a flag that whether or not `this` keyword is valid.
     * The flag is initialized when got at the first time.
     * @returns {{valid: boolean}}
     *   an object which has a flag that whether or not `this` keyword is valid.
     */
    function getCurrentCheckingContext(): CheckingContext {
      const current = stack[stack.length - 1];

      if (!current.init) {
        current.init = true;
        current.valid = !astUtils.isDefaultThisBinding(
          current.node,
          sourceCode,
          { capIsConstructor },
        );
      }
      return current;
    }

    /**
     * Pushes new checking context into the stack.
     *
     * The checking context is not initialized yet.
     * Because most functions don't have `this` keyword.
     * When `this` keyword was found, the checking context is initialized.
     * @param {ASTNode} node A function node that was entered.
     * @returns {void}
     */
    function enterFunction(node: CheckingContextNode): void {
      // `this` can be invalid only under strict mode.
      stack.push({
        init: !context.getScope().isStrict,
        node,
        valid: true,
      });
    }

    /**
     * Pushes new checking context into the stack.
     *
     * The checking context is not initialized yet.
     * Because most functions don't have `this` keyword.
     * When `this` keyword was found, the checking context is initialized.
     * @param {ASTNode} node A function node that was entered.
     * @returns {void}
     */
    function enterArrowFunction(node: CheckingContextNode): void {
      // `this` can only be valid inside class methods.
      stack.push({
        init: true,
        node,
        valid: node.parent?.type === AST_NODE_TYPES.ClassProperty,
      });
    }

    /**
     * Pops the current checking context from the stack.
     * @returns {void}
     */
    function exitFunction(): void {
      stack.pop();
    }

    return {
      /*
       * `this` is invalid only under strict mode.
       * Modules is always strict mode.
       */
      Program(node): void {
        const scope = context.getScope(),
          features = context.parserOptions.ecmaFeatures ?? {};

        stack.push({
          init: true,
          node,
          valid: !(
            scope.isStrict ||
            node.sourceType === 'module' ||
            (features.globalReturn && scope.childScopes[0].isStrict)
          ),
        });
      },

      'Program:exit'(): void {
        stack.pop();
      },

      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,

      // Introduce handling of ArrowFunctionExpressions not present in baseRule
      ArrowFunctionExpression: enterArrowFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // Reports if `this` of the current context is invalid.
      ThisExpression(node): void {
        const current = getCurrentCheckingContext();
        if (current && !current.valid) {
          context.report({ node, messageId: 'noInvalidThis' });
        }
      },
    };
  },
});
