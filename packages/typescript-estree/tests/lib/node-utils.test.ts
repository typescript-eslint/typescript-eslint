import {
  unescapeStringLiteralText,
  unescapeUnicodeIdentifier,
} from '../../src/node-utils';

describe(unescapeStringLiteralText, () => {
  it('should not modify content', () => {
    let text = 'amp;';
    expect(unescapeStringLiteralText(text)).toBe(text);
    text = 'test';
    expect(unescapeStringLiteralText(text)).toBe(text);
    text = 'foo&bar&baz;';
    expect(unescapeStringLiteralText(text)).toBe(text);
    text = 'foo&bar&baz;';
    expect(unescapeStringLiteralText(text)).toBe(text);
    text = '&notlisted;';
    expect(unescapeStringLiteralText(text)).toBe(text);
    text = '\u20ac';
    expect(unescapeStringLiteralText(text)).toBe(text);
  });
  it('should handle empty string', () => {
    expect(unescapeStringLiteralText('')).toBe('');
  });
  it('should handle named entities followed by alphanumeric characters', () => {
    expect(unescapeStringLiteralText('&uuml;ber')).toBe('über');
  });
  it('should handle invalid code point modify content', () => {
    expect(unescapeStringLiteralText('&#2013266066;')).toBe('&#2013266066;');
  });
  it('should escape correctly', () => {
    expect(unescapeStringLiteralText('&amp=123&lang=en&amp,&amp;')).toBe(
      '&amp=123&lang=en&amp,&',
    );
    expect(unescapeStringLiteralText('&#1;')).toBe('\u0001');
    expect(unescapeStringLiteralText('&#x0021;')).toBe('!');
    expect(unescapeStringLiteralText('&#0;')).toBe('\u0000');
    expect(unescapeStringLiteralText('&OElig;')).toBe('\u0152');
    expect(unescapeStringLiteralText('&oelig;')).toBe('\u0153');
    expect(unescapeStringLiteralText('&there4;')).toBe('\u2234');
    expect(unescapeStringLiteralText('&#128514;')).toBe('😂');
    expect(
      unescapeStringLiteralText(
        'a\n&lt;&gt;&quot;&apos;&amp;&copy;&#8710;&rx;&#128514;&#0;&#1;',
      ),
    ).toBe(`a\n<>"'&©∆&rx;😂\u0000\u0001`);
  });
});

describe('unescapeUnicodeIdentifier', () => {
  it('should decode simple \\uXXXX escape', () => {
    expect(unescapeUnicodeIdentifier('\\u0061')).toBe('a');
    expect(unescapeUnicodeIdentifier('\\u0042')).toBe('B');
  });

  it('should decode \\u{X} escape', () => {
    expect(unescapeUnicodeIdentifier('\\u{61}')).toBe('a');
    expect(unescapeUnicodeIdentifier('\\u{1F602}')).toBe('😂');
  });

  it('should decode multiple escapes in one string', () => {
    expect(unescapeUnicodeIdentifier('\\u0061\\u0062')).toBe('ab');
    expect(unescapeUnicodeIdentifier('\\u{61}\\u{62}')).toBe('ab');
  });

  it('should leave non-escape text unchanged', () => {
    expect(unescapeUnicodeIdentifier('foo')).toBe('foo');
    expect(unescapeUnicodeIdentifier('a\\u0062c')).toBe('abc');
  });

  it('should not decode invalid escapes', () => {
    expect(unescapeUnicodeIdentifier('\\u00ZZ')).toBe('\\u00ZZ');
    expect(unescapeUnicodeIdentifier('\\u{ZZ}')).toBe('\\u{ZZ}');
  });
});
