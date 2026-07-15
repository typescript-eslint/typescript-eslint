import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isConditionalTest } from '../../src/util/isConditionalTest';

describe(isConditionalTest, () => {
  it('returns false for nodes with no parent', () => {
    const node = {
      name: 'value',
      type: AST_NODE_TYPES.Identifier,
    } as TSESTree.Identifier;

    expect(isConditionalTest(node)).toBe(false);
  });
});
