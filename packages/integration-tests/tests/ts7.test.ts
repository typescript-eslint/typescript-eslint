import { nodeIntegrationTest } from '../tools/integration-test-base';

// TypeScript 7's `typescript` package exports only `version` and
// `versionMajorMinor` — the rest of the compiler API is absent. Each package
// entry point must throw our friendly error before anything else touches the
// TS API, which is only guaranteed by CJS execution order — so this must be
// tested against the built packages in a real node process, not via vitest
// module mocking.
const TS7_ERROR_MESSAGE = [
  'typescript-eslint does not support TS 7.',
  'Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0 to run typescript-eslint using the TS 6 API.',
  "See also https://github.com/typescript-eslint/typescript-eslint/issues/10940 for tracking typescript-eslint's support for TS 7",
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
