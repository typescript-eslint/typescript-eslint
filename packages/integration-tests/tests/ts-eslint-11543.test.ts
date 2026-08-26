import {
  eslintIntegrationTest,
  typescriptIntegrationTest,
} from '../tools/integration-test-base';

for (const additionalFlags of [
  [],
  ['--strictNullChecks'],
  ['--strictNullChecks', '--exactOptionalPropertyTypes'],
]) {
  typescriptIntegrationTest(
    `typescript${
      additionalFlags.length ? ` with ${additionalFlags.join(', ')}` : ''
    } without #11543 workarounds`,
    __filename,
    ['--allowJs', '--esModuleInterop', ...additionalFlags, 'eslint.config.js'],
    out => {
      const lines = out.split('\n').filter(
        line =>
          line &&
          // error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.
          // this is fine for us to ignore in this context
          !line.includes('error TS18028'),
      );

      // The types should not error (https://github.com/typescript-eslint/typescript-eslint/issues/11543)
      expect(lines).toHaveLength(0);
    },
  );
}

typescriptIntegrationTest(
  'typescript reports TS2578 for the now-unneeded #11543 workaround directive',
  __filename,
  ['--allowJs', '--esModuleInterop', 'ts2578.config.js'],
  out => {
    expect(out).toContain('error TS2578');
  },
);

eslintIntegrationTest(__filename, 'eslint.config.js');
