import * as ts from 'typescript';

import { convertTokens, unescapeStringLiteralText } from '../../src/node-utils';

describe(convertTokens, () => {
  function getTokens(code: string): string[] {
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      { languageVersion: ts.ScriptTarget.ESNext },
      /* setParentNodes */ true,
    );

    return convertTokens(sourceFile).map(
      token =>
        `${token.type} ${JSON.stringify(token.value)} [${token.range.join(', ')}]`,
    );
  }

  it('includes the `<` opening a type argument list that is followed by another `<`', () => {
    expect(getTokens('type Bar = ReturnType<<T>(x: T) => number>;'))
      .toMatchInlineSnapshot(`
        [
          "Identifier "type" [0, 4]",
          "Identifier "Bar" [5, 8]",
          "Punctuator "=" [9, 10]",
          "Identifier "ReturnType" [11, 21]",
          "Punctuator "<" [21, 22]",
          "Punctuator "<" [22, 23]",
          "Identifier "T" [23, 24]",
          "Punctuator ">" [24, 25]",
          "Punctuator "(" [25, 26]",
          "Identifier "x" [26, 27]",
          "Punctuator ":" [27, 28]",
          "Identifier "T" [29, 30]",
          "Punctuator ")" [30, 31]",
          "Punctuator "=>" [32, 34]",
          "Identifier "number" [35, 41]",
          "Punctuator ">" [41, 42]",
          "Punctuator ";" [42, 43]",
        ]
      `);
  });

  it('includes the `<` opening the type arguments of a call expression that is followed by another `<`', () => {
    expect(getTokens('const bar = foo<<T>(x: T) => number>();'))
      .toMatchInlineSnapshot(`
        [
          "Keyword "const" [0, 5]",
          "Identifier "bar" [6, 9]",
          "Punctuator "=" [10, 11]",
          "Identifier "foo" [12, 15]",
          "Punctuator "<" [15, 16]",
          "Punctuator "<" [16, 17]",
          "Identifier "T" [17, 18]",
          "Punctuator ">" [18, 19]",
          "Punctuator "(" [19, 20]",
          "Identifier "x" [20, 21]",
          "Punctuator ":" [21, 22]",
          "Identifier "T" [23, 24]",
          "Punctuator ")" [24, 25]",
          "Punctuator "=>" [26, 28]",
          "Identifier "number" [29, 35]",
          "Punctuator ">" [35, 36]",
          "Punctuator "(" [36, 37]",
          "Punctuator ")" [37, 38]",
          "Punctuator ";" [38, 39]",
        ]
      `);
  });

  it('includes the `<` opening a type argument list that is separated from the identifier by a space', () => {
    expect(getTokens('type Bar = ReturnType <<T>(x: T) => number>;'))
      .toMatchInlineSnapshot(`
        [
          "Identifier "type" [0, 4]",
          "Identifier "Bar" [5, 8]",
          "Punctuator "=" [9, 10]",
          "Identifier "ReturnType" [11, 21]",
          "Punctuator "<" [22, 23]",
          "Punctuator "<" [23, 24]",
          "Identifier "T" [24, 25]",
          "Punctuator ">" [25, 26]",
          "Punctuator "(" [26, 27]",
          "Identifier "x" [27, 28]",
          "Punctuator ":" [28, 29]",
          "Identifier "T" [30, 31]",
          "Punctuator ")" [31, 32]",
          "Punctuator "=>" [33, 35]",
          "Identifier "number" [36, 42]",
          "Punctuator ">" [42, 43]",
          "Punctuator ";" [43, 44]",
        ]
      `);
  });

  it('includes the `<` opening a type argument list that is separated from the identifier by a comment', () => {
    expect(getTokens('type Bar = ReturnType /* c */ <<T>(x: T) => number>;'))
      .toMatchInlineSnapshot(`
        [
          "Identifier "type" [0, 4]",
          "Identifier "Bar" [5, 8]",
          "Punctuator "=" [9, 10]",
          "Identifier "ReturnType" [11, 21]",
          "Punctuator "<" [30, 31]",
          "Punctuator "<" [31, 32]",
          "Identifier "T" [32, 33]",
          "Punctuator ">" [33, 34]",
          "Punctuator "(" [34, 35]",
          "Identifier "x" [35, 36]",
          "Punctuator ":" [36, 37]",
          "Identifier "T" [38, 39]",
          "Punctuator ")" [39, 40]",
          "Punctuator "=>" [41, 43]",
          "Identifier "number" [44, 50]",
          "Punctuator ">" [50, 51]",
          "Punctuator ";" [51, 52]",
        ]
      `);
  });

  it('does not duplicate the `<` opening a type argument list that is separated from the next `<` by a space', () => {
    expect(getTokens('type Bar = ReturnType< <T>(x: T) => number>;'))
      .toMatchInlineSnapshot(`
        [
          "Identifier "type" [0, 4]",
          "Identifier "Bar" [5, 8]",
          "Punctuator "=" [9, 10]",
          "Identifier "ReturnType" [11, 21]",
          "Punctuator "<" [21, 22]",
          "Punctuator "<" [23, 24]",
          "Identifier "T" [24, 25]",
          "Punctuator ">" [25, 26]",
          "Punctuator "(" [26, 27]",
          "Identifier "x" [27, 28]",
          "Punctuator ":" [28, 29]",
          "Identifier "T" [30, 31]",
          "Punctuator ")" [31, 32]",
          "Punctuator "=>" [33, 35]",
          "Identifier "number" [36, 42]",
          "Punctuator ">" [42, 43]",
          "Punctuator ";" [43, 44]",
        ]
      `);
  });

  it('keeps a `<<` operator as a single token', () => {
    expect(getTokens('const bar = 1 << 2;')).toMatchInlineSnapshot(`
      [
        "Keyword "const" [0, 5]",
        "Identifier "bar" [6, 9]",
        "Punctuator "=" [10, 11]",
        "Numeric "1" [12, 13]",
        "Punctuator "<<" [14, 16]",
        "Numeric "2" [17, 18]",
        "Punctuator ";" [18, 19]",
      ]
    `);
  });
});

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
