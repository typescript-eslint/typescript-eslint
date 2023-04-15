import type { FunctionDeclaration } from 'typescript';
import { createSourceFile, ScriptTarget, SyntaxKind } from 'typescript';

import {
  findFirstMatchingAncestor,
  unescapeStringLiteralText,
} from '../../src/node-utils';

describe('unescapeStringLiteralText()', () => {
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

describe('findFirstMatchingAncestor', () => {
  const sourceCode = `
    function foo() {
      return 42;
    }
  `;
  const sourceFile = createSourceFile(
    'test.ts',
    sourceCode,
    ScriptTarget.Latest,
  );

  it('returns the node itself when it matches the predicate', () => {
    const result = findFirstMatchingAncestor(
      sourceFile.getChildren()[0].getChildren()[0],
      node => node === sourceFile.getChildren()[0].getChildren()[0],
    );
    expect(result).toBe(sourceFile.getChildren()[0].getChildren()[0]);
  });

  it('returns the first matching ancestor', () => {
    const result = findFirstMatchingAncestor(
      sourceFile.getChildren()[0].getChildren()[0],
      node => node.kind === SyntaxKind.FunctionDeclaration,
    );
    expect(result?.kind).toBe(SyntaxKind.FunctionDeclaration);
    expect((result as FunctionDeclaration)?.name?.escapedText).toBe('foo');
  });

  it('returns undefined when no matching ancestor is found', () => {
    const result = findFirstMatchingAncestor(
      sourceFile.getChildren()[0].getChildren()[0],
      node => node.kind === SyntaxKind.VariableDeclaration,
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined when called with undefined node', () => {
    const result = findFirstMatchingAncestor(undefined as never, node => true);
    expect(result).toBeUndefined();
  });
});
