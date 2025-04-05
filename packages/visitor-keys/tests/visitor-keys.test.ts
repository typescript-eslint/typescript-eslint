import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { visitorKeys } from '../src';

const types = new Set(Object.keys(AST_NODE_TYPES));
const keys = new Set(Object.keys(visitorKeys));

describe('Every ast node type should have a visitor key defined', () => {
  it.for([...types])('%s', (type, { expect }) => {
    expect(keys).toContain(type);
  });
});

// these keys are defined by the base eslint module, and are not covered by our AST
const IGNORED_KEYS = new Set([
  'ExperimentalRestProperty',
  'ExperimentalSpreadProperty',
]);

const nonIgnoredKeys = [...keys].filter(key => !IGNORED_KEYS.has(key));

describe('Every visitor key should have an ast node type defined', () => {
  it.for(nonIgnoredKeys)('%s', (key, { expect }) => {
    expect(types).toContain(key);
  });
});
