// @ts-ignore
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/types';

const PARSER_NAME = '@typescript-eslint/parser';

interface ESLintPlugin {
  rules: Linter.RulesRecord;
  config: Linter.Config;
}

export interface WebLinter {
  fix(
    code: string,
    parserOptions: ParserOptions,
    rules: Linter.RulesRecord,
  ): Linter.FixReport;
  lint(
    code: string,
    parserOptions: ParserOptions,
    rules: Linter.RulesRecord,
  ): Linter.LintMessage[];
}

export async function loadLinter(): Promise<WebLinter> {
  const plugins: ESLintPlugin = await import(
    // @ts-ignore
    '@typescript-eslint/eslint-plugin'
  );
  const parser = await import(`./parser`);
  // @ts-ignore
  const ESLinter = await import('eslint/lib/linter/linter');

  const linter = new ESLinter.Linter();

  const rules = Object.entries(plugins.rules).reduce((rules, [name, rule]) => ({
    ...rules,
    [`@typescript-eslint/${name}`]: rule,
  }));

  linter.defineParser(PARSER_NAME, parser);
  linter.defineRules(rules);

  return {
    fix(
      code: string,
      parserOptions: ParserOptions,
      rules: Linter.RulesRecord,
    ): Linter.FixReport {
      return linter.verifyAndFix(code, {
        parser: PARSER_NAME,
        parserOptions,
        rules,
      });
    },
    lint(
      code: string,
      parserOptions: ParserOptions,
      rules: Linter.RulesRecord,
    ): Linter.LintMessage[] {
      return linter.verify(code, {
        parser: PARSER_NAME,
        parserOptions,
        rules,
      });
    },
  };
}
