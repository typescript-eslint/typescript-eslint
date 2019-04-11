import assert from 'assert';

import * as util from '../../src/eslint-utils/applyDefault';

describe('applyDefault', () => {
  it('returns a clone of the default if no options given', () => {
    const defaults = [
      {
        prop: 'setting',
      },
    ];
    const user = null;
    const result = util.applyDefault(defaults, user);

    assert.deepStrictEqual(result, defaults);
    assert.notStrictEqual(result, defaults);
  });

  it('returns applies a deepMerge to each element in the array', () => {
    const defaults = [
      {
        prop: 'setting1',
        other: 'other',
      },
      {
        prop: 'setting2',
      },
    ] as Record<string, string>[];
    const user = [
      {
        prop: 'new',
        other: 'something',
      },
    ] as Record<string, string>[];
    const result = util.applyDefault(defaults, user);

    assert.deepStrictEqual(result, [
      {
        prop: 'new',
        other: 'something',
      },
      {
        prop: 'setting2',
      },
    ]);
    assert.notStrictEqual(result, defaults);
    assert.notStrictEqual(result, user);
  });

  it('returns a brand new array', () => {
    const defaults: undefined[] = [];
    const user: undefined[] = [];
    const result = util.applyDefault(defaults, user);

    assert.notStrictEqual(result, defaults);
    assert.notStrictEqual(result, user);
  });
});

