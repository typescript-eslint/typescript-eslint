/*
We intentionally do not include @types/eslint.

This is to ensure that nobody accidentally uses those incorrect types
instead of the ones declared within this package
*/

declare module 'eslint' {
  const Linter: unknown;
  const RuleTester: unknown;
  const SourceCode: unknown;
  const CLIEngine: unknown;
  const ESLint: unknown;

  export { Linter, RuleTester, SourceCode, CLIEngine, ESLint };
}
