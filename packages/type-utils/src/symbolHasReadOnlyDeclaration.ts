import type { Symbol as SymbolType, TypeChecker } from 'typescript';
import { ModifierFlags, NodeFlags, SymbolFlags } from 'typescript';

import { isCallExpression } from './isCallExpression';
import { isEnumMember } from './isEnumMember';
import { isInConstContext } from './isInConstContext';
import { isModifierFlagSet } from './isModifierFlagSet';
import { isNodeFlagSet } from './isNodeFlagSet';
import { isPropertyAssignment } from './isPropertyAssignment';
import { isReadonlyAssignmentDeclaration } from './isReadonlyAssignmentDeclaration';
import { isShorthandPropertyAssignment } from './isShorthandPropertyAssignment';
import { isVariableDeclaration } from './isVariableDeclaration';

export function symbolHasReadonlyDeclaration(
  symbol: SymbolType,
  checker: TypeChecker,
): boolean {
  return (
    (symbol.flags & SymbolFlags.Accessor) === SymbolFlags.GetAccessor ||
    Boolean(
      symbol
        .getDeclarations()
        ?.some(
          node =>
            isModifierFlagSet(node, ModifierFlags.Readonly) ||
            (isVariableDeclaration(node) &&
              isNodeFlagSet(node.parent, NodeFlags.Const)) ||
            (isCallExpression(node) &&
              isReadonlyAssignmentDeclaration(node, checker)) ||
            isEnumMember(node) ||
            ((isPropertyAssignment(node) ||
              isShorthandPropertyAssignment(node)) &&
              isInConstContext(node.parent)),
        ),
    )
  );
}
