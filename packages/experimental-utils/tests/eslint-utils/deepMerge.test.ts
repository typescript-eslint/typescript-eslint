import assert from 'assert';

import * as util from '../../src/eslint-utils/deepMerge';

describe('deepMerge', () => {
  it('creates a brand new object', () => {
    const a = {};
    const b = {};
    const result = util.deepMerge(a, b);

    assert.notStrictEqual(result, a);
    assert.notStrictEqual(result, b);
  });

  it('deeply merges objects', () => {
    const a = {
      stringA1: 'asdf',
      numberA1: 1,
      boolA1: true,
      arrayA1: [1, 2, 3],
      objA1: {
        stringA2: 'fsda',
        numberA2: 2,
        boolA2: false,
        arrayA2: [3, 2, 1],
        objA2: {},
      },
    };
    const b = {
      stringB1: 'asdf',
      numberB1: 1,
      boolB1: true,
      arrayB1: [1, 2, 3],
      objB1: {
        stringB2: 'fsda',
        numberB2: 2,
        boolB2: false,
        arrayB2: [3, 2, 1],
        objB2: {},
      },
    };

    assert.deepStrictEqual(util.deepMerge(a, b), Object.assign({}, a, b));
  });

  it('deeply overwrites properties in the first one with the second', () => {
    const a = {
      prop1: {
        prop2: 'hi',
      },
    };
    const b = {
      prop1: {
        prop2: 'bye',
      },
    };

    assert.deepStrictEqual(util.deepMerge(a, b), b);
  });
});
