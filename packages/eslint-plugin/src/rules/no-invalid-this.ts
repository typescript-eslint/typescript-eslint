import { TSESTree } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-invalid-this';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
  deepMerge,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = deepMerge(
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
  {
    properties: {
      capIsConstructor: {
        type: 'boolean',
        default: true,
      },
    },
  },
);

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
    messages: baseRule.meta.messages,
    schema: [schema],
  },
  defaultOptions: [{ capIsConstructor: true }],
  create(context) {
    const rules = baseRule.create(context);
    let argList: Array<string[]> = [];

    return {
      ...rules,
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        const names = node?.params.map(
          (param: TSESTree.Identifier) => param?.name,
        );
        argList.push(names);
        // baseRule's work
        rules.FunctionDeclaration(node);
      },
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void {
        argList.pop();
        // baseRule's work
        rules['FunctionDeclaration:exit'](node);
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        const names = node?.params.map(
          (param: TSESTree.Identifier) => param.name,
        );
        argList.push(names);
        // baseRule's work
        rules.FunctionExpression(node);
      },
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void {
        argList.pop();
        // baseRule's work
        rules['FunctionExpression:exit'](node);
      },
      ThisExpression(node: TSESTree.ThisExpression) {
        const lastFnArg = argList[argList.length - 1];

        if (lastFnArg?.some((name: string) => name === 'this')) {
          return;
        }

        // baseRule's work
        rules.ThisExpression(node);
      },
    };
  },
});
