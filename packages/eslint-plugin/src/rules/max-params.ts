import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

type FunctionLike =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

type FunctionRuleListener<T extends FunctionLike> = (node: T) => void;

const baseRule = getESLintCoreRule('max-params');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'max-params',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce a maximum number of parameters in function definitions',
      extendsBaseRule: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          maximum: {
            type: 'integer',
            minimum: 0,
          },
          max: {
            type: 'integer',
            minimum: 0,
          },
          countVoidThis: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{ max: 3, countVoidThis: false }],

  create(context, [{ countVoidThis }]) {
    const baseRules = baseRule.create(context);

    if (countVoidThis === true) {
      return baseRules;
    }

    const removeVoidThisParam = <T extends FunctionLike>(node: T): T => {
      if (
        node.params.length === 0 ||
        node.params[0].type !== AST_NODE_TYPES.Identifier ||
        node.params[0].name !== 'this' ||
        node.params[0].typeAnnotation?.typeAnnotation.type !==
          AST_NODE_TYPES.TSVoidKeyword
      ) {
        return node;
      }

      return {
        ...node,
        params: node.params.slice(1),
      };
    };

    const wrapListener = <T extends FunctionLike>(
      listener: FunctionRuleListener<T>,
    ): FunctionRuleListener<T> => {
      return (node: T): void => {
        listener(removeVoidThisParam(node));
      };
    };

    return {
      ArrowFunctionExpression: wrapListener(baseRules.ArrowFunctionExpression),
      FunctionDeclaration: wrapListener(baseRules.FunctionDeclaration),
      FunctionExpression: wrapListener(baseRules.FunctionExpression),
    };
  },
});
