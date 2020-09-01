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
        'disallow `this` keywords outside of classes or class-like objects',
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
    const argList: boolean[] = [];

    return {
      ...rules,
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        argList.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
        // baseRule's work
        rules.FunctionDeclaration(node);
      },
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void {
        argList.pop();
        // baseRule's work
        rules['FunctionDeclaration:exit'](node);
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        argList.push(
          node.params.some(
            param =>
              param.type === AST_NODE_TYPES.Identifier && param.name === 'this',
          ),
        );
        // baseRule's work
        rules.FunctionExpression(node);
      },
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void {
        argList.pop();
        // baseRule's work
        rules['FunctionExpression:exit'](node);
      },
      ThisExpression(node: TSESTree.ThisExpression): void {
        const lastFnArg = argList[argList.length - 1];

        if (lastFnArg) {
          return;
        }

        // baseRule's work
        rules.ThisExpression(node);
      },
    };
  },
});
