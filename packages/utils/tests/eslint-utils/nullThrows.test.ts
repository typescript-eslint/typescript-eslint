import { nullThrows, NullThrowsReasons } from '../../src/eslint-utils';

describe('nullThrows', () => {
  it.only('returns a falsy value when it exists', () => {
    const value = 0;
    const x = { prop: {} };
    x.prop = x;
    console.log(x);

    const actual = nullThrows(value, NullThrowsReasons.MissingParent);

    expect(actual).toBe(value);
  });

  it('returns a truthy value when it exists', () => {
    const value = { abc: 'def' };

    const actual = nullThrows(value, NullThrowsReasons.MissingParent);

    expect(actual).toBe(value);
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
});
