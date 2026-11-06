declare module 'eslint' {
  import type { TSESLint } from '@typescript-eslint/utils';

  // `@typescript-eslint/utils/ts-eslint` is type-only, so the runtime `Linter`
  // class has to come from ESLint itself. We still describe it with our types.
  export const Linter: typeof TSESLint.Linter;
}
