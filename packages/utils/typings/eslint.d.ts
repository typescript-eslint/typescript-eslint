/*
We intentionally do not include @types/eslint.

This is to ensure that nobody accidentally uses those incorrect types
instead of the ones declared within this package
*/

declare module 'eslint' {
  const Linter: unknown;
  const RuleTester: unknown;
  const SourceCode: unknown;

  export { Linter, RuleTester, SourceCode };
}
declare module 'eslint/use-at-your-own-risk' {
  const FlatESLint: unknown;
  const LegacyESLint: unknown;

  export { FlatESLint, LegacyESLint };
}
