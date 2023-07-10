declare module 'eslint/use-at-your-own-risk' {
  import type { AnyRuleModule } from '@typescript-eslint/utils/ts-eslint';

  export const builtinRules: ReadonlyMap<string, AnyRuleModule>;
}

declare module '@eslint/eslintrc' {
  import type { Linter } from '@typescript-eslint/utils/ts-eslint';

  export const Legacy: {
    ConfigOps: {
      normalizeConfigGlobal: (
        configuredValue: boolean | string | null,
      ) => Linter.GlobalVariableOptionBase;
      // ...
    };
    environments: Map<string, Linter.Environment>;
    // ...
  };
}

declare module 'eslint' {
  export { SourceCode } from '@typescript-eslint/utils/ts-eslint';
}
