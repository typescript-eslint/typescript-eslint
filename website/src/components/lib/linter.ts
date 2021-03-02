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
  const plugin: ESLintPlugin = await import('@typescript-eslint/eslint-plugin');
  const parser = await import(`./parser`);
  const ESLinter = await import('eslint/lib/linter/linter');

  const linter = new ESLinter.Linter();

  linter.defineParser(PARSER_NAME, parser);
  for (const name of Object.keys(plugin.rules)) {
    linter.defineRule(`@typescript-eslint/${name}`, plugin.rules[name]);
  }

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
