import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import fs from 'fs';
import marked from 'marked';
import path from 'path';
import { logRule } from '../log';

function validateTableRules(
  rules: Record<string, Readonly<TSESLint.RuleModule<string, unknown[]>>>,
  rulesTable: marked.Tokens.Table,
): boolean {
  let hasErrors = false;

  Object.entries(rules).forEach(([ruleName, rule]) => {
    const row = rulesTable.cells.find(row =>
      row[0].includes(`/${ruleName}.md`),
    );

    if (!row) {
      if (!rule.meta.deprecated) {
        hasErrors = true;
        logRule(false, ruleName, 'Missing entry in table');
        return;
      }

      // all is well, the rule shouldn't have a row as it's deprecated
      return;
    }
    if (row && rule.meta.deprecated) {
      hasErrors = true;
      logRule(
        false,
        ruleName,
        'Rule is marked as deprecated, should not have an entry in the table',
      );
      return;
    }

    const errors: string[] = [];
    const [
      rowLink,
      rowDescription,
      rowIsRecommended,
      rowIsFixable,
      rowNeedsTypeInfo,
    ] = row;

    function validateTableBoolean(
      value: boolean,
      cell: string,
      trueString: string,
      columnLabel: string,
    ): void {
      if (value && cell !== trueString) {
        errors.push(
          `Rule ${chalk.red(
            'not',
          )} marked as ${columnLabel} when it ${chalk.bold('should')} be`,
        );
      }

      if (!value && cell !== '') {
        errors.push(
          `Rule ${chalk.red(
            'was',
          )} marked as ${columnLabel} when it ${chalk.bold('should not')} be`,
        );
      }
    }

    const expectedLink = `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
    if (rowLink !== expectedLink) {
      errors.push(
        `Link is invalid.`,
        `    Expected: ${chalk.underline(expectedLink)}`,
        `    Received: ${chalk.underline(rowLink)}`,
      );
    }

    const expectedDescription = rule.meta.docs.description;
    if (rowDescription !== expectedDescription) {
      errors.push(
        'Description does not match the rule metadata.',
        `    Expected: ${chalk.underline(expectedDescription)}`,
        `    Received: ${chalk.underline(rowDescription)}`,
      );
    }

    validateTableBoolean(
      !!rule.meta.docs.recommended,
      rowIsRecommended,
      ':heavy_check_mark:',
      'recommended',
    );

    validateTableBoolean(
      rule.meta.fixable !== undefined,
      rowIsFixable,
      ':wrench:',
      'fixable',
    );

    // quick-and-dirty check to see if it uses parserServices
    // not perfect but should be good enough
    const ruleFileContents = fs.readFileSync(
      path.resolve(__dirname, `../../src/rules/${ruleName}.ts`),
    );

    const usesTypeInformation = ruleFileContents.includes('getParserServices');
    const tableRowHasThoughtBalloon = !!rowNeedsTypeInfo;
    if (rule.meta.docs.requiresTypeChecking === true) {
      if (!usesTypeInformation) {
        errors.push(
          'Rule has `requiresTypeChecking` set in its meta, but it does not actually use type information - fix by removing `meta.docs.requiresTypeChecking`',
        );
      } else if (!tableRowHasThoughtBalloon) {
        errors.push(
          'Rule was documented as not using type information, when it actually does - fix by updating the plugin README.md',
        );
      }
    } else {
      if (usesTypeInformation) {
        errors.push(
          'Rule does not have `requiresTypeChecking` set in its meta, despite using type information - fix by setting `meta.docs.requiresTypeChecking: true` in the rule',
        );
      } else if (tableRowHasThoughtBalloon) {
        errors.push(
          `Rule was documented as using type information, when it actually doesn't - fix by updating the plugin README.md`,
        );
      }
    }

    validateTableBoolean(
      usesTypeInformation,
      rowNeedsTypeInfo,
      ':thought_balloon:',
      'requiring type information',
    );

    hasErrors = hasErrors || errors.length > 0;
    logRule(errors.length === 0, ruleName, ...errors);
  });

  return hasErrors;
}

export { validateTableRules };
