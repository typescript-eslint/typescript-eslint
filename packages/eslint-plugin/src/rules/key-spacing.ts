import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('key-spacing');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const baseSchema = Array.isArray(baseRule.meta.schema)
  ? baseRule.meta.schema[0]
  : baseRule.meta.schema;

export default util.createRule<Options, MessageIds>({
  name: 'key-spacing',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce consistent spacing between keys and values in types and interfaces',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: [baseSchema],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{}],

  create(context) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);

    function validateBody(
      body: TSESTree.TSTypeLiteral | TSESTree.TSInterfaceBody,
    ): void {
      let minStart = 0;

      // In case of single-line interface declaration, skip rule
      if (body.loc.start.line === body.loc.end.line) {
        return;
      }

      const members = 'members' in body ? body.members : body.body;

      for (const node of members) {
        if (
          (node.type === AST_NODE_TYPES.TSPropertySignature ||
            node.type === AST_NODE_TYPES.TSIndexSignature) &&
          node.typeAnnotation
        ) {
          minStart = Math.max(
            minStart,
            node.typeAnnotation.loc.start.column + ': '.length,
          );
        }
      }

      for (const node of members) {
        if (
          node.type === AST_NODE_TYPES.TSPropertySignature &&
          node.typeAnnotation
        ) {
          const start = node.typeAnnotation.typeAnnotation.loc.start.column;

          if (start !== minStart) {
            context.report({
              node,
              messageId: start > minStart ? 'extraValue' : 'missingValue',
              data: {
                computed: '',
                key: sourceCode.getText(node.key),
              },
            });
          }
        }
      }
    }
    return {
      ...baseRules,
      TSTypeLiteral: validateBody,
      TSInterfaceBody: validateBody,
    };
  },
});
