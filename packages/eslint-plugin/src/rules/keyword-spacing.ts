import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

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

  create(context) {
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
    };
  },
});
