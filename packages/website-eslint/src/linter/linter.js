import 'vs/language/typescript/tsWorker';
import { parseForESLint } from './parser';
import { Linter } from 'eslint';
import rules from '@typescript-eslint/eslint-plugin/dist/rules';

const PARSER_NAME = '@typescript-eslint/parser';

export function loadLinter() {
  const linter = new Linter();
  let storedAST;
  let storedTsAST;

  linter.defineParser(PARSER_NAME, {
    parseForESLint(code, options) {
      const toParse = parseForESLint(code, options);
      storedAST = toParse.ast;
      storedTsAST = toParse.tsAst;
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

  const ruleNames = Array.from(linter.getRules()).map(value => {
    return {
      name: value[0],
      description: value[1]?.meta?.docs?.description,
    };
  });

  return {
    ruleNames: ruleNames,

    getAst() {
      return storedAST;
    },

    getTsAst() {
      return storedTsAST;
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
