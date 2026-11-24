import type { SourceFile } from 'typescript';

import * as ts from 'typescript';

export interface PrivateTypeQueryDiagnostic {
  diagnostic: ts.Diagnostic;
  privateIdentifier: ts.Node;
  qualifiedName: ts.Node;
}

/**
 * TypeScript parses `typeof a.#field` as a qualified name with an empty,
 * error-flagged identifier on the right, even though the private identifier is
 * present in the token stream. Recognize only that shape so the parser can
 * recover it instead of reporting `Identifier expected.`
 */
export function getPrivateTypeQueryDiagnostics(
  ast: SourceFile,
): PrivateTypeQueryDiagnostic[] {
  const recovered: PrivateTypeQueryDiagnostic[] = [];

  for (const diagnostic of ast.parseDiagnostics) {
    if (diagnostic.code !== 1003 || diagnostic.length !== 0) {
      continue;
    }

    const diagnosticNode = getDiagnosticNode(ast, diagnostic.start);
    if (
      diagnosticNode?.kind !== ts.SyntaxKind.Identifier ||
      diagnosticNode.pos !== diagnosticNode.end ||
      (diagnosticNode.flags & ts.NodeFlags.ThisNodeHasError) === 0
    ) {
      continue;
    }

    const qualifiedName = diagnosticNode.parent;
    if (
      !ts.isQualifiedName(qualifiedName) ||
      qualifiedName.right !== diagnosticNode ||
      !isTypeQueryName(qualifiedName)
    ) {
      continue;
    }

    const children = qualifiedName.getChildren(ast);
    const privateIndex = children.findIndex(
      child =>
        child.kind === ts.SyntaxKind.PrivateIdentifier &&
        child.end === diagnosticNode.pos,
    );
    if (privateIndex === -1) {
      continue;
    }

    const privateIdentifier = children[privateIndex];
    const privateText = ast.text.slice(
      privateIdentifier.getStart(ast),
      privateIdentifier.end,
    );
    if (!isValidPrivateIdentifierText(privateText)) {
      continue;
    }

    recovered.push({ diagnostic, privateIdentifier, qualifiedName });
  }

  return recovered;
}

function getDiagnosticNode(
  ast: SourceFile,
  position: number | undefined,
): ts.Node | undefined {
  if (position == null) {
    return undefined;
  }

  let found: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if (found || node.pos > position || node.end < position) {
      return;
    }
    if (
      node.kind === ts.SyntaxKind.Identifier &&
      node.pos === position &&
      node.end === position
    ) {
      found = node;
      return;
    }
    node.forEachChild(visit);
  };
  visit(ast);
  return found;
}

function isTypeQueryName(node: ts.Node): boolean {
  let current: ts.Node = node;
  while (ts.isQualifiedName(current)) {
    current = current.parent;
  }
  return ts.isTypeQueryNode(current);
}

function isValidPrivateIdentifierText(text: string): boolean {
  if (!text.startsWith('#') || text.length < 2) {
    return false;
  }
  const name = text.slice(1);
  const isIdentifierStart =
    /[$_\p{ID_Start}]/u.test(name[0]) || name[0] === '\\';
  const isIdentifierPart = /^[$_\u200C\u200D\p{ID_Continue}]*$/u.test(
    name.slice(1),
  );
  return isIdentifierStart && isIdentifierPart;
}
