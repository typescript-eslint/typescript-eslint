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
