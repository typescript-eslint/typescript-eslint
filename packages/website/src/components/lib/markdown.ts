import type { ConfigModel } from '../types';
import { parseESLintRC } from './parseConfig';

function createSummary(
  value: string,
  title: string,
  type: 'ts' | 'json',
  length: number,
): string {
  const code = `### ${title}\n\n\`\`\`${type}\n${value}\n\`\`\``;
  if ((code.match(/\n/g) ?? []).length > length) {
    return `<details>\n<summary>Expand</summary>\n\n${code}\n\n</details>`;
  }
  return code;
}

function createSummaryJson(obj: string, field: string, title: string): string {
  if (obj && obj.length > 0) {
    return createSummary(obj, title, 'json', 10);
  }
  return '';
}

function generateVersionsTable(tsVersion: string): string {
  return [
    '| package | version |',
    '| -- | -- |',
    `| \`@typescript-eslint/eslint-plugin\` | \`${process.env.TS_ESLINT_VERSION}\` |`,
    `| \`@typescript-eslint/parser\` | \`${process.env.TS_ESLINT_VERSION}\` |`,
    `| \`TypeScript\` | \`${tsVersion}\` |`,
    `| \`ESLint\` | \`${process.env.ESLINT_VERSION}\` |`,
    `| \`node\` | \`web\` |`,
  ].join('\n');
}

/**
 * Create a markdown string that user can copy and paste into an issue
 */
export function createMarkdown(state: ConfigModel): string {
  return [
    `[Playground](${document.location.toString()})`,
    createSummary(state.code, 'Code', 'ts', 30),
    createSummaryJson(state.eslintrc, 'rules', 'Eslint config'),
    createSummaryJson(state.tsconfig, 'compilerOptions', 'TypeScript config'),
    generateVersionsTable(state.ts),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Create a URLSearchParams string for the issue template
 */
export function createMarkdownParams(state: ConfigModel): string {
  const { rules } = parseESLintRC(state.eslintrc);
  const ruleKeys = Object.keys(rules);

  const onlyRuleName =
    ruleKeys.length === 1
      ? ruleKeys[0].replace('@typescript-eslint/', '')
      : 'rule name here';

  const params = {
    labels: 'bug,package: eslint-plugin,triage',
    template: '01-bug-report-plugin.yaml',
    title: `Bug: [${onlyRuleName}] <short description of the issue>`,
    'playground-link': document.location.toString(),
    'repro-code': state.code,
    'eslint-config': `module.exports = ${state.eslintrc ?? '{}'}`,
    'typescript-config': state.tsconfig ?? '{}',
    versions: generateVersionsTable(state.ts),
  };

  return new URLSearchParams(params).toString();
}
