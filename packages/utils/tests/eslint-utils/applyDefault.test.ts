import { ESLintUtils } from '../../src';

describe(ESLintUtils.applyDefault, () => {
  it('returns a clone of the default if no options given', () => {
    const defaults = [{ prop: 'setting' }];
    const user = null;
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).toEqual(defaults);
    expect(result).not.toBe(defaults);
  });

  it('returns applies a deepMerge to each element in the array', () => {
    const defaults: Record<string, string>[] = [
      {
        other: 'other',
        prop: 'setting1',
      },
      {
        prop: 'setting2',
      },
    ];
    const user: Record<string, string>[] = [
      {
        other: 'something',
        prop: 'new',
      },
    ];
    const result = ESLintUtils.applyDefault(defaults, user);

    expect(result).toEqual([
      {
        other: 'something',
        prop: 'new',
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

    expect(result).toEqual(['2tbs']);
    expect(result).not.toBe(defaults);
    expect(result).not.toBe(user);
  });

  it('should work when default option is null', () => {
    const defaults: unknown[] = [null];
    const user: unknown[] = [
      {
        other: 'other',
        prop: 'setting1',
      },
    ];
    const result = ESLintUtils.applyDefault(defaults, user);
    expect(result).toEqual(user);
    expect(result).not.toBe(defaults);
    expect(result).not.toBe(user);
  });
});
