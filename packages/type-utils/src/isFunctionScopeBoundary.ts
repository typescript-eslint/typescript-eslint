import type { Node, SourceFile } from 'typescript';
import { isExternalModule, SyntaxKind } from 'typescript';

export const enum ScopeBoundary {
  None = 0,
  Function = 1,
  Block = 2,
  Type = 4,
  ConditionalType = 8,
}

export function isFunctionScopeBoundary(node: Node): ScopeBoundary {
  switch (node.kind) {
    case SyntaxKind.FunctionExpression:
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.Constructor:
    case SyntaxKind.ModuleDeclaration:
    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.ClassExpression:
    case SyntaxKind.EnumDeclaration:
    case SyntaxKind.MethodDeclaration:
    case SyntaxKind.FunctionDeclaration:
    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
    case SyntaxKind.MethodSignature:
    case SyntaxKind.CallSignature:
    case SyntaxKind.ConstructSignature:
    case SyntaxKind.ConstructorType:
    case SyntaxKind.FunctionType:
      return ScopeBoundary.Function;
    case SyntaxKind.SourceFile:
      // if SourceFile is no module, it contributes to the global scope and is therefore no scope boundary
      return isExternalModule(<SourceFile>node)
        ? ScopeBoundary.Function
        : ScopeBoundary.None;
    default:
      return ScopeBoundary.None;
  }
}
