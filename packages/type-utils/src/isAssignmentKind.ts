import { SyntaxKind } from 'typescript';

export function isAssignmentKind(kind: SyntaxKind): boolean {
  return (
    kind >= SyntaxKind.FirstAssignment && kind <= SyntaxKind.LastAssignment
  );
}
