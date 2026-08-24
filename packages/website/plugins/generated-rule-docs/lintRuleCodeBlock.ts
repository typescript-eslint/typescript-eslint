import type { ESLintPluginRuleModule } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type * as mdast from 'mdast';

import * as tseslintParser from '@typescript-eslint/parser';
import { Linter } from '@typescript-eslint/utils/ts-eslint';

import { parseRuleOptionsFromMeta } from './ruleOptions';

export interface LintRuleCodeBlockOptions {
  code: string;
  language: string;
  meta: string | null | undefined;
  rule: Readonly<ESLintPluginRuleModule>;
  ruleName: string;
  tsconfigRootDir: string;
}

export function isTypeScriptCodeBlock(
  node: mdast.Code,
): node is mdast.Code & { lang: string } {
  return /^tsx?\b/i.test(node.lang?.trim() ?? '');
}

export function lintRuleCodeBlock({
  code,
  language,
  meta,
  rule,
  ruleName,
  tsconfigRootDir,
}: LintRuleCodeBlockOptions): Linter.LintMessage[] {
  const options = parseRuleOptionsFromMeta(meta);
  const namespacedRuleName = `@typescript-eslint/${ruleName}`;
  const ruleEntry: Linter.RuleLevelAndOptions = options.length
    ? ['error', ...options]
    : ['error'];

  const linter = new Linter();
  return linter.verify(
    code,
    [
      {
        languageOptions: {
          parser: tseslintParser,
          parserOptions: {
            disallowAutomaticSingleRunInference: true,
            project: './tsconfig.json',
            tsconfigRootDir,
          },
        },
        plugins: {
          '@typescript-eslint': { rules: { [ruleName]: rule } },
        },
        rules: {
          [namespacedRuleName]: ruleEntry,
        },
      },
    ],
    /^tsx\b/i.test(language.trim()) ? 'react.tsx' : 'file.ts',
  );
}
