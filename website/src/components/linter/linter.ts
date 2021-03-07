import type { ParserOptions } from '@typescript-eslint/types';
import type { Linter } from 'eslint/lib/linter/linter';
import type { ParseForESLintResult } from './parser';

const PARSER_NAME = '@typescript-eslint/parser';

export interface WebLinter {
  ruleNames: string[];
  getAst(): ParseForESLintResult['ast'];
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
  const { parseForESLint } = await import(`./parser`);
  const { Linter } = await import('eslint/lib/linter/linter');
  const linter = new Linter();
  let storedAST: ParseForESLintResult['ast'];

  linter.defineParser(PARSER_NAME, {
    parseForESLint(code: string, options: ParserOptions): ParseForESLintResult {
      const toParse = parseForESLint(code, options);
      storedAST = toParse.ast;
      return toParse;
    },
    parse(code: string, options: ParserOptions): ParseForESLintResult['ast'] {
      const toParse = parseForESLint(code, options);
      storedAST = toParse.ast;
      return toParse.ast;
    },
  });
  for (const name of Object.keys(rules.default)) {
    linter.defineRule(`@typescript-eslint/${name}`, rules.default[name]);
  }

  const ruleNames = Object.keys(rules.default).map(
    name => `@typescript-eslint/${name}`,
  );

  return {
    ruleNames,
    getAst(): ParseForESLintResult['ast'] {
      return storedAST;
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
