import {
  eslintIntegrationTest,
  typescriptIntegrationTest,
} from '../tools/integration-test-base';

typescriptIntegrationTest(
  __filename,
  ['--allowJs', '--esModuleInterop', 'eslint.config.js'],
  out => {
    const lines = out.split('\n').filter(
      line =>
        // error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.
        // this is fine for us to ignore in this context
        line && !line.includes('error TS18028'),
    );

    // The types should not error (e.g. https://github.com/eslint-stylistic/eslint-stylistic/issues/276)
    expect(lines).toHaveLength(0);
  },
);
eslintIntegrationTest(__filename, 'eslint.config.js', true);
