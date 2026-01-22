/*
We intentionally do not include @types/eslint.

This is to ensure that nobody accidentally uses those incorrect types
instead of the ones declared within this package
*/

declare module 'eslint' {
  export const ESLint: unknown;
  export const Linter: unknown;
  export const RuleTester: unknown;
  export const SourceCode: unknown;
}
declare module 'eslint/use-at-your-own-risk' {
  export const FlatESLint: unknown;
  export const LegacyESLint: unknown;
}
