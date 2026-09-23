import { nodeIntegrationTest } from '../tools/integration-test-base';

const TS7_ERROR_MESSAGE = [
  'typescript-eslint does not support TS 7.0.',
  'Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0 to run typescript-eslint using the TS 6 API.',
  "See also https://github.com/typescript-eslint/typescript-eslint/issues/10940 for tracking typescript-eslint's support for TS >=7.1",
].join('\n');

for (const scriptName of [
  'imports-eslint-plugin.mjs',
  'imports-parser.mjs',
  'imports-typescript-eslint.mjs',
]) {
  nodeIntegrationTest(__filename, scriptName, stderr => {
    expect(stderr).toContain(TS7_ERROR_MESSAGE);
  });
}
