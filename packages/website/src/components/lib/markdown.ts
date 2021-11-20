import type { ConfigModel } from '../types';

export function createSummary(
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

function createSummaryJson(
  obj: ConfigModel['rules'] | ConfigModel['tsConfig'],
  field: string,
  title: string,
): string {
  if (obj && Object.keys(obj).length > 0) {
    return createSummary(
      JSON.stringify({ [field]: obj }, null, 2),
      title,
      'json',
      10,
    );
  }
  return '';
}

export function createMarkdown(state: ConfigModel): string {
  return [
    '## Repro',
    `[Playground](${document.location.toString()})`,
    createSummary(state.code, 'Code', 'ts', 30),
    createSummaryJson(state.rules, 'rules', 'Eslint config'),
    createSummaryJson(state.tsConfig, 'compilerOptions', 'TypeScript config'),
    '## Expected Result\n',
    '## Actual Result\n',
    '## Additional Info\n',
    '## Versions',
    `| package                            | version |
| ---------------------------------- | ------- |
| \`@typescript-eslint/eslint-plugin\` | \`${process.env.TS_ESLINT_VERSION}\` |
| \`@typescript-eslint/parser\`        | \`${process.env.TS_ESLINT_VERSION}\` |
| \`TypeScript\`                       | \`${state.ts}\` |
| \`ESLint\`                           | \`${process.env.ESLINT_VERSION}\` |
| \`Env\`                              | \`web\` |`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
