import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('lines-around-comment');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'lines-around-comment',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require empty lines around comments',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            beforeBlockComment: {
              type: 'boolean',
              default: true,
            },
            afterBlockComment: {
              type: 'boolean',
              default: false,
            },
            beforeLineComment: {
              type: 'boolean',
              default: false,
            },
            afterLineComment: {
              type: 'boolean',
              default: false,
            },
            allowBlockStart: {
              type: 'boolean',
              default: false,
            },
            allowBlockEnd: {
              type: 'boolean',
              default: false,
            },
            allowClassStart: {
              type: 'boolean',
            },
            allowClassEnd: {
              type: 'boolean',
            },
            allowObjectStart: {
              type: 'boolean',
            },
            allowObjectEnd: {
              type: 'boolean',
            },
            allowArrayStart: {
              type: 'boolean',
            },
            allowArrayEnd: {
              type: 'boolean',
            },
            ignorePattern: {
              type: 'string',
            },
            applyDefaultIgnorePatterns: {
              type: 'boolean',
            },
          },
          additionalProperties: false,
        },
      ],
    },
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      beforeBlockComment: true,
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);
    return {
      ...rules,
    };
  },
});
