import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import path from 'path';
// import plugin from '../src/index';
import { checkForRuleDocs } from './check-for-rule-docs';
import { parseReadme } from './parse-readme';
import { validateTableStructure } from './validate-table-structure';
import { validateTableRules } from './validate-table-rules';

// TODO - use non-hard coded list when #313 is merged
// const { rules } = plugin;
const rules = [
  'adjacent-overload-signatures',
  'array-type',
  'await-thenable',
  'ban-ts-ignore',
  'ban-types',
  'camelcase',
  'class-name-casing',
  'explicit-function-return-type',
  'explicit-member-accessibility',
  'func-call-spacing',
  'generic-type-naming',
  'indent',
  'interface-name-prefix',
  'member-delimiter-style',
  'member-naming',
  'member-ordering',
  'no-angle-bracket-type-assertion',
  'no-array-constructor',
  'no-empty-interface',
  'no-explicit-any',
  'no-extra-parens',
  'no-extraneous-class',
  'no-for-in-array',
  'no-inferrable-types',
  'no-magic-numbers',
  'no-misused-new',
  'no-namespace',
  'no-non-null-assertion',
  'no-object-literal-type-assertion',
  'no-parameter-properties',
  'no-require-imports',
  'no-this-alias',
  'no-triple-slash-reference',
  'no-type-alias',
  'no-unnecessary-qualifier',
  'no-unnecessary-type-assertion',
  'no-unused-vars',
  'no-use-before-define',
  'no-useless-constructor',
  'no-var-requires',
  'prefer-for-of',
  'prefer-function-type',
  'prefer-includes',
  'prefer-interface',
  'prefer-namespace-keyword',
  'prefer-regexp-exec',
  'prefer-string-starts-ends-with',
  'promise-function-async',
  'require-array-sort-compare',
  'restrict-plus-operands',
  'semi',
  'type-annotation-spacing',
  'unbound-method',
  'unified-signatures',
].reduce<Record<string, TSESLint.RuleModule<any, any>>>((acc, f) => {
  const rule = require(path.resolve(__dirname, `../../src/rules/${f}`)).default;
  acc[f] = rule;
  return acc;
}, {});

let hasErrors = false;
console.log(chalk.underline('Checking for rule docs'));
hasErrors = hasErrors || checkForRuleDocs(rules);

console.log();
console.log(chalk.underline('Valdiating README.md'));
const rulesTable = parseReadme();

console.log();
console.log(chalk.italic('Checking table structure...'));
hasErrors = hasErrors || validateTableStructure(rules, rulesTable);

console.log();
console.log(chalk.italic('Checking rules...'));
hasErrors = hasErrors || validateTableRules(rules, rulesTable);

if (hasErrors) {
  console.log('\n\n');
  console.error(
    chalk.bold.bgRed.white('There were errors found in the documentation.'),
  );
  console.log('\n\n');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
