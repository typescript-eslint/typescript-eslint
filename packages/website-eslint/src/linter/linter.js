import 'vs/language/typescript/tsWorker';
import { parseForESLint } from './parser';
import { Linter } from 'eslint';
import rules from '@typescript-eslint/eslint-plugin/dist/rules';

const PARSER_NAME = '@typescript-eslint/parser';

export function loadLinter(libs, options) {
  const linter = new Linter();
  let storedAST;
  let storedTsAST;
  let storedScope;

  let compilerOptions = options;

  linter.defineParser(PARSER_NAME, {
    parseForESLint(code, eslintOptions) {
      const toParse = parseForESLint(
        code,
        eslintOptions,
        compilerOptions,
        libs,
      );
      storedAST = toParse.ast;
      storedTsAST = toParse.tsAst;
      storedScope = toParse.scopeManager;
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

  const ruleNames = Array.from(linter.getRules()).map(value => {
    return {
      name: value[0],
      description: value[1]?.meta?.docs?.description,
    };
  });

  return {
    ruleNames: ruleNames,

    updateOptions(options) {
      if (options) {
        compilerOptions = Object.assign({}, compilerOptions, options);
      }
    },

    getScope() {
      return storedScope;
    },

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
