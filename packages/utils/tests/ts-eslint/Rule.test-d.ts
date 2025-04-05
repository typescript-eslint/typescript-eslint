import type { TSESTree } from '@typescript-eslint/types';

import type { RuleListener } from '../../src/ts-eslint';

type RuleListenerKeysWithoutIndexSignature = {
  [K in keyof RuleListener as string extends K ? never : K]: K;
};

type RuleListenerSelectors = NonNullable<
  RuleListenerKeysWithoutIndexSignature[keyof RuleListenerKeysWithoutIndexSignature]
>;

type AllSelectors =
  | `${TSESTree.AST_NODE_TYPES}:exit`
  | `${TSESTree.AST_NODE_TYPES}`;

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
