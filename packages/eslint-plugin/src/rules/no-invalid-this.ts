import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-invalid-this');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'no-invalid-this',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `this` keywords outside of classes or class-like objects',
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages,
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
  },
  defaultOptions: [{ capIsConstructor: true }],
  create(context) {
    const rules = baseRule.create(context);

    /**
     * Since function definitions can be nested we use a stack storing if "this" is valid in the current context.
     *
     * Example:
     *
     * function a(this: number) { // valid "this"
     *     function b() {
     *         console.log(this); // invalid "this"
     *     }
     * }
     *
     * When parsing the function declaration of "a" the stack will be: [true]
     * When parsing the function declaration of "b" the stack will be: [true, false]
     */
    const thisIsValidStack: boolean[] = [];

    return {
      ...rules,
      PropertyDefinition(): void {
        thisIsValidStack.push(true);
      },
      'PropertyDefinition:exit'(): void {
        thisIsValidStack.pop();
      },
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        thisIsValidStack.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
      },
      'FunctionDeclaration:exit'(): void {
        thisIsValidStack.pop();
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        thisIsValidStack.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
      },
      'FunctionExpression:exit'(): void {
        thisIsValidStack.pop();
      },
      ThisExpression(node: TSESTree.ThisExpression): void {
        const thisIsValidHere = thisIsValidStack[thisIsValidStack.length - 1];

        if (thisIsValidHere) {
          return;
        }

        // baseRule's work
        rules.ThisExpression(node);
      },
    };
  },
});
