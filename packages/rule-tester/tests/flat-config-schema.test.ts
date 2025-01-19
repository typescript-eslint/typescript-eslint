/* eslint-disable @typescript-eslint/no-empty-function */
// Forked from: https://github.com/eslint/eslint/blob/f182114144ae0bb7187de34a1661f31fb70f1357/tests/lib/config/flat-config-schema.js

import type { ObjectLike } from '../src/utils/flat-config-schema';

import { flatConfigSchema } from '../src/utils/flat-config-schema';

describe('merge', () => {
  const { merge } = flatConfigSchema.settings;

  it('merges two objects', () => {
    const first = { foo: 42 };
    const second = { bar: 'baz' };
    const result = merge(first, second);

    expect(result).toEqual({ ...first, ...second });
  });

  it('returns an empty object if both values are undefined', () => {
    const result = merge(undefined, undefined);

    expect(result).toEqual({});
  });

  it('returns an object equal to the first one if the second one is undefined', () => {
    const first = { bar: 'baz', foo: 42 };
    const result = merge(first, undefined);

    expect(result).toEqual(first);
    expect(result).not.toBe(first);
  });

  it('returns an object equal to the second one if the first one is undefined', () => {
    const second = { bar: 'baz', foo: 42 };
    const result = merge(undefined, second);

    expect(result).toEqual(second);
    expect(result).not.toBe(second);
  });

  it('does not preserve the type of merged objects', () => {
    const first = new Set(['bar', 'foo']);
    const second = new Set(['baz']);
    const result = merge(
      first as unknown as ObjectLike,
      second as unknown as ObjectLike,
    );

    expect(result).toEqual({});
  });

  it('merges two objects in a property', () => {
    const first = { foo: { bar: 'baz' } };
    const second = { foo: { qux: 42 } };
    const result = merge(first, second);

    expect(result).toEqual({ foo: { bar: 'baz', qux: 42 } });
  });

  it('overwrites an object in a property with an array', () => {
    const first = { someProperty: { 1: 'foo', bar: 'baz' } };
    const second = { someProperty: ['qux'] };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result.someProperty).toEqual(second.someProperty);
  });

  it('overwrites an array in a property with another array', () => {
    const first = { someProperty: ['foo', 'bar', undefined, 'baz'] };
    const second = { someProperty: ['qux', undefined, 42] };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result.someProperty).toEqual(second.someProperty);
  });

  it('overwrites an array in a property with an object', () => {
    const first = { foo: ['foobar'] };
    const second = { foo: { 1: 'qux', bar: 'baz' } };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result.foo).toEqual(second.foo);
  });

  it('does not override a value in a property with undefined', () => {
    const first: ObjectLike = { foo: { bar: 'baz' } };
    const second: ObjectLike = { foo: undefined };
    const result = merge(first, second);

    expect(result).toEqual(first);
    expect(result).not.toBe(first);
  });

  it('does not change the prototype of a merged object', () => {
    const first = { foo: 42 };
    const second = { ['__proto__']: { qux: true }, bar: 'baz' };
    const result = merge(first, second);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it("does not merge the '__proto__' property", () => {
    const first = { ['__proto__']: { foo: 42 } };
    const second = { ['__proto__']: { bar: 'baz' } };
    const result = merge(first, second);

    expect(result).toEqual({});
  });

  it('overrides a value in a property with null', () => {
    const first = { foo: { bar: 'baz' } };
    const second = { foo: null };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result).not.toBe(second);
  });

  it('overrides a value in a property with a non-nullish primitive', () => {
    const first = { foo: { bar: 'baz' } };
    const second = { foo: 42 };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result).not.toBe(second);
  });

  it('overrides an object in a property with a string', () => {
    const first = { foo: { bar: 'baz' } };
    const second = { foo: 'qux' };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result).not.toEqual(first);
  });

  it('overrides a value in a property with a function', () => {
    const first = { someProperty: { foo: 42 } };
    const second = { someProperty(): void {} };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result.someProperty).not.toHaveProperty('foo');
  });

  it('overrides a function in a property with an object', () => {
    const first = { someProperty: Object.assign(() => {}, { foo: 'bar' }) };
    const second = { someProperty: { baz: 'qux' } };
    const result = merge(first, second);

    expect(result).toEqual(second);
    expect(result.someProperty).not.toHaveProperty('foo');
  });

  it('sets properties to undefined', () => {
    const first = { bar: undefined, foo: undefined };
    const second = { baz: undefined, foo: undefined };
    const result = merge(first, second);

    expect(result).toEqual({ bar: undefined, baz: undefined, foo: undefined });
  });

  it('considers only own enumerable properties', () => {
    const first = {
      __proto__: { inherited1: 'A' }, // non-own properties are not considered
      included1: 'B',
      notMerged1: { first: true },
    };
    const second = {
      __proto__: { inherited2: 'C' }, // non-own properties are not considered
      included2: 'D',
      notMerged2: { second: true },
    };

    // non-enumerable properties are not considered
    Object.defineProperty(first, 'notMerged2', {
      enumerable: false,
      value: { first: true },
    });
    Object.defineProperty(second, 'notMerged1', {
      enumerable: false,
      value: { second: true },
    });

    const result = merge(first, second);

    expect(result).toEqual({
      included1: 'B',
      included2: 'D',
      notMerged1: { first: true },
      notMerged2: { second: true },
    });
  });

  it('merges objects with self-references', () => {
    const first: ObjectLike = { foo: 42 };

    first.first = first;
    const second: ObjectLike = { bar: 'baz' };

    second.second = second;
    const result = merge(first, second);

    expect(result.first).toEqual(first);
    expect(result.second).toEqual(second);

    const expected: ObjectLike = { bar: 'baz', foo: 42 };

    expected.first = first;
    expected.second = second;
    expect(result).toEqual(expected);
  });

  it('merges objects with overlapping self-references', () => {
    const first: ObjectLike = { foo: 42 };

    first.reference = first;
    const second: ObjectLike = { bar: 'baz' };

    second.reference = second;

    const result = merge(first, second);

    expect(result.reference).toEqual(result);

    const expected: ObjectLike = { bar: 'baz', foo: 42 };

    expected.reference = expected;
    expect(result).toEqual(expected);
  });

  it('merges objects with cross-references', () => {
    const first: ObjectLike = { foo: 42 };
    const second: ObjectLike = { bar: 'baz' };

    first.second = second;
    second.first = first;

    const result = merge(first, second);

    expect(result.first).toEqual(first);
    expect(result.second).toEqual(second);

    const expected: ObjectLike = { bar: 'baz', foo: 42 };

    expected.first = first;
    expected.second = second;
    expect(result).toEqual(expected);
  });

  it('merges objects with overlapping cross-references', () => {
    const first: ObjectLike = { foo: 42 };
    const second: ObjectLike = { bar: 'baz' };

    first.reference = second;
    second.reference = first;

    const result = merge(first, second);

    expect(result).toEqual((result.reference as ObjectLike).reference);

    const expected = {
      bar: 'baz',
      foo: 42,
      reference: { bar: 'baz', foo: 42 },
    };

    (expected.reference as ObjectLike).reference = expected;
    expect(result).toEqual(expected);
  });

  it('produces the same results for the same combinations of property values', () => {
    const firstCommon = { foo: 42 };
    const secondCommon = { bar: 'baz' };
    const first = {
      a: firstCommon,
      b: firstCommon,
      c: { foo: 'different' },
      d: firstCommon,
    };
    const second = {
      a: secondCommon,
      b: { bar: 'something else' },
      c: secondCommon,
      d: secondCommon,
    };
    const result = merge(first, second);

    expect(result.a).toEqual(result.d);

    const expected = {
      a: { bar: 'baz', foo: 42 },
      b: { bar: 'something else', foo: 42 },
      c: { bar: 'baz', foo: 'different' },
      d: { bar: 'baz', foo: 42 },
    };

    expect(result).toEqual(expected);
  });
});
