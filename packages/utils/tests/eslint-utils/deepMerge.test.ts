import { ESLintUtils } from '../../src';

describe(ESLintUtils.deepMerge, () => {
  it('creates a brand new object', () => {
    const a = {};
    const b = {};
    const result = ESLintUtils.deepMerge(a, b);

    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
  });

  it('deeply merges objects', () => {
    const a = {
      arrayA1: [1, 2, 3],
      boolA1: true,
      numberA1: 1,
      objA1: {
        arrayA2: [3, 2, 1],
        boolA2: false,
        numberA2: 2,
        objA2: {},
        stringA2: 'fsda',
      },
      stringA1: 'asdf',
    };
    const b = {
      arrayB1: [1, 2, 3],
      boolB1: true,
      numberB1: 1,
      objB1: {
        arrayB2: [3, 2, 1],
        boolB2: false,
        numberB2: 2,
        objB2: {},
        stringB2: 'fsda',
      },
      stringB1: 'asdf',
    };

    expect(ESLintUtils.deepMerge(a, b)).toStrictEqual({ ...a, ...b });
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

    expect(ESLintUtils.deepMerge(a, b)).toStrictEqual(b);
  });
});
