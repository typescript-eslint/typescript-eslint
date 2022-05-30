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

export function genVersions(state: ConfigModel): string {
  return [
    '| package | version |',
    '| -- | -- |',
    `| \`@typescript-eslint/eslint-plugin\` | \`${process.env.TS_ESLINT_VERSION}\` |`,
    `| \`@typescript-eslint/parser\` | \`${process.env.TS_ESLINT_VERSION}\` |`,
    `| \`TypeScript\` | \`${state.ts}\` |`,
    `| \`ESLint\` | \`${process.env.ESLINT_VERSION}\` |`,
    `| \`node\` | \`web\` |`,
  ].join('\n');
}

export function createMarkdown(state: ConfigModel): string {
  return [
    `[Playground](${document.location.toString()})`,
    createSummary(state.code, 'Code', 'ts', 30),
    createSummaryJson(state.rules, 'rules', 'Eslint config'),
    createSummaryJson(state.tsConfig, 'compilerOptions', 'TypeScript config'),
    genVersions(state),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function createMarkdownParams(state: ConfigModel): string {
  const params = {
    template: '1-bug-report-plugin.yaml',
    title: 'Bug: [rule name here] <short description of the issue>',
    'playground-link': document.location.toString(),
    'repro-code': state.code,
    'eslint-config':
      `module.exports = ` +
      JSON.stringify(
        { parser: '@typescript-eslint/parser', rules: state.rules },
        null,
        2,
      ),
    'typescript-config': JSON.stringify(
      { compilerOptions: state.tsConfig },
      null,
      2,
    ),
    versions: genVersions(state),
  };

  return new URLSearchParams(params).toString();
}
