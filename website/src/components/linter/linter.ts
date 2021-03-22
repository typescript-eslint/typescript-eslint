import type { ParserOptions } from '@typescript-eslint/types';
import type { Linter } from '@typescript-eslint/experimental-utils/dist/ts-eslint/Linter';
import type {
  RuleCreateFunction,
  RuleModule,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import type { ParseForESLintResult } from './parser';

const PARSER_NAME = '@typescript-eslint/parser';

export interface WebLinter {
  ruleNames: string[];
  getAst(): ParseForESLintResult['ast'];
  lint(
    code: string,
    parserOptions: ParserOptions,
    rules?: Linter.RulesRecord,
  ): Linter.LintMessage[];
}

export async function loadLinter(): Promise<WebLinter> {
  const rules: Record<
    string,
    RuleCreateFunction | RuleModule<string, unknown[]>
  > = (await import('@typescript-eslint/eslint-plugin/dist/rules')).default;
  const { parseForESLint } = await import(`./parser`);
  const { Linter } = await import('eslint/lib/linter/linter');
  const linter: Linter = new Linter();
  let storedAST: ParseForESLintResult['ast'];

  linter.defineParser(PARSER_NAME, {
    parseForESLint(code: string, options: ParserOptions): ParseForESLintResult {
      const toParse = parseForESLint(code, options);
      storedAST = toParse.ast;
      return toParse;
    },
    // parse(code: string, options: ParserOptions): ParseForESLintResult['ast'] {
    //   const toParse = parseForESLint(code, options);
    //   storedAST = toParse.ast;
    //   return toParse.ast;
    // },
  });
  for (const name of Object.keys(rules)) {
    linter.defineRule(`@typescript-eslint/${name}`, rules[name]);
  }

  const ruleNames = Object.keys(rules).map(
    name => `@typescript-eslint/${name}`,
  );

  return {
    ruleNames,
    getAst(): Linter.ESLintParseResult['ast'] {
      return storedAST;
    },
    lint(
      code: string,
      parserOptions: ParserOptions,
      rules?: Linter.RulesRecord,
    ): Linter.LintMessage[] {
      return linter.verify(code, {
        parser: PARSER_NAME,
        parserOptions,
        rules,
      });
    },
  };
}
