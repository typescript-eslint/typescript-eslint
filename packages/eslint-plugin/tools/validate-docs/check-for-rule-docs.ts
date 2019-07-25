import { TSESLint } from '@typescript-eslint/experimental-utils';
import fs from 'fs';
import path from 'path';
import { logRule } from '../log';

function checkForRuleDocs(
  rules: Record<string, Readonly<TSESLint.RuleModule<string, unknown[]>>>,
): boolean {
  const ruleDocs = new Set(
    fs.readdirSync(path.resolve(__dirname, '../../docs/rules')),
  );

  let hasErrors = false;
  Object.keys(rules).forEach(ruleName => {
    const ruleHasDoc = ruleDocs.has(`${ruleName}.md`);
    hasErrors = hasErrors || !ruleHasDoc;
    logRule(
      ruleHasDoc,
      ruleName,
      `Couldn't find file docs/rules/${ruleName}.md`,
    );
  });

  return hasErrors;
}

export { checkForRuleDocs };
