// @ts-ignore
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/types';

const PARSER_NAME = '@typescript-eslint/parser';

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
  const rules: Linter.RulesRecord = await import(
    '@typescript-eslint/eslint-plugin/dist/rules'
  );
  const parser = await import(`./parser`);
  const { Linter } = await import('eslint/lib/linter/linter');

  const linter = new Linter();

  linter.defineParser(PARSER_NAME, parser);
  for (const name of Object.keys(rules.default)) {
    linter.defineRule(`@typescript-eslint/${name}`, rules.default[name]);
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
