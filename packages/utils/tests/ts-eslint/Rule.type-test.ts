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

type ExpectNever<T extends never> = T;

type SelectorsWithWrongNodeType = {
  [K in TSESTree.AST_NODE_TYPES]: Parameters<
    NonNullable<RuleListener[K]>
  >[0]['type'] extends K
    ? K extends Parameters<NonNullable<RuleListener[K]>>[0]['type']
      ? never
      : K
    : K;
}[TSESTree.AST_NODE_TYPES];
type _test_rule_listener_selectors_have_correct_node_types =
  ExpectNever<SelectorsWithWrongNodeType>;

type ExtraSelectors = Exclude<RuleListenerSelectors, AllSelectors>;
type _test_rule_listener_does_not_define_extra_selectors =
  ExpectNever<ExtraSelectors>;

type MissingSelectors = Exclude<AllSelectors, RuleListenerSelectors>;
type _test_rule_listener_has_selectors_for_all_node_types =
  ExpectNever<MissingSelectors>;
