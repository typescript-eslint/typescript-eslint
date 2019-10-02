import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import marked from 'marked';
import { logError } from '../log';

const RULE_LINK_REGEX = /\[`@typescript-eslint\/(.+)`\]/;
function validateTableStructure(
  rules: Record<string, Readonly<TSESLint.RuleModule<string, unknown[]>>>,
  rulesTable: marked.Tokens.Table,
): boolean {
  const ruleNames = Object.keys(rules)
    .filter(ruleName => rules[ruleName].meta.deprecated !== true)
    .sort();
  let hasErrors = false;

  rulesTable.cells.forEach((row, rowIndex) => {
    const match = RULE_LINK_REGEX.exec(row[0]);
    if (!match) {
      logError(chalk.bold(`Unable to parse link in row ${rowIndex}:`), row[0]);
      hasErrors = true;
      return;
    }

    const rowRuleName = match[1];
    const ruleIndex = ruleNames.findIndex(ruleName => rowRuleName === ruleName);
    if (ruleIndex === -1) {
      logError(
        chalk.bold(
          `Found rule ${rowRuleName} in table, but it doesn't exist in the plugin.`,
        ),
      );
      hasErrors = true;
      return;
    }

    if (ruleIndex !== rowIndex) {
      console.error(
        chalk.bold.red('✗'),
        chalk.bold('Sorting:'),
        'Incorrect line number for',
        chalk.bold(rowRuleName),
      );
      hasErrors = true;
      return;
    }
  });

  return hasErrors;
}

export { validateTableStructure };
