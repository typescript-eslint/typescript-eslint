import { LINEBREAK_MATCHER } from '../../src/ast-utils/misc';

describe('LINEBREAK_MATCHER', () => {
  it('matches a CRLF', ({ expect }) => {
    expect('before\r\nafter'.split(LINEBREAK_MATCHER)).toEqual([
      'before',
      'after',
    ]);
  });

  it('matches a CR', ({ expect }) => {
    expect('before\rafter'.split(LINEBREAK_MATCHER)).toEqual([
      'before',
      'after',
    ]);
  });

  it('matches a LF', ({ expect }) => {
    expect('before\nafter'.split(LINEBREAK_MATCHER)).toEqual([
      'before',
      'after',
    ]);
  });

  it('matches a Unicode line separator', ({ expect }) => {
    expect('before\u2028after'.split(LINEBREAK_MATCHER)).toEqual([
      'before',
      'after',
    ]);
  });

  it('matches a Unicode paragraph separator', ({ expect }) => {
    expect('before\u2029after'.split(LINEBREAK_MATCHER)).toEqual([
      'before',
      'after',
    ]);
  });
});
