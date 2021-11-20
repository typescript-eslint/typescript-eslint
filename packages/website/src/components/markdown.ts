import type { ConfigModel } from './types';

export function createSummary(
  value: string,
  type: string,
  length = 20,
): string {
  const code = `\`\`\`${type}\n${value}\n\`\`\``;
  if ((code.match(/\n/g) ?? []).length > length) {
    return `<details>\n<summary>Expand</summary>\n\n${code}\n\n</details>`;
  }
  return code;
}

export function createMarkdown(state: ConfigModel): string {
  const esConfig = { rules: state.rules };
  const tsConfig = { compilerOptions: state.tsConfig };
  return [
    '## Repro',
    `[Playground](${document.location.toString()})`,
    '### Code',
    createSummary(state.code, 'ts', 30),
    '### Eslint config',
    createSummary(JSON.stringify(esConfig, null, 2), 'json'),
    '### TypeScript config',
    createSummary(JSON.stringify(tsConfig, null, 2), 'json'),
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
