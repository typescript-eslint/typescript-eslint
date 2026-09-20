import type { TSESTree } from '@typescript-eslint/types';

import type {
  RuleContext,
  RuleFix,
  RuleListener,
  SuggestionReportDescriptor,
} from '../../src/ts-eslint';

type RuleListenerKeysWithoutIndexSignature = {
  [K in keyof RuleListener as string extends K ? never : K]: K;
};

type RuleListenerSelectors = NonNullable<
  RuleListenerKeysWithoutIndexSignature[keyof RuleListenerKeysWithoutIndexSignature]
>;

type AllSelectors =
  `${TSESTree.AST_NODE_TYPES}:exit` | `${TSESTree.AST_NODE_TYPES}`;

type SelectorsWithWrongNodeType = {
  [K in TSESTree.AST_NODE_TYPES]: Parameters<
    NonNullable<RuleListener[K]>
  >[0]['type'] extends K
    ? K extends Parameters<NonNullable<RuleListener[K]>>[0]['type']
      ? never
      : K
    : K;
}[TSESTree.AST_NODE_TYPES];

test('type tests', () => {
  expectTypeOf<SelectorsWithWrongNodeType>().toBeNever();

  expectTypeOf<RuleListenerSelectors>().exclude<AllSelectors>().toBeNever();

  expectTypeOf<AllSelectors>().exclude<RuleListenerSelectors>().toBeNever();
});

// https://github.com/typescript-eslint/typescript-eslint/issues/11543
describe('RuleContext#report', () => {
  test('accepts the wide descriptor shape despite the ESLint-compatible overload', () => {
    const context = {} as Readonly<RuleContext<'messageId', []>>;
    const node = {} as TSESTree.Node;
    const data: Record<string, unknown> = {};
    const suggestions: readonly SuggestionReportDescriptor<'messageId'>[] = [];

    context.report({ data, messageId: 'messageId', node });
    context.report({ messageId: 'messageId', node, suggest: suggestions });
    context.report({
      fix: fixer => fixer.replaceText(node, 'text'),
      messageId: 'messageId',
      node,
    });
    context.report({
      fix: (): RuleFix => ({ range: [0, 1] as const, text: '' }),
      messageId: 'messageId',
      node,
    });
    context.report({
      data,
      fix: fixer => [fixer.remove(node)],
      messageId: 'messageId',
      node,
      suggest: [
        {
          data,
          fix: fixer => fixer.remove(node),
          messageId: 'messageId',
        },
      ],
    });
    context.report({
      loc: node.loc,
      messageId: 'messageId',
    });

    // @ts-expect-error -- message strings are intentionally not allowed
    context.report({ message: 'message', node });
    // @ts-expect-error -- unknown message ids are not allowed
    context.report({ messageId: 'other', node });
  });
});
