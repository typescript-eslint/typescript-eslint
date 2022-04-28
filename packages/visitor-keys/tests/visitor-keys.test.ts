import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { visitorKeys } from '../src';

const types = new Set(Object.keys(AST_NODE_TYPES));
const keys = new Set(Object.keys(visitorKeys));

describe('Every ast node type should have a visitor key defined', () => {
  for (const type of types) {
    it(type, () => {
      expect(keys.has(type)).toBeTruthy();
    });
  }
});

// these keys are defined by the base eslint module, and are not covered by our AST
const IGNORED_KEYS = new Set([
  'ExperimentalRestProperty',
  'ExperimentalSpreadProperty',
]);
describe('Every visitor key should have an ast node type defined', () => {
  for (const key of keys) {
    if (IGNORED_KEYS.has(key)) {
      if (types.has(key)) {
        it(`${key} should not be ignored as it has an AST_NODE_TYPE defined`, () => {
          expect(true).toBeFalsy();
        });
      }
      continue;
    }

    it(key, () => {
      expect(types.has(key)).toBeTruthy();
    });
  }
});
