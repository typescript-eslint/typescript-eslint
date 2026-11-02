import * as nativeAst from '@typescript/native/unstable/ast';
import * as nativeSync from '@typescript/native/unstable/sync';
import * as ts from 'typescript';

// Composite masks are unions of the single members and are compared only by
// those members, so a differing composite is not a differing value.
const COMPOSITE_MEMBERS =
  /^(?:All|Intrinsic|NodeBuilderFlagsMask|\w+Excludes)$/;

function mismatches(
  native: Record<string, number | string>,
  classic: Record<string, number | string>,
): string[] {
  return Object.entries(native).flatMap(([name, value]) =>
    typeof value === 'number' &&
    !COMPOSITE_MEMBERS.test(name) &&
    typeof classic[name] === 'number' &&
    classic[name] !== value
      ? [`${name}: native ${value}, classic ${String(classic[name])}`]
      : [],
  );
}

// The adapters pass these through without translation, so every member the
// two enums share must hold the same value. SyntaxKind, NodeFlags, and
// ObjectFlags are renumbered and are translated by name instead.
describe.each([
  ['DiagnosticCategory', nativeSync.DiagnosticCategory, ts.DiagnosticCategory],
  ['ElementFlags', nativeSync.ElementFlags, ts.ElementFlags],
  ['IndexKind', nativeSync.IndexKind, ts.IndexKind],
  ['JsxEmit', nativeSync.JsxEmit, ts.JsxEmit],
  ['LanguageVariant', nativeAst.LanguageVariant, ts.LanguageVariant],
  ['ModifierFlags', nativeSync.ModifierFlags, ts.ModifierFlags],
  ['ModuleKind', nativeSync.ModuleKind, ts.ModuleKind],
  [
    'ModuleResolutionKind',
    nativeSync.ModuleResolutionKind,
    ts.ModuleResolutionKind,
  ],
  ['NodeBuilderFlags', nativeSync.NodeBuilderFlags, ts.NodeBuilderFlags],
  ['ScriptKind', nativeSync.ScriptKind, ts.ScriptKind],
  ['ScriptTarget', nativeAst.ScriptTarget, ts.ScriptTarget],
  ['SignatureKind', nativeSync.SignatureKind, ts.SignatureKind],
  ['SymbolFlags', nativeSync.SymbolFlags, ts.SymbolFlags],
  ['TypeFlags', nativeSync.TypeFlags, ts.TypeFlags],
  ['TypeFormatFlags', nativeSync.TypeFormatFlags, ts.TypeFormatFlags],
  ['TypePredicateKind', nativeSync.TypePredicateKind, ts.TypePredicateKind],
] as const)('%s', (_name, native, classic) => {
  it('has the same value as classic for every shared member', () => {
    expect(mismatches(native, classic)).toEqual([]);
  });
});
