import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import type {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
} from '../util';
import { createRule } from '../util';

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
      recommended: false,
      extendsBaseRule: true,
    },
    // TODO: this rule has only had messages since v7.0 - remove this when we remove support for v6
    messages: baseRule.meta.messages ?? {
      unexpectedThis: "Unexpected 'this'.",
    },
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
        // baseRule's work
        rules.FunctionDeclaration?.(node);
      },
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void {
        thisIsValidStack.pop();
        // baseRule's work
        rules['FunctionDeclaration:exit']?.(node);
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        thisIsValidStack.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
        // baseRule's work
        rules.FunctionExpression?.(node);
      },
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void {
        thisIsValidStack.pop();
        // baseRule's work
        rules['FunctionExpression:exit']?.(node);
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
