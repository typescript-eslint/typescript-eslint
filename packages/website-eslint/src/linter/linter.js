import { parseForESLint } from './parser';
import { Linter } from 'eslint';
import rules from '@typescript-eslint/eslint-plugin/dist/rules';

const PARSER_NAME = '@typescript-eslint/parser';

export function loadLinter() {
  const linter = new Linter();
  let storedAST;

  linter.defineParser(PARSER_NAME, {
    parseForESLint(code, options) {
      const toParse = parseForESLint(code, options);
      storedAST = toParse.ast;
      return toParse;
    }, // parse(code: string, options: ParserOptions): ParseForESLintResult['ast'] {
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

    getAst() {
      return storedAST;
    },

    lint(code, parserOptions, rules) {
      return linter.verify(code, {
        parser: PARSER_NAME,
        parserOptions,
        rules,
      });
    },
  };
}
