import { TSESLint } from '@typescript-eslint/experimental-utils';
import fs from 'fs';
import path from 'path';
import { logRule } from '../log';
import chalk from 'chalk';

function checkForRuleDocs(
  rules: Record<string, Readonly<TSESLint.RuleModule<string, unknown[]>>>,
): boolean {
  const docsRoot = path.resolve(__dirname, '../../docs/rules');
  const ruleDocs = new Set(fs.readdirSync(docsRoot));

  let hasErrors = false;
  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName].meta;
    const errors: string[] = [];
    const ruleHasDoc = ruleDocs.has(`${ruleName}.md`);
    if (!ruleHasDoc) {
      errors.push(`Couldn't find file docs/rules/${ruleName}.md`);
    } else {
      const file = fs.readFileSync(
        path.join(docsRoot, `${ruleName}.md`),
        'utf-8',
      );
      const match = /^\s*#[^\r\n]*/.exec(file) ?? [];
      const expectedDescription = `# ${rule.docs.description} (\`${ruleName}\`)`;
      if (!match[0] || match[0] !== expectedDescription) {
        errors.push(
          'Header of file does not match the rule metadata.',
          `    Expected: ${chalk.underline(expectedDescription)}`,
          `    Received: ${chalk.underline(match[0])}`,
        );
      }
    }

    const ruleConfigName = /([A-Za-z-]+)\.md/.exec(rule.docs.url) ?? [];
    if (ruleConfigName[1] !== ruleName) {
      errors.push(
        'Name field does not match with rule name.',
        `    Expected: ${chalk.underline(ruleName)}`,
        `    Received: ${chalk.underline(ruleConfigName[1])}`,
      );
    }

    logRule(errors.length === 0, ruleName, ...errors);
    hasErrors = hasErrors || errors.length !== 0;
  });

  return hasErrors;
}

export { checkForRuleDocs };
