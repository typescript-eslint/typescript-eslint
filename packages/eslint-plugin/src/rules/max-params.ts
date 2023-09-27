import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

type FunctionLike =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

type FunctionRuleListener<T extends FunctionLike> = (node: T) => void;

const baseRule = getESLintCoreRule('max-params');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = Object.values(
  util.deepMerge(
    { ...baseRule.meta.schema },
    {
      0: {
        oneOf: [
          baseRule.meta.schema[0].oneOf[0],
          {
            ...baseRule.meta.schema[0].oneOf[1],
            properties: {
              ...baseRule.meta.schema[0].oneOf[1].properties,
              countVoidThis: {
                type: 'boolean',
              },
            },
          },
        ],
      },
    },
  ),
) as JSONSchema4[];

export default util.createRule<Options, MessageIds>({
  name: 'max-params',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce a maximum number of parameters in function definitions',
      extendsBaseRule: true,
    },
    schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{ max: 3, countVoidThis: false }],

  create(context, [{ countVoidThis }]) {
    const baseRules = baseRule.create(context);

    if (countVoidThis === true) {
      return baseRules;
    }

    const removeVoidThisParam = <T extends FunctionLike>(node: T): T => {
      if (node.params.length === 0) {
        return node;
      }

      const params = [...node.params];

      if (
        params[0] &&
        params[0].type === AST_NODE_TYPES.Identifier &&
        params[0].name === 'this' &&
        params[0].typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSVoidKeyword
      ) {
        params.shift();
      }

      return {
        ...node,
        params,
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
