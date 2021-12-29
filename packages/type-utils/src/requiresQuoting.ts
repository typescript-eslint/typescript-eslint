import * as ts from 'typescript';

function requiresQuoting(
  name: string,
  target: ts.ScriptTarget = ts.ScriptTarget.ESNext,
): boolean {
  if (name.length === 0) {
    return true;
  }

  if (!ts.isIdentifierStart(name.charCodeAt(0), target)) {
    return true;
  }

  for (let i = 1; i < name.length; i += 1) {
    if (!ts.isIdentifierPart(name.charCodeAt(i), target)) {
      return true;
    }
  }

  return false;
}

export { requiresQuoting };
