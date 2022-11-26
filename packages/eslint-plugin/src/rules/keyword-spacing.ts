import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('keyword-spacing');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'keyword-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before and after keywords',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{}],

  create(context, [{ after }]) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);
    return {
      ...baseRules,
      TSAsExpression(node): void {
        const asToken = util.nullThrows(
          sourceCode.getTokenAfter(
            node.expression,
            token => token.value === 'as',
          ),
          util.NullThrowsReasons.MissingToken('as', node.type),
        );
        const oldTokenType = asToken.type;
        // as is a contextual keyword, so it's always reported as an Identifier
        // the rule looks for keyword tokens, so we temporarily override it
        // we mutate it at the token level because the rule calls sourceCode.getFirstToken,
        // so mutating a copy would not change the underlying copy returned by that method
        asToken.type = AST_TOKEN_TYPES.Keyword;

        // use this selector just because it is just a call to `checkSpacingAroundFirstToken`
        baseRules.DebuggerStatement(asToken as never);

        // make sure to reset the type afterward so we don't permanently mutate the AST
        asToken.type = oldTokenType;
      },
      'ImportDeclaration[importKind=type]'(
        node: TSESTree.ImportDeclaration,
      ): void {
        const typeToken = sourceCode.getFirstToken(node, { skip: 1 })!;
        const punctuatorToken = sourceCode.getTokenAfter(typeToken)!;
        if (
          node.specifiers?.[0]?.type === AST_NODE_TYPES.ImportDefaultSpecifier
        ) {
          return;
        }
        const spacesBetweenTypeAndPunctuator =
          punctuatorToken.range[0] - typeToken.range[1];
        if (after && spacesBetweenTypeAndPunctuator === 0) {
          context.report({
            loc: punctuatorToken.loc,
            messageId: 'expectedBefore',
            data: { value: punctuatorToken.value },
            fix(fixer) {
              return fixer.insertTextBefore(punctuatorToken, ' ');
            },
          });
        }
        if (!after && spacesBetweenTypeAndPunctuator > 0) {
          context.report({
            loc: punctuatorToken.loc,
            messageId: 'unexpectedBefore',
            data: { value: punctuatorToken.value },
            fix(fixer) {
              return fixer.removeRange([
                typeToken.range[1],
                typeToken.range[1] + spacesBetweenTypeAndPunctuator,
              ]);
            },
          });
        }
      },
    };
  },
});
