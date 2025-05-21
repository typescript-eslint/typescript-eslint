declare module 'eslint/use-at-your-own-risk' {
  import type { AnyRuleModule } from '@typescript-eslint/utils/ts-eslint';

  export const builtinRules: ReadonlyMap<string, AnyRuleModule>;
}

declare module 'eslint' {
  export { SourceCode } from '@typescript-eslint/utils/ts-eslint';
}
