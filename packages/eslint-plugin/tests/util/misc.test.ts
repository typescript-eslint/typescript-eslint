import * as misc from '../../src/util/misc';

describe('formatWordList', () => {
  it('can format with no words', () => {
    expect(misc.formatWordList([])).toBe('');
  });

  it('can format with 1 word', () => {
    expect(misc.formatWordList(['foo'])).toBe('foo');
  });

  it('can format with 2 words', () => {
    expect(misc.formatWordList(['foo', 'bar'])).toBe('foo and bar');
  });

  it('can format with 3 words', () => {
    expect(misc.formatWordList(['foo', 'bar', 'baz'])).toBe('foo, bar and baz');
  });

  it('can format with 4 words', () => {
    expect(misc.formatWordList(['foo', 'bar', 'baz', 'boz'])).toBe(
      'foo, bar, baz and boz',
    );
  });
});

describe('findLastIndex', () => {
  it('returns -1 if there are no elements to iterate over', () => {
    expect(misc.findLastIndex([], () => true)).toBe(-1);
  });

  it('returns the index of the last element if predicate just returns true for all values', () => {
    expect(misc.findLastIndex([1, 2, 3], () => true)).toBe(2);
  });
});
