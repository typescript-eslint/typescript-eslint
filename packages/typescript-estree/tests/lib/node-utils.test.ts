import { unescapeStringLiteralText } from '../../src/node-utils';

describe('unescapeStringLiteralText()', () => {
  it('should not modify content', () => {
    let text = 'amp;';
    expect(unescapeStringLiteralText(text)).toEqual(text);
    text = 'test';
    expect(unescapeStringLiteralText(text)).toEqual(text);
    text = 'foo&bar&baz;';
    expect(unescapeStringLiteralText(text)).toEqual(text);
    text = 'foo&bar&baz;';
    expect(unescapeStringLiteralText(text)).toEqual(text);
    text = '&notlisted;';
    expect(unescapeStringLiteralText(text)).toEqual(text);
    text = '\u20ac';
    expect(unescapeStringLiteralText(text)).toEqual(text);
  });
  it('should handle empty string', () => {
    expect(unescapeStringLiteralText('')).toEqual('');
  });
  it('should handle named entities followed by alphanumeric characters', () => {
    expect(unescapeStringLiteralText('&uuml;ber')).toEqual('über');
  });
  it('should handle invalid code point modify content', () => {
    expect(unescapeStringLiteralText('&#2013266066;')).toEqual('&#2013266066;');
  });
  it('should escape correctly', () => {
    expect(unescapeStringLiteralText('&amp=123&lang=en&amp,&amp;')).toEqual(
      '&amp=123&lang=en&amp,&',
    );
    expect(unescapeStringLiteralText('&#1;')).toEqual('\u0001');
    expect(unescapeStringLiteralText('&#x0021;')).toEqual(`!`);
    expect(unescapeStringLiteralText('&#0;')).toEqual('\u0000');
    expect(unescapeStringLiteralText('&OElig;')).toEqual('\u0152');
    expect(unescapeStringLiteralText('&oelig;')).toEqual('\u0153');
    expect(unescapeStringLiteralText('&there4;')).toEqual('\u2234');
    expect(unescapeStringLiteralText('&#128514;')).toEqual('😂');
    expect(
      unescapeStringLiteralText(
        'a\n&lt;&gt;&quot;&apos;&amp;&copy;&#8710;&rx;&#128514;&#0;&#1;',
      ),
    ).toEqual(`a\n<>"'&©∆&rx;😂\u0000\u0001`);
  });
});
