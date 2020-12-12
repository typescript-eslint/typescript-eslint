import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-invalid-this';
import {
  InferOptionsTypeFromRule,
  createRule,
  InferMessageIdsTypeFromRule,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'no-invalid-this',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `this` keywords outside of classes or class-like objects',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages ?? {
      unexpectedThis: "Unexpected 'this'.",
    },
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
      ClassProperty(): void {
        thisIsValidStack.push(true);
      },
      'ClassProperty:exit'(): void {
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
        rules.FunctionDeclaration(node);
      },
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void {
        thisIsValidStack.pop();
        // baseRule's work
        rules['FunctionDeclaration:exit'](node);
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        thisIsValidStack.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
        // baseRule's work
        rules.FunctionExpression(node);
      },
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void {
        thisIsValidStack.pop();
        // baseRule's work
        rules['FunctionExpression:exit'](node);
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
