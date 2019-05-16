import chalk from 'chalk';
import plugin from '../../src/index';
import { checkForRuleDocs } from './check-for-rule-docs';
import { parseReadme } from './parse-readme';
import { validateTableStructure } from './validate-table-structure';
import { validateTableRules } from './validate-table-rules';

const { rules } = plugin;

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
