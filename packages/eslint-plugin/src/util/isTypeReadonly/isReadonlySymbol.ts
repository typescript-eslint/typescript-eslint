// - this code is ported from typescript's type checker
// Starting at https://github.com/Microsoft/TypeScript/blob/4212484ae18163df867f53dab19a8cc0c6000793/src/compiler/checker.ts#L26285

import * as ts from 'typescript';

// #region internal types used for isReadonlySymbol

// we can't use module augmentation because typescript uses export = ts
/* eslint-disable @typescript-eslint/ban-ts-ignore */

// CheckFlags is actually const enum
// https://github.com/Microsoft/TypeScript/blob/236012e47b26fee210caa9cbd2e072ef9e99f9ae/src/compiler/types.ts#L4038
const enum CheckFlags {
  Readonly = 1 << 3,
}
type GetCheckFlags = (symbol: ts.Symbol) => CheckFlags;
// @ts-ignore
const getCheckFlags: GetCheckFlags = ts.getCheckFlags;

type GetDeclarationModifierFlagsFromSymbol = (s: ts.Symbol) => ts.ModifierFlags;
const getDeclarationModifierFlagsFromSymbol: GetDeclarationModifierFlagsFromSymbol =
  // @ts-ignore
  ts.getDeclarationModifierFlagsFromSymbol;

/* eslint-enable @typescript-eslint/ban-ts-ignore */

// function getDeclarationNodeFlagsFromSymbol(s: ts.Symbol): ts.NodeFlags {
//   return s.valueDeclaration ? ts.getCombinedNodeFlags(s.valueDeclaration) : 0;
// }

// #endregion

function isReadonlySymbol(symbol: ts.Symbol): boolean {
  // The following symbols are considered read-only:
  // Properties with a 'readonly' modifier
  // Variables declared with 'const'
  // Get accessors without matching set accessors
  // Enum members
  // Unions and intersections of the above (unions and intersections eagerly set isReadonly on creation)

  // transient readonly property
  if (getCheckFlags(symbol) & CheckFlags.Readonly) {
    console.log('check flags is truthy');
    return true;
  }

  // Properties with a 'readonly' modifier
  if (
    symbol.flags & ts.SymbolFlags.Property &&
    getDeclarationModifierFlagsFromSymbol(symbol) & ts.ModifierFlags.Readonly
  ) {
    return true;
  }

  // Variables declared with 'const'
  // if (
  //   symbol.flags & ts.SymbolFlags.Variable &&
  //   getDeclarationNodeFlagsFromSymbol(symbol) & ts.NodeFlags.Const
  // ) {
  //   return true;
  // }

  // Get accessors without matching set accessors
  if (
    symbol.flags & ts.SymbolFlags.Accessor &&
    !(symbol.flags & ts.SymbolFlags.SetAccessor)
  ) {
    return true;
  }

  // Enum members
  if (symbol.flags & ts.SymbolFlags.EnumMember) {
    return true;
  }

  return false;

  // TODO - maybe add this check?
  // || symbol.declarations.some(isReadonlyAssignmentDeclaration)
}

export { isReadonlySymbol };
