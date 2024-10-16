import { nullThrows, NullThrowsReasons } from '../../src/eslint-utils';

describe('nullThrows', () => {
  it('returns a falsy value when it exists', () => {
    const value = 0;

    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      nullThrows(value, NullThrowsReasons.MissingParent),
    ).not.toThrow();
  });

  it('returns a truthy value when it exists', () => {
    const value = { abc: 'def' };

    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      nullThrows(value, NullThrowsReasons.MissingParent),
    ).not.toThrow();
  });

  it('throws an error when the value is null', () => {
    expect(() => nullThrows(null, NullThrowsReasons.MissingParent)).toThrow(
      NullThrowsReasons.MissingParent,
    );
  });

  it('throws an error when the value is undefined', () => {
    expect(() =>
      nullThrows(undefined, NullThrowsReasons.MissingParent),
    ).toThrow(NullThrowsReasons.MissingParent);
  });

  it('throws a filled in error when the value is undefined and NullThrowsReasons.MissingToken is used', () => {
    expect(() =>
      nullThrows(undefined, NullThrowsReasons.MissingToken('bracket', 'node')),
    ).toThrow(
      new Error(
        'Non-null Assertion Failed: Expected to find a bracket for the node.',
      ),
    );
  });
});
