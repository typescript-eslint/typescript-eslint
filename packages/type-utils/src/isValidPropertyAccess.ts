import { isIdentifierPart, isIdentifierStart, ScriptTarget } from 'typescript';

/**
 * Determines whether the given text can be used to access a property with a PropertyAccessExpression while preserving the property's name.
 */
export function isValidPropertyAccess(
  text: string,
  languageVersion = ScriptTarget.Latest,
): boolean {
  if (text.length === 0) {
    return false;
  }

  let ch = text.codePointAt(0)!;

  if (!isIdentifierStart(ch, languageVersion)) {
    return false;
  }

  for (let i = charSize(ch); i < text.length; i += charSize(ch)) {
    ch = text.codePointAt(i)!;

    if (!isIdentifierPart(ch, languageVersion)) {
      return false;
    }
  }

  return true;
}

function charSize(ch: number): 2 | 1 {
  return ch >= 0x10000 ? 2 : 1;
}
