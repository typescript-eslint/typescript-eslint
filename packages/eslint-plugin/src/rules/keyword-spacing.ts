import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, deepMerge, nullThrows, NullThrowsReasons } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('keyword-spacing');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const baseSchema = Array.isArray(baseRule.meta.schema)
  ? baseRule.meta.schema[0]
  : baseRule.meta.schema;
const schema = deepMerge(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- https://github.com/microsoft/TypeScript/issues/17002
  baseSchema,
  {
    properties: {
      overrides: {
        properties: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          type: baseSchema.properties.overrides.properties.import,
        },
      },
    },
  },
) as unknown as JSONSchema4;

export default createRule<Options, MessageIds>({
  name: 'keyword-spacing',
  meta: {
    deprecated: true,
    replacedBy: ['@stylistic/ts/keyword-spacing'],
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before and after keywords',
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: [schema],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{}],

  create(context, [{ after, overrides }]) {
    const baseRules = baseRule.create(context);
    return {
      ...baseRules,
      TSAsExpression(node): void {
        const asToken = nullThrows(
          context.sourceCode.getTokenAfter(
            node.expression,
            token => token.value === 'as',
          ),
          NullThrowsReasons.MissingToken('as', node.type),
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
        const { type: typeOptionOverride = {} } = overrides ?? {};
        const typeToken = context.sourceCode.getFirstToken(node, { skip: 1 })!;
        const punctuatorToken = context.sourceCode.getTokenAfter(typeToken)!;
        if (
          node.specifiers[0]?.type === AST_NODE_TYPES.ImportDefaultSpecifier
        ) {
          return;
        }
        const spacesBetweenTypeAndPunctuator =
          punctuatorToken.range[0] - typeToken.range[1];
        if (
          (typeOptionOverride.after ?? after) === true &&
          spacesBetweenTypeAndPunctuator === 0
        ) {
          context.report({
            loc: typeToken.loc,
            messageId: 'expectedAfter',
            data: { value: 'type' },
            fix(fixer) {
              return fixer.insertTextAfter(typeToken, ' ');
            },
          });
        }
        if (
          (typeOptionOverride.after ?? after) === false &&
          spacesBetweenTypeAndPunctuator > 0
        ) {
          context.report({
            loc: typeToken.loc,
            messageId: 'unexpectedAfter',
            data: { value: 'type' },
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
