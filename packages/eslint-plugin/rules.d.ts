/*
We purposely don't generate types for our plugin because:
1) there's no real reason that anyone should do a typed import of our rules,
2) it would require us to change our code so there aren't as many inferred types

This type declaration exists as a hacky way to add a type to the export for our
internal packages that require it
*/

import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

export interface TypeScriptESLintRules {
  [ruleName: string]: RuleModule<string, unknown[]>;
}
declare const rules: TypeScriptESLintRules;
export = rules;
