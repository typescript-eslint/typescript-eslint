import { nodeIntegrationTest } from '../tools/integration-test-base';

const PARSER_TS7_ERROR_MESSAGE = [
  "typescript-eslint's classic parser backend does not support TypeScript 7 installed as 'typescript'.",
  "The experimental TypeScript 7.1 native backend requires side-by-side 'typescript' and '@typescript/native' aliases. See https://typescript-eslint.io/packages/parser#experimental-typescript-71-native-backend.",
].join('\n');
const PACKAGE_TS7_ERROR_MESSAGE = 'typescript-eslint does not support TS 7.0.';

for (const scriptName of [
  'imports-eslint-plugin.mjs',
  'imports-parser.mjs',
  'imports-typescript-eslint.mjs',
]) {
  nodeIntegrationTest(__filename, scriptName, stderr => {
    expect(stderr).toContain(
      scriptName === 'imports-parser.mjs'
        ? PARSER_TS7_ERROR_MESSAGE
        : PACKAGE_TS7_ERROR_MESSAGE,
    );
  });
}
