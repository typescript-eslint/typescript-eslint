import { ESLintUtils } from '../../src';

describe('applyDefault', () => {
  it('returns a clone of the default if no options given', () => {
    const defaults = [{ prop: 'setting' }];
    const user = null;
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).toStrictEqual(defaults);
    expect(result).not.toBe(defaults);
  });

  it('returns applies a deepMerge to each element in the array', () => {
    const defaults: Record<string, string>[] = [
      {
        prop: 'setting1',
        other: 'other',
      },
      {
        prop: 'setting2',
      },
    ];
    const user: Record<string, string>[] = [
      {
        prop: 'new',
        other: 'something',
      },
    ];
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).toStrictEqual([
      {
        prop: 'new',
        other: 'something',
      },
      {
        prop: 'setting2',
      },
    ]);
    expect(result).not.toBe(defaults);
    expect(result).not.toBe(user);
  });

  it('returns a brand new array', () => {
    const defaults: undefined[] = [];
    const user: undefined[] = [];
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).not.toBe(defaults);
    expect(result).not.toBe(user);
  });

  it('should work with array of options', () => {
    const defaults: unknown[] = ['1tbs'];
    const user: unknown[] = ['2tbs'];
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).toStrictEqual(['2tbs']);
    expect(result).not.toBe(defaults);
    expect(result).not.toBe(user);
  });
});
