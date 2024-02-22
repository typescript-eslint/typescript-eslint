import {
  eslintIntegrationTest,
  typescriptIntegrationTest,
} from '../tools/integration-test-base';

typescriptIntegrationTest(
  __filename,
  ['--allowJs', '--esModuleInterop', 'eslint.config.js'],
  out => {
    const lines = out
      .split('\n')
      .filter(
        line =>
          // error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.
          // this is fine for us to ignore in this context
          !line.includes('error TS18028'),
      )
      .join('\n');

    // The stylistic type errors: https://github.com/eslint-stylistic/eslint-stylistic/issues/276
    expect(lines).toMatchInlineSnapshot(`
      "node_modules/@stylistic/eslint-plugin-plus/dts/index.d.ts(7,46): error TS2694: Namespace '"/<tmp_folder>/node_modules/@types/eslint/index".ESLint' has no exported member 'RuleModule'.
      node_modules/@stylistic/eslint-plugin/dist/dts/rule-options.d.ts(6,11): error TS2320: Interface 'UnprefixedRuleOptions' cannot simultaneously extend types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions'.
        Named property ''comma-dangle'' of types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions' are not identical.
      node_modules/@stylistic/eslint-plugin/dist/dts/rule-options.d.ts(6,11): error TS2320: Interface 'UnprefixedRuleOptions' cannot simultaneously extend types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions'.
        Named property ''keyword-spacing'' of types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions' are not identical.
      node_modules/@stylistic/eslint-plugin/dist/dts/rule-options.d.ts(6,11): error TS2320: Interface 'UnprefixedRuleOptions' cannot simultaneously extend types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions'.
        Named property ''lines-around-comment'' of types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions' are not identical.
      node_modules/@stylistic/eslint-plugin/dist/dts/rule-options.d.ts(6,11): error TS2320: Interface 'UnprefixedRuleOptions' cannot simultaneously extend types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions'.
        Named property ''lines-between-class-members'' of types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions' are not identical.
      node_modules/@stylistic/eslint-plugin/dist/dts/rule-options.d.ts(6,11): error TS2320: Interface 'UnprefixedRuleOptions' cannot simultaneously extend types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions'.
        Named property ''padding-line-between-statements'' of types 'UnprefixedRuleOptions' and 'UnprefixedRuleOptions' are not identical.
      "
    `);
  },
);
eslintIntegrationTest(__filename, 'eslint.config.js', true);
