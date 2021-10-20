import * as misc from '../../src/util/misc';

describe('formatWordList', () => {
  it('can format with no words', () => {
    expect(misc.formatWordList([])).toEqual('');
  });

  it('can format with 1 word', () => {
    expect(misc.formatWordList(['foo'])).toEqual('foo');
  });

  it('can format with 2 words', () => {
    expect(misc.formatWordList(['foo', 'bar'])).toEqual('foo and bar');
  });

  it('can format with 3 words', () => {
    expect(misc.formatWordList(['foo', 'bar', 'baz'])).toEqual(
      'foo, bar and baz',
    );
  });

  it('can format with 4 words', () => {
    expect(misc.formatWordList(['foo', 'bar', 'baz', 'boz'])).toEqual(
      'foo, bar, baz and boz',
    );
  });
});
