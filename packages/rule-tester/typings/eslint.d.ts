declare module 'eslint/use-at-your-own-risk' {
  import type { AnyRuleModule } from '@typescript-eslint/utils/ts-eslint';

  export const builtinRules: ReadonlyMap<string, AnyRuleModule>;
}

declare module 'eslint' {
  import type * as TSESLint from '@typescript-eslint/utils/ts-eslint';

  // `@typescript-eslint/utils/ts-eslint` is type-only, so the runtime classes
  // have to come from ESLint itself. We still describe them with our types.
  export const Linter: typeof TSESLint.Linter;
  export const SourceCode: typeof TSESLint.SourceCode;
}
