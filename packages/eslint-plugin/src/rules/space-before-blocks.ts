import type { TSESTree } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('space-before-blocks');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'space-before-blocks',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before blocks',
      extendsBaseRule: true,
    },
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: {
      // @ts-expect-error -- we report on this messageId so we need to ensure it's there in case ESLint changes in future
      unexpectedSpace: 'Unexpected space before opening brace.',
      // @ts-expect-error -- we report on this messageId so we need to ensure it's there in case ESLint changes in future
      missingSpace: 'Missing space before opening brace.',
      ...baseRule.meta.messages,
    },
  },
  defaultOptions: ['always'],
  create(context, [config]) {
    const rules = baseRule.create(context);
    const sourceCode = context.getSourceCode();

    let requireSpace = true;

    if (typeof config === 'object') {
      requireSpace = config.classes === 'always';
    } else if (config === 'never') {
      requireSpace = false;
    }

    function checkPrecedingSpace(
      node: TSESTree.Token | TSESTree.TSInterfaceBody,
    ): void {
      const precedingToken = sourceCode.getTokenBefore(node);
      if (precedingToken && util.isTokenOnSameLine(precedingToken, node)) {
        // eslint-disable-next-line deprecation/deprecation -- TODO - switch once our min ESLint version is 6.7.0
        const hasSpace = sourceCode.isSpaceBetweenTokens(
          precedingToken,
          node as TSESTree.Token,
        );

        if (requireSpace && !hasSpace) {
          context.report({
            node,
            messageId: 'missingSpace',
            fix(fixer) {
              return fixer.insertTextBefore(node, ' ');
            },
          });
        } else if (!requireSpace && hasSpace) {
          context.report({
            node,
            messageId: 'unexpectedSpace',
            fix(fixer) {
              return fixer.removeRange([
                precedingToken.range[1],
                node.range[0],
              ]);
            },
          });
        }
      }
    }

    function checkSpaceAfterEnum(node: TSESTree.TSEnumDeclaration): void {
      const punctuator = sourceCode.getTokenAfter(node.id);
      if (punctuator) {
        checkPrecedingSpace(punctuator);
      }
    }

    return {
      ...rules,
      TSEnumDeclaration: checkSpaceAfterEnum,
      TSInterfaceBody: checkPrecedingSpace,
    };
  },
});
